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
 * @param frames {DataPoint[]}
 * @param cycle_index {number}
 * @returns {Cycle}
 */
function get_cycle(frames, cycle_index=0){
    if(cycles.length === 0){
        return reduce_to_cycle(frames, cycle_index)
    }
    return cycles[cycle_index]
}


/**
 * @param frames {DataPoint[]}
 * @param cycle_index {number}
 * @returns {Cycle}
 */
function reduce_to_cycle(frames, cycle_index = 0) {
    const cycle_end = {
        first: 1467 + 80,
        last: 1467 + 88
    }

    const final_area = {
        first: 1467 + 71,
        last: cycle_end.last
    }

    const cycle_start = {
        first: 1467 + 95,
        last: 1467 + 130
    }

    let cycle_active = false
    let end_area_hit = false

    for (let i = 0; i < frames.length; i++) {
        if (frames[i].time.lineNumber >= cycle_start.first && frames[i].time.lineNumber <= cycle_start.last && (!cycle_active || end_area_hit)) {
            cycle_active = true
            end_area_hit = false
            rawCycles.push([])
        }

        if (!cycle_active) {
            continue
        }

        if (frames[i].time.lineNumber >= cycle_end.first && frames[i].time.lineNumber <= cycle_end.last) {
            cycle_active = false
        }

        if (frames[i].time.lineNumber >= final_area.first && frames[i].time.lineNumber <= final_area.last && !end_area_hit) {
            end_area_hit = true
        }

        rawCycles[rawCycles.length - 1].push(frames[i])
    }

    for (let i = 0; i < rawCycles.length; i++) {
        cycles[i] = new Cycle(rawCycles[i])
    }

    return cycles[cycle_index]
    // return frames
}

/**
 * @template K
 * @param arr {Array<K>}
 * @param pick_every {number}
 * @returns {Array<K>}
 */
function pick_every_x_from_array(arr, pick_every = 10) {
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
function print_script_lines(rawFrames) {
    const disabled = true
    if(disabled){
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