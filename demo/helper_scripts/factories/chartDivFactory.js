async function createDivForPlotlyChart(chartId) {
    // check whether the div already exists
    if (document.getElementById(chartId) !== null) {
        // Check if it has the correct shape?
        return
    }

    // create div since it does not exist yet
    const div = _createDiv(chartId)

    // Create the heading inside that gets the loading text
    const heading = document.createElement("h1")

    // Add the heading to the div as a child
    div.appendChild(heading)

    //Add the div to the container that has the visualizations
    document.getElementById("visualization-container").appendChild(div)
}

function _createDiv(id) {
    const div = document.createElement("div")

    // Add the classes to the div for placeholder text and formatting
    div.id = id
    div.classList.add("vis-placeholder", "draggable")
    div.draggable = false

    return div
}

async function createDivsForPlotlyCharts(chartIds) {
    for (let chartId of chartIds) {
        await createDivForPlotlyChart(chartId)
    }
}

async function createDivForTable(chartId, tableId, tableHeaders) {
    // check whether the div already exists
    if (document.getElementById(chartId) !== null) {
        // Check if it has the correct shape?
        return
    }

    const div = _createDiv(chartId)

    const table = document.createElement("table")
    table.id = tableId

    const tableBody = document.createElement("tbody")
    const headerRow = document.createElement("tr")

    table.appendChild(tableBody)
    tableBody.appendChild(headerRow)

    for (let header of tableHeaders){
        const tableHead = document.createElement("th")
        tableHead.innerText = header
        headerRow.appendChild(tableHead)
    }

    div.appendChild(table)

    //Add the div to the container that has the visualizations
    document.getElementById("visualization-container").appendChild(div)
}