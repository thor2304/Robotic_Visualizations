import {updateVisualizations} from "../helper_scripts/updateVisualizations.js";
import {getScriptOffset, groups} from "../csv_driven_3d.js";
import {get_line} from "./line_highlight.js";

const button_container = document.getElementById("Script-control-button-container");

/**
 * @type {Object<Element, Array<HTMLButtonElement>>}
 */
const button_groups = {};
/**
 * @type {HTMLButtonElement[]}
 */
const all_buttons = [];

/**
 * @param timestamp {number}
 * @param name {string}
 * @param plotGroup {PlotGroupIdentifier}
 * @returns {Promise<void>}
 */
export async function createButtonAndWarningLine(timestamp, name, plotGroup) {
    // Create and add the button
    const button = document.createElement("button");
    button.innerHTML = `${name}<br>
    ${timestamp}`;

    button.id = `button-${timestamp}-${name}`;

    button_container.appendChild(button);

    button.addEventListener ("click", async function() {
        await updateVisualizations(timestamp, plotGroup);
    });

    const default_display = button.style.display;

    button.style.display = "none";


    // Add the event listener for the line which shows the buttons

    const datapoint = groups.get(plotGroup).groupedDataPoints[timestamp]

    if(datapoint === undefined){
        console.log(`No datapoint found for timestamp ${timestamp}`)
        return
    }

    const line = await get_line(datapoint.time.lineNumber, getScriptOffset())

    if (line === undefined){
        console.log(`No line found for timestamp ${timestamp} and line number ${datapoint.time.lineNumber}`)
        return
    }else{
        console.log(`Found line for timestamp ${timestamp} and line number ${datapoint.time.lineNumber}`)
    }

    line.classList.add("warning")

    button_groups[line] = button_groups[line] || []

    if (button_groups[line].length === 0){
        const hide = getHideDecider()
        line.addEventListener("click", async function() {
            hideAllButtons()
            if (hide()){
                return
            }
            for (let i = 0; i < button_groups[line].length; i++) {
                button_groups[line][i].style.display = default_display;
            }
        });
    }

    button_groups[line].push(button)

    all_buttons.push(button)
}

function getHideDecider(){
    let shouldHide = true;
    return function(){
        shouldHide = !shouldHide;
        return shouldHide;
    }
}

function hideAllButtons(){
    for (let i = 0; i < all_buttons.length; i++) {
        all_buttons[i].style.display = "none";
    }
}

