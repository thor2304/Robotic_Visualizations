import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const dataFolder ='../../Robot_control/EDDE_data/WITH_POWER'

/**
 * Uses d3 to load a csv document, then calls the provided callback function
 * @param callback {function(Object[])} a function that takes the parsed csv data as an argument
 * @param data_delimiter {string} delimiter used in the csv file, could be tab, space, comma, etc.
 */
export async function load_data_then_call(callback, data_delimiter = ','){
    const runName = "2_4_partial"
    const filePath = `${dataFolder}/${runName}/${runName}-0.csv`


    const text = await d3.text(filePath);
    const out = parseData(text, data_delimiter)
    await callback(out)
}

/**
 *
 * @param data_delimiter {string} delimiter used in the csv file, could be tab, space, comma, etc. Default is comma
 * @param text {string} the text of the csv file
 * @return {Object[]} an array of objects, each object is a row in the csv file. The keys of the object are the column names
 */
export function parseData(text, data_delimiter =",") {
    const parsedCSV = d3.dsvFormat(data_delimiter).parseRows(text);
    const out = []
    const keys = parsedCSV.shift();
    for (const parsedRow of parsedCSV) {
        const frame = {}
        for (let i = 0; i < parsedRow.length; i++) {
            if (i < keys.length && keys[i] !== 'vars..') {
                frame[keys[i]] = parsedRow[i]
            } else {
                frame["vars"] = frame["vars"] || []
                frame["vars"].push(parsedRow[i])
            }
        }
        out.push(frame)
    }
    return out;
}
