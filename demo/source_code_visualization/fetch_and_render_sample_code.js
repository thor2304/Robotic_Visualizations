import {renderMarkDownToHTML} from "./render_using_rehype.js";
import {CodeBlock} from "./CodeBlock.js";
import {loadJson, save} from "../file_upload/Cache.js";
import {MyFile} from "../file_upload/MyFile.js";

export const scriptFileName = "script"

window.addEventListener("DOMContentLoaded", async () => {
    const code = await fetch_and_render_sample_code()
    const markdown = code.toMarkdown()

    const code_container = document.getElementById("code-container")
    if (!code_container) {
        console.error("Could not find code-container")
        return
    }
    renderMarkDownToHTML(markdown, code_container)
})

async function getCode() {
    const script = await loadJson(scriptFileName)
    if (script) {
        return script
    }

    const code = await fetch_sample_code()
    save(scriptFileName, code)
    return code
}

/**
 * @return {Promise<MyFile>}
 */
async function fetch_sample_code() {
    const server_url = window.location.origin + "/Robotic_Visualizations/";
    const folder = "Robot_control/full_scripts/all_runs/";
    const filename = "real_script_for_robot_use.script";
    const url = server_url + folder;
    const response = await fetch(url + filename);
    return new MyFile(filename, await response.text());
}

async function fetch_and_render_sample_code() {
    const code = await getCode();
    return new CodeBlock(extract_extension(code.name), code.content);
}

function extract_extension(filename) {
    const last_dot = filename.lastIndexOf(".");
    if (last_dot === -1) {
        return "";
    }
    return filename.substring(last_dot + 1);
}


