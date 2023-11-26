import {getAnimationSettings} from "./animationSettings.js";
import {getColorMap} from "../ColorMap.js";
import {updateVisualizations} from "../updateVisualizations.js";
import {createErrorBar, createVerticalLine, get2dLayout} from "./layoutFactory.js";
import {createDivForPlotlyChart} from "./chartDivFactory.js";
import {cleanName} from "../datanameCleaner.js";

const lineWeight = 3

/**
 * Creates a line plot with the given dataPoints and data names
 * @param chartName {string} - The name of the chart displayed as the title
 * @param chartId {string} - The id of the htmlElement into which the chart will be created
 * @param dataPoints {DataPoint[]} - An array of dataPoints
 * @param timestamps {Timestamp[]} - An array of timestamps
 * @param dataNames {string []} - An array of strings that are passed to dataPoints[i].traversed_attribute(dataNames[j]).
 * These are the names of the attributes that will be plotted.
 * @param errors {TimespanError[]}
 * @param plotGroup {PlotGroup}
 * @returns {Promise<void>}
 */
export async function plotLineChart(chartName, chartId, dataPoints, timestamps, dataNames, errors, plotGroup) {
    const dataArrays = {}

    const chart = await createDivForPlotlyChart(chartId)


    // Generate the layout. This is necessary for generating the frames
    const layout = get2dLayout(chartName, chart.clientHeight, chart.clientWidth)
    for (let timespanError of errors) {
        layout.shapes.push(createErrorBar(timespanError.start.time.stepCount, timespanError.end.time.stepCount, timespanError.triggeringVariable))
    }

    // Hacky way to remove the numbers for this specific plot type
    if (dataNames.filter(name => name === "custom.is_holding_A").length > 0) {
        layout.yaxis.dtick = 1
    }

    layout.legend.bgcolor = getColorMap().group_colors.A_background
    layout.legend.bordercolor = getColorMap().plot_colors.gridColor
    layout.legend.borderwidth = 1

    layout.xaxis.tickprefix = "Step "

    const ticktext = []
    const tickvals = []

    console.log(layout)

    // for(let i = 0; i < timestamps.length; i++){
    //     // push one every 1000 steps or every 100 if there are less than 1000 steps or something like that
    // }

    // Enabling the things below would override the tick text and values
    // This would allow us to have different text in the hover box than shown on the x axis
    // layout.xaxis.ticktext = ticktext
    // layout.xaxis.tickvals = tickvals

    const frames = new Array(timestamps.length)

    for (let i = 0; i < timestamps.length; i++) {
        const shapes = layout.shapes.slice()
        const line = createVerticalLine(timestamps[i], "stepCount")

        shapes.push(line)

        frames[i] = {
            name: timestamps[i],
            // data is an array, where each index corresponds to the index of a trace in the traces array
            // Since we only update one value, it will be the first trace in the traces array
            // We no longer update the data, but instead the shapes
            // This is because shapes allow us the flexibility to add vertical lines that span the paper
            // data: dataArray,
            layout: {
                shapes: shapes
            }
        }
    }

    const cleanNames = []

    dataNames.forEach(name => {
        cleanNames.push(cleanName(name))
    })

    for (let i = 0; i < cleanNames.length; i++) {
        dataArrays[cleanNames[i]] = []
    }

    for (let i = 0; i < dataPoints.length; i++) {
        for (let j = 0; j < dataNames.length; j++) {
            dataArrays[cleanNames[j]].push(dataPoints[i].traversed_attribute(dataNames[j]))
        }
    }

    const traces = generate_traces(cleanNames, dataArrays, timestamps);

    await Plotly.react(chart, {
        data: traces,
        layout: layout,
        // frames: frames,
    })

    const frameLookup = {}
    for (let i = 0; i < frames.length; i++) {
        frameLookup[frames[i].name] = frames[i]
    }

    plotGroup.addUpdateInformation(chartId, getAnimationSettings(false), frameLookup)

    chart.on('plotly_click', async function (data) {
        await updateVisualizations(getTimestampFromClick(data), plotGroup.identifier);
    })
}

function generate_traces(dataNames, dataArrays, time) {
    const traces = []

    if (dataNames.length === 0 || dataNames.length > 6) {
        throw new Error("Invalid number of data names. It must be between 1 and 6. Both inclusive")
    }

    // Generate the traces for the data lines
    for (let i = 0; i < dataNames.length; i++) {
        traces.push({
            x: time,
            y: dataArrays[dataNames[i]],
            type: 'scatter',
            name: dataNames[i],
            line: {
                color: getColorMap().legend_colors_array[i],
                width: lineWeight,
            },
        })
    }

    return traces
}

function getTimestampFromClick(data) {
    return data.points[data.points.length - 1].x;
}
