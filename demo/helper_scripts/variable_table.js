function createRowInTable(traversed_variable_name, timestamp, tblBody) {
    const variable = groups.get(getActivePlotGroup()).groupedDataPoints[timestamp].traversed_attribute(traversed_variable_name)

    if(variable === undefined) {
        return
    }
    // const variable_value = variable.value
    const variable_value = variable


    const row = document.createElement("tr");

    const var_name = document.createElement("td");
    var_name.appendChild(document.createTextNode(traversed_variable_name));

    const var_value = document.createElement("td");
    var_value.appendChild(document.createTextNode(variable_value));

    row.appendChild(var_name);
    row.appendChild(var_value);

    tblBody.appendChild(row);
    tblBody.childDict[traversed_variable_name] = row
}

async function update_variable_showcase(timestamp) {
    const variable_showcase = document.getElementById(
        `${getIdPrefix(getActivePlotGroup())}variable_vis`
    )

    let tblBodyID = 0;

    for(let i = 0; i < variable_showcase.childNodes.length; i++) {
        if(variable_showcase.childNodes[i].nodeName === 'TBODY') {
            tblBodyID = i;
            break;
        }
    }

    const tblBody = variable_showcase.childNodes[tblBodyID];

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

    for (let i = 0; i < available_variable_names.length; i++) {
        const name = available_variable_names[i];
        if(tblBody.childDict[name] === undefined) {
            createRowInTable(name, timestamp, tblBody);
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
