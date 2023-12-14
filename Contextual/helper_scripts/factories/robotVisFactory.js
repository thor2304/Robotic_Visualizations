import {getAnimationSettings} from "./animationSettings.js";
import {getColorMap} from "../ColorMap.js";
import {updateVisualizations} from "../updateVisualizations.js";
import {get3dLayout} from "./layoutFactory.js";
import {createDivForPlotlyChart} from "./chartDivFactory.js";


/**
 * This method is responsible for creating a 3d visualization of the robot.<br>
 * It creates a plotly chart and adds it to the DOM.<br>
 * It also registers this chart with the plotGroup, so that it is updated when the slider is moved.
 *
 * @param dataframes {Array<DataPoint>}
 * @param chartId {String}
 * @param chartTitle {String}
 * @param plotGroup {PlotGroup}
 * @returns {Promise<void>}
 */
export async function plot3dVis(dataframes, chartId, chartTitle, plotGroup) {
    const chart = await createDivForPlotlyChart(chartId)

    const datum = dataframes[0]

    const joints = Object.keys(datum.robot.joints)

    const traces = createTraces(joints, datum);

    let frames = createFrames(dataframes, joints);

    const box_size = 1

    const layout = getCustomLayout(chartTitle, box_size, chart);

    // Create the plot:
    // This one uses newPlot instead of react, because with react there is a bug where it resets the layout when scrubbing time after having changed the cycle.
    await Plotly.newPlot(chartId, {
        data: traces,
        layout: layout,
    });

    const frameLookup = createFrameLookup(frames);

    plotGroup.addUpdateInformation(chartId, getAnimationSettings(), frameLookup)
}

/**
 *
 * @param joints {String[]}
 * @param datum {DataPoint}
 * @return {Object[]}
 */
function createTraces(joints, datum) {
    const traces = []

    traces.push({
        name: "lines",
        id: "lines",
        text: "lines",
        x: [],
        y: [],
        z: [],
        mode: 'lines',
        type: 'scatter3d',
        line: {
            color: getColorMap().legend_colors.connecting_line,
            width: 6
        },
        hoverinfo: "skip",
        showlegend: false,
    })

    for (let i = 0; i < joints.length; i++) {
        const joint = datum.robot.joints[joints[i]];

        traces.push({
            name: joints[i],
            x: [joint.position.x],
            y: [joint.position.y],
            z: [joint.position.z],
            id: joints[i],
            text: joints[i],
            marker: {
                size: 6,
                line: {
                    color: getColorMap().legend_colors.a,
                    width: 0.5
                },
                color: getColorMap().legend_colors_array[i],
                opacity: 0.8
            },
            mode: 'markers',
            type: 'scatter3d'
        });

        traces[0].x.push(joint.position.x)
        traces[0].y.push(joint.position.y)
        traces[0].z.push(joint.position.z)
    }
    return traces;
}

/**
 *
 * @param dataframes {Array<DataPoint>}
 * @param joints {String[]}
 * @return {{name:string, data:{id: [string],text: [string], x: [string], y:[string], z:[string] }[]}[]}
 */
function createFrames(dataframes, joints) {
    let frames = [];
    const timestamps = dataframes.map(frame => frame.time.stepCount)
    for (let i = 0; i < timestamps.length; i++) {
        const joint_data = joints.map(joint => {
            return {
                id: [joint],
                text: [joint],
                x: [dataframes[i].robot.joints[joint].position.x],
                y: [dataframes[i].robot.joints[joint].position.y],
                z: [dataframes[i].robot.joints[joint].position.z],
            }
        })

        const line_data = [{
            id: ["lines"],
            text: ["line"],
            x: joints.map(joint => dataframes[i].robot.joints[joint].position.x),
            y: joints.map(joint => dataframes[i].robot.joints[joint].position.y),
            z: joints.map(joint => dataframes[i].robot.joints[joint].position.z),
        }]

        frames.push({
            name: timestamps[i],
            data: line_data.concat(joint_data)
        })
    }
    return frames;
}

/**
 *
 * @param chartTitle {String}
 * @param box_size {Number}
 * @param chart {HTMLElement}
 * @return {{xaxis: {automargin: boolean}, margin: {r: number, b: number, pad: number, t: number, l: number}, plot_bgcolor: string, paper_bgcolor: string, title, yaxis: {automargin: boolean}, autosize: boolean, scene: {xaxis: {color: string, range: (number|*)[], title: string}, aspectmode: string, yaxis: {color: string, range: (number|*)[], title: string}, zaxis: {color: string, range: (number|*)[], title: string}, aspectratio: {x: number, y: number, z: number}}, showlegend: boolean, legend: {x: number, xanchor: string, y: number}}}
 */
function getCustomLayout(chartTitle, box_size, chart) {
    const layout = get3dLayout(chartTitle, box_size, chart.clientWidth, chart.clientHeight, 1.5)
    layout.hovermode = 'closest';
    return layout;
}

/**
 *
 * @param frames {Array<{}>}
 * @return {{}}
 */
function createFrameLookup(frames) {
    const frameLookup = {}
    for (let i = 0; i < frames.length; i++) {
        frameLookup[frames[i].name] = frames[i]
    }
    return frameLookup;
}