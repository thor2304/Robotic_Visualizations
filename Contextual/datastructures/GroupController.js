import {plotCoordinates} from "../helper_scripts/factories/CoordinatePlotFactory.js";
import {registerSliderTimestamps} from "../helper_scripts/slider-control.js";

export class GroupController {
    /**
     * @private
     * @type {{plotGroup: PlotGroup, options: PlotGroup[]}}
     */
    A = {
        plotGroup: undefined,
        options: []
    };
    /**
     * @private
     * @type {{plotGroup: PlotGroup, options: PlotGroup[]}}
     */
    B = {
        plotGroup: undefined,
        options: []
    };

    averageTimePerCycle = 0;

    /**
     * @param groupA {PlotGroup}
     * @param groupB {PlotGroup?}
     * @returns {void}
     */
    initialize(groupA, groupB) {
        this.A.plotGroup = groupA;
        this.addOption(groupA);
        if (groupB === undefined) {
            return;
        }
        this.B.plotGroup = groupB;
        this.addOption(groupB);
    }

    /**
     * @param groupIdentifier {PlotGroupIdentifier}
     * @param optionIndex {number | string}
     */
    set(groupIdentifier, optionIndex) {
        const index = typeof optionIndex === "string" ? parseInt(optionIndex) : optionIndex;
        const activePlotGroup = this.getOptions(groupIdentifier)[index]
        this[groupIdentifier].plotGroup = activePlotGroup;
        // This updates the visualizations to use this new cycle
        activePlotGroup.getPlotPromises().forEach(promise => promise.then())
        plotCoordinates("test", [{xName: "custom.target_x", yName: "custom.target_y"}], this).then()
        registerSliderTimestamps(activePlotGroup.getCycle().sequentialDataPoints)
        this.updateCycleText(`${index + 1}`)
    }

    updateCycleText(cycleName) {
        const activePlotGroup = this.get("A")
        const timeForThisCycle = activePlotGroup.getCycle().timeForThisCycle

        const errorOrNot = document.getElementById(`error-or-not-A`)
        const cycleSpeedDisplay = document.getElementById(`cycle-speed-display-A`)

        const percentage = Math.abs(Math.round(((timeForThisCycle/this.averageTimePerCycle)*100 - 100)*100)/100)
        const slowerOrFaster = timeForThisCycle - this.averageTimePerCycle > 0 ? "slower" : "faster"
        cycleSpeedDisplay.innerText = `Cycle ${cycleName} was ${percentage}% ${slowerOrFaster} than the average cycle`

        const hasError = activePlotGroup.getCycle().hasError()
        const hasWarning = activePlotGroup.getCycle().hasWarning()
        if (hasError) {
            errorOrNot.innerText = `Cycle ${cycleName} was performed with an error`
        }else if (hasWarning) {
            errorOrNot.innerText = `Cycle ${cycleName} was performed with a warning`
        } else {
            errorOrNot.innerText = `Cycle ${cycleName} was performed without an error`
        }

    }

    /**
     * @param group {PlotGroup}
     * @returns {void}
     */
    addOption(group) {
        this[group.identifier].options.push(group);
        this.computeTimePerCycle()
    }

    computeTimePerCycle(groupIdentifier = "A") {
        const group = this[groupIdentifier]
        let sum = 0;
        for (const option of group.options) {
            if (option.getCycle() === undefined) {
                continue;
            }
            sum += option.getCycle().timeForThisCycle
        }
        this.averageTimePerCycle = sum / group.options.length
    }

    /**
     * @param identifier {PlotGroupIdentifier}
     * @returns {PlotGroup[]}
     */
    getOptions(identifier) {
        return this[identifier].options;
    }

    /**
     * @param option {PlotGroupIdentifier}
     * @returns {PlotGroup}
     */
    get(option) {
        return this[option].plotGroup
    }

    /**
     * @returns {PlotGroupIdentifier[]}
     */
    getGroupIdentifiers() {
        // return ["A", "B"]
        return ["A"]
    }

    /**
     *
     * @param rawFrames {DataPoint[]}
     */
    addRawFrames(rawFrames) {
        this.rawFrames = rawFrames;
    }
}