import {getColorMap} from "../ColorMap.js";
import {get2dLayout} from "./layoutFactory.js";
import {createDivForPlotlyChart} from "./chartDivFactory.js";
import {getAnimationSettings} from "./animationSettings.js";
import {getActivePlotGroup} from "../updateVisualizations.js";

function getLayoutForCoordinates(chartName, xMin, xMax, yMin, yMax) {
    const layout = get2dLayout(chartName, false)
    // layout.shapes.push(createBoundingLines())
    layout.xaxis.showline = false
    layout.xaxis.showticklabels = false
    layout.yaxis.showline = false
    layout.yaxis.showticklabels = false
    layout.xaxis.range = [xMin, xMax]
    layout.yaxis.range = [yMin, yMax]
    layout.xaxis.scaleanchor = "y"
    layout.xaxis.scaleratio = 1
    layout.xaxis.constrain = "domain"

    return layout;
}

function getFramesForTCP(plotGroup) {
    const frames = [];
    const datapoints = plotGroup.getCycle().sequentialDataPoints
    const timestamps = plotGroup.getCycle().timestamps

    for (let i = 0; i < timestamps.length; i++) {
        try {
            frames.push({
                name: timestamps[i],
                data: [{
                    x: [datapoints[i].robot.joints.wrist_3.position.x],
                    y: [datapoints[i].robot.joints.wrist_3.position.y],
                }]
            })

        } catch (e) {
            console.error(e, datapoints[i], i)
        }
    }
    return frames;
}

/**
 *
 * @param traces {Object[]}
 * @param dataPoints {DataPoint[]}
 * @return {{yMin: number, yMax: number, xMax: number, xMin: number}}
 */
function getRanges(traces, dataPoints) {
    const minTraceX = Math.min(...traces.map((trace) => Math.min(...trace.x)))
    const minFrameX = Math.min(...dataPoints.map((datapoint) => datapoint.robot.joints.wrist_3.position.x))
    const minX = Math.min(minTraceX, minFrameX)

    const maxTraceX = Math.max(...traces.map((trace) => Math.max(...trace.x)))
    const maxFrameX = Math.max(...dataPoints.map((datapoint) => datapoint.robot.joints.wrist_3.position.x))
    const maxX = Math.max(maxTraceX, maxFrameX)

    const minTraceY = Math.min(...traces.map((trace) => Math.min(...trace.y)))
    const minFrameY = Math.min(...dataPoints.map((datapoint) => datapoint.robot.joints.wrist_3.position.y))
    const minY = Math.min(minTraceY, minFrameY)

    const maxTraceY = Math.max(...traces.map((trace) => Math.max(...trace.y)))
    const maxFrameY = Math.max(...dataPoints.map((datapoint) => datapoint.robot.joints.wrist_3.position.y))
    const maxY = Math.max(maxTraceY, maxFrameY)

    const xRange = maxX - minX
    const yRange = maxY - minY

    const xPadding = xRange * 0.05
    const yPadding = yRange * 0.05

    const xMin = minX - xPadding
    const xMax = maxX + xPadding
    const yMin = minY - yPadding
    const yMax = maxY + yPadding
    return {xMin, xMax, yMin, yMax};
}


/**
 * Creates a 2d plot, that shows the values of the datanames provided at the first timestamp of the cycles provided.
 * @param chartName {string} - The name of the chart displayed as the title
 * @param chartId {string} - The id of the htmlElement into which the chart will be created
 * @param dataNames {CoordinateNames} - An array of strings that are passed to dataPoints[i].traversed_attribute(dataNames[j]).
 * These are the names of the attributes that will be plotted.
 * @param groupController {GroupController} - The plotgroups that together contain all the relevant cycles.
 * @param plotGroup {PlotGroup} - The plotgroup that this plot belongs to.
 * @returns {Promise<void>}
 */
