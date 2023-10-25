import {renderMarkDownToHTML} from "./render_using_rehype.js";
import {CodeBlock} from "./CodeBlock.js";
import {loadJson, save} from "../file_upload/Cache.js";
import {MyFile} from "../file_upload/Datastructures/MyFile.js";

export const scriptFileName = "script"

window.addEventListener("DOMContentLoaded", async () => {
    const code_container = document.getElementById("code-container")
    if (!code_container) {
        console.warn("Could not find code-container. Will not continue to fetch and render code visualization")
        return
    }

    const code = await getCode()
    // console.log(code)
    const markdown = code.toMarkdown()

    renderMarkDownToHTML(markdown, code_container)
})

/**
 * @return {Promise<CodeBlock>}
 */
async function getCode() {
    const code = await getCodeFile()
    return new CodeBlock(extract_extension(code.name), code.content)
}

/**
 *
 * @return {Promise<MyFile>}
 */
async function getCodeFile() {
    const script = await loadJson(scriptFileName)
    if (script) {
        return script
    }

    const code = await fetch_sample_code()
    await save(scriptFileName, code)
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



function extract_extension(filename) {
    const last_dot = filename.lastIndexOf(".");
    if (last_dot === -1) {
        return "";
    }
    return filename.substring(last_dot + 1);
}


