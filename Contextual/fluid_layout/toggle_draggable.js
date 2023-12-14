export const unlock_button = document.querySelector('#lock-layout-button');
const separatorSlider = document.querySelector('#separator-slider');


const locked_to_unlock_string = "🔒➡️🔓";
const unlock_to_locked_string = "🔓➡️🔒";

let is_locked = true;

function update_unlocked_class(draggable) {
    if (is_locked) {
        draggable.classList.remove("unlocked")
    } else {
        draggable.classList.add("unlocked")
    }
}

/**
 *
 * @type {Map<HTMLElement, {dragmode: string, hovermode: string}>}
 */
const previousSettings = new Map();

function isNotPlotlyChart(element) {
    let plotly_div = undefined;
    for (let i = 0; i < element.childElementCount; i++) {
        if (element.children[i].classList.contains("plot-container")) {
            plotly_div = element.children[i];
            break;
        }
    }
    return plotly_div === undefined;

}

/**
 *
 * @param element {HTMLElement}
 */
function update_plotly_chart_static(element) {
    // Only generate the image if necessary

    if (isNotPlotlyChart(element)) {
        return;
    }

    const newLayout = {
        dragmode: is_locked ? previousSettings.get(element).dragmode :false,
        hovermode: is_locked ? previousSettings.get(element).hovermode : false,
        width: element.clientWidth
    }

    previousSettings.set(element, {
        dragmode: element.layout.dragmode,
        hovermode: element.layout.hovermode
    })

    //  The relayout makes sure the chart is the right size
    Plotly.relayout(element, newLayout);
}

unlock_button.addEventListener('click', () => {
    const draggables = document.querySelectorAll('.draggable');

    is_locked = !is_locked;

    draggables.forEach(draggable => {
        draggable.setAttribute('draggable', `${!is_locked}`);
        update_unlocked_class(draggable);
        update_plotly_chart_static(draggable);
    })

    separatorSlider.style.visibility = is_locked ? "hidden" : "visible";
    separatorSlider.classList.toggle("unlocked", !is_locked);


    setButtonString()
})


function setButtonString() {
    unlock_button.innerText = is_locked ? locked_to_unlock_string : unlock_to_locked_string;
    update_unlocked_class(unlock_button)
}

setButtonString();



