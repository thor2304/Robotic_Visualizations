/**
 * @typedef {number | `${number}`} Timestamp
 */
import {PlotGroup, PlotRequest, plotTypes} from "./datastructures/PlotGroup.js";
import {get_cycles, pick_every_x_from_array} from "./helper_scripts/cycle_filtering.js";
import {getActivePlotGroup, updateVisualizations} from "./helper_scripts/updateVisualizations.js";
import {populatePickers} from "./helper_scripts/cycle-picker.js";
import {plotCoordinates} from "./helper_scripts/factories/CoordinatePlotFactory.js";
import {createButtonAndWarningLine} from "./source_code_visualization/ErrorHighlightingLine.js";
import {load_data_then_call} from "./helper_scripts/load_csv_data.js";
import {convert_EDDE_to_data_frames} from "./helper_scripts/EDDE_loader.js";
import {makeAllDraggable} from "./fluid_layout/make_draggable.js";
import {filter_raw_data} from "./helper_scripts/targeted_filtering.js";
import {GroupController} from "./datastructures/GroupController.js";

export const groups = new GroupController();


const scriptOffset = 1468;

export function getScriptOffset() {
    return scriptOffset
}

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
        new PlotRequest(`${namePrefix}3D Robot Arm`, `${idPrefix}3dAnimation`, [], plotTypes.robot),
        new PlotRequest(`${namePrefix}Line Graph`, `${idPrefix}lineGraph`, ["scriptVariables.vg_Vacuum_A.value", "scriptVariables.vg_Vacuum_B.value",], plotTypes.line),
        // new PlotRequest(`${namePrefix}Line Graph of stepS`, `${idPrefix}lineGraph-secomd`, ["scriptVariables.step_count.value"], plotTypes.line),
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
    const groupB = createGroup("B");

    await groupA.createDivsForPlots();
    await groupB.createDivsForPlots();

    // 2. Shared operation for both groups

    data = filter_raw_data(data);
    const reduced_data = pick_every_x_from_array(data, 2);
    const rawFrames = await convert_EDDE_to_data_frames(reduced_data); // This method is the cause of all loading time
    // print_script_lines(rawFrames);
    // end of 2.

    const cycles = get_cycles(rawFrames);

    const withErrors = [];
    const withoutErrors = [];

    for (let i = 0; i < cycles.length; i++) {
        const cycle = cycles[i];
        if (cycle.hasError()) {
            withErrors.push(cycle)
        } else {
            withoutErrors.push(cycle)
        }
    }

    groups.initialize(groupA, groupB)

    groupA.setCycle(withErrors[0])
    for (let i = 1; i < withErrors.length; i++) {
        const newGroup = createGroup("A")
        newGroup.setCycle(withErrors[i])
        groups.addOption(newGroup)
    }

    groupB.setCycle(withoutErrors[0])
    for (let i = 1; i < withoutErrors.length; i++) {
        const newGroup = createGroup("B")
        newGroup.setCycle(withoutErrors[i])
        groups.addOption(newGroup)
    }

    const firstStep = groupA.cycle.sequentialDataPoints[0].time.stepCount;

    populatePickers(groups)


    // 3.1 Per group operations that might interfere with the other group
    for (const key of Object.keys(groupA.maxima)) {
        await createButtonAndWarningLine(groupA.maxima[key].stepcount, key + " max", groupA.identifier)
    }
    // end of 3.1

    // 4. Shared operation for both groups
    const plotPromises = groupA.getPlotPromises();
    plotPromises.push(...groupB.getPlotPromises());
    await Promise.all(plotPromises);

    await plotCoordinates(
        "received_x, received_y - All cycles",
        "test",
        [{xName: "scriptVariables.received_x.value", yName: "scriptVariables.received_y.value"}],
        groups
    )

    // 5. shared operations for both groups
    finalizePlotting(firstStep);

    // end of 5.
}


// The .then at the end is used to await the promise
load_data_then_call(plot_raw_data).then(r => ("loaded"))