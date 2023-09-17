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

document.body.addEventListener('mousemove', (e) => {
    setTimeout(() => {
        plotly_containers = document.querySelectorAll('.js-plotly-plot');
    }, 2000)
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

        codeContainer.style.flex = `${codeSplit}%`
        visualizationContainer.style.flex = `${vizSplit}%`

        // the following are boundaries for when to resize the plotly charts
        const low_percent = 1.2;
        const lower_bound = main_container.clientWidth * 0.01 * low_percent; // the charts current size is less than lower_bound px from the target size
        const up_percent = 15;
        const upper_bound = main_container.clientWidth * 0.01 * up_percent; // the charts current size is more than upper_bound px from the target size

        const true_target_size = main_container.clientWidth * 0.01 * vizSplit;

        // Taking a % off the split will make the plot slightly smaller and allow for flex to control the size
        const target_down_size = main_container.clientWidth * 0.01 * (vizSplit - 10);

        // Since the plotly charts have set width, they somehow override the flex container
        // We need to manually update the width of the plotly charts
        plotly_containers.forEach((plotly_container) => {
            console.log("plotly_container.layout", plotly_container.layout)
            console.log("plotly_container", plotly_container)
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
})