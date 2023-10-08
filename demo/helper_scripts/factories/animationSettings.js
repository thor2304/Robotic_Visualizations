/**
 *
 * @param redraw {boolean}
 * @returns {{mode: string, transition: {duration: number, easing: string}, frame: {duration: number, redraw: boolean}}}
 */
function getAnimationSettings(redraw = true) {
    return {
        mode: 'immediate',
        transition: {
            duration: 0,
            easing: 'none'
        },
        frame: {
            duration: 0,
            redraw: redraw
        },
    }
}