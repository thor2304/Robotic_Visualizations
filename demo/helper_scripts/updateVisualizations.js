// This is a list of all the plots that are currently updating.
// Push information as arrays, that are to be passed to Plotly.animate(plot_name, settings)
const updatingPlots = [];

let previousTimestamp = 0;
async function updateVisualizations(timestamp) {
    if (timestamp === previousTimestamp){
        return
    }
    previousTimestamp = timestamp.toString()

    datapoints_linked.updateCurrent(timestamp);

    const calls = []

    for (let i = 0; i < updatingPlots.length; i++) {
        calls.push(Plotly.animate(updatingPlots[i][0], [timestamp], updatingPlots[i][1]))
    }

    calls.push(update_variable_showcase(timestamp))
    await highlight_line(datapoints[timestamp].time.lineNumber, getScriptOffset())

    try{
        await Promise.allSettled(calls);
    }catch (e){
    }
}