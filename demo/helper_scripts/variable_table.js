function createRowInTable(variable_name, timestamp, tblBody) {
    const variable = datapoints[timestamp].scriptVariables[variable_name]
    if(variable === undefined) {
        return
    }
    const variable_value = variable.value


    const row = document.createElement("tr");

    const var_name = document.createElement("td");
    var_name.appendChild(document.createTextNode(variable_name));

    const var_value = document.createElement("td");
    var_value.appendChild(document.createTextNode(variable_value));

    row.appendChild(var_name);
    row.appendChild(var_value);

    tblBody.appendChild(row);
    tblBody.childDict[variable_name] = row
}

async function update_variable_showcase(timestamp) {
    const variable_showcase = document.getElementById('variable_showcase')

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

    const available_variable_names = extract_available_variables(datapoints[timestamp])

    for (let i = 0; i < available_variable_names.length; i++) {
        if(tblBody.childDict[available_variable_names[i]] === undefined) {
            createRowInTable(available_variable_names[i], timestamp, tblBody);
        }

        tblBody.childDict[available_variable_names[i]].childNodes[1].innerText = datapoints[timestamp].scriptVariables[available_variable_names[i]].value
    }

    variable_showcase.appendChild(tblBody);
}