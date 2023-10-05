/**
 * This method filters out the intitial datapoint which is an EDDE artifact, as well as all lines that have the text: NaN
 * @param raw_data {Array<{lineString: string, [key: string]:string}>}
 * @returns {Array<{lineString: string, [key: string]:string}>}
 */
function filter_raw_data(raw_data){
    /**
     *
     * @type {Array<{lineString: string, [key: string]:string}>}
     */
    const out = []

    for (let i = 1; i < raw_data.length; i++) {
        const line = raw_data[i];
        if(line.lineString !== "NaN"){
            out.push(line)
        }
    }

    return out
}