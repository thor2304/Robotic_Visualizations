/**
 *This adds the preprocessed attribute highlightLine to the data points.
 * This is used to get accurate line highlighting when scrubbing backwards and hitting a line which is outside of the script.
 * @param dataPoints {Array<DataPoint>}
 * @returns {void}
 */
function addHighlightLineToDataPoints(dataPoints) {
    let previousLine = 0;
    for (let i = 0; i < dataPoints.length; i++) {
        const scriptLine = dataPoints[i].pointInTime.lineNumber - getScriptOffset();

        // If the script line is negative or 0, it means that the point in time is before our script started.
        // Therefore, we set it to the previous line instead
        if (scriptLine > 0) {
            // Since the line is within our script we update the previous line to be the current line
            previousLine = scriptLine;
        }

        // We highlight the line of the previous line (Which might have been updated with the current line)
        dataPoints[i].pointInTime.highlightLine = previousLine;
    }
}