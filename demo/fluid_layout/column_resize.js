const separationSlider = document.getElementById('separator-slider');
const codeContainer = document.getElementById("code-container");
const visualizationContainer = document.getElementById("visualization-container");

let buttonDown = false;

separationSlider.addEventListener('mousedown', (e) => {
    e.preventDefault();
    buttonDown = true;
})

document.body.addEventListener("mouseup", (event) => {
    buttonDown = false;
});

let plotly_containers = document.querySelectorAll('.js-plotly-plot');
const main_container = document.querySelector('main');
setTimeout(() => {
    plotly_containers = document.querySelectorAll('.js-plotly-plot');
}, 5000)

document.body.addEventListener('mousemove', async (e) => {
    // TODO: Add a an event for charts loaded, that this can tie into along with the draggable functionality

    // noinspection UnnecessaryLocalVariableJS
    if (buttonDown) {
        // Using clientWidth is not a bulletproof solution and may cause issues
        const windowWidth = document.documentElement["clientWidth"];
        const leftSplit = (e.pageX / windowWidth) * 100;
        const rightSplit = 100 - leftSplit;

        // When we introduce reordering between code and viz containers, we will need to update this
        // We will have to compare the x coordinates between code and viz containers
        const codeSplit = rightSplit;
        const vizSplit = leftSplit;

        await updateSplit(codeSplit, vizSplit);
        await updateContainers();
    }
})

const [_updateContainers, _updateSplit] = getSplitResizeFunctions();

/**
 * This function is throttled
 *
 * @type {function(number, number): void}
 * @param codeSplit {number} The percentage of the code container
 * @param vizSplit {number} The percentage of the visualization container
 */
const updateSplit = _updateSplit;

/**
 * This function is throttled.
 * It updates the flex values of the code and visualization containers.
 * It is used to update the plotly containers since they do not respect flex values.
 *
 * Therefore, this function should be called after changes to the flex values of the code and visualization containers.
 * And after changes to the window size.
 * @type {function(): void}
 */
const updateContainers = _updateContainers;

function getSplitResizeFunctions(){
    let internalCodeSplit = 50;
    let internalVizSplit = 50;

    const _updateSplit = (codeSplit, vizSplit) => {
        internalCodeSplit = codeSplit;
        internalVizSplit = vizSplit;
    }

    const _updateContainers = () => {
        console.log("updateContainers");
        codeContainer.style.flex = `${internalCodeSplit}%`
        visualizationContainer.style.flex = `${internalVizSplit}%`

        // the following are boundaries for when to resize the plotly charts
        const low_percent = 1.2;
        const lower_bound = main_container.clientWidth * 0.01 * low_percent; // the charts current size is less than lower_bound px from the target size
        const up_percent = 15;
        const upper_bound = main_container.clientWidth * 0.01 * up_percent; // the charts current size is more than upper_bound px from the target size

        const true_target_size = main_container.clientWidth * 0.01 * internalVizSplit;

        // Taking a % off the split will make the plot slightly smaller and allow for flex to control the size
        const target_down_size = main_container.clientWidth * 0.01 * (internalVizSplit - 10);

        // Since the plotly charts have set width, they somehow override the flex container
        // We need to manually update the width of the plotly charts
        plotly_containers.forEach((plotly_container) => {
            // console.log("plotly_container.layout", plotly_container.layout)
            // console.log("plotly_container", plotly_container)
            const difference = true_target_size - plotly_container.layout.width;
            if (difference > lower_bound && difference < upper_bound) {
                // We are within acceptable bounds, no need to resize
                return;
            }
            Plotly.relayout(plotly_container, {
                // If we do not subtract the lower bound, then the lower_bound will be triggered on the next "frame"
                width: difference > lower_bound ? true_target_size - (lower_bound + 5): target_down_size,
            });
        })
    }

    const throttleUpdateContainers = get_throttled_version_function(_updateContainers, 50);
    const throttleUpdateSplit = get_throttled_version_function(_updateSplit, 50);

    return [throttleUpdateContainers, throttleUpdateSplit]

}