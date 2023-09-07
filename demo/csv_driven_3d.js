// Datapoints is a dictionary that maps a timestamp to a datapoint object.
// This mapping should follow the datapoint that is visualized at this timestamp by plotly.
// It is used for debugging by printing the datapoint to the console. As well as for highlighting the line hit
let datapoints = {}

const datapoints_linked = new LinkedList()

// This is a list of all the plots that are currently updating.
// Push information as arrays, that are to be passed to Plotly.animate(plot_name, settings)
let updatingPlots = [];

const scriptOffset = 1467;

let available_variable_names = [""]

async function plot_raw_data(data) {
    const reduced_data = pick_every_x_from_array(data, 10);
    const rawFrames = await convert_EDDE_to_data_frames(reduced_data);
    print_script_lines(rawFrames);

    const frames = reduce_to_cycle(rawFrames);
    console.log("frames generated, next step plotting->", frames)

    available_variable_names = extract_available_variables(frames[frames.length - 1]);
    console.log("available_variable_names", available_variable_names)

    const timestamps = []
    // Add the frames to the datapoints dictionary and timestamps array, and the next_datapoint_name
    for (let i = 0; i < frames.length; i++) {
        datapoints[frames[i].time.stepCount] = frames[i]
        timestamps.push(frames[i].time.stepCount)
        datapoints_linked.push(frames[i].time.stepCount)
    }

    const variablesForError = [
        "robot.tool.measuredForce.magnitude", "robot.tool.positionError.magnitude", "controller.memoryUsage",
        "custom.current_window_diff_0", "custom.current_window_diff_1", "custom.current_window_diff_2", "custom.current_window_diff_3", "custom.current_window_diff_4", "custom.current_window_diff_5"
    ]
    const maxValues = await findMaxOfVariables(frames, variablesForError)

    console.table(maxValues)

    for (let i = 0; i < variablesForError.length; i++) {
        await createButtonJumpingToTimeStamp(maxValues[variablesForError[i]].stepcount, variablesForError[i] + " max")
    }

    await Promise.all([plot3dVis(frames), plot_tcp_error(frames, timestamps), plot_tcp_error_3d(frames, timestamps)]);

    // Mark all vis containers as loaded, to remove the loading text
    const visContainers = document.getElementsByClassName("vis-placeholder");
    for (let i = 0; i < visContainers.length; i++) {
        visContainers[i].classList.add("loaded");
    }
}

/**
 *
 * @param dataPoints
 * @param variablePathArray An array of paths that will be passed to DataPoint.traversed_attribute()
 * @returns {Promise<{}>}  Of the form {variablePath: {stepcount: number, value: number}}
 */
async function findMaxOfVariables(dataPoints, variablePathArray) {
    const currentMax = {}
    for (let variablePath of variablePathArray) {
        currentMax[variablePath] = {
            stepcount: undefined,
            value: 0
        }
    }

    for (let i = 0; i < dataPoints.length; i++) {
        const dataPoint = dataPoints[i];
        for (let variablePath of variablePathArray) {
            const value = dataPoint.traversed_attribute(variablePath)
            if (value > currentMax[variablePath].value) {
                currentMax[variablePath].value = value
                currentMax[variablePath].stepcount = dataPoint.time.stepCount
            }
        }
    }

    return currentMax
}


async function plot3dVis(dataframes) {
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
            color: 'rgb(82, 146, 222)',
            width: 6
        },
        hoverinfo: "skip",
        showlegend: false,
    })

    for (let i = 0; i < joints.length; i++) {
        let joint = datum.robot.joints[joints[i]];

        const greyscale_color = (255 / joints.length) * i
        const r_color = (124 / joints.length) * i + 100
        const g_color = 255 - (124 / joints.length) * i
        const b_color = 200

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
                    color: 'rgba(217, 217, 217, 0.14)',
                    width: 3
                },
                color: `rgb(${r_color}, ${g_color}, ${b_color})`,
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

    let layout = {
        autosize: true,
        margin: {
            l: 0,
            r: 0,
            b: 0,
            t: 5,
            pad: 4
        },
        xaxis: {
            automargin: true,
        },
        yaxis: {
            automargin: true,
        },
        paper_bgcolor: '#303f4b00',
        plot_bgcolor: '#b7b7b700',
        scene: {
            aspectmode: "manual",
            aspectratio: {
                x: 1, y: 1, z: 1,
            },
            xaxis: {
                title: 'x',
                range: [-box_size, box_size],
                color: "red"
            },
            yaxis: {
                title: 'y',
                range: [-box_size, box_size],
                color: "green"
            },
            zaxis: {
                title: 'z',
                range: [-box_size, box_size],
                color: "blue"
            }
        },
        hovermode: 'closest',
        // Finally, add the slider and use `pad` to position it
        // nicely next to the buttons.
        sliders: [{
            pad: {
                l: 20,
                t: overlap_with_slider ? -90 : -35,
                b: 15,
            },
            currentvalue: {
                visible: true,
                prefix: 'stepcount: ',
                xanchor: 'right',
                font: {
                    size: 20,
                    // color: '#666'
                }
            },
            steps: sliderSteps
        }]
    }

// Create the plot:
    await Plotly.newPlot('3dAnimation', {
        data: traces,
        layout: layout,
        frames: frames,
    });

    updatingPlots.push(['3dAnimation', getAnimationSettings()])

    const robotArmvis = document.getElementById('3dAnimation')
    robotArmvis.on('plotly_sliderchange', async function (e) {
        try{
            await updateVisualizations(e.step.value)

        }catch (exc){
            console.log(exc)
        }
    })
}

async function updateVisualizations(timestamp) {
    datapoints_linked.updateCurrent(timestamp);

    const calls = []

    for (let i = 0; i < updatingPlots.length; i++) {
        calls.push(Plotly.animate(updatingPlots[i][0], [timestamp], updatingPlots[i][1]))
    }

    calls.push(update_variable_showcase(timestamp))

    try{
        await Promise.all(calls);
    }catch (e){
        console.log("promise all: " + e)
    }

    await highlight_line(datapoints[timestamp].time.lineNumber, scriptOffset)
}


async function plot_tcp_error(dataframes, timestamps) {
    const chartName = 'TCP Error'
    const chartId = 'tcp_vis'
    const dataNames = [
        "robot.tool.positionError.x",
        "robot.tool.positionError.y",
        "robot.tool.positionError.z",
        "robot.tool.positionError.magnitude",
    ]

    await plotLineChart(chartName, chartId, dataframes, timestamps, dataNames)
}

async function plot_tcp_error_3d(dataframes, timestamps) {
    await plotDirection("TCP Error", "3d_tcp_vis", dataframes, timestamps, ["robot.tool.positionError"])
}

load_data_then_call(plot_raw_data)