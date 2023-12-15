import {groups} from "../csv_driven_3d.js";

/**
 * 
 * @param groups {GroupController}
 */
export function populatePickers(groups) {
    const groupIdentifiers = groups.getGroupIdentifiers()
    const counts = []
    for (const groupIdentifier of groupIdentifiers) {
        const groupSelector = document.getElementById(`dropdown-${groupIdentifier}`)
        const plotGroups = groups.getOptions(groupIdentifier)
        counts.push(plotGroups.length)
        addOptions(groupIdentifier, groupSelector, plotGroups)
    }

    const sum = counts.reduce((a, b) => a + b, 0)

    for (const groupIdentifier of groupIdentifiers) {
        const label = document.getElementById(`error-density-${groupIdentifier}`)
        const groupSelector = document.getElementById(`dropdown-${groupIdentifier}`)
        const percentage = Math.round((groupSelector.errorCount / sum * 100)*10)/10
        addPercentageDisplay(label,  percentage, true)
    }
}

/**
 *Adds the text for the percentage of errors found.
 * @param pickerLabel {HTMLLabelElement}
 * @param percentage {number}
 * @param hasError {boolean}
 */
function addPercentageDisplay(pickerLabel, percentage, hasError = true) {
    const percentageDisplay = document.createElement("span")
    percentageDisplay.innerText = ` Errors were ${hasError ? "" : "not " }detected in ${percentage}% of the provided cycles`
    pickerLabel.appendChild(percentageDisplay)
}

/**
 * Adds options to the cycle picker dropdown.
 * @param groupIdentifier {PlotGroupIdentifier}
 * @param groupPicker {HTMLSelectElement}
 * @param plotGroups {PlotGroup[]}
 */
function addOptions(groupIdentifier, groupPicker, plotGroups) {
    let errors = 0;
    let notErrors = 0;

    plotGroups.sort((a, b) => a.getCycle().cycleIndex - b.getCycle().cycleIndex)

    for (let i = 0; i < plotGroups.length; i++) {
        const plotGroup = plotGroups[i];
        const option = document.createElement("option")
        let appendText = ""
        if (plotGroup.getCycle().hasError()) {
            appendText = "(error)"
        }
        if (plotGroup.getCycle().hasWarning()) {
            appendText = "(warning)"
        }
        option.innerText = `${plotGroup.getCycle().cycleIndex + 1} ${appendText}`
        option.value = i.toString()
        if (i === 0) {
            option.selected = true
        }
        groupPicker.appendChild(option)

        if (plotGroup.getCycle().hasError()) {
            errors++
        } else {
            notErrors++
        }
    }

    groupPicker.addEventListener("change", () => {
        const selected = groupPicker.value
        groups.set(groupIdentifier, selected)
    })

    groupPicker.errorCount = errors
    groupPicker.notErrorCount = notErrors
}

