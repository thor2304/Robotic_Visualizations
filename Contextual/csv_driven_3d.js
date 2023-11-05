/**
 * @typedef {number | `${number}`} Timestamp
 */
import {Cycle, PlotGroup, PlotRequest, plotTypes} from "./datastructures/PlotGroup.js";
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
import {convertFlightRecordDataToDataPoints} from "./file_upload/flightRecordTranslations.js";

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
    // const namePrefix = `${groupIdentifier}: `

    const plotRequests = [
        // new PlotRequest(`${namePrefix} Bar Chart`, `${idPrefix}barchart`, ["controller.executionTime"], plotTypes.bar),
        new PlotRequest(`${namePrefix}3D Robot Arm`, `${idPrefix}3dAnimation`, [], plotTypes.robot),
        new PlotRequest(`${namePrefix}Vacuum Levels`, `${idPrefix}lineGraph`, ["scriptVariables.vg_Vacuum_A.value", "scriptVariables.vg_Vacuum_B.value",], plotTypes.line),
        // new PlotRequest(`${namePrefix}3D TCP Vis`, `${idPrefix}3d_tcp_vis`, ["robot.tool.positionError"], plotTypes.direction),
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
    const groupA = createGroup("A");
    // const groupB = createGroup("B");

    await groupA.createDivsForPlots();
    // await groupB.createDivsForPlots();

    // 2. Shared operation for both groups
    let rawFrames;

    if (dataSource === "FlightRecord") {
        rawFrames = await convertFlightRecordDataToDataPoints(data);
    } else if (dataSource === "EDDE" || dataSource === "RTDE") {
        data = filter_raw_data(data);
        data = pick_every_x_from_array(data, 2);
        rawFrames = await convert_EDDE_to_data_frames(data); // This method is the cause of all loading time
    }

    // console.log(rawFrames[rawFrames.length - 1])

    // print_script_lines(rawFrames);
    // end of 2.

    const cycles = get_cycles(rawFrames);

    const withErrors = [];
    const withoutErrors = [];

    console.log(withErrors, withoutErrors)

    for (let i = 0; i < cycles.length; i++) {
        const cycle = cycles[i];
        if (cycle.hasError()) {
            withErrors.push(cycle)
        } else {
            withoutErrors.push(cycle)
        }
    }

    if (cycles.length === 0) {
        withErrors.push(new Cycle(rawFrames, 0))
    }

    groups.initialize(groupA)

    groupA.setCycle(withErrors[0])
    for (let i = 1; i < withErrors.length; i++) {
        const newGroup = createGroup("A")
        newGroup.setCycle(withErrors[i])
        groups.addOption(newGroup)
    }

    // if (withoutErrors.length === 0) {
    //     withoutErrors.push(new Cycle([rawFrames[0]], withErrors.length))
    // }
    //
    // groupB.setCycle(withoutErrors[0])
    // for (let i = 1; i < withoutErrors.length; i++) {
    //     const newGroup = createGroup("B")
    //     newGroup.setCycle(withoutErrors[i])
    //     groups.addOption(newGroup)
    // }

    for (let i = 0; i < withoutErrors.length; i++) {
        const newGroup = createGroup("A")
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
    // plotPromises.push(...groupB.getPlotPromises());
    await Promise.all(plotPromises);

    await plotCoordinates(
        "Pickup positions",
        "test",
        [{xName: "robot.tool.position.x", yName: "robot.tool.position.y"}],
        groups
    )

    // 5. shared operations for both groups
    finalizePlotting(firstStep);

    // end of 5.
}
