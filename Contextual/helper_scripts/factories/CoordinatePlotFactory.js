import {getColorMap} from "../ColorMap.js";
import {get2dLayout} from "./layoutFactory.js";
import {createDivForPlotlyChart} from "./chartDivFactory.js";

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
    const layout = get2dLayout(chartName, false)
    // layout.shapes.push(createBoundingLines())
    layout.xaxis.showline = false
    layout.xaxis.showticklabels = false
    layout.yaxis.showline = false
    layout.yaxis.showticklabels = false
    // layout.xaxis.range = [0, 1]
    // layout.yaxis.range = [0, 1]
    layout.xaxis.autorange = true
    layout.yaxis.autorange = true
    layout.xaxis.scaleanchor = "y"
    layout.xaxis.scaleratio = 1
    layout.xaxis.constrain = "domain"

    const ACycles = groupController.getOptions("A").map((plotGroup) => plotGroup.getCycle())
    const BCycles = groupController.getOptions("B").map((plotGroup) => plotGroup.getCycle())

    const coordinates = extractCoordinates(ACycles, BCycles, dataNames)
    const traces = _generate_traces_coordinate(coordinates)

    // We have no frames here until we want to start animating the 2d plot.
    const plot = await Plotly.newPlot(chart, {
        data: traces,
        layout: layout,
    })

    // Below is commented until we want to have an interactive plot of the cycles.
    // for(let plotGroup of plotGroups){
    //     plotGroup.addUpdateInformation(chartId, getAnimationSettings(false))
    // }
    //
    // chart.on('plotly_click', async function (data) {
    //     // In the future, we want to be able to click on a point and have the corresponding plotgroup changed to reflect that cycle.
    // })
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

    function getCoordinatesForCycleGroup(coordinates, cycles, error) {
        for (let cycle of cycles) {
            const dataPoint = cycle.sequentialDataPoints[1] || cycle.sequentialDataPoints[0]
            for (let i = 0; i < dataNames.length; i++) {
                const x = dataPoint.traversed_attribute(dataNames[i].xName)
                const y = dataPoint.traversed_attribute(dataNames[i].yName)
                coordinates.push({
                    x: x,
                    y: y,
                    error: error,
                    name: cycle.cycleIndex.toString(),
                    cycleIndex: cycle.cycleIndex
                })
            }
        }
    }

    getCoordinatesForCycleGroup(ACoordinates, ACycles, true);
    getCoordinatesForCycleGroup(BCoordinates, BCycles, false);

    return [].concat(ACoordinates, BCoordinates)
}

const markers = {
    past: 'triangle-up-open-dot',
    current: 'circle-open-dot',
    future: 'diamond-open-dot',
    explanation: "circle"
}

/**
 *
 * @param coordinates {Coordinate []} - An array of strings that are passed to dataPoints[i].traversed_attribute(dataNames[j]).
 * @param active_number {number} - The index of the cycle that is currently active.
 * @returns {{}[]}
 */
function _generate_traces_coordinate(coordinates, active_number = 1) {
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

    // Generate the traces for the legend explanation
    traces.push(getTransparentMarkerForLegendExplanation("Error", colorMap.general.error, markers.explanation))
    traces.push(getTransparentMarkerForLegendExplanation("Success", colorMap.general.success, markers.explanation))

    traces.push(getTransparentMarkerForLegendExplanation("Past", colorMap.general.success, markers.past))
    traces.push(getTransparentMarkerForLegendExplanation("Current", colorMap.general.success, markers.current))
    traces.push(getTransparentMarkerForLegendExplanation("Future", colorMap.general.success, markers.future))

    return traces
}

function getTransparentMarkerForLegendExplanation(text, color, symbol) {
    return {
        x: [0],
        y: [0], // We need to put something in here for it to show up. But at the same time we do not want to show the data
        type: 'scatter',
        name: text,
        marker: {
            color: color,
            symbol: symbol,
            size: 20
        },
        legendGroup: "legendExplanation",
        visible: "legendonly"
    }
}
