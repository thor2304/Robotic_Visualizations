/**
 * Creates a line plot with the given dataPoints and data names
 * @param chartName - The name of the chart displayed as the title
 * @param chartId - The id of the htmlElement into which the chart will be created
 * @param dataPoints - An array of dataPoints
 * @param timestamps - An array of timestamps
 * @param dataNames - An array of strings that are passed to dataPoints[i].traversed_attribute(dataNames[j]).
 * These are the names of the attributes that will be plotted.
 * @returns {Promise<void>}
 */
async function plotLineChart(chartName, chartId, dataPoints, timestamps, dataNames) {
    const dataArrays = {}

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

    await Plotly.newPlot(chart, {
        data: traces,
        layout: get2dLayout(chartName),
        frames: frames,
    })

    updatingPlots.push([chartId, getAnimationSettings(false)])

    chart.on('plotly_click', async function (data) {
        let timestamp = await createAnnotationForClick(data, chartId, false);
        await updateVisualizations(timestamp);
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

    let minY = Math.min(...localMinimums)
    let maxY = Math.max(...localMaximums)

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
