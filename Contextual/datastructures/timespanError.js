import {getScriptOffset} from "../csv_driven_3d.js";

/**
 * Used as the return type of the main function defined in this class.
 */
export class TimespanError {
    /**
     * @param start {DataPoint}
     * @param end {DataPoint}
     * @param triggeringVariable {string}
     */
    constructor(start, end, triggeringVariable) {
        this.start = start
        this.end = end
        this.triggeringVariable = triggeringVariable;
    }
}


export class Limit {
    /**
     * @param min {number}
     * @param max {number}
     */
    constructor(min, max) {
        this._min = min
        this._max = max
    }

    /**
     * This method uses >= and <= for comparisons
     * @param input {number}
     * @returns {boolean}
     */
    contains(input) {
        return input <= this._max && input >= this._min
    }

    get range() {
        return this._max - this._min
    }

    get min() {
        return this._min
    }

    get max() {
        return this._max
    }
}

export class ScriptSpan {
    /**
     *
     * @param startLine {number}
     * @param endLine {number}
     * @param min {number}
     * @param max {number}
     */
    constructor(startLine, endLine, min, max) {
        this.scriptRange = new Limit(startLine, endLine)
        this.variableLimit = new Limit(min, max)
    }

    /**
     * @param line_number {number}
     * @returns {boolean}
     */
    contains_line(line_number) {
        return this.scriptRange.contains(line_number)
    }

    doesNotContainLine(line_number) {
        return !this.contains_line(line_number)
    }
}

export class VariableController {
    /**
     * @param variableName {string} Must be the traversed path of a variable e.g. "robot.tool.position.x"
     * @param scriptRanges {ScriptSpan[]} Ranges must not overlap, and they must be sorted
     */
    constructor(variableName, scriptRanges) {
        this.variableName = variableName
        this.ranges = scriptRanges
        this._hasActiveError = false
        /**
         *
         * @type {DataPoint}
         * @private
         */
        this._activeErrorStart = null
        /**
         *
         * @type {TimespanError[]}
         * @private
         */
        this._observedErrors = []

        this._minimumErrorLength = 0.2 // seconds
    }

    /**
     * The input array maps script lines to arrays of the variable controllers that are configured for those lines.<br>
     * There is no line 0, therefore 0 is used for a list of all controllers.
     * @param controllerLookup {Array<Array<VariableController>>}
     */
    register(controllerLookup) {
        if (controllerLookup.length === 0) {
            controllerLookup.push([])
        }

        controllerLookup[0].push(this)

        for (let range of this.ranges) {
            const loopStart = range.scriptRange.min
            const loopEnd = range.scriptRange.max

            while (loopEnd >= controllerLookup.length) {
                controllerLookup.push([])
            }

            // We can indiscriminately push ourselves to this array, because ranges should not have overlapping script ranges
            for (let i = loopStart; i <= loopEnd; i++) {
                controllerLookup[i].push(this)
            }
        }
    }

    /**
     *
     * @param lastDataPoint {DataPoint}
     * @returns {TimespanError[]}
     */
    getAllObservedErrors(lastDataPoint) {
        // if an error is currently active, close it and add to the list
        if (this._hasActiveError) {
            this._closeError(lastDataPoint)
        }

        return this._observedErrors
    }

    /**
     *
     * @param endDataPoint {DataPoint}
     * @private
     */
    _closeError(endDataPoint) {
        const errorLength = endDataPoint.time.timestamp - this._activeErrorStart.time.timestamp
        // console.log("errorLength", errorLength)
        if (errorLength >= this._minimumErrorLength) { // Only add the error if it is longer than the minimum error length
            // This is done to allow for a short ramp up of the pump
            const error = new TimespanError(this._activeErrorStart, endDataPoint, this.variableName)
            this._observedErrors.push(error)
        }
        this._hasActiveError = false
    }

    _startError(dataPoint) {
        this._hasActiveError = true
        this._activeErrorStart = dataPoint
    }

    /**
     * @param dataPoint {DataPoint}
     */
    checkDataPoint(dataPoint) {
        // Loop through ranges.
        // If this range.contains the datapoint then check it and return right after

        const lineNumber = dataPoint.pointInTime.lineNumber - getScriptOffset()

        for (const range of this.ranges) {
            if (range.doesNotContainLine(lineNumber)) {
                continue
            }

            const isWithinLimits = range.variableLimit.contains(dataPoint.traversed_attribute(this.variableName))

            // If there was previously an error, but now we are within limits, end the active error
            if (this._hasActiveError && isWithinLimits) {
                this._closeError(dataPoint)
                return;
            } else if (!this._hasActiveError && !isWithinLimits) { // if we don't have an active error, but we are now outside the limits
                this._startError(dataPoint)
                return;
            }

        }
    }

}

/**
 *
 * @param dataPoints {DataPoint[]}
 * @returns {TimespanError[]}
 */
export function detectErrors(dataPoints) {
    /**
     * @type {TimespanError[]}
     */
    const out = []

    /**
     * @type {Array<Array<VariableController>>}
     */
    const controllerLookup = []

    /**
     * I still want to add a bit more information to the "triggeringVariable" aspect of the TimeSpanError.
     * Possibly information about the range that started it and the range that made it end.
     * I see these as relevant informations for knowing why this error was triggered.
     */

        // Create the variable controllers that we need
        // Create their script ranges
    const vacuumInActiveRangeBefore = new ScriptSpan(72, 135, 0, 5)
    const vacuumActiveRange = new ScriptSpan(137, 160, 9, 100)
    const vacuumInActiveRangeAfter = new ScriptSpan(162, 165, 0, 5)
    const vacuumAController = new VariableController("scriptVariables.vg_Vacuum_A.value", [vacuumInActiveRangeBefore, vacuumActiveRange, vacuumInActiveRangeAfter])
    const vacuumBController = new VariableController("scriptVariables.vg_Vacuum_B.value", [vacuumInActiveRangeBefore, vacuumActiveRange, vacuumInActiveRangeAfter])

    // Register the controllers using controllerLookup
    vacuumAController.register(controllerLookup)
    vacuumBController.register(controllerLookup)

    // Loop through all datapoints and call controllerlookup[datapoint.time.linenumber] (correct for scriptoffset)
    // For all VariableControllers returned by that:
    // Call controller.checkDataPoint(datapoint)

    for (const dataPoint of dataPoints) {
        const controllers = controllerLookup[dataPoint.time.lineNumber - getScriptOffset()]
        if (controllers === undefined) {
            continue
        }
        for (const controller of controllers) {
            controller.checkDataPoint(dataPoint)
        }
    }

    // For all controllers call getObservedErrors and add the results to out (consider using spread ...)
    for (let i = 0; i < controllerLookup[0].length; i++) {
        out.push(...controllerLookup[0][i].getAllObservedErrors(dataPoints[dataPoints.length - 1]))
    }

    return out
}