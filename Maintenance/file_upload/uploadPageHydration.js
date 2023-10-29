import {loadJson, remove} from "./Cache.js";
import {dataFileName} from "../helper_scripts/load_csv_data.js";
import {scriptFileName} from "../source_code_visualization/fetch_and_render_sample_code.js";


async function clearCaches(){
    // console.log(await loadJson("motorParams.json"))
    await remove(dataFileName)
    await remove(scriptFileName)
}

document.getElementById("clear-cache-button").addEventListener("click", clearCaches)