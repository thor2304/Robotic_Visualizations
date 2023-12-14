import {Cycle} from "../datastructures/Cycle.js";

/**
 * @type {Array<Array<DataPoint>>}
 */
const rawCycles = []
/**
 *
 * @type {Cycle[]}
 */
const cycles = []

/**
 * This method is safe to call multiple times, since it will only calculate the cycles once
 * @param frames {DataPoint[]} The frames from which cycles are calculated
 * @param cycle_index {number} 0-based index of the cycle to get
 * @returns {Cycle}
 */
export function get_cycle(frames, cycle_index = 0) {
    return get_cycles(frames)[cycle_index]
}

/**
 * @param frames {DataPoint[]}
 * @return {Cycle[]}
 */
export function get_cycles(frames) {
    if (cycles.length === 0) {
        extract_cycles(frames)
    }
    return cycles
}


/**
 * @param frames {DataPoint[]}
 * @returns {void}
 */
function extract_cycles(frames) {
    const between_cycles = {
        first: 1467 + 80,
        last: 1467 + 88
    }

    const final_area = {
        first: 1467 + 71,
        last: between_cycles.last
    }

    const cycle_start = {
        first: 1467 + 95,
        last: 1467 + 130
    }

    // console.log(frames)

    let cycle_active = false
    let end_area_hit = false

    for (let i = 0; i < frames.length; i++) {
        const frameLine = frames[i].time.lineNumber

        const withinCycleStart = frameLine >= cycle_start.first && frameLine <= cycle_start.last
        if (withinCycleStart && (!cycle_active || end_area_hit)) {
            // Start of a new cycle
            cycle_active = true
            end_area_hit = false
            rawCycles.push([])
        }

        if (!cycle_active) {
            continue
        }

        const isBetween_cycles = frameLine >= between_cycles.first && frameLine <= between_cycles.last
        if (isBetween_cycles) {
            cycle_active = false
        }

        const inFinalArea = frameLine >= final_area.first && frameLine <= final_area.last
        if (inFinalArea) {
            end_area_hit = true
        }

        rawCycles[rawCycles.length - 1].push(frames[i])
    }

    for (let i = 0; i < rawCycles.length; i++) {
        cycles[i] = new Cycle(rawCycles[i], i)
    }
}

/**
 * @template K
 * @param arr {Array<K>}
 * @param pick_every {number}
 * @returns {Array<K>}
 */
export function pick_every_x_from_array(arr, pick_every = 10) {
    const out = []

    for (let i = 0; i < arr.length; i++) {
        if (i % pick_every === 0) {
            out.push(arr[i])
        }
    }

    return out;
}

/**
 *  I have disabled this for now,
 *  since it is more of a debug option to see what lines are hit during the execution
 * @param rawFrames {DataPoint[]}
 */
export function print_script_lines(rawFrames) {
    const disabled = true
    if (disabled) {
        return
    }

    /**
     * @type {{linenumber: number, lineString: string, timestamp: number}[]}
     */
    const filteredScriptLines = rawFrames.map((e) => {
        return {
            linenumber: e.time.lineNumber,
            lineString: e.time.lineString,
            timestamp: e.time.timestamp
        }
    }).filter((e) => e.linenumber >= 1467)
    const res = [];
    const map = new Map();
    for (const item of filteredScriptLines) {
        if (!map.has(item.linenumber)) {
            map.set(item.linenumber, true);    // set any value to Map
            res.push(item);
        }
    }

    for (let i = 1; i < res.length; i++) {
        // highlight_line(res[i].linenumber - 1467)
    }

    console.log(res)
}