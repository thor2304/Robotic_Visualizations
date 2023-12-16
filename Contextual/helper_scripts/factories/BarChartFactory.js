import {createDivForPlotlyChart} from "./chartDivFactory.js";
import {createErrorBar, get2dLayout} from "./layoutFactory.js";
import {updateVisualizations} from "../updateVisualizations.js";

//https://plotly.com/javascript/bar-charts/

/**
 * Creates a barchart of the given dataName from the provided DataPoints
 * @param chartName {string} - The name of the chart displayed as the title
 * @param chartId {string} - The id of the htmlElement into which the chart will be created
 * @param dataPoints {DataPoint[]} - An array of dataPoints
 * @param timestamps {Timestamp[]} - An array of timestamps
 * @param dataName {string} - A string that are passed to dataPoints[i].traversed_attribute(dataName).
 * These are the names of the attributes that will be plotted.
 * @param errors {TimespanError[]}
 * @param plotGroup {PlotGroup}
 * @returns {Promise<void>}
 */
export async function plotBarChart(chartName, chartId, dataPoints, timestamps, dataName, errors, plotGroup) {
    const data = []

    const chart = await createDivForPlotlyChart(chartId)

    for (const dataPoint of dataPoints) {
        data.push(dataPoint.traversed_attribute(dataName))
    }

    const trace = createTrace(data, timestamps, dataName)

    const layout = get2dLayout(chartName, chart.clientHeight, chart.clientWidth);
    for(let timespanError of errors){
        layout.shapes.push(createErrorBar(timespanError.start.time.stepCount, timespanError.end.time.stepCount, timespanError.triggeringVariable))
    }

    await Plotly.react(chart, {
        data: trace,
        layout: layout,
    })

    // plotGroup.addUpdateInformation(chartId, getAnimationSettings(false))

    chart.on('plotly_click', async function (data) {
        const x = data.points[data.points.length - 1].x;
        await updateVisualizations(x, plotGroup.identifier);
    })
}

function createTrace(data, timestamps, dataName) {
    return [{
        x: timestamps,
        y: data,
        name: dataName,
        type: 'bar'
    }]
}