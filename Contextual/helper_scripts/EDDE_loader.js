import {computePositionAndRotation} from "../dataframe_driven_robot_arm/computeJointPositions.js";
import {
    DataPoint,
    Joint,
    Joints,
    Payload,
    PhysicalIO,
    Position,
    Register,
    Robot,
    Tool,
    Variable
} from "../datastructures/datastructures.js";
import {computeTCPPosition, parse_to_bool} from "./helpers.js";
import {loadJson, save} from "../file_upload/Cache.js";
import {parseRegisters, parsePhysicalIO} from "../featureEnabler.js";

/**
 *
 * @param data {Array<Object>}
 * @returns {Promise<Array<DataPoint>>}
 */
export async function convert_EDDE_to_data_frames(data) {
    translate_names(data)

    return await parser(data, await get_custom_map())
}

function extractExpectedWeight(datum) {
    return 0;
}

function get_controller_memory(datum) {
    return 8_000_000;
}

/**
 * @param datum {Object}
 * @returns {PhysicalIO[]}
 */
function extract_physical_io(datum) {
    /**
     * @type {PhysicalIO[]}
     */
    const out = []

    for (let i = 0; i < 8; i++) {
        out.push(new PhysicalIO(`digital_in_${i}`, parse_to_bool(datum[`digital_in_${i}`])))
        out.push(new PhysicalIO(`digital_out_${i}`, parse_to_bool(datum[`digital_out_${i}`])))
        out.push(new PhysicalIO(`config_out_${i}`, parse_to_bool(datum[`config_out_${i}`])))
        out.push(new PhysicalIO(`config_in_${i}`, parse_to_bool(datum[`config_in_${i}`])))
    }

    for (let i = 0; i < 2; i++) {
        out.push(new PhysicalIO(`analog_in_${i}`, Number.parseFloat(datum[`analog_in_${i}`])))
        out.push(new PhysicalIO(`analog_out_${i}`, Number.parseFloat(datum[`analog_out_${i}`])))
    }

    return out
}

/**
 * @param datum {Object}
 * @returns {Variable[]}
 */
function extract_variables(datum) {
    /**
     * @type {Variable[]}
     */
    const out = []

    /**
     * @type {string[]}
     */
    const variables = datum.vars
    if (variables === undefined) {
        return out;
    }
    for (let i = 0; i < variables.length; i++) {
        const variableSplit = variables[i].split(';')
        // This is one candidate for where we could parse the data type of the variable
        // We could also do it directly in the Variable type instead if we want to
        out.push(new Variable(variableSplit[0], variableSplit[1]))
        if (variableSplit[0].startsWith("step")) {
            out.push(new Variable('step_count', variableSplit[1]))
        }
    }

    return out;
}

/**
 * Takes in a number and converts it to a string of 1's and 0's
 *
 * function copied from MDN docs
 * The original has a note about not taking in too large numbers, but i expect the inputs to this to be purely positive numbers
 *
 * @param nMask {number} The number to convert
 * @returns {string}
 */
function createBinaryString(nMask) {
    // function copied from MDN docs
    // The original has a note about not taking in too large numbers, but i expect the inputs to this to be purely positive numbers
    let sMask = "";
    for (let nFlag = 0, nShifted = nMask; nFlag < 32; nFlag++) {
        sMask += String(nShifted >>> 31)
        nShifted <<= 1
    }
    return sMask;
}

/**
 * @param datum {Object}
 * @returns {Register[]}
 */
function extract_registers(datum) {
    /**
     * @type {Register[]}
     */
    const out = []

    for (let i = 0; i < 24; i++) {
        out.push(new Register(`output_double_register_${i}`, Number.parseFloat(datum[`output_double_register_${i}`])))
        out.push(new Register(`input_double_register_${i}`, Number.parseFloat(datum[`input_double_register_${i}`])))
        out.push(new Register(`output_int_register_${i}`, Number.parseInt(datum[`output_int_register_${i}`])))
        out.push(new Register(`input_int_register_${i}`, Number.parseInt(datum[`input_int_register_${i}`])))
    }

    for (let i = 0; i < 2; i++) {
        const lower = i * 32
        const upper = (i + 1) * 32 - 1

        const outputBits = createBinaryString(datum[`output_bit_register_${lower}_to${upper}`])
        const inputBits = createBinaryString(datum[`input_bit_register_${lower}_to${upper}`])

        for (let j = 0; j < 32; j++) {
            out.push(new Register(`output_bit_register_${lower + j}`, parse_to_bool(outputBits[j])))
            out.push(new Register(`input_bit_register_${lower + j}`, parse_to_bool(inputBits[j])))
        }
    }

    return out;
}

