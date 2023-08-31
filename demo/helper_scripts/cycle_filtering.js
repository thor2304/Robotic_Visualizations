function reduce_to_cycle(frames, cycle_index = 0) {
    const cycles = []

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
            cycles.push([])
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

        cycles[cycles.length - 1].push(frames[i])
    }

    return cycles[cycle_index]
    // return frames
}

function pick_every_x_from_array(arr, pick_every = 10) {
    const out = []

    for (let i = 0; i < arr.length; i++) {
        if (i % pick_every === 0) {
            out.push(arr[i])
        }
    }

    return out;
}

function print_script_lines(rawFrames) {
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