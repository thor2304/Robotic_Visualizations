
/**
 * @typedef {number | `${number}`} Timestamp
 */

const groups = new GroupController();


const scriptOffset = 1468;

function getScriptOffset() {
    return scriptOffset
}

const cycle_index = 1

/**
 * @param firstSepCount {number}
 */
function finalizePlotting(firstSepCount) {
    // Mark all vis containers as loaded, to remove the loading text
    const visContainers = document.getElementsByClassName("vis-placeholder");
    for (let i = 0; i < visContainers.length; i++) {
        visContainers[i].classList.add("loaded");
    }

    // Updating immediately after loading, populates the variable showcase with the first datapoint
    updateVisualizations(firstSepCount, getActivePlotGroup())

    makeAllDraggable()
}

/**
 * @param groupIdentifier {PlotGroupIdentifier}
 * @returns {string}
 */
function getIdPrefix(groupIdentifier) {
    return `${groupIdentifier}-`
}

/**
 *
 * @param groupIdentifier {PlotGroupIdentifier}
 * @returns {PlotGroup}
 */
function createGroup(groupIdentifier) {
    const variablesForMaxima = ["robot.tool.measuredForce.magnitude", "robot.tool.positionError.magnitude", "controller.memoryUsage",
        "custom.current_window_diff_0", "custom.current_window_diff_1", "custom.current_window_diff_2", "custom.current_window_diff_3", "custom.current_window_diff_4", "custom.current_window_diff_5"];

    const idPrefix = getIdPrefix(groupIdentifier)
    const namePrefix = `${groupIdentifier}: `

    const plotRequests = [
        new PlotRequest(`${namePrefix}3D Robot Arm`, `${idPrefix}3dAnimation`, [], plotTypes.robot),
        new PlotRequest(`${namePrefix}Line Graph`, `${idPrefix}lineGraph`, ["scriptVariables.vg_Vacuum_A.value", "scriptVariables.vg_Vacuum_B.value",], plotTypes.line),
        new PlotRequest(`${namePrefix}3D TCP Vis`, `${idPrefix}3d_tcp_vis`, ["robot.tool.positionError"], plotTypes.direction),
        new PlotRequest(`${namePrefix}variable_table`, `${idPrefix}variable_vis`, [], plotTypes.table),
    ]

    return new PlotGroup(plotRequests, variablesForMaxima, groupIdentifier)
}

/**
 * @param data {Array<Object>}
 * @returns {Promise<void>}
 */
async function plot_raw_data(data) {
    const groupA = createGroup("A");
    const alternateGroupA = createGroup("A");
    const groupB = createGroup("B");

    await groupA.createDivsForPlots();
    await alternateGroupA.createDivsForPlots();
    await groupB.createDivsForPlots();

    // 2. Shared operation for both groups
    const reduced_data = pick_every_x_from_array(data, 5);
    const rawFrames = await convert_EDDE_to_data_frames(reduced_data); // This method is the cause of all loading time
    // print_script_lines(rawFrames);
    // end of 2.

    // 3. Per group operations
    groupA.setCycle(get_cycle(rawFrames, cycle_index));
    const firstStep = groupA.cycle.sequentialDataPoints[0].time.stepCount;
    alternateGroupA.setCycle(get_cycle(rawFrames, cycle_index + 1));

    groupB.setCycle(get_cycle(rawFrames, cycle_index + 1));


    groups.initialize(groupA, groupB)
    groups.addOptionA(alternateGroupA)

    // 3.1 Per group operations that might interfere with the other group
    // for (let i = 0; i < variablesForError.length; i++) {
    //     await createButtonAndErrorLine(maxValues[variablesForError[i]].stepcount, variablesForError[i] + " max", groupA.identifier)
    // }
    // end of 3.1

    // 4. Shared operation for both groups
    const plotPromises = groupA.getPlotPromises();
    plotPromises.push(...groupB.getPlotPromises());
    await Promise.all(plotPromises);

    // 5. shared operations for both groups
    finalizePlotting(firstStep);
    // end of 5.
}

/**
 * { [x: string]: {stepcount:string, value: number} }
 * @param dataPoints {Array<DataPoint>}
 * @param variablePathArray {Array<String>} An array of paths that will be passed to DataPoint.traversed_attribute()
 * @returns {Promise<{ [x: string]: {stepcount:number, value: number} }>}  Of the form {variablePath: {stepcount: number, value: number}}
 */
function findMaxOfVariables(dataPoints, variablePathArray) {
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
 * @param dataframes {DataPoint[]}
 * @param timestamps {Timestamp[]}
 * @param chartId {string}
 * @param errors {TimespanError[]}
 * @param plotGroupIdentifier {PlotGroup}
 * @returns {Promise<void>}
 */
async function plot_line_graph(dataframes, timestamps, chartId, errors, plotGroupIdentifier) {
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

    await plotLineChart(chartName, chartId, dataframes, timestamps, dataNames, errors, plotGroupIdentifier)
}

load_data_then_call(plot_raw_data).then(r => ("loaded"))