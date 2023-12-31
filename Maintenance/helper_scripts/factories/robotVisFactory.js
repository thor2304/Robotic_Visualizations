import {getAnimationSettings} from "./animationSettings.js";
import {getColorMap} from "../ColorMap.js";
import {updateVisualizations} from "../updateVisualizations.js";
import {get3dLayout} from "./layoutFactory.js";
import {createDivForPlotlyChart} from "./chartDivFactory.js";

/**
 * @param dataframes {Array<DataPoint>}
 * @param chartId {String}
 * @param plotGroup {PlotGroup}
 * @returns {Promise<void>}
 */
export async function plot3dVis(dataframes, chartId, plotGroup) {
    await createDivForPlotlyChart(chartId)

    const overlap_with_slider = true;

    const traces = []

    const datum = dataframes[0]

    const joints = Object.keys(datum.robot.joints)

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
    // console.log(traces)

    const timestamps = dataframes.map(frame => frame.time.stepCount)
    let frames = [];
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
            // data: joint_data
        })
    }
    // console.log(frames)

    let sliderSteps = [];
    for (let i = 0; i < timestamps.length; i++) {
        sliderSteps.push({
            method: 'animate',
            label: timestamps[i],
            args: [[timestamps[i]],
                {
                    mode: 'immediate',
                    transition: {
                        duration: 0,
                        easing: 'linear'
                    },
                    frame: {duration: 300},
                }],
            execute: false
        });
    }

    const box_size = 1

    const layout = get3dLayout(chartId, box_size, 1.5)

    layout.hovermode = 'closest';
    // Finally, add the slider and use `pad` to position it
    // nicely next to the buttons.
    // layout.sliders = [{
    //     pad: {
    //         l: 20,
    //         r: 20,
    //         t: overlap_with_slider ? -90 : -35,
    //         b: 15,
    //     },
    //     currentvalue: {
    //         visible: true,
    //         prefix: 'stepcount: ',
    //         xanchor: 'right',
    //         font: {
    //             size: 20,
    //             // color: '#666'
    //         }
    //     },
    //     steps: sliderSteps
    // }]

    // Create the plot:
    await Plotly.newPlot(chartId, {
        data: traces,
        layout: layout,
        frames: frames,
    });

    plotGroup.addUpdateInformation(chartId, getAnimationSettings())

    const robotArmvis = document.getElementById(chartId)
    robotArmvis.on('plotly_sliderchange', async function (e) {
        try {
            await updateVisualizations(e.step.value, plotGroup.identifier)
        } catch (exc) {
            console.log(exc)
        }
    })
}