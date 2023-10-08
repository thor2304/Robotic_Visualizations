/**
 * Reads the color map from the css variables
 * @returns {{general: {success: string, warning: string, error: string}, group_colors: {B_inactive: string, B_background: string, A_inactive: string, A_background: string, B_active: string, A_active: string}, legend_colors: {a: string, b: string, c: string, d: string, e: string, f: string}}}
 */
function readColorMap(){
    const r = document.querySelector(':root');
    const rs = getComputedStyle(r);

    return {
        general: {
            error: rs.getPropertyValue('--error-color'),
            warning: rs.getPropertyValue('--warning-color'),
            success: rs.getPropertyValue('--success-color'),
        },
        legend_colors: {
            a: rs.getPropertyValue('--legend-a-color'),
            b: rs.getPropertyValue('--legend-b-color'),
            c: rs.getPropertyValue('--legend-c-color'),
            d: rs.getPropertyValue('--legend-d-color'),
            e: rs.getPropertyValue('--legend-e-color'),
            f: rs.getPropertyValue('--legend-f-color'),
        },
        group_colors: {
            A_background: rs.getPropertyValue('--group-A-background-color'),
            A_active: rs.getPropertyValue('--group-A-active-color'),
            A_inactive: rs.getPropertyValue('--group-A-inactive-color'),
            B_background: rs.getPropertyValue('--group-B-background-color'),
            B_active: rs.getPropertyValue('--group-B-active-color'),
            B_inactive: rs.getPropertyValue('--group-B-inactive-color'),
        }
    };
}

console.log(readColorMap());