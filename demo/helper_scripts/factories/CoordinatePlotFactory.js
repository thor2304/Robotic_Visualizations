/**
 * Creates a 2d plot, that shows the values of the datanames provided at the first timestamp of the cycles provided.
 * @param chartName {string} - The name of the chart displayed as the title
 * @param chartId {string} - The id of the htmlElement into which the chart will be created
 * @param dataNames {string []} - An array of strings that are passed to dataPoints[i].traversed_attribute(dataNames[j]).
 * These are the names of the attributes that will be plotted.
 * @param groupController {GroupController} - The plotgroups that together contain all the relevant cycles.
 * @returns {Promise<void>}
 */
async function plotCoordinates(chartName, chartId, dataNames, groupController){
    const chart = await createDivForPlotlyChart(chartId)
    const layout = get2dLayout(chartName)

    const ACycles = groupController.getOptions("A").map((plotgroup) => plotgroup.getCycle())
    const BCycles = groupController.getOptions("B").map((plotgroup) => plotgroup.getCycle())

    const coordinates = extractCoordinates(ACycles, BCycles, dataNames)
    const traces = _generate_traces_coordinate(coordinates)

    // We have no frames here until we want to start animating the 2d plot.
    await Plotly.newPlot(chart, {
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
 * @typedef {{x: number, y: number, error: boolean}} Coordinate
 */

/**
 * @param ACycles {Cycle[]}
 * @param BCycles {Cycle[]}
 * @param dataNames {string []}
 * @returns {Coordinate []}
 */
function extractCoordinates(ACycles, BCycles, dataNames){
    return [
        {x: 0, y: 1, error: false},
        {x: 1, y: 0.5, error: true},
    ]
}

/**
 *
 * @param coordinates {Coordinate []} - An array of strings that are passed to dataPoints[i].traversed_attribute(dataNames[j]).
 * @returns {{}[]}
 */
function _generate_traces_coordinate(coordinates) {
    const traces = []

    // Generate the traces for the data lines
    for (let i = 0; i < coordinates.length; i++) {
        traces.push({
            x: coordinates[i].x,
            y: coordinates[i].y,
            type: 'scattergl',
            name: coordinates[i],
            marker: {
                color: coordinates[i].error ? 'red' : 'blue',
                symbol: coordinates[i].error ? 'circle' : 'diamond',
            }
        })
    }

    return traces
}
