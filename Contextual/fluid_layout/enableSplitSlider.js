import {updateContainers, updateSplit} from "./column_resize.js";

document.body.addEventListener("DOMContentLoaded", () => {
    registerSliderEvents()
});

function registerSliderEvents() {
    let buttonDown = false;

    document.getElementById('separator-slider').addEventListener('mousedown', (e) => {
        e.preventDefault();
        buttonDown = true;
    })

    document.body.addEventListener("mouseup", (event) => {
        buttonDown = false;
    });

    document.body.addEventListener('mousemove', async (e) => {
        if (buttonDown) {
            // Using clientWidth is not a bulletproof solution and may cause issues
            const windowWidth = document.documentElement["clientWidth"];
            const leftSplit = (e.pageX / windowWidth) * 100;
            const rightSplit = 100 - leftSplit;

            // When we introduce reordering between code and viz containers, we will need to update this
            // We will have to compare the x coordinates between code and viz containers
            await updateSplit(rightSplit, leftSplit);
            await updateContainers();
        }
    })
}