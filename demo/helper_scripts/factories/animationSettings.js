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