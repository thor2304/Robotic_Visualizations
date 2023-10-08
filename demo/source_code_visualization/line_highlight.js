let code = undefined;
const code_container = document.getElementById('code-container');

/**
 * @type {Element}
 */
let previous_highlighted_line = null;
const highlight_class_name = 'active';
const highlight_inactive_line_name = "inactive";

/**
 * Highlights the given line number, offset by the given offset.<br>
 * in the given data set the csv data shows line 1467 as the line where the script is loaded.
 * This is used as the offset such that line 1567 from the csv data is line 100 in the code visualization.
 * @param line_number {number} The line number provided by the csv data
 * @param offset {number} The line from the csv data that is actually line 0 in the code visualization
 * (Where it is loaded by the "true" script running on the controller)
 * @param scrollIntoView {boolean} If the line should be scrolled into view. This scrolls only the container and not the whole page
 * @param active {boolean} If the line should be highlighted as active or inactive
 * @param controllingGroup {PlotGroupIdentifier} The group that is controlling the line highlight. This is used to determine if the line should be highlighted as active or inactive
 */
async function highlight_line(line_number, offset = 0, scrollIntoView = true, active = true, controllingGroup="A") {
    const line = await get_line(line_number, offset);

    if (line === undefined) {
        if(previous_highlighted_line === undefined || previous_highlighted_line === null){
            return;
        }
        previous_highlighted_line.classList.add(highlight_inactive_line_name);
        return;
    }

    const groupName = `controlling-group-${controllingGroup}`
    const groupNameA = `controlling-group-A`
    const groupNameB = `controlling-group-B`

    // Unhighlight the previously highlighted line
    if (previous_highlighted_line !== null) {
        previous_highlighted_line.classList.remove(highlight_class_name);
        previous_highlighted_line.classList.remove(highlight_inactive_line_name);
        previous_highlighted_line.classList.remove(groupNameA);
        previous_highlighted_line.classList.remove(groupNameB);
    }

    line.classList.add(highlight_class_name);
    line.classList.add(groupName);

    if (!active) {
        line.classList.add(highlight_inactive_line_name);
        line.classList.remove(highlight_class_name);
    }

    if(scrollIntoView){
        line.scrollIntoView( {block: "nearest", inline: "nearest", behavior: "smooth"})
    }

    previous_highlighted_line = line;
}

/**
 * @param lineNumber {number}
 * @param offset {number}
 * @returns {Promise<Element>}
 */
async function get_line(lineNumber, offset = 0) {
    return new Promise((resolve, reject) => {
        ensure_code()
        if (code === undefined) {
            code_container.addEventListener('populated', (e) => {
                ensure_code()
                resolve(_get_line(lineNumber, offset));
            }, false);
        } else {
            resolve(_get_line(lineNumber, offset));
        }
    });
}

/**
 *
 * @param lineNumber {number}
 * @param offset {number}
 * @returns {Element}
 * @private
 */
function _get_line(lineNumber, offset = 0) {
    const lines = code.getElementsByClassName('line');

    const scriptLine = lineNumber - offset;

    if (scriptLine <= 0 || scriptLine >= lines.length) {
        return undefined;
    }

    return lines[scriptLine - 1];
}

/**
 * This function can be called multiple times with no consequence
 * @returns {boolean}
 */
function ensure_code() {
    if (code === undefined) {
        code = document.getElementById('code-container').getElementsByTagName('code')[0];
        if (code === undefined) {
            return false;
        }
    }
    return true;
}