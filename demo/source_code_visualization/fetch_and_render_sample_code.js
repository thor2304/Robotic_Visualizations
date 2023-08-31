import {renderMarkDownToHTML} from "./render_using_rehype.js";
import {CodeBlock} from "./CodeBlock.js";

const code = await fetch_and_render_sample_code()
const markdown = code.toMarkdown()

const code_container = document.getElementById("code-container")
renderMarkDownToHTML(markdown, code_container)


async function fetch_and_render_sample_code(){
    const server_url = window.location.origin + "/Robotic_Visualizations/";
    const folder = "Robot_control/full_scripts/all_runs/";
    const filename = "real_script_for_robot_use.script";
    const url = server_url + folder;
    const response = await fetch(url + filename);
    return new CodeBlock(extract_extension(filename), await response.text());
}

function extract_extension(filename) {
    const last_dot = filename.lastIndexOf(".");
    if (last_dot === -1) {
        return "";
    }
    return filename.substring(last_dot + 1);
}


