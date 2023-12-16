import {getActivePlotGroup, updateVisualizations} from "./updateVisualizations.js";
import {groups} from "../csv_driven_3d.js";
import {updateSliderStep} from "./slider-control.js";

async function stepToNextTimestamp() {
    const nextTimestamp = groups.get(getActivePlotGroup()).dataPointsLinked.next();
    await updateVisualizations(nextTimestamp, getActivePlotGroup());
    updateSliderStep(nextTimestamp);
}

async function stepToPreviousTimestamp() {
    const previousTimeStamp = groups.get(getActivePlotGroup()).dataPointsLinked.previous();
    if (previousTimeStamp === undefined) {
        return;
    }
    await updateVisualizations(previousTimeStamp, getActivePlotGroup());
    updateSliderStep(previousTimeStamp);
}

const right_arrow = "ArrowRight";
const left_arrow = "ArrowLeft";

document.body.addEventListener("keydown", (e) => {
    try {
        if (e.key === right_arrow) {
            stepToNextTimestamp().then()
        } else if (e.key === left_arrow) {
            stepToPreviousTimestamp().then()
        }
    } catch (e) {
        console.log(e)
    }
})