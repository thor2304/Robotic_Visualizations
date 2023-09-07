// This script depends on d3 being loaded

const dataFolder ='../../Robot_control/EDDE_data/WITH_POWER'

// Uses d3 to load a csv document, then calls the provided callback function
async function load_data_then_call(callback, data_delimiter = ','){
    const runName = "2_4_partial"
    const filePath = `${dataFolder}/${runName}/${runName}-0.csv`

    d3.text(filePath, async function (data) {
        const parsedCSV = d3.dsv(data_delimiter).parseRows(data);

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
    });
}