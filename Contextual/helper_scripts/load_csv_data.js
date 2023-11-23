import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import {MyFile} from "../file_upload/Datastructures/MyFile.js";
import {loadJson, save} from "../file_upload/Cache.js";

const dataFolder ='../../Robot_control/EDDE_data/WITH_POWER'

export const dataFileName = "dataFile"

/**
 * Uses d3 to load a csv document, then calls the provided callback function
 * @param callback {function(Object[], string)} a function that takes the parsed csv data as an argument, as well as a string that specifies the data source
 * @param data_delimiter {string} delimiter used in the csv file, could be tab, space, comma, etc.
 */
export async function load_data_then_call(callback, data_delimiter = ','){
    let cached = await loadJson(dataFileName)
    // console.log(cached)
    if (!cached){
        cached = await fetch_sample_data()
        await save(dataFileName, cached)
    }

    const out = parseData(cached.content, data_delimiter)

    let dataSource = cached.dataSource

    if (!dataSource){
        dataSource = "EDDE"
    }

    await callback(out, dataSource)
}

/**
 *
 * @return {Promise<MyFile>}
 */
async function fetch_sample_data(){
    const runName = "2_4_partial"
    const filePath = `${dataFolder}/${runName}/${runName}-0.csv`

    const text = await d3.text(filePath);
    console.log("Fetching sample data")

    const out = new MyFile(filePath, text)
    out.setDataSource("EDDE")
    return out
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
