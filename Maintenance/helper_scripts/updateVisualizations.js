import {getScriptOffset, groups} from "../csv_driven_3d.js";
// import {highlight_line} from "../source_code_visualization/line_highlight.js";
import {update_variable_showcase} from "./variable_table.js";
import {get_throttled_version_function} from "./factories/ThrottledFunction.js";


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

    previousTimestamp = timestamp.toString()

    _activePlotGroup = plotGroup

    groups.get(_activePlotGroup).dataPointsLinked.updateCurrent(timestamp);

    const calls = []

    const updatingPlots = groups.get(_activePlotGroup).getUpdateInformation()
    for (let i = 0; i < updatingPlots.length; i++) {
        calls.push(Plotly.animate(updatingPlots[i][0], [timestamp], updatingPlots[i][1]))
    }

    calls.push(update_variable_showcase(timestamp))
    // await highlight_line(
    //     groups.get(_activePlotGroup).groupedDataPoints[timestamp].time.highlightLine,
    //     0,
    //     true,
    //     groups.get(_activePlotGroup).groupedDataPoints[timestamp].time.highlightLine + getScriptOffset() === groups.get(_activePlotGroup).groupedDataPoints[timestamp].time.lineNumber,
    //     _activePlotGroup
    // )

    try{
        await Promise.allSettled(calls);
    }catch (e){
    }
}

/**
 * @param timestamp {Timestamp}
 * @param plotGroup {PlotGroupIdentifier} This defaults to the return value of {@link getActivePlotGroup}
 * @returns {Promise<void>}
 */
export const updateVisualizations = get_throttled_version_function(_updateVisualizations, 10);