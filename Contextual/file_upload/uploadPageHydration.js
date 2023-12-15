import {remove} from "./Cache.js";
import {dataFileName} from "../helper_scripts/load_csv_data.js";
import {scriptFileName} from "../source_code_visualization/fetch_and_render_sample_code.js";
import {refreshIndicators} from "./statusVisualizations.js";


async function clearCaches() {
    await clearDataCache()
    await clearScriptCache()
    location.reload()
}

export async function clearDataCache() {
    await remove(dataFileName)
    await remove("cachedComputations")
}

export async function clearScriptCache() {
    await remove(scriptFileName)
}

if (document.getElementById("clear-cache-button")) {
    document.getElementById("clear-cache-button")
        .addEventListener("click", clearCaches)
}

if (document.getElementById("clear-data-cache-button")) {
    document.getElementById("clear-data-cache-button")
        .addEventListener("click", async ()=>{
            await clearDataCache()
            refreshIndicators()
        })
}

if (document.getElementById("clear-script-cache-button")) {
    document.getElementById("clear-script-cache-button")
        .addEventListener("click", async ()=>{
            await clearScriptCache()
            refreshIndicators()
        })
}