import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const dataFolder ='../../Robot_control/EDDE_data/WITH_POWER'

// Uses d3 to load a csv document, then calls the provided callback function
export async function load_data_then_call(callback, data_delimiter = ','){
    const runName = "2_4_partial"
    const filePath = `${dataFolder}/${runName}/${runName}-0.csv`


    const text = await d3.text(filePath);
    const parsedCSV = d3.dsvFormat(data_delimiter).parseRows(text);
    const out = []
    const keys = parsedCSV.shift();
    for (const parsedRow of parsedCSV) {
        const frame = {}
        for (let i = 0; i < parsedRow.length; i++) {
            if (i < keys.length && keys[i] !== 'vars..'){
                frame[keys[i]] = parsedRow[i]
            }else{
                frame["vars"] = frame["vars"] || []
                frame["vars"].push(parsedRow[i])
            }
        }
        out.push(frame)
    }
    await callback(out)
}