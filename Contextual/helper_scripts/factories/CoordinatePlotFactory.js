import {getColorMap} from "../ColorMap.js";
import {get2dLayout} from "./layoutFactory.js";
import {createDivForPlotlyChart} from "./chartDivFactory.js";
import {getAnimationSettings} from "./animationSettings.js";
import {getActivePlotGroup} from "../updateVisualizations.js";

function getLayoutForCoordinates(chartName, chart, xMin, xMax, yMin, yMax) {
    const layout = get2dLayout(chartName, chart.clientHeight, chart.clientWidth, false)
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

function getFramesForTCP(plotGroup, padCount = 0) {
    const frames = [];
    const datapoints = plotGroup.getCycle().sequentialDataPoints
    const timestamps = plotGroup.getCycle().timestamps

    const padData = []
    for (let i = 0; i < padCount; i++) {
        padData.push({})
    }

    for (let i = 0; i < timestamps.length; i++) {
        const dataArray = []
        padData.forEach(pad => {
            dataArray.push(pad)
        })

        dataArray.push({
            x: [datapoints[i].robot.tool.position.x],
            y: [datapoints[i].robot.tool.position.y],
        })

        try {
            frames.push({
                name: timestamps[i],
                data: dataArray,
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
export async function plotCoordinates(chartId, dataNames, groupController, chartName = undefined, plotGroup = undefined) {
    const chart = await createDivForPlotlyChart(chartId)

    if (plotGroup === undefined) {
        plotGroup = groupController.get(getActivePlotGroup())
    }

    if (chartName === undefined) {
        chartName = chart.layout.title
    }

    const traces = createTraces(groupController, dataNames);

    let ranges = chart.ranges
    if (ranges === undefined) {
        ranges = getRanges(traces, groupController.rawFrames);
    }

    const frames = getFramesForTCP(plotGroup, traces.length - 1);

    addLegendExplanations(traces);

    const layout = getLayoutForCoordinates(chartName, chart, ranges.xMin, ranges.xMax, ranges.yMin, ranges.yMax);

    const plot = await Plotly.react(chart, {
        data: traces,
        layout: layout,
        // frames: frames,
    })

    plot.ranges = ranges

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
 * @typedef {{x: number, y: number, color: string, name: string, cycleIndex: number}} Coordinate
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

                let color = getColorMap().general.success
                if (cycle.hasError()) {
                    color = getColorMap().general.error
                } else if (cycle.hasWarning()) {
                    color = getColorMap().general.warning
                }
                coordinates.push({
                    x: x,
                    y: y,
                    color: color,
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
    present: 'circle-open-dot',
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
        x: past_coordinates.map((coordinate) => coordinate.x),
        y: past_coordinates.map((coordinate) => coordinate.y),
        type: 'scatter',
        mode: 'markers',
        name: "", // Past. This is empty to get rid of the ugly grey box
        showlegend: false,
        marker: {
            color: past_coordinates.map((coordinate) => coordinate.color),
            symbol: markers.past,
            size: 20,
            line: {
                width: 2
            }
        },
        text: past_coordinates.map((coordinate) => (coordinate.cycleIndex + 1).toString()),
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
            color: future_coordinates.map((coordinate) => coordinate.color),
            symbol: markers.future,
            size: 20,
            line: {
                width: 2
            }
        },
        text: future_coordinates.map((coordinate) => (coordinate.cycleIndex + 1).toString()),
        hovertemplate: "(%{x}, %{y}) number: %{text} Future"
    })

    traces.push({
        x: active_coordinate.map((coordinate) => coordinate.x),
        y: active_coordinate.map((coordinate) => coordinate.y),
        type: 'scatter',
        mode: 'markers',
        name: "", // Present. This is empty to get rid of the ugly grey box
        showlegend: false,
        marker: {
            color: active_coordinate.map((coordinate) => coordinate.color),
            symbol: markers.present,
            size: 20,
            line: {
                width: 2
            }
        },
        text: active_coordinate.map((coordinate) => (coordinate.cycleIndex + 1).toString()),
        hovertemplate: "(%{x}, %{y}) number: %{text} Present"
    })

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
            size: 20,
            line: {
                width: 2
            }
        },
        hovertemplate: "(%{x}, %{y}) Present TCP Position"
    })

    return traces
}

function addLegendExplanations(traces) {
    const colorMap = getColorMap()
    traces.push(getTransparentMarkerForLegendExplanation("Error", colorMap.general.error, markers.explanation))
    traces.push(getTransparentMarkerForLegendExplanation("Success", colorMap.general.success, markers.explanation))
    traces.push(getTransparentMarkerForLegendExplanation("Warning", colorMap.general.warning, markers.explanation))

    traces.push(getTransparentMarkerForLegendExplanation("Past", colorMap.general.text_on_background, markers.past))
    traces.push(getTransparentMarkerForLegendExplanation("Present", colorMap.general.text_on_background, markers.present))
    traces.push(getTransparentMarkerForLegendExplanation("Future", colorMap.general.text_on_background, markers.future))

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
