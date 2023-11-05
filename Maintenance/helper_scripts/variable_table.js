import {getActivePlotGroup} from "./updateVisualizations.js";
import {getIdPrefix, groups} from "../csv_driven_3d.js";
import {extract_available_variables} from "./helpers.js";

function createRowInTableWithVariable(traversed_variable_name, timestamp, tblBody) {
    const variable = groups.get(getActivePlotGroup()).groupedDataPoints[timestamp].traversed_attribute(traversed_variable_name)

    if(variable === undefined) {
        return
    }
    createRowInTable([traversed_variable_name, variable], tblBody)
}

export function createRowInTable(column_contents, tblBody) {
    const row = document.createElement("tr");

    for(let i = 0; i < column_contents.length; i++) {
        const column = document.createElement("td");
        column.appendChild(document.createTextNode(column_contents[i]));
        row.appendChild(column);
    }

    tblBody.appendChild(row);
    if (tblBody.childDict === undefined) {
        tblBody.childDict = {}
    }
    tblBody.childDict[column_contents[0]] = row
}

export function getTblBodyFromDiv(div) {
    for(let i = 0; i < div.childNodes.length; i++) {
        if(div.childNodes[i].nodeName === 'TBODY') {
            return div.childNodes[i];
        }
        if (div.childNodes[i].nodeName === 'TABLE') {
            return getTblBodyFromDiv(div.childNodes[i]);
        }
    }
}

export async function update_variable_showcase(timestamp) {
    const variable_showcase = document.getElementById(
        `${getIdPrefix(getActivePlotGroup())}variable_vis`
    )

    const tblBody = getTblBodyFromDiv(variable_showcase);

    if (tblBody.childDict === undefined) {
        tblBody.childDict = {}
        for (let child of tblBody.childNodes) {
            if (child.nodeName !== 'TR') {
                continue
            }
            tblBody.childDict[child.childNodes[0].innerText] = child
        }
    }

    for (let i = 0; i < tblBody.childNodes.length; i++) {
        let child = tblBody.childNodes[i]
        if (child.nodeName !== 'TR') {
            continue
        }
        let is_header = false
        for (let j = 0; j < child.childNodes.length; j++) {
            if (child.childNodes[j].nodeName === 'TH') {
                is_header = true
                break
            }
        }
        if (is_header) {
            continue
        }
        child.childNodes[1].innerText = 'undefined'
    }

    const available_variable_names = extract_available_variables(groups.get(getActivePlotGroup()).groupedDataPoints[timestamp])
    add_path_to_variable_names('scriptVariables', available_variable_names)
    // available_variable_names.push("pointInTime.lineString") // When added back in the table might become too wide for the screen with the current implementation
    available_variable_names.push("pointInTime.lineNumber")
    available_variable_names.push("pointInTime.timestamp")

    for (let i = 0; i < available_variable_names.length; i++) {
        const name = available_variable_names[i];
        if(tblBody.childDict[name] === undefined) {
            createRowInTableWithVariable(name, timestamp, tblBody);
        }

        tblBody.childDict[name].childNodes[1].innerText = groups.get(getActivePlotGroup()).groupedDataPoints[timestamp].traversed_attribute(name)
    }

    variable_showcase.appendChild(tblBody);
}

function add_path_to_variable_names(path, variable_names) {
    for(let i = 0; i < variable_names.length; i++) {
        variable_names[i] = `${path}.${variable_names[i]}.value`
    }
}
