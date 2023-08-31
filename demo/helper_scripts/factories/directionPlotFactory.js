/**
 * Creates a plotly plot with the given data displayed in the form of an arrow for each DataName
 * @param chartName - Name of the chart
 * @param chartId - htmlID of the chart
 * @param dataPoints - Array of DataPoints
 * @param timestamps - Array of timestamps
 * @param dataNames - Array of DataNames. These are used for traversing in each datapoint. This is therefore in the shape of "robot.tool.positionError" without x,y,z
 * @returns {Promise<PlotlyHTMLElement>}
 */
async function plotDirection(chartName, chartId, dataPoints, timestamps, dataNames) {
    const traces = []

    for (let i = 0; i < dataNames.length; i++) {
        traces.push(...createArrowTraces(dataPoints, dataNames[i]))
    }

    console.log(traces)

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

    console.log(scale)

    const layout = get3dLayout(chartName, scale)
    const layoutSec = get3dLayout(chartName, scale)

    console.log(frames)
    console.log(layoutSec)

    updatingPlots.push([chartId, getAnimationSettings()])

    return await Plotly.newPlot(chartId, {
        data: traces,
        frames: frames,
        layout: layout,
    })
}

const arrow_tip_ratio = 1.5;
const arrow_starting_ratio = 0.95;

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

    line.name = dataName
    line.text = dataName
    line.mode = 'lines'
    line.type = 'scatter3d'
    line.colorscale = 'Viridis'
    line.line = {
        // color: 'rgb(82, 146, 222)',
        width: 14
    }

    ArrowHead.name = ""
    ArrowHead.text = ""
    ArrowHead.type = "cone"
    // ArrowHead.colorscale = 'Viridis'
    ArrowHead.color = 'rgb(82, 146, 222)'
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
            color: 'rgb(82, 146, 222)',
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