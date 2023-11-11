import {groups} from "../csv_driven_3d.js";

/**
 *
 * @param groups {GroupController}
 */
export function populatePickers(groups) {
    const groupIdentifiers = groups.getGroupIdentifiers()
    const counts = []
    for (let i = 0; i < groupIdentifiers.length; i++) {
        const groupIdentifier = groupIdentifiers[i];
        const groupSelector = document.getElementById(`dropdown-${groupIdentifier}`)
        const plotGroups = groups.getOptions(groupIdentifier)
        counts.push(plotGroups.length)
        addOptions(groupIdentifier, groupSelector, plotGroups)
    }

    const sum = counts.reduce((a, b) => a + b, 0)

    for (let i = 0; i < groupIdentifiers.length; i++) {
        const label = document.getElementById(`error-density-${groupIdentifiers[i]}`)
        const groupSelector = document.getElementById(`dropdown-${groupIdentifiers[i]}`)
        addPercentageDisplay(label,  groupSelector.errorCount / sum * 100, true)
        // addPercentageDisplay(label,  groupSelector.notErrorCount / sum * 100, false)
    }
}

function addPercentageDisplay(pickerLabel, percentage, hasError = true) {
    const percentageDisplay = document.createElement("span")
    percentageDisplay.innerText = ` Errors were ${hasError ? "" : "not " }detected in ${percentage}% of the provided cycles`
    pickerLabel.appendChild(percentageDisplay)
}

/**
 * @param groupIdentifier {PlotGroupIdentifier}
 * @param groupPicker {HTMLSelectElement}
 * @param plotGroups {PlotGroup[]}
 */
function addOptions(groupIdentifier, groupPicker, plotGroups) {
    let errors = 0;
    let notErrors = 0;
    for (let i = 0; i < plotGroups.length; i++) {
        const plotGroup = plotGroups[i];
        const option = document.createElement("option")
        option.innerText = `${plotGroup.getCycle().cycleIndex} ${plotGroup.getCycle().hasError() ? " (error)" : ""}`
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

