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
        paper_bgcolor: getColorMap().plot_colors.paperColor,
        plot_bgcolor: getColorMap().plot_colors.plotColor,
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

        fillcolor: getColorMap().general.error,
        opacity: 0.3,
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

        fillcolor: getColorMap().plot_colors.gridColor,
        opacity: 1,
        line: {
            width: 1,
            color: getColorMap().plot_colors.gridColor
        }
    }
}

/**
 *
 * @param title {string}
 * @param forLinePlot {boolean} - If true, the layout will be for a line plot, otherwise it will be for other types of 2d plots
 * @returns Object
 */
function get2dLayout(title, forLinePlot = true) {
    const {plotColor, paperColor, gridColor} = getColorMap().plot_colors

    return {
        title: title,
        hovermode: forLinePlot ? "x unified" : "closest",
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
            showspikes: forLinePlot,
            gridcolor: gridColor,
            gridwidth: 1,
            showline: forLinePlot,
        },
        yaxis: {
            automargin: true,
            gridcolor: gridColor,
            gridwidth: 1,
            showline: forLinePlot,
        },
        plot_bgcolor: plotColor,
        paper_bgcolor: paperColor,
        //https://plotly.com/javascript/shapes/
        shapes: [
        ],
    }
}