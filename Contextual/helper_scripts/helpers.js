import {Position} from "../datastructures/datastructures.js";

/**
 * Creates an immutable object that has the values presented attributes.
 * The attributes return their value.
 * @param values {Array<String>}
 * @returns {Readonly<{}>}
 */
export function createEnum(values) {
    const enumObject = {};
    for (const val of values) {
        enumObject[val] = val;
    }
    return Object.freeze(enumObject);
}

export function evenlyPickItemsFromArray(fromArray, extractionCount) {
    // if we want more items than available, return all items
    fromArray = fromArray.slice()
    if (extractionCount >= fromArray.length) {
        return fromArray;
    }
    // buffer for collecting picked items
    const result = [fromArray.shift(), fromArray.pop()];
    if (extractionCount === 2) {
        return result;
    } else if (extractionCount === 1) {
        result.pop();
        return result;
    }
    const totalItems = fromArray.length;

    extractionCount -= 2; // we already picked 2 items
    // default interval between items (might be float)
    const interval = totalItems / extractionCount;

    const lastItem = result.pop();

    for (let i = 0; i < extractionCount; i++) {
        // always add half of interval, so 'picking area' is 'aligned' to the center
        // eg evenlyPickItemsFromArray([0...100], 1); // [50] instead of [0]
        const evenIndex = Math.floor(i * interval + (interval / 2));

        result.push(fromArray[evenIndex]);
    }
    result.push(lastItem);
    return result;
}

export function computeTCPPosition(datum, offSetVector, computedPositions, computedRotations) {
    const computedTcpOffset =
        math.multiply(computedRotations, offSetVector)
            .toArray();

    return new Position(computedPositions[5].x + computedTcpOffset[0], computedPositions[5].y + computedTcpOffset[1], computedPositions[5].z + computedTcpOffset[2]);
}

/**
 * Usage example:
 *     // available_variable_names = extract_available_variables(frames[frames.length - 1]);
 *     // console.log("available_variable_names", available_variable_names)
 * @param frame {DataPoint}
 * @returns {string[]}
 */
export function extract_available_variables(frame) {
    const allVariables = Object.keys(frame.scriptVariables)
    /**
     * @type {string[]}
     */
    const variables = []
    for (let i = 0; i < allVariables.length; i++) {
        const lowerCased = allVariables[i].toLowerCase()
        if ((lowerCased.startsWith("on_") || lowerCased.startsWith("vg_")) && lowerCased !== "vg_vacuum_b" && lowerCased !== "vg_vacuum_a") {
            continue
        }

        variables.push(allVariables[i])
    }

    return variables
}

export function parse_to_bool(value) {
    return value === "1";
}