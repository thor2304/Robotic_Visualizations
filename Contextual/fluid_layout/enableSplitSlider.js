import {updateContainers, updateSplit} from "./column_resize.js";

if (document.readyState === "interactive" || document.readyState === "complete") {
    // already fired, so run logic right away
    registerSliderEvents();
} else {
    // not fired yet, so let's listen for the event
    document.body.addEventListener("DOMContentLoaded", registerSliderEvents);
}

function registerSliderEvents() {
    let buttonDown = false;

    document.getElementById('separator-slider').addEventListener('mousedown', (e) => {
        e.preventDefault();
        buttonDown = true;
    })

    document.body.addEventListener("mouseup", (event) => {
        buttonDown = false;
    });

    document.body.addEventListener('mousemove', (e) => {
        if (buttonDown) {
            // Using clientWidth is not a bulletproof solution and may cause issues
            const windowWidth = document.documentElement["clientWidth"];
            const leftSplit = (e.pageX / windowWidth) * 100;
            const rightSplit = 100 - leftSplit;

            // When we introduce reordering between code and viz containers, we will need to update this
            // We will have to compare the x coordinates between code and viz containers
            updateSplit(rightSplit, leftSplit);
            updateContainers();
        }
    })
}