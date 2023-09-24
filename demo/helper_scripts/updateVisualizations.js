// This is a list of all the plots that are currently updating.
// Push information as arrays, that are to be passed to Plotly.animate(plot_name, settings)
const updatingPlots = [];
// TODO: ^^ This should be a "grouped" variable where a plot identifier is mapped to a list of plots that are updating

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
function getActivePlotGroup(){
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
    previousTimestamp = timestamp.toString()

    _activePlotGroup = plotGroup

    groupedDataPoints_linked[_activePlotGroup].updateCurrent(timestamp);

    const calls = []

    for (let i = 0; i < updatingPlots.length; i++) {
        calls.push(Plotly.animate(updatingPlots[i][0], [timestamp], updatingPlots[i][1]))
    }

    calls.push(update_variable_showcase(timestamp))
    await highlight_line(
        groupedDataPoints[_activePlotGroup][timestamp].time.highlightLine,
        0,
        true,
        groupedDataPoints[_activePlotGroup][timestamp].time.highlightLine + getScriptOffset() === groupedDataPoints[_activePlotGroup][timestamp].time.lineNumber
    )

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
const updateVisualizations = get_throttled_version_function(_updateVisualizations, 10);