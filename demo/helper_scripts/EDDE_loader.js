/**
 *
 * @param data {Array<Object>}
 * @returns {Promise<Array<DataPoint>>}
 */
async function convert_EDDE_to_data_frames(data) {
    translate_names(data)

    return await parser(data)
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
        if (variableSplit[0].startsWith("s")) {
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
    "add": (a, b) => a + b,
    "subtract": (a, b) => a - b,
    "multiply": (a, b) => a * b,
    "divide": (a, b) => a / b,
}

/**
 * @param customVariables {{picked_variables: Array<Object>, wildcard: string, computed_variables: Array<Object>}}
 * @param datum {Object}
 * @returns {Promise<{Object}>}
 */
async function createCustom(customVariables, datum) {
    const out = {}

    for (let i = 0; i < customVariables.picked_variables.length; i++) {
        const variable = customVariables.picked_variables[i]
        if (variable.count !== undefined) {
            for (let j = 0; j < variable.count; j++) {
                const variable_name = variable.name.replace(customVariables.wildcard, j)
                out[variable_name] = variable.type === "float" ? Number.parseFloat(datum[variable_name]) : datum[variable_name]
            }
        } else if (variable.indexes !== undefined) {
            for (let index of variable.indexes) {
                const variable_name = variable.name.replace(customVariables.wildcard, index)
                out[variable_name] = variable.type === "float" ? Number.parseFloat(datum[variable_name]) : datum[variable_name]
            }
        } else {
            out[variable.name] = variable.type === "float" ? Number.parseFloat(datum[variable.name]) : datum[variable.name]
        }
    }

    for (let i = 0; i < customVariables.computed_variables.length; i++) {
        const variable = customVariables.computed_variables[i]

        if (variable.count !== undefined) {
            for (let j = 0; j < variable.count; j++) {
                const variable_name = variable.name.replace(customVariables.wildcard, j)

                const argument_1 = datum[variable.arguments[0].replace(customVariables.wildcard, j)]
                const argument_2 = datum[variable.arguments[1].replace(customVariables.wildcard, j)]

                out[variable_name] = method_map[variable.method](argument_1, argument_2)
            }
        } else if (variable.indexes !== undefined) {
            for (let index of variable.indexes) {
                const variable_name = variable.name.replace(customVariables.wildcard, index)

                const argument_1 = datum[variable.arguments[0].replace(customVariables.wildcard, index)]
                const argument_2 = datum[variable.arguments[1].replace(customVariables.wildcard, index)]

                out[variable_name] = method_map[variable.method](argument_1, argument_2)
            }
        } else {
            const argument_1 = datum[variable.arguments[0]]
            const argument_2 = datum[variable.arguments[1]]

            out[variable.name] = method_map[variable.method](argument_1, argument_2)
        }
    }

    return out
}

/**
 * @param datum {Object}
 * @param offSetVector {ArrayLike}
 * @param customVariables {Object}
 * @returns {Promise<DataPoint>}
 */
async function create_frame_from_datum(datum, offSetVector, customVariables) {
    const computation = computePositionAndRotation([datum.actual_q_0, datum.actual_q_1, datum.actual_q_2, datum.actual_q_3, datum.actual_q_4, datum.actual_q_5]);
    const computedPositions = computation[0];
    const computedTCPRotation = computation[1];
    const computedTcpPosition = computeTCPPosition(datum, offSetVector, computedPositions, computedTCPRotation);

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

    const physicalIO = extract_physical_io(datum);
    const variables = extract_variables(datum);
    const registers = extract_registers(datum);

    const custom = await createCustom(customVariables, datum)

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
    );
}

/**
 * @returns {Promise<Object>}
 */
async function get_custom_map() {
    const server_url = window.location.origin + "/Robotic_Visualizations/";
    const file_location = "demo/helper_scripts/allow_list.json";

    const response = await fetch(server_url + file_location);
    return await response.json();
}

/**
 * @param data {Array<Object>}
 * @returns {Promise<Array<DataPoint>>}
 */
async function parser(data) {
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

    const customVariables = await get_custom_map();
    console.log("customVariables", customVariables)

    /**
     * @type {DataPoint[]}
     */
    const frames = []

    // Generate the uniquely positioned frames
    // This is the slowest part of this function
    for (let i = 0; i < data.length; i++) {
        const dataPoint = await create_frame_from_datum(data[i], offSetVector, customVariables);
        frames.push(dataPoint)
    }

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
 */
function translate_names(data) {
    for (let i = 0; i < data.length; i++) {
        for (const RTDE_name of Object.keys(EDDE_translations)) {
            if (data[i][RTDE_name] === undefined) {
                data[i][RTDE_name] = data[i][EDDE_translations[RTDE_name]]
                // data[i][EDDE_translations[RTDE_name]] = undefined
            }
        }
    }
}