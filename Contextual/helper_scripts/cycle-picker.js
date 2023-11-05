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
    //TODO: Calculate error percentage and not error percentage not just the percentage for each picker

    const sum = counts.reduce((a, b) => a + b, 0)

    for (let i = 0; i < groupIdentifiers.length; i++) {
        const label = document.getElementById(`dropdown-${groupIdentifiers[i]}-label`)
        addPercentageDisplay(label, counts[i] / sum * 100)
    }
}

function addPercentageDisplay(pickerLabel, percentage) {
    const percentageDisplay = document.createElement("span")
    percentageDisplay.innerText = ` (${percentage}% of cycles)`
    pickerLabel.appendChild(percentageDisplay)
}

/**
 * @param groupIdentifier {PlotGroupIdentifier}
 * @param groupPicker {HTMLSelectElement}
 * @param plotGroups {PlotGroup[]}
 */
function addOptions(groupIdentifier, groupPicker, plotGroups) {
    for (let i = 0; i < plotGroups.length; i++) {
        const plotGroup = plotGroups[i];
        const option = document.createElement("option")
        option.innerText = `${plotGroup.getCycle().cycleIndex} ${plotGroup.getCycle().hasError() ? " (error)" : ""}`
        option.value = i.toString()
        if (i === 0) {
            option.selected = true
        }
        groupPicker.appendChild(option)
    }

    groupPicker.addEventListener("change", () => {
        const selected = groupPicker.value
        groups.set(groupIdentifier, selected)
    })

}

