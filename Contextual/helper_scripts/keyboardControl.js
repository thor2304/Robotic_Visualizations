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
    if (e.key === right_arrow) {
        stepToNextTimestamp().catch((e) => {
            console.error(e);
        })
    } else if (e.key === left_arrow) {
        stepToPreviousTimestamp().catch((e) => {
            console.error(e);
        })
    }
})