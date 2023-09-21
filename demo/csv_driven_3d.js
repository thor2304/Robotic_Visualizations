/**
 * Datapoints is a dictionary that maps a timestamp to a datapoint object.
 * This mapping should follow the datapoint that is visualized at this timestamp by plotly.
 * It is used for debugging by printing the datapoint to the console. As well as for highlighting the line hit
 * @type {Object<number, DataPoint>}
 */
let datapoints = {}

const datapoints_linked = new LinkedList()

const scriptOffset = 1468;

function getScriptOffset(){
    return scriptOffset
}

const cycle_index = 1

function finalizePlotting(firstSepCount) {
    // Mark all vis containers as loaded, to remove the loading text
    const visContainers = document.getElementsByClassName("vis-placeholder");
    for (let i = 0; i < visContainers.length; i++) {
        visContainers[i].classList.add("loaded");
    }

    // Updating immediately after loading, populates the variable showcase with the first datapoint
    updateVisualizations(firstSepCount)

    makeAllDraggable()
}

/**
 * @param data {Array<Object>}
 * @returns {Promise<void>}
 */
async function plot_raw_data(data) {
    // 1. Per group operations. Must be the very first thing done in this function. To display loading divs
    const robotArmChartId = "3dAnimation"
    const lineGraphId = "lineGraph"
    const ArrowVisId = "3d_tcp_vis"
    await createDivsForPlotlyCharts([robotArmChartId, lineGraphId, ArrowVisId])

    await createDivForTable("variable_vis", "variable_showcase", ["Variable", "Value"])
    // end of 1.

    // 2. Shared operation for both groups
    const reduced_data = pick_every_x_from_array(data, 5);
    const rawFrames = await convert_EDDE_to_data_frames(reduced_data); // This method is the cause of all loading time
    // print_script_lines(rawFrames);
    // end of 2.

    // 3. Per group operations
    const frames = get_cycle(rawFrames, cycle_index);
    console.log("frames generated, next step plotting->", frames)

    await addHighlightLineToDataPoints(frames)

    /**
     * @type {number[]}
     */
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

    // 3.1 Per group operations that might interfere with the other group
    for (let i = 0; i < variablesForError.length; i++) {
        await createButtonAndErrorLine(maxValues[variablesForError[i]].stepcount, variablesForError[i] + " max")
    }
    // end of 3.1

    const errors = await detectErrors(frames)
    // end of 3.

    // 4. Shared operation for both groups
    await Promise.all([plot3dVis(frames, robotArmChartId), plot_line_graph(frames, timestamps, lineGraphId, errors), plot_tcp_error_3d(frames, timestamps, ArrowVisId)]);

    // 5. shared operations for both groups
    finalizePlotting(frames[0].time.stepCount);
    // end of 5.
}

/**
 * { [x: string]: {stepcount:string, value: number} }
 * @param dataPoints {Array<DataPoint>}
 * @param variablePathArray {Array<String>} An array of paths that will be passed to DataPoint.traversed_attribute()
 * @returns {Promise<{ [x: string]: {stepcount:number, value: number} }>}  Of the form {variablePath: {stepcount: number, value: number}}
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

/**
 * @param dataframes {Array<DataPoint>}
 * @param timestamps {Array<Number>}
 * @param chartId {String}
 * @param errors {TimespanError[]}
 * @returns {Promise<void>}
 */
async function plot_line_graph(dataframes, timestamps, chartId, errors) {
    // const chartName = 'TCP Error'
    // const dataNames = [
    //     "robot.tool.positionError.x",
    //     "robot.tool.positionError.y",
    //     "robot.tool.positionError.z",
    //     "robot.tool.positionError.magnitude",
    // ]

    const chartName = "Vacuum level"
    const dataNames = [
        "scriptVariables.vg_Vacuum_A.value",
        "scriptVariables.vg_Vacuum_B.value",
    ]

    await plotLineChart(chartName, chartId, dataframes, timestamps, dataNames, errors)
}

async function plot_tcp_error_3d(dataframes, timestamps, chartId) {
    await plotDirection("TCP Error", chartId, dataframes, timestamps, ["robot.tool.positionError"])
}

load_data_then_call(plot_raw_data)