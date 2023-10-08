function get3dLayout(title, range) {
    return {
        title: title,
        autosize: true,
        margin: {
            l: 0,
            r: 0,
            b: 5,
            t: 30,
            pad: 4
        },
        xaxis: {
            automargin: true,
        },
        yaxis: {
            automargin: true,
        },
        paper_bgcolor: '#303f4b00',
        plot_bgcolor: '#b7b7b700',
        scene: {
            aspectmode: "manual",
            aspectratio: {
                x: 1, y: 1, z: 1,
            },
            xaxis: {
                title: 'x',
                range: [-range, range],
                color: "red"
            },
            yaxis: {
                title: 'y',
                range: [-range, range],
                color: "green"
            },
            zaxis: {
                title: 'z',
                range: [-range, range],
                color: "blue"
            }
        }
    }
}

/**
 *
 * @param startX {number}
 * @param endX {number}
 * @returns {{yref: string, xref: string, fillcolor: string, line: {width: number}, y0: number, x0: number, y1: number, x1: number, type: string, opacity: number}}
 */
function createErrorBar(startX, endX){
    //https://plotly.com/javascript/shapes/
    return {
        type: "rect",
        xref: "x",
        yref: "paper",
        x0: startX,
        y0: 0,
        x1: endX,
        y1: 1,

        fillcolor: "#e71818",
        opacity: 0.2,
        line: {
            width: 0
        }
    }
}

/**
 * @returns {{yref: string, xref: string, fillcolor: string, line: {color, width: number}, y0: number, x0: number, y1: number, x1: number, type: string, opacity: number}}
 */
function createBoundingLines(){
    return {
        type: "rect",
        xref: "paper",
        yref: "paper",
        x0: 0,
        y0: 0,
        x1: 1,
        y1: 1,

        fillcolor: "rgba(255,255,255)",
        opacity: 1,
        line: {
            width: 1,
            color: _getColors().gridColor
        }
    }
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    const newColorScheme = event.matches ? "dark" : "light";
    alert(`To change to ${newColorScheme} mode, you should reload the page while it is the chosen mode`)
});

/**
 *
 * @returns {{paperColor: string, gridColor: string, plotColor: string}}
 * @private
 */
function _getColors(){
    let plotColor = 'rgba(145,0,0,0)'
    // let paperColor = 'hsl(208, 21%, 12%)'
    let paperColor = 'hsla(208,21%,12%,0)'
    let gridColor = "rgba(100,100,100,0.6)"

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        // light mode
        plotColor = 'rgba(145,0,0,0)'
        paperColor = 'hsl(210, 29%, 97%)'
        gridColor = "rgba(96,96,96,0.6)"
    }

    return {
        plotColor: plotColor,
        paperColor: paperColor,
        gridColor: gridColor
    }
}

/**
 *
 * @param title {string}
 * @returns Object
 */
function get2dLayout(title) {
    const {plotColor, paperColor, gridColor} = _getColors()

    return {
        title: title,
        hovermode:"x unified",
        autosize: true,
        margin: {
            l: 0,
            r: 0,
            b: 25,
            t: 30,
            pad: 4
        },
        xaxis: {
            automargin: true,
            spikethickness: -2, // Enabling this removes the color surrounding the spike line
            gridcolor: gridColor,
            gridwidth: 1,
            showline: true,
        },
        yaxis: {
            automargin: true,
            gridcolor: gridColor,
            gridwidth: 1,
            showline: true,
        },
        plot_bgcolor: plotColor,
        paper_bgcolor: paperColor,
        //https://plotly.com/javascript/shapes/
        shapes: [
        ],
    }
}