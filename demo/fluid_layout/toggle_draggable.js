const unlock_button = document.querySelector('#lock-layout-button');
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

function update_plotly_chart_static(element) {
    // if (element.data !== undefined) {
    //     Plotly.react(element, element.data, element.layout, {staticPlot: !is_locked});
    // }

    let plotly_image = undefined;

    for (let i = 0; i < element.childElementCount; i++) {
        if (element.children[i].classList.contains("plotly-image")) {
            plotly_image = element.children[i];
            break;
        }
    }

    if (plotly_image === undefined) {
        // create an image tag to put the plotly chart in
        plotly_image = document.createElement("img");
        plotly_image.classList.add("plotly-image");

        element.appendChild(plotly_image);
    }

    let plotly_div = undefined;
    for (let i = 0; i < element.childElementCount; i++) {
        if (element.children[i].classList.contains("plot-container")) {
            plotly_div = element.children[i];
            break;
        }
    }
    const plotly_controlled_div = plotly_div;


    if (plotly_controlled_div === undefined) {
        return;
    }

    // Only generate the image if necessary
    if (!is_locked) {
        // Plotly
        //     .toImage(
        //         element,
        //         {
        //             format: 'png',
        //             width: plotly_controlled_div.clientWidth,
        //             height: plotly_controlled_div.clientHeight
        //         })
        //     .then(function (dataUrl) {
        //         plotly_image.src = dataUrl;
        //     });
        Plotly.relayout(element, {
            dragmode: false,
            // hovermode: false
        })
    } else {
        //    Otherwise we are going from showing an image to showing the chart.
        //    Showing the chart requires a relayout to make sure the chart is the right size
        Plotly.relayout(element, {
            dragmode: "turntable",
            width: element.clientWidth
        });
    }

    // plotly_controlled_div.hidden = !is_locked;
    // plotly_image.hidden = is_locked;
    plotly_image.hidden = true;
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



