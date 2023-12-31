import {getColorMap} from "../ColorMap.js";

/**
 *
 * @param title {string}
 * @param range {number}
 * @param zoom {number}
 * @return {{xaxis: {automargin: boolean}, margin: {r: number, b: number, pad: number, t: number, l: number}, plot_bgcolor: string, paper_bgcolor: string, title, yaxis: {automargin: boolean}, autosize: boolean, scene: {xaxis: {color: string, range: (number|*)[], title: string}, aspectmode: string, yaxis: {color: string, range: (number|*)[], title: string}, zaxis: {color: string, range: (number|*)[], title: string}, aspectratio: {x: number, y: number, z: number}}, showlegend: boolean, legend: {x: number, xanchor: string, y: number}}}
 */
export function get3dLayout(title, range, zoom=1) {
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
                x: zoom, y: zoom, z: zoom,
            },
            xaxis: {
                title: 'x',
                range: [-range, range],
                color: "red",
                showticklabels: false,
            },
            yaxis: {
                title: 'y',
                range: [-range, range],
                color: "green",
                showticklabels: false,
            },
            zaxis: {
                title: 'z',
                range: [-range, range],
                color: "blue",
                showticklabels: false,
            },
            camera: {
                projection: {
                    type: 'perspective'
                }
            }
        },
        showlegend: true,
        legend: {
            x: 1,
            xanchor: 'right',
            y: 1
        }
    }
}

/**
 *
 * @param startX {number}
 * @param endX {number}
 * @returns {{yref: string, xref: string, fillcolor: string, line: {width: number}, y0: number, x0: number, y1: number, x1: number, type: string, opacity: number}}
 */
export function createErrorBar(startX, endX){
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
export function createBoundingLines(){
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
export function get2dLayout(title, forLinePlot = true) {
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
        showlegend: true,
        legend: {
            //https://plotly.com/javascript/reference/layout/#layout-legend-xanchor
            x: 1, // this is the paper coordinate of the plot
            xanchor: 'right', // right means that the position is calculated from the right side of the legend
            yanchor: 'top',
            y: 1,
            // orientation: "h",
        }
    }
}