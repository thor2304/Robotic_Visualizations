// The span that should be updated to the text value of the timestamp at the index selected by the slider
import {evenlyPickItemsFromArray} from "./helpers.js";
import {getActivePlotGroup, updateVisualizations} from "./updateVisualizations.js";

const timestampShowcase = document.getElementById('timestamp-vis');

// Contains the slider that is used to select a timestamp
const timeSlider = document.getElementById('time-slider');

// Contains spans that should be updated to the text value of the timestamp at this index
const sliderTicks = document.getElementById('slider-ticks');

export let updateSliderStep;

export function registerSliderTimestamps(dataPoints) {
    // Create numberOfTicks evenly spaced ticks
    const numberOfTicks = 10;

    const tickDataPoints = evenlyPickItemsFromArray(dataPoints, numberOfTicks)

    const ticks = sliderTicks.childNodes
    for (; ticks.length > 0;) {
        ticks[0].remove();
    }

    for (let i = 0; i < tickDataPoints.length; i++) {
        const span = document.createElement('span');
        span.innerText = tickDataPoints[i].time.stepCount;
        sliderTicks.appendChild(span);
    }

    // Set the timestamp showcase to the first timestamp
    timestampShowcase.innerText = dataPoints[0].time.stepCount;

    // Set the slider to the first timestamp
    timeSlider.value = 0;

    timeSlider.min = 0;
    timeSlider.max = dataPoints.length - 1;

    const timeStampStringToIndex = {};
    for (let i = 0; i < dataPoints.length; i++) {
        timeStampStringToIndex[dataPoints[i].time.stepCount] = i;
    }

    updateSliderStep = (timestampString) => {
        timeSlider.value = timeStampStringToIndex[timestampString];
        updateSliderText(timestampString)
    }

    function updateSliderText(timeStampString) {
        timestampShowcase.innerText = timeStampString;
    }

    // Update the timestamp showcase when the slider is moved
    // timeSlider.addEventListener('input', async () => {
    //     const timestamp = dataPoints[timeSlider.value].time.stepCount;
    //     updateSliderText(timestamp);
    //     await updateVisualizations(timestamp, getActivePlotGroup());
    // });

    timeSlider.oninput = async function () {
        const timestamp = dataPoints[timeSlider.value].time.stepCount;
        updateSliderText(timestamp);
        await updateVisualizations(timestamp, getActivePlotGroup());
    }
}