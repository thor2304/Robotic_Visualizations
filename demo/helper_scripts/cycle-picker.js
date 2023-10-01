/**
 *
 * @param groups {GroupController}
 */
function populatePickers(groups) {
    const groupIdentifiers = groups.getGroupIdentifiers()
    for (let i = 0; i < groupIdentifiers.length; i++) {
        const groupIdentifier = groupIdentifiers[i];
        const groupSelector = document.getElementById(`dropdown-${groupIdentifier}`)
        addOptions(groupIdentifier, groupSelector, groups.getOptions(groupIdentifier))
    }
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
        option.innerText = `${plotGroup.getCycle().cycleIndex}`
        option.value = i
        if (i === 0) {
            option.selected = true
        }
        groupPicker.appendChild(option)
    }

    groupPicker.addEventListener("change", () => {
        console.log("change")
        const selected = groupPicker.value
        groups.set(groupIdentifier, selected)
    })

}

