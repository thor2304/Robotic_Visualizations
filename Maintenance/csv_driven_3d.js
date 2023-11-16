/**
 * @typedef {number | `${number}`} Timestamp
 */
import {Cycle, PlotGroup, PlotRequest, plotTypes} from "./datastructures/PlotGroup.js";
import {get_cycles, pick_every_x_from_array} from "./helper_scripts/cycle_filtering.js";
import {getActivePlotGroup, updateVisualizations} from "./helper_scripts/updateVisualizations.js";
// import {populatePickers} from "./helper_scripts/cycle-picker.js";
import {createButtonAndWarningLine} from "./source_code_visualization/ErrorHighlightingLine.js";
import {load_data_then_call} from "./helper_scripts/load_csv_data.js";
import {convert_EDDE_to_data_frames} from "./helper_scripts/EDDE_loader.js";
import {makeAllDraggable} from "./fluid_layout/make_draggable.js";
import {filter_raw_data} from "./helper_scripts/targeted_filtering.js";
import {GroupController} from "./datastructures/GroupController.js";
import {convertFlightRecordDataToDataPoints} from "./file_upload/flightRecordTranslations.js";
import {showStrain} from "./strain/showstrain.js";
import {updateContainers} from "./fluid_layout/column_resize.js";
import {registerSliderTimestamps} from "./helper_scripts/slider-control.js";
import {sendToBottom} from "./fluid_layout/sendToBottom.js";

export const groups = new GroupController();


const scriptOffset = 1468;

export function getScriptOffset() {
    return scriptOffset
}

// The .then at the end is used to await the promise
load_data_then_call(plot_raw_data).then(r => ("loaded"))

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
    updateContainers()
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
    const namePrefix = `${groupIdentifier}: `

    const plotRequests = [
        // new PlotRequest(`${namePrefix} Bar Chart`, `${idPrefix}barchart`, ["controller.executionTime"], plotTypes.bar),
        new PlotRequest(`${namePrefix}3D Robot Arm`, `${idPrefix}3dAnimation`, [], plotTypes.robot),
        // new PlotRequest(`${namePrefix}Line Graph`, `${idPrefix}lineGraph`, ["scriptVariables.vg_Vacuum_A.value", "scriptVariables.vg_Vacuum_B.value",], plotTypes.line),
        // new PlotRequest(`${namePrefix}Line Graph of TCP position`, `${idPrefix}lineGraph-joints`, [
        //     "custom.Actual TCP pose rx [rad]",
        //     "custom.Actual TCP pose ry [rad]",
        //     "custom.Actual TCP pose rz [rad]",
        //     "robot.joints.wrist_3.position.x",
        //     "robot.joints.wrist_3.position.y",
        //     "robot.joints.wrist_3.position.z",
        // ], plotTypes.line),
        // new PlotRequest(`${namePrefix}3D TCP Vis`, `${idPrefix}3d_tcp_vis`, ["robot.tool.positionError"], plotTypes.direction),
        // new PlotRequest(`${namePrefix}variable_table`, `${idPrefix}variable_vis`, [], plotTypes.table),
    ]

    return new PlotGroup(plotRequests, variablesForMaxima, groupIdentifier)
}



/**
 * @param data {Array<Object>}
 * @param dataSource {"EDDE" | "FlightRecord"|"RTDE"}
 * @returns {Promise<void>}
 */
async function plot_raw_data(data, dataSource = "EDDE") {
    const groupA = createGroup("A");

    await groupA.createDivsForPlots();

    // 2. Shared operation for both groups
    let rawFrames;

    if (dataSource === "FlightRecord") {
        // data = pick_every_x_from_array(data, 10);
        rawFrames = await convertFlightRecordDataToDataPoints(data);
    } else if (dataSource === "EDDE" || dataSource === "RTDE") {
        data = filter_raw_data(data);
        // data = pick_every_x_from_array(data, 2);
        rawFrames = await convert_EDDE_to_data_frames(data); // This method is the cause of all loading time
    }

    rawFrames = rawFrames.filter(frame => frame.time.stepCount !== undefined)

    registerSliderTimestamps(rawFrames)

    await showStrain(rawFrames);

    groups.initialize(groupA)

    groupA.setCycle(new Cycle(rawFrames, 0))


    let firstStep = groupA.cycle.sequentialDataPoints[0].time.stepCount;

    if (firstStep === undefined) {
        console.log("First step not available, moving on to find the first point with it defined")
        for (let i = 0; i < groupA.cycle.sequentialDataPoints.length; i++) {
            if (groupA.cycle.sequentialDataPoints[i].time.stepCount !== undefined) {
                firstStep = groupA.cycle.sequentialDataPoints[i].time.stepCount;
                break;
            }
        }
    }

    // populatePickers(groups)

    await Promise.all(groupA.getPlotPromises());

    finalizePlotting(firstStep);
    sendToBottom();
}