/**
 * @type {{add: (function(*, *)), subtract: (function(*, *)), divide: (function(*, *)), multiply: (function(*, *))}}
 */
const method_map = {
    "add": (a, b) => Number.parseFloat(a) + Number.parseFloat(b),
    "subtract": (a, b) => a - b,
    "multiply": (a, b) => a * b,
    "divide": (a, b) => a / b,
    "aboveNumber": (a, b) => a > b ? 1 : 0,
    "aboveBool": (a, b) => a > b,
    "belowNumber": (a, b) => a < b ? 1 : 0,
    "belowBool": (a, b) => a < b,
}

/**
 * @param customVariables {CustomVariableConfiguration}
 * @param datum {Object}
 * @returns {Object<string, number>}
 */
function createCustom(customVariables, datum) {
    const out = {}

    for (let i = 0; i < customVariables.picked_variables.length; i++) {
        const variable = customVariables.picked_variables[i]
        out[variable.name] = variable.type === "float" ? Number.parseFloat(datum[variable.name]) : datum[variable.name]
    }

    const vars = datum.vars
    const varLookup = {}
    for (let i = 0; i < vars.length; i++) {
        const variableSplit = vars[i].split(';')
        varLookup[`vars.${variableSplit[0]}`] = variableSplit[1]
    }

    for (let i = 0; i < customVariables.computed_variables.length; i++) {
        const variable = customVariables.computed_variables[i]

        const method = method_map[variable.method]

        const arg1 = variable.arguments[0].startsWith("vars.") ? varLookup[variable.arguments[0]] : datum[variable.arguments[0]]
        const arg2 = typeof variable.arguments[1] !== "string" ? variable.arguments[1] : variable.arguments[1].startsWith("vars.") ? varLookup[variable.arguments[1]] : datum[variable.arguments[1]]

        out[variable.name] = method(arg1, arg2)
    }

    return out
}

/**
 * @param datum {Object}
 * @param offSetVector {ArrayLike}
 * @param customVariables {CustomVariableConfiguration}
 * @param cacheData {{joint_1: {x:number, y: number, z:number}, joint_2: {x:number, y: number, z:number}, joint_3: {x:number, y: number, z:number}, joint_4: {x:number, y: number, z:number}, joint_5: {x:number, y: number, z:number}, joint_6: {x:number, y: number, z:number}, tcp: {x:number, y: number, z:number}}}
 * @returns {Promise<DataPoint>}
 */
async function create_frame_from_datum(datum, offSetVector, customVariables, cacheData) {
    // Read the datum whether it contains the cached attributes of position and rotation
    // If computation is needed, modify the datum to include the computed attributes, after this method is done, the datum can be written out and saved

    let computedPositions;
    let computedTcpPosition
    if (cacheData) {
        computedPositions = [
            new Position(cacheData.joint_1.x, cacheData.joint_1.y, cacheData.joint_1.z),
            new Position(cacheData.joint_2.x, cacheData.joint_2.y, cacheData.joint_2.z),
            new Position(cacheData.joint_3.x, cacheData.joint_3.y, cacheData.joint_3.z),
            new Position(cacheData.joint_4.x, cacheData.joint_4.y, cacheData.joint_4.z),
            new Position(cacheData.joint_5.x, cacheData.joint_5.y, cacheData.joint_5.z),
            new Position(cacheData.joint_6.x, cacheData.joint_6.y, cacheData.joint_6.z),
        ]
        computedTcpPosition = new Position(cacheData.tcp.x, cacheData.tcp.y, cacheData.tcp.z)
    } else {
        const computation = computePositionAndRotation([datum.actual_q_0, datum.actual_q_1, datum.actual_q_2, datum.actual_q_3, datum.actual_q_4, datum.actual_q_5]);
        computedPositions = computation[0];
        const computedTCPRotation = computation[1];
        computedTcpPosition = computeTCPPosition(datum, offSetVector, computedPositions, computedTCPRotation);
    }

    const base = new Joint(Joints.Base, computedPositions[0], undefined, datum.actual_position_0, datum.target_position_0)
    const shoulder = new Joint(Joints.Shoulder, computedPositions[1], undefined, datum.actual_position_1, datum.target_position_1)
    const elbow = new Joint(Joints.Elbow, computedPositions[2], undefined, datum.actual_position_2, datum.target_position_2)
    const wrist_1 = new Joint(Joints["wrist 1"], computedPositions[3], undefined, datum.actual_position_3, datum.target_position_3)
    const wrist_2 = new Joint(Joints["wrist 2"], computedPositions[4], undefined, datum.actual_position_4, datum.target_position_4)
    const wrist_3 = new Joint(Joints["wrist 3"], computedPositions[5], undefined, datum.actual_position_5, datum.target_position_5)

    const tool = new Tool(
        computedTcpPosition,
        new Position(datum.actual_TCP_pose_0, datum.actual_TCP_pose_1, datum.actual_TCP_pose_2),
        datum.force_x, datum.force_y, datum.force_z,
    )


    const robot = new Robot(tool,
        [base, shoulder, elbow, wrist_1, wrist_2, wrist_3],
        new Payload(extractExpectedWeight(datum), parseFloat(datum.payload)),
        datum.protective_stop,
        datum.blend
    )

    let physicalIO;
    if (parsePhysicalIO){
        physicalIO = extract_physical_io(datum);
    }

    let registers;
    if (parseRegisters){
        registers = extract_registers(datum);
    }

    const variables = extract_variables(datum);

    const custom = createCustom(customVariables, datum)

    // The names should be added to the translation list so the EDDE names can be translated to our "universal name"
    // frame.tcp_error = new Offset(datum.actual_TCP_pose_0 - computedTcpPosition[0], datum.actual_TCP_pose_1 - computedTcpPosition[1], datum.actual_TCP_pose_2 - computedTcpPosition[2])
    return new DataPoint(
        datum.timestamp,
        datum.line_number,
        datum.line_string,
        datum.execution_time,
        datum.cpu_usage,
        get_controller_memory(datum),
        datum.memory_usage,
        robot,
        physicalIO,
        variables,
        registers,
        custom
    )
}

/**
 * @returns {Promise<CustomVariableConfiguration>}
 * @param custom_map_file_name {string} The name of the custom map file. Must be located in demo/customizations folder
 */
export async function get_custom_map(custom_map_file_name = "EDDE_allow_list.json") {
    const server_url = window.location.origin + "/Robotic_Visualizations/Contextual/customizations/";
    const response = await fetch(server_url + custom_map_file_name);
    return new CustomVariableConfiguration(await response.json());
}

/** Picked Variable:
 * @typedef  {
 * {unit: string, name: string, count: number, start: number, type: string}
 * |{name: string, count: number, start: number, type: string}
 * |{unit: string, name: string, type: string}
 * |{name: string, type: string}
 * |{unit: string, indexes: string[], name: string, type: string}
 * } PickedVariableTemplate
 */

/**
 * @typedef  {{unit?: string, name: string, type: string}} PickedVariable
 */

/**
 * Computed Variable:
 * @typedef {
 * {method: string, name: string, count: number, arguments: string[]}
 * | {method: string, name: string, indexes: string[], arguments: string[]}
 * |{method: string, name: string, arguments: string[]}
 * } ComputedVariableTemplate
 */

/**
 * @typedef {{method: string, name: string, arguments: string[]}} ComputedVariable
 */

class CustomVariableConfiguration {
    /**
     * @param jsonConfig {{
     * picked_variables: PickedVariableTemplate[],
     * wildcard: string,
     * computed_variables: ComputedVariableTemplate[]
     *}}
     */
    constructor(jsonConfig) {
        /**
         * @type {{
         * picked_variables: PickedVariableTemplate[],
         * wildcard: string,
         * computed_variables: ComputedVariableTemplate[]
         * }}
         * @private
         */
        this._jsonConfig = jsonConfig;
        /**
         *
         * @type {PickedVariable[]}
         */
        this.picked_variables = [];
        /**
         * @type {ComputedVariable[]}
         */
        this.computed_variables = [];
        this._populateComputedVariables()
        this._populatePickedVariables()
    }

    _populateComputedVariables() {
        for (let i = 0; i < this._jsonConfig.computed_variables.length; i++) {
            const variable = this._jsonConfig.computed_variables[i]

            if (variable.count !== undefined) {
                for (let j = 0; j < variable.count; j++) {
                    /**
                     * @type {ComputedVariable}
                     */
                    const outVariable = {
                        name: variable.name.replace(this._jsonConfig.wildcard, j),
                        method: variable.method,
                        arguments: [
                            variable.arguments[0].replace(this._jsonConfig.wildcard, j),
                            variable.arguments[1].replace(this._jsonConfig.wildcard, j)
                        ]
                    }

                    this.computed_variables.push(outVariable)
                }
            } else if (variable.indexes !== undefined) {
                for (let index of variable.indexes) {
                    /**
                     * @type {ComputedVariable}
                     */
                    const outVariable = {
                        name: variable.name.replace(this._jsonConfig.wildcard, index),
                        method: variable.method,
                        arguments: [
                            variable.arguments[0].replace(this._jsonConfig.wildcard, index),
                            variable.arguments[1].replace(this._jsonConfig.wildcard, index)
                        ]
                    }

                    this.computed_variables.push(outVariable)
                }
            } else {
                this.computed_variables.push({
                    name: variable.name,
                    method: variable.method,
                    arguments: [
                        variable.arguments[0],
                        variable.arguments[1]
                    ]
                })
            }
        }
    }

    _populatePickedVariables() {
        for (let i = 0; i < this._jsonConfig.picked_variables.length; i++) {
            const variable = this._jsonConfig.picked_variables[i]
            if (variable.count !== undefined) { // Loop using numbered indexes (0,1,2,3,4...)
                for (let j = 0; j < variable.count; j++) {
                    this.picked_variables.push({
                        name: variable.name.replace(this._jsonConfig.wildcard, j),
                        type: variable.type,
                        unit: variable.unit
                    })
                }
            } else if (variable.indexes !== undefined) { // Loop using named indexes (x,y,z)
                for (let index of variable.indexes) {
                    this.picked_variables.push({
                        name: variable.name.replace(this._jsonConfig.wildcard, index),
                        type: variable.type,
                        unit: variable.unit
                    })
                }
            } else { // No loop, just use the variable name
                this.picked_variables.push({
                    name: variable.name,
                    type: variable.type,
                    unit: variable.unit
                })
            }
        }
    }


}

/**
 * @param data {Array<Object>}
 * @param customVariableConfiguration {CustomVariableConfiguration}
 * @returns {Promise<Array<DataPoint>>}
 */
