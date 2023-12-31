import {has, loadJson} from "./Cache.js";
import {dataFileName} from "../helper_scripts/load_csv_data.js";
import {scriptFileName} from "../source_code_visualization/fetch_and_render_sample_code.js";

const dataIndicator = document.getElementById("data-indicator")
const lastVersionDisplay = document.getElementById("last-version")
const scriptIndicator = document.getElementById("script-indicator")
const fileNameIndicator = document.getElementById("file-name-indicator")

export function refreshIndicators() {
    if (!dataIndicator || !scriptIndicator) {
        return
    }
    has(dataFileName).then((hasData) => {
        loadJson(dataFileName).then((data) => {
            if (data) {
                setFileName(data.name)
            }
        })
        setIndicator(dataIndicator, hasData)
        if (!hasData) {
            clearVersionNumber()
        }
    })

    has(scriptFileName).then((hasScript) => {
        setIndicator(scriptIndicator, hasScript)
    })
}

refreshIndicators()


export function setFileName(fileName) {
    fileNameIndicator.textContent = fileName

}
function clearVersionNumber() {
    lastVersionDisplay.textContent = ""
    setFileName("")
}

export function updateVersionNumber(newVersion = undefined) {
    if (newVersion === undefined) {
        clearVersionNumber()
    }else{
        lastVersionDisplay.textContent = `Last version uploaded: ${newVersion}`
    }
    setIndicator(dataIndicator, true)
}

export function updateScriptStatus() {
    setIndicator(scriptIndicator, true)
}

/**
 *
 * @param indicator {HTMLElement} - the indicator to set
 * @param status {boolean} - true if data is present, false if not
 */
function setIndicator(indicator, status) {
    if (status) {
        indicator.classList.add("present")
        indicator.textContent = "Uploaded"
    } else {
        indicator.classList.remove("present")
        indicator.textContent = "Not uploaded"
    }
}