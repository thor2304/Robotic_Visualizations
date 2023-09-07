let code = undefined;
const code_container = document.getElementById('code-container');
let previous_highlighted_line = null;
const highlight_class_name = 'active';
const highlight_inactive_line_name = "inactive";

/**
 * Highlights the given line number, offset by the given offset.<br>
 * in the given data set the csv data shows line 1467 as the line where the script is loaded.
 * This is used as the offset such that line 1567 from the csv data is line 100 in the code visualization.
 * @param line_number The line number provided by the csv data
 * @param offset The line from the csv data that is actually line 0 in the code visualization
 * (Where it is loaded by the "true" script running on the controller)
 */
async function highlight_line(line_number, offset = 0) {
    const line = await get_line(line_number, offset);

    if (line === undefined) {
        if(previous_highlighted_line === undefined || previous_highlighted_line === null){
            return;
        }
        previous_highlighted_line.classList.add(highlight_inactive_line_name);

        return;
    }

    // Unhighlight the previously highlighted line
    if (previous_highlighted_line !== null) {
        previous_highlighted_line.classList.remove(highlight_class_name);
        previous_highlighted_line.classList.remove(highlight_inactive_line_name);
    }

    line.classList.add(highlight_class_name);

    previous_highlighted_line = line;

}

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

function _get_line(lineNumber, offset = 0) {
    const lines = code.getElementsByClassName('line');

    const scriptLine = lineNumber - offset;

    if (scriptLine <= 0 || scriptLine >= lines.length) {
        return undefined;
    }

    return lines[scriptLine - 1];
}


function ensure_code() {
    if (code === undefined) {
        code = document.getElementById('code-container').getElementsByTagName('code')[0];
        if (code === undefined) {
            return false;
        }
    }
    return true;
}