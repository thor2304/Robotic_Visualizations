/**
 * Used as the return type of the main function defined in this class.
 */
class TimespanError {
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


class Limit {
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

class ScriptSpan {
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
}

class VariableController {
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
    }

    /**
     * The input array maps script lines to arrays of the variable controllers that are configured for those lines
     * @param controllerLookup {Array<Array<VariableController>>}
     */
    register(controllerLookup) {
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
    getAllObservedErrors(lastDataPoint){
        // if an error is currently active, close it and add to the list
        if(this._hasActiveError){
            this._closeError(lastDataPoint)
        }

        return this._observedErrors
    }

    /**
     *
     * @param endDataPoint {DataPoint}
     * @private
     */
    _closeError(endDataPoint){
        const error = new TimespanError(this._activeErrorStart, endDataPoint, this.variableName)
        this._observedErrors.push(error)

        this._hasActiveError = false
    }

    _startError(dataPoint){
        this._hasActiveError = true
        this._activeErrorStart = dataPoint
    }

    /**
     * @param dataPoint {DataPoint}
     */
    checkDataPoint(dataPoint){
        // Loop through ranges.
        // If this range has min > datapoint then return
        // If this range.contains the datapoint then check it and return right after

        const lineNumber = dataPoint.pointInTime.lineNumber - getScriptOffset()
        for (let i = 0; i < this.ranges.length; i++) {
            if(this.ranges[i].scriptRange.min > lineNumber){
                return
            }

            if(this.ranges[i].contains_line(lineNumber)){
                const isWithinLimits = this.ranges[i].variableLimit.contains(dataPoint.traversed_attribute(this.variableName))

                // If there was previously an error, but now we are within limits, end the active error
                if(this._hasActiveError && isWithinLimits){
                    this._closeError(dataPoint)
                    return;
                }else if(!this._hasActiveError && !isWithinLimits){ // if we don't have an active error, but we are now outside the limits
                    this._startError(dataPoint)
                    return;
                }
            }
        }

    }

}

/**
 *
 * @param dataPoints {DataPoint[]}
 * @returns {Promise<TimespanError[]>}
 */
async function detectErrors(dataPoints) {
    /**
     * @type {TimespanError[]}
     */
    const out = []

    /**
     *
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
    // Register the controllers using controllerLookup

    // Loop through all datapoints and call controllerlookup[datapoint.time.linenumber] (correct for scriptoffset)
        // For all VariableControllers returned by that:
        // Call controller.checkDataPoint(datapoint)

    // For all controllers call getObservedErrors and add the results to out (consider using spread ...)

    // return out
}