import {calculateRemainingLife} from "./lifetimeCalculation.js";
import {Joints} from "../datastructures/datastructures.js";
import {createDivForTable} from "../helper_scripts/factories/chartDivFactory.js";
import {createRowInTable, getTblBodyFromDiv} from "../helper_scripts/variable_table.js";

export async function showStrain(rawFrames) {
    const life = await calculateRemainingLife(rawFrames)

    console.log("Strain:", life)

    const strainDisplay = document.getElementById("strain-display")
    console.log(strainDisplay)

    if (life === undefined || life === null || life.filter(l => isNaN(l)).length === life.length) {
        const strainDisplayText = document.createElement("p")
        strainDisplayText.innerText = `No strain data available`
        strainDisplay.appendChild(strainDisplayText)
        return
    }

    const table = await createDivForTable("strain-display", "strain-table", ["id", "Joint name", "Expected total life [years]"])
    const tblBody = getTblBodyFromDiv(table)
    console.log(tblBody)
    console.log(table)

    Object.keys(Joints).forEach((joint, index) => {
        const lifeInMinutes = life[index] / 60
        const lifeInHours = lifeInMinutes / 60
        const lifeInDays = lifeInHours / 24
        const lifeInYears = lifeInDays / 365
        const displayYears = lifeInYears.toFixed(2)

        createRowInTable([index, joint, `${displayYears} years`], tblBody)
    })
}

function showTextInDiv(strainDisplay, joint, lifeInYears) {
    const strainDisplayText = document.createElement("p")
    strainDisplayText.innerText = `Expected total of ${joint}: ${lifeInYears} years`
    strainDisplay.appendChild(strainDisplayText)
}