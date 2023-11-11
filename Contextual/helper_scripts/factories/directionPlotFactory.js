import {getAnimationSettings} from "./animationSettings.js";
import {getColorMap} from "../ColorMap.js";
import {get3dLayout} from "./layoutFactory.js";
import {createDivForPlotlyChart} from "./chartDivFactory.js";

/**
 * Creates a plotly plot with the given data displayed in the form of an arrow for each DataName
 * @param chartName {string} - Name of the chart
 * @param chartId {string} - htmlID of the chart
 * @param dataPoints {DataPoint[]}- Array of DataPoints
 * @param timestamps {Timestamp[]} - Array of timestamps
 * @param dataNames {string[]} - Array of DataNames. These are used for traversing in each datapoint. This is therefore in the shape of "robot.tool.positionError" without x,y,z
 * @param plotGroup {PlotGroup}
 * @returns {Promise<PlotlyHTMLElement>}
 */
export async function plotDirection(chartName, chartId, dataPoints, timestamps, dataNames, plotGroup) {
    const traces = []

    await createDivForPlotlyChart(chartId)

    for (let i = 0; i < dataNames.length; i++) {
        traces.push(...createArrowTraces(dataPoints, dataNames[i]))
    }

    // console.log(traces)

    const frames = [];
    for (let i = 0; i < timestamps.length; i++) {
        const dataArray = [];
        for (let j = 0; j < dataNames.length; j++) {
            const [line_data, arrow_data] = createFrameData(dataPoints, i, dataNames[j])
            dataArray.push(line_data, arrow_data)
        }
        frames.push({
            name: timestamps[i],
            data: dataArray
        })
    }

    const scale = getMaxScale(dataPoints, dataNames)

    // console.log(scale)

    const layout = get3dLayout(chartName, scale)

    // console.log(frames)

    const frameLookup = {}
    for (let i = 0; i < frames.length; i++) {
        frameLookup[frames[i].name] = frames[i]
    }
    plotGroup.addUpdateInformation(chartId, getAnimationSettings(), frameLookup)

    return await Plotly.newPlot(chartId, {
        data: traces,
        // frames: frames,
        layout: layout,
    })
}

const arrow_tip_ratio = 1;
const arrow_starting_ratio = 0.98;

function createFrameData(dataPoints, i, dataName) {
    const line_data = {
        id: [dataName],
        x: [0, dataPoints[i].traversed_attribute(dataName).x],
        y: [0, dataPoints[i].traversed_attribute(dataName).y],
        z: [0, dataPoints[i].traversed_attribute(dataName).z],
    }

    const arrow_data = {
        id: ["ArrowHead-" + dataName],
        x: [arrow_starting_ratio * dataPoints[i].traversed_attribute(dataName).x],
        y: [arrow_starting_ratio * dataPoints[i].traversed_attribute(dataName).y],
        z: [arrow_starting_ratio * dataPoints[i].traversed_attribute(dataName).z],
        u: [arrow_tip_ratio * dataPoints[i].traversed_attribute(dataName).x],
        v: [arrow_tip_ratio * dataPoints[i].traversed_attribute(dataName).y],
        w: [arrow_tip_ratio * dataPoints[i].traversed_attribute(dataName).z],
    }
    return [line_data, arrow_data];
}


function createArrowTraces(datapoints, dataName) {
    const [line, ArrowHead] = createFrameData(datapoints, 0, dataName)

    const colorMap = getColorMap()

    line.name = dataName
    line.text = dataName
    line.mode = 'lines'
    line.type = 'scatter3d'
    line.line = {
        color: getColorMap().legend_colors.connecting_line,
        width: 14
    }

    ArrowHead.name = ""
    ArrowHead.text = ""
    ArrowHead.type = "cone"
    ArrowHead.colorscale = [[0, getColorMap().legend_colors.connecting_line], [1, getColorMap().legend_colors.connecting_line]]
    ArrowHead.showLegend = false
    ArrowHead.showscale = false
    ArrowHead.sizemode = "absolute"


    const base = {
        name: "base",
        id: "base",
        text: "Zero point",
        x: [0],
        y: [0],
        z: [0],
        mode: 'markers',
        type: 'scatter3d',
        marker: {
            color: getColorMap().legend_colors.connecting_line,
        },
        showLegend: false,
    }

    return [line, ArrowHead, base]
}

function getMaxScale(dataPoints, dataNames) {
    let maxScale = 2e-3
    for (let i= 0; i < dataPoints.length; i++) {
        for (let j = 0; j <dataNames.length; j++){
            const traversed = dataPoints[i].traversed_attribute(dataNames[j])
            if (Math.abs(traversed.x) > maxScale) {
                maxScale = Math.abs(traversed.x)
            }
            if (Math.abs(traversed.y) > maxScale) {
                maxScale = Math.abs(traversed.y)
            }
            if (Math.abs(traversed.z) > maxScale) {
                maxScale =  Math.abs(traversed.z)
            }
        }
    }
    return maxScale
}