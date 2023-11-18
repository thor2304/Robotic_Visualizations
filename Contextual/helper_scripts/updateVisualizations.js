import {getScriptOffset, groups} from "../csv_driven_3d.js";
import {highlight_line} from "../source_code_visualization/line_highlight.js";
import {update_variable_showcase} from "./variable_table.js";
import {get_throttled_version_function} from "./factories/ThrottledFunction.js";
import {updateSliderStep} from "./slider-control.js";


let previousTimestamp = 0;

/**
 * @private
 * @type {PlotGroupIdentifier}
 */
let _activePlotGroup = "A";

/**
 * The plot group that is currently active and controlled by the keyboard
 * @returns {PlotGroupIdentifier}
 */
export function getActivePlotGroup(){
    return _activePlotGroup
}

/**
 * @param timestamp {Timestamp}
 * @param plotGroup {PlotGroupIdentifier}
 * @returns {Promise<void>}
 * @private
 */
async function _updateVisualizations(timestamp, plotGroup = _activePlotGroup) {
    if (timestamp === previousTimestamp && plotGroup === _activePlotGroup){
        return
    }

    if (timestamp === undefined){
        console.log("Timestamp is undefined")
        return
    }

    const datapoint = groups.get(_activePlotGroup).groupedDataPoints[timestamp]
    if (datapoint === undefined){
        console.log("Datapoint is undefined, when trying to update visualisations",groups.get(_activePlotGroup) )
        return
    }

    const start = performance.now();

    previousTimestamp = timestamp.toString()

    updateSliderStep(timestamp)

    _activePlotGroup = plotGroup

    groups.get(_activePlotGroup).dataPointsLinked.updateCurrent(timestamp);

    const calls = []

    const updatingPlots = groups.get(_activePlotGroup).getUpdateInformation()
    for (let i = 0; i < updatingPlots.length; i++) {
        const frameLookup = updatingPlots[i][2]
        const frame = frameLookup === undefined ? [timestamp] : frameLookup[timestamp]
        calls.push(Plotly.animate(updatingPlots[i][0], frame, updatingPlots[i][1]))
    }

    calls.push(update_variable_showcase(timestamp))
    await highlight_line(
        datapoint.time.highlightLine,
        0,
        true,
        datapoint.time.highlightLine + getScriptOffset() === datapoint.time.lineNumber,
        _activePlotGroup
    )

    try{
        await Promise.allSettled(calls);
    }catch (e){
    }

    const end = performance.now();

    console.log("Update took " + (end - start) + " milliseconds")
}

/**
 * @param timestamp {Timestamp}
 * @param plotGroup {PlotGroupIdentifier} This defaults to the return value of {@link getActivePlotGroup}
 * @returns {Promise<void>}
 */
export const updateVisualizations = get_throttled_version_function(_updateVisualizations, 10);