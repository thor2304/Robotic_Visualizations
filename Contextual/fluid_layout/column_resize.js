import {get_throttled_version_function} from "../helper_scripts/factories/ThrottledFunction.js";

export const visualizationContainer = document.getElementById("visualization-container");


const [_updateContainers, _updateSplit] = getSplitResizeFunctions();

/**
 * This function is not throttled, but calling it multiple times have no negative impact.
 *
 * @type {function(number, number): void}
 * @param codeSplit {number} The percentage of the code container
 * @param vizSplit {number} The percentage of the visualization container
 */
export const updateSplit = _updateSplit;

/**
 * This function is throttled. So calling it frequently is safe.<br>
 * It updates the flex values of the code and visualization containers.
 * It is used to update the plotly containers since they do not respect flex values.
 *
 * Therefore, this function should be called after changes to the flex values of the code and visualization containers.
 * And after changes to the window size.
 * @type {function(): void}
 */
export const updateContainers = _updateContainers;

/**
 * We use this function to return other functions, because of closures.<br>
 * This allows us to keep the internal variables hidden, but create a method for updating them.
 * @return {(_updateContainers|_updateSplit)[]}
 */
function getSplitResizeFunctions(){
    let internalCodeSplit = 50; // initial values
    let internalVizSplit = 50; // initial values

    const codeContainer = document.getElementById("code-container");
    const main_container = document.querySelector('main');
    let plotly_containers = document.querySelectorAll('.js-plotly-plot');

    visualizationContainer.addEventListener("populated", () => {
        plotly_containers = document.querySelectorAll('.js-plotly-plot');
    })

    function _updateSplit(codeSplit, vizSplit) {
        internalCodeSplit = codeSplit;
        internalVizSplit = vizSplit;
    }


    function updatePlotlyContainers(target_size){
        // Since the plotly charts have set width, they somehow override the flex container
        // We need to manually update the width of the plotly charts
        plotly_containers.forEach((plotly_container) => {
            Plotly.relayout(plotly_container, {
                // since the function is throttled, we can just set the width to the target size
                width:  target_size,
            });
        })
    }

    const throttledUpdatePlotlyContainers = get_throttled_version_function(updatePlotlyContainers, 10);

    function _updateContainers(){
        codeContainer.style.flex = `${internalCodeSplit}%`

        visualizationContainer.style.flex = `${internalVizSplit}%`

        // Taking a % off the split will make the plot slightly smaller and allow for flex to control the size
        const target_down_size = main_container.clientWidth * 0.01 * (internalVizSplit - 2);
        throttledUpdatePlotlyContainers(target_down_size);
    }

    return [_updateContainers, _updateSplit]
}


