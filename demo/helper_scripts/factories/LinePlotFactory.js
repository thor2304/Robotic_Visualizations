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
async function plotLineChart(chartName, chartId, dataPoints, timestamps, dataNames, errors, plotGroup) {
    const dataArrays = {}

    await createDivForPlotlyChart(chartId)

    for (let i = 0; i < dataNames.length; i++) {
        dataArrays[dataNames[i]] = []
    }

    for (let i = 0; i < dataPoints.length; i++) {
        for (let j = 0; j < dataNames.length; j++) {
            dataArrays[dataNames[j]].push(dataPoints[i].traversed_attribute(dataNames[j]))
        }
    }

    const traces = generate_traces(dataNames, dataArrays, timestamps);

    const frames = new Array(timestamps.length)
    for (let i = 0; i < timestamps.length; i++) {
        frames[i] = {
            name: timestamps[i],
            // data is an array, where each index corresponds to the index of a trace in the traces array
            // Since we only update one value, it will be the first trace in the traces array
            data: [{
                x: [timestamps[i], timestamps[i]],
            }]
        }
    }


    const chart = document.getElementById(chartId)

    const layout = get2dLayout(chartName)
    for(let timespanError of errors){
        console.log(createErrorBar(timespanError.start.time.stepCount, timespanError.end.time.stepCount))
        layout.shapes.push(createErrorBar(timespanError.start.time.stepCount, timespanError.end.time.stepCount))
    }


    await Plotly.newPlot(chart, {
        data: traces,
        layout: layout,
        frames: frames,
    })

    plotGroup.addUpdateInformation(chartId, getAnimationSettings(false))

    chart.on('plotly_click', async function (data) {
        const timestamp = await createAnnotationForClick(data, chartId, false);
        await updateVisualizations(timestamp, plotGroup.identifier);
    })
}

function generate_traces(dataNames, dataArrays, time) {
    const traces = []

    // Generate the vertical line that indicates the current timestamp
    const localMinimums = []

    const localMaximums = []
    for (let i = 0; i < dataNames.length; i++) {
        localMinimums.push(Math.min(...dataArrays[dataNames[i]]))
        localMaximums.push(Math.max(...dataArrays[dataNames[i]]))
    }

    const minY = Math.min(...localMinimums)
    const maxY = Math.max(...localMaximums)

    traces.push({
            x: [time[0], time[0]],
            y: [minY, maxY],
            type: 'linesgl',
            name: 'timestamp',
            line: {
                color: 'rgb(84,130,140)',
                width: 2,
            },
            marker: {
                size: 2,
                visible: false,
            }
        }
    )
    // Generate the traces for the data lines
    for (let i = 0; i < dataNames.length; i++) {
        traces.push({
            x: time,
            y: dataArrays[dataNames[i]],
            type: 'scattergl+linesgl',
            name: dataNames[i]
        })
    }

    return traces
}

async function createAnnotationForClick(data, htmlElementName, showAnnotation = true) {
    const lastIndex = data.points.length - 1

    if (showAnnotation) {
        const annotate_text = 'Timestamp: ' + data.points[lastIndex].x.toPrecision(5) +
            ' y = ' + data.points[lastIndex].y.toPrecision(4);

        const annotation = {
            text: annotate_text,
            x: data.points[lastIndex].x,
            y: parseFloat(data.points[lastIndex].y.toPrecision(4))
        }

        await Plotly.relayout(htmlElementName, {annotations: [annotation]})
    }

    return data.points[lastIndex].x;
}