export async function parser(data, customVariableConfiguration) {
    // console.log("data received, now going to loop over the data and generate the frames->")
    const firstData = data[0];
    const res = computePositionAndRotation([firstData.actual_q_0, firstData.actual_q_1, firstData.actual_q_2, firstData.actual_q_3, firstData.actual_q_4, firstData.actual_q_5]);

    const positions = res[0];
    const rotationMatrix = res[1];

    const tcpActualPosition = new Position(firstData.actual_TCP_pose_0, firstData.actual_TCP_pose_1, firstData.actual_TCP_pose_2);

    const tcpOffsets = math.matrix(tcpActualPosition.subtract(positions[5]).toArray());

    // console.table("tcpOffsets", tcpOffsets.toArray())
    // console.table("rotationMatrix", rotationMatrix)

    const offSetVector = math.matrix([0, 0, 0]);
    // const offSetVector = math.multiply(math.inv(rotationMatrix), tcpOffsets);

    // console.log("customVariables", customVariableConfiguration)

    /**
     * @type {DataPoint[]}
     */
    const frames = []

    let loadedCachedComputations = await loadJson("cachedComputations")

    // Generate the uniquely positioned frames
    // This is the slowest part of this function
    for (let i = 0; i < data.length; i++) {
        // if (data[i].vars === undefined) {
        //     data.splice(i, 1)
        //     i--
        //     continue
        // }
        const cacheData = loadedCachedComputations ? loadedCachedComputations[i] : undefined
        const dataPoint = await create_frame_from_datum(data[i], offSetVector, customVariableConfiguration, cacheData);
        frames.push(dataPoint)
    }

    if (!loadedCachedComputations) {
        console.log("saving cachedComputations")
        const cachedComputations = frames.map(frame => {
            return {
                joint_1: {
                    x: frame.robot.joints.base.position.x,
                    y: frame.robot.joints.base.position.y,
                    z: frame.robot.joints.base.position.z,
                },
                joint_2: {
                    x: frame.robot.joints.shoulder.position.x,
                    y: frame.robot.joints.shoulder.position.y,
                    z: frame.robot.joints.shoulder.position.z,
                },
                joint_3: {
                    x: frame.robot.joints.elbow.position.x,
                    y: frame.robot.joints.elbow.position.y,
                    z: frame.robot.joints.elbow.position.z,
                },
                joint_4: {
                    x: frame.robot.joints.wrist_1.position.x,
                    y: frame.robot.joints.wrist_1.position.y,
                    z: frame.robot.joints.wrist_1.position.z,
                },
                joint_5: {
                    x: frame.robot.joints.wrist_2.position.x,
                    y: frame.robot.joints.wrist_2.position.y,
                    z: frame.robot.joints.wrist_2.position.z,
                },
                joint_6: {
                    x: frame.robot.joints.wrist_3.position.x,
                    y: frame.robot.joints.wrist_3.position.y,
                    z: frame.robot.joints.wrist_3.position.z,
                },
                tcp: {
                    x: frame.robot.tool.position.x,
                    y: frame.robot.tool.position.y,
                    z: frame.robot.tool.position.z,
                }
            }
        })

        await save("cachedComputations", cachedComputations)

        console.log("cachedComputations", cachedComputations)
    }

    // const header = Object.keys(data[0]).join(",") + ",vars" + "\n"
    // console.log("header", header)
    //
    // const fileContent = header + data.map(data => Object.values(data).join(",")).join("\n")
    // console.log("fileContent", fileContent)

    // console.log("frames", frames)

    return frames;
}

/**
 * @type {{actual_q_0: string, protective_stop: string, actual_q_2: string, line_string: string, actual_q_1: string, actual_q_4: string, actual_q_3: string, actual_q_5: string, memory_usage: string, execution_time: string, actual_TCP_pose_4: string, actual_TCP_pose_3: string, actual_TCP_pose_5: string, actual_TCP_pose_0: string, actual_TCP_pose_2: string, line_number: string, actual_TCP_pose_1: string, force_z: string, cpu_usage: string, force_x: string, force_y: string, timestamp: string}}
 */
const EDDE_translations = {
    // RTDE name: EDDE name
    "actual_TCP_pose_0": "actual_pose_0",
    "actual_TCP_pose_1": "actual_pose_1",
    "actual_TCP_pose_2": "actual_pose_2",
    "actual_TCP_pose_3": "actual_pose_3",
    "actual_TCP_pose_4": "actual_pose_4",
    "actual_TCP_pose_5": "actual_pose_5",

    "actual_q_0": "actual_position_0",
    "actual_q_1": "actual_position_1",
    "actual_q_2": "actual_position_2",
    "actual_q_3": "actual_position_3",
    "actual_q_4": "actual_position_4",
    "actual_q_5": "actual_position_5",

    "force_x": "force_x",
    "force_y": "force_y",
    "force_z": "force_z",

    "timestamp": "robot_epoch",
    "line_string": "current_line_str",
    "line_number": "current_line",
    "memory_usage": "current_memory_process",
    "cpu_usage": "current_cpu_usage",
    "execution_time": "execution_time",

    "protective_stop": "protective_stop",
}

/**
 * Modifies the attributes of the objects within the data Array
 * @param data {Array<Object>}
 * @param translations {Object<string, string>} Maps RTDE names to the names of the other format
 */
export function translate_names(data, translations = EDDE_translations) {
    for (let i = 0; i < data.length; i++) {
        for (const RTDE_name of Object.keys(translations)) {
            if (data[i][RTDE_name] === undefined) {
                data[i][RTDE_name] = data[i][translations[RTDE_name]]
                // data[i][EDDE_translations[RTDE_name]] = undefined
            }
        }
    }
}