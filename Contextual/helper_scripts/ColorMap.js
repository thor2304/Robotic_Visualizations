/**
 * @typedef ColorMap {{general: {success: string, warning: string, error: string, text_on_background: string}, legend_colors_array: string[], group_colors: {B_inactive: string, B_background: string, A_inactive: string, A_background: string, B_active: string, A_active: string}, plot_colors: {paperColor: string, gridColor: string, plotColor: string}, legend_colors: {a: string, b: string, c: string, d: string, e: string, f: string, connecting_line: string}}}
 */

/**
 * Reads the color map from the css variables
 * @returns ColorMap
 * @private
 */
function _readColorMap() {
    const r = document.querySelector(':root');
    const rs = getComputedStyle(r);

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
        general: {
            error: rs.getPropertyValue('--error-color'),
            warning: rs.getPropertyValue('--warning-color'),
            success: rs.getPropertyValue('--success-color'),
            text_on_background: rs.getPropertyValue('--text-on-background-color'),
        },
        legend_colors: {
            a: rs.getPropertyValue('--legend-a-color'),
            b: rs.getPropertyValue('--legend-b-color'),
            c: rs.getPropertyValue('--legend-c-color'),
            d: rs.getPropertyValue('--legend-d-color'),
            e: rs.getPropertyValue('--legend-e-color'),
            f: rs.getPropertyValue('--legend-f-color'),
            connecting_line: rs.getPropertyValue('--connecting-line-color'),
        },
        legend_colors_array: [
            rs.getPropertyValue('--legend-a-color'),
            rs.getPropertyValue('--legend-b-color'),
            rs.getPropertyValue('--legend-c-color'),
            rs.getPropertyValue('--legend-d-color'),
            rs.getPropertyValue('--legend-e-color'),
            rs.getPropertyValue('--legend-f-color'),
        ],
        group_colors: {
            A_background: rs.getPropertyValue('--group-A-background-color'),
            A_active: rs.getPropertyValue('--group-A-active-color'),
            A_inactive: rs.getPropertyValue('--group-A-inactive-color'),
            B_background: rs.getPropertyValue('--group-B-background-color'),
            B_active: rs.getPropertyValue('--group-B-active-color'),
            B_inactive: rs.getPropertyValue('--group-B-inactive-color'),
        },
        plot_colors: {
            plotColor: plotColor,
            paperColor: paperColor,
            gridColor: gridColor
        }
    };
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    const newColorScheme = event.matches ? "dark" : "light";
    alert(`To change to ${newColorScheme} mode, you should reload the page while it is the chosen mode`)
});


/**
 * Get the active color map. This is already taking into account dark/light mode
 * @returns ColorMap
 */
export function getColorMap() {
    return _readColorMap();
}