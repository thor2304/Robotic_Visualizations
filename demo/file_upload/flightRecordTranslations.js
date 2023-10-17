/**
 * @type {{actual_q_0: string, protective_stop: string, actual_q_2: string, line_string: string, actual_q_1: string, actual_q_4: string, actual_q_3: string, actual_q_5: string, memory_usage: string, execution_time: string, actual_TCP_pose_4: string, actual_TCP_pose_3: string, actual_TCP_pose_5: string, actual_TCP_pose_0: string, actual_TCP_pose_2: string, line_number: string, actual_TCP_pose_1: string, force_z: string, cpu_usage: string, force_x: string, force_y: string, timestamp: string}}
 */
import {get_custom_map, parser, translate_names} from "../helper_scripts/EDDE_loader.js";

export const FlightRecordTranslations = {
    // RTDE name: Flight Record name
    "actual_TCP_pose_0": "Actual TCP pose x [m]",
    "actual_TCP_pose_1": "Actual TCP pose y [m]",
    "actual_TCP_pose_2": "Actual TCP pose z [m]",
    "actual_TCP_pose_3": "Actual TCP pose rx [rad]",
    "actual_TCP_pose_4": "Actual TCP pose ry [rad]",
    "actual_TCP_pose_5": "Actual TCP pose rz [rad]",

    "actual_q_0": "Actual position j0 [rad]",
    "actual_q_1": "Actual position j1 [rad]",
    "actual_q_2": "Actual position j2 [rad]",
    "actual_q_3": "Actual position j3 [rad]",
    "actual_q_4": "Actual position j4 [rad]",
    "actual_q_5": "Actual position j5 [rad]",

    "force_x": "TCP force x [N]",
    "force_y": "TCP force y [N]",
    "force_z": "TCP force z [N]",

    "timestamp": "Timestamp [s]",
    // "line_string": "not transmitted",
    // "line_number": "not transmitted",
    // "memory_usage": "not transmitted",
    // "cpu_usage": "not transmitted",
    "execution_time": "Realtime thread execution time [ms]",

    "mass": "Payload mass [kg]",

    "protective_stop": "Safety status",
}

/**
 * @param data {Array<Object>}
 * @returns {Promise<Array<DataPoint>>}
 */
export async function convertFlightRecordDataToDataPoints(data){
    translate_names(data, FlightRecordTranslations)
    addStepCountToDataPoints(data);
    return await parser(data, await get_custom_map("flight_record_variable_config.json"))
}

function addStepCountToDataPoints(dataPoints) {
    let stepCount = 0;
    for (const dataPoint of dataPoints) {
        dataPoint.vars = dataPoint.vars || [];
        dataPoint.vars.push(`step_count_dummy;${stepCount}`);
        stepCount++;
    }
}
