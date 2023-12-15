/**
 * @typedef {number | `${number}`} Timestamp
 */
import {PlotGroup} from "./datastructures/PlotGroup.js";
import {get_cycles} from "./helper_scripts/cycle_filtering.js";
import {getActivePlotGroup, updateVisualizations} from "./helper_scripts/updateVisualizations.js";
import {populatePickers} from "./helper_scripts/cycle-picker.js";
import {plotCoordinates} from "./helper_scripts/factories/CoordinatePlotFactory.js";
import {load_data_then_call} from "./helper_scripts/load_csv_data.js";
import {convert_EDDE_to_data_frames} from "./helper_scripts/EDDE_loader.js";
import {makeAllDraggable} from "./fluid_layout/make_draggable.js";
import {filter_raw_data} from "./helper_scripts/targeted_filtering.js";
import {GroupController} from "./datastructures/GroupController.js";
import {convertFlightRecordDataToDataPoints} from "./file_upload/flightRecordTranslations.js";
import {updateContainers, visualizationContainer} from "./fluid_layout/column_resize.js";
import {registerSliderTimestamps} from "./helper_scripts/slider-control.js";
import {sendToBottom} from "./fluid_layout/sendToBottom.js";
import {PlotRequest, plotTypes} from "./datastructures/PlotRequest.js";
import {Cycle} from "./datastructures/Cycle.js";


export const groups = new GroupController();


const scriptOffset = 1468;

export function getScriptOffset() {
    return scriptOffset
}

// The .then at the end is used to await the promise
load_data_then_call(plot_raw_data).then()

/**
 * @param firstSepCount {number}
 */
function finalizePlotting(firstSepCount) {
    // Mark all vis containers as loaded, to remove the loading text
    const visContainers = document.getElementsByClassName("vis-placeholder");
    for (const visContainer of visContainers ){
        visContainer.classList.add("loaded")
    }

    // Updating immediately after loading, populates the variable showcase with the first datapoint
    updateVisualizations(firstSepCount, getActivePlotGroup())

    makeAllDraggable()
    updateContainers()

    visualizationContainer.dispatchEvent(new Event('populated'));

    groups.updateCycleText("1")
}

/**
 * @param groupIdentifier {PlotGroupIdentifier}
 * @returns {string}
 */
export function getIdPrefix(groupIdentifier) {
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
    const namePrefix = ``

    const plotRequests = [
        // new PlotRequest(`${namePrefix} Bar Chart`, `${idPrefix}barchart`, ["controller.executionTime"], plotTypes.bar),
        // new PlotRequest(`${namePrefix}3D TCP Vis`, `${idPrefix}3d_tcp_vis`, ["robot.tool.positionError"], plotTypes.direction),
        new PlotRequest(`${namePrefix}3D Robot Arm`, `${idPrefix}3dAnimation`, [], plotTypes.robot),
        new PlotRequest(`${namePrefix}Vacuum Levels`, `${idPrefix}lineGraph`, ["scriptVariables.vg_Vacuum_A.value", "scriptVariables.vg_Vacuum_B.value","scriptVariables.vacuum_level.value"],  plotTypes.line, "%"),
        new PlotRequest(`${namePrefix}Robot gripper is holding`, `${idPrefix}holdingPlot`, ["custom.is_holding_A", "custom.is_holding_B",], plotTypes.line),
        new PlotRequest(`${namePrefix}variable_table`, `${idPrefix}variable_vis`, [], plotTypes.table),
    ]

    return new PlotGroup(plotRequests, variablesForMaxima, groupIdentifier)
}

/**
 * @param data {Array<Object>}
 * @param dataSource {"EDDE" | "FlightRecord"|"RTDE"}
 * @returns {Promise<void>}
 */
async function plot_raw_data(data, dataSource = "EDDE") {
    console.log("starting timing of plot_raw_data")
    const start = performance.now();

    const groupA = createGroup("A");

    await groupA.createDivsForPlots();

    // 2. Shared operation for both groups
    let rawFrames;

    if (dataSource === "FlightRecord") {
        rawFrames = await convertFlightRecordDataToDataPoints(data);
    } else if (dataSource === "EDDE" || dataSource === "RTDE") {
        data = filter_raw_data(data);
        rawFrames = await convert_EDDE_to_data_frames(data); // This method is the cause of all loading time
    }

    rawFrames = rawFrames.filter(frame => frame.time.stepCount !== undefined)
    const frameTime = performance.now()

    // end of 2.
    const cycles = get_cycles(rawFrames);

    if (cycles.length === 0) {
        cycles.push(new Cycle(rawFrames, 0))
    }

    groups.initialize(groupA)

    groups.addRawFrames(rawFrames)
    groupA.setCycle(cycles[0])

    registerSliderTimestamps(groupA.cycle.sequentialDataPoints)

    for (let i = 1; i < cycles.length; i++) {
        const newGroup = createGroup("A")
        newGroup.setCycle(cycles[i])
        groups.addOption(newGroup)
    }


    let firstStep = groupA.cycle.sequentialDataPoints[0].time.stepCount;

    if (firstStep === undefined) {
        console.log("First step not available, moving on to find the first point with it defined")
        for (const datapoint of groupA.cycle.sequentialDataPoints) {
            if (datapoint.time.stepCount !== undefined) {
                firstStep = datapoint.time.stepCount;
                break;
            }
        }
    }

    populatePickers(groups)


    // 3.1 Per group operations that might interfere with the other group
    // for (const key of Object.keys(groupA.maxima)) {
    //     await createButtonAndWarningLine(groupA.maxima[key].stepcount, key + " max", groupA.identifier)
    // }
    // end of 3.1

    // 4. Shared operation for both groups
    const plotPromises = groupA.getPlotPromises();
    // plotPromises.push(...groupB.getPlotPromises());
    await Promise.all(plotPromises);

    await plotCoordinates(
        "test",
        [{xName: "custom.target_x", yName: "custom.target_y"}],
        groups,
        "Pickup positions"
    )

    // 5. shared operations for both groups
    finalizePlotting(firstStep);

    const end = performance.now();
    console.log(`Total time: ${end - start}ms`)
    console.log(`Frame time: ${frameTime - start}ms`)

    sendToBottom()
    // end of 5.
}