export async function plotCoordinates(chartName, chartId, dataNames, groupController, plotGroup) {
    const chart = await createDivForPlotlyChart(chartId)
    const traces = createTraces(groupController, dataNames);

    // console.log("plotting coordinates", groupController.get(getActivePlotGroup()), plotGroup)

    // We have no frames here until we want to start animating the 2d plot.

    const frames = getFramesForTCP(plotGroup);
    const {xMin, xMax, yMin, yMax} = getRanges(traces, groupController.rawFrames);
    addLegendExplanations(traces);

    const layout = getLayoutForCoordinates(chartName, xMin, xMax, yMin, yMax);

    const plot = await Plotly.react(chart, {
        data: traces,
        layout: layout,
        // frames: frames,
    })

    plot.ranges = {
        xMin: xMin,
        xMax: xMax,
        yMin: yMin,
        yMax: yMax
    }


    // for (let plotGroup of groupController.getOptions("A")) {
    //     plotGroup.addUpdateInformation(chartId, getAnimationSettings(false), frameLookup)
    // }

    plotGroup.addUpdateInformation(chartId, getAnimationSettings(false), generateFrameLookupFromFrames(frames))



    // chart.on('plotly_click', async function (data) {
    //     // In the future, we want to be able to click on a point and have the corresponding plotgroup changed to reflect that cycle.
    // })
}

function generateFrameLookupFromFrames(frames) {
    const frameLookup = {}
    for (let i = 0; i < frames.length; i++) {
        frameLookup[frames[i].name] = frames[i]
    }

    return frameLookup
}

/**
 *
 * @param groupController {GroupController}
 * @param dataNames {CoordinateNames}
 * @return {{}[]}
 */
function createTraces(groupController, dataNames) {
    const ACycles = groupController.getOptions("A").map((plotGroup) => plotGroup.getCycle())
    const BCycles = groupController.getOptions("B").map((plotGroup) => plotGroup.getCycle())

    const coordinates = extractCoordinates(ACycles, BCycles, dataNames)
    const activeCycle = groupController.get(getActivePlotGroup()).getCycle().cycleIndex
    const TCP_x = groupController.get(getActivePlotGroup()).getCycle().sequentialDataPoints[activeCycle].robot.tool.position.x
    const TCP_y = groupController.get(getActivePlotGroup()).getCycle().sequentialDataPoints[activeCycle].robot.tool.position.y
    return _generate_traces_coordinate(coordinates, activeCycle, TCP_x, TCP_y);
}

/**
 *
 * @param chartId {string}
 * @param dataNames {CoordinateNames}
 * @param groupController {GroupController}
 */
export function updateCoordinatePlot(chartId, dataNames, groupController) {
    const chart = document.getElementById(chartId)
    console.log("updateCoordinatePlot", groupController.get(getActivePlotGroup()))

    const {xMin, xMax, yMin, yMax} = chart.ranges

    const traces = createTraces(groupController, dataNames);

    const frames = getFramesForTCP(groupController.get(getActivePlotGroup()));
    groupController.get(getActivePlotGroup()).addUpdateInformation(chartId, getAnimationSettings(false), generateFrameLookupFromFrames(frames))

    Plotly.react(chart, {
        data: traces,
        layout: getLayoutForCoordinates(chart.layout.title, xMin, xMax, yMin, yMax),
        frames: frames,
    }).then();
}


/**
 * @typedef {{x: number, y: number, error: boolean, name: string, cycleIndex: number}} Coordinate
 */

/**
 * @typedef {{xName: string, yName:string}[]} CoordinateNames
 */

/**
 * @param ACycles {Cycle[]}
 * @param BCycles {Cycle[]}
 * @param dataNames {CoordinateNames}
 * @returns {Coordinate[]}
 */
function extractCoordinates(ACycles, BCycles, dataNames) {
    /**
     * @type {Coordinate[]}
     */
    const ACoordinates = []
    /**
     * @type {Coordinate[]}
     */
    const BCoordinates = []

    function getCoordinatesForCycleGroup(coordinates, cycles) {
        for (let cycle of cycles) {
            const dataPoint = cycle.sequentialDataPoints[1] || cycle.sequentialDataPoints[0]
            for (let i = 0; i < dataNames.length; i++) {
                const x = dataPoint.traversed_attribute(dataNames[i].xName)
                const y = dataPoint.traversed_attribute(dataNames[i].yName)
                coordinates.push({
                    x: x,
                    y: y,
                    error: cycle.hasError(),
                    name: cycle.cycleIndex.toString(),
                    cycleIndex: cycle.cycleIndex
                })
            }
        }
    }

    getCoordinatesForCycleGroup(ACoordinates, ACycles);
    getCoordinatesForCycleGroup(BCoordinates, BCycles);

    return [].concat(ACoordinates, BCoordinates)
}

const markers = {
    past: 'triangle-up-open-dot',
    current: 'circle-open-dot',
    future: 'diamond-open-dot',
    explanation: "circle",
    robot: "circle-open-dot"
}

/**
 *
 * @param coordinates {Coordinate []} -
 * @param active_number {number} - The index of the cycle that is currently active.
 * @param TCP_x {number} - The x coordinate of the TCP at the active cycle
 * @param TCP_y {number} - The y coordinate of the TCP at the active cycle
 * @returns {{}[]}
 */
function _generate_traces_coordinate(coordinates, active_number = 1, TCP_x, TCP_y) {
    const traces = []

    const colorMap = getColorMap()

    const past_coordinates = coordinates.filter((coordinate) => coordinate.cycleIndex < active_number)
    const future_coordinates = coordinates.filter((coordinate) => coordinate.cycleIndex > active_number)
    const active_coordinate = coordinates.filter((coordinate) => coordinate.cycleIndex === active_number)

    traces.push({
        x: [TCP_x],
        y: [TCP_y],
        type: 'scatter',
        mode: 'markers',
        name: "", // Robot. This is empty to get rid of the ugly grey box
        showlegend: false,
        marker: {
            color: colorMap.legend_colors.a,
            symbol: markers.robot,
            size: 20
        },
        hovertemplate: "(%{x}, %{y}) Current TCP Position"
    })

    traces.push({
        x: past_coordinates.map((coordinate) => coordinate.x),
        y: past_coordinates.map((coordinate) => coordinate.y),
        type: 'scatter',
        mode: 'markers',
        name: "", // Past. This is empty to get rid of the ugly grey box
        showlegend: false,
        marker: {
            color: past_coordinates.map((coordinate) => coordinate.error ? colorMap.general.error : colorMap.general.success),
            symbol: markers.past,
            size: 20
        },
        text: past_coordinates.map((coordinate) => coordinate.cycleIndex.toString()),
        hovertemplate: "(%{x}, %{y}) number: %{text} Past"
    })

    traces.push({
        x: future_coordinates.map((coordinate) => coordinate.x),
        y: future_coordinates.map((coordinate) => coordinate.y),
        type: 'scatter',
        mode: 'markers',
        name: "", // Future. This is empty to get rid of the ugly grey box
        showlegend: false,
        marker: {
            color: future_coordinates.map((coordinate) => coordinate.error ? colorMap.general.error : colorMap.general.success),
            symbol: markers.future,
            size: 20,
        },
        text: future_coordinates.map((coordinate) => coordinate.cycleIndex.toString()),
        hovertemplate: "(%{x}, %{y}) number: %{text} Future"
    })

    traces.push({
        x: active_coordinate.map((coordinate) => coordinate.x),
        y: active_coordinate.map((coordinate) => coordinate.y),
        type: 'scatter',
        mode: 'markers',
        name: "", // Current. This is empty to get rid of the ugly grey box
        showlegend: false,
        marker: {
            color: active_coordinate.map((coordinate) => coordinate.error ? colorMap.general.error : colorMap.general.success),
            symbol: markers.current,
            size: 20
        },
        text: active_coordinate.map((coordinate) => coordinate.cycleIndex.toString()),
        hovertemplate: "(%{x}, %{y}) number: %{text} Current"
    })

    return traces
}

function addLegendExplanations(traces) {
    const colorMap = getColorMap()
    traces.push(getTransparentMarkerForLegendExplanation("Error", colorMap.general.error, markers.explanation))
    traces.push(getTransparentMarkerForLegendExplanation("Success", colorMap.general.success, markers.explanation))

    traces.push(getTransparentMarkerForLegendExplanation("Past", colorMap.legend_colors.c, markers.past))
    traces.push(getTransparentMarkerForLegendExplanation("Current", colorMap.legend_colors.c, markers.current))
    traces.push(getTransparentMarkerForLegendExplanation("Future", colorMap.legend_colors.c, markers.future))

    traces.push(getTransparentMarkerForLegendExplanation("Robot TCP position", colorMap.legend_colors.a, markers.robot))
}

function getTransparentMarkerForLegendExplanation(text, color, symbol, TCP_x, TCP_y) {
    return {
        x: [undefined],
        y: [undefined],
        // x: [TCP_x],
        // y: [TCP_y],
        type: 'scatter',
        mode: 'markers',
        name: text,
        marker: {
            color: color,
            symbol: symbol,
            size: 14
        },
        legendGroup: "legendExplanation",
        showLegend: true,
        // visible: "legendonly"
    }
}
