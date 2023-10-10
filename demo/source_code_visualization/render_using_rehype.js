import {unified} from "https://esm.sh/unified@10.1.2?bundle"
import remarkParse from "https://esm.sh/remark-parse@10.0.2?bundle"
import remarkRehype from "https://esm.sh/remark-rehype@10.1.0?bundle"
import rehypeStringify from 'https://esm.sh/rehype-stringify@9.0.3?bundle'
import rehypeStarryNight from "https://esm.sh/@microflash/rehype-starry-night@2.1.0?bundle"

import urscript from "./Grammar/URScript_TextMate.js"
import {code_container} from "./line_highlight.js";

const prefix = 'language-'
const rehypePrefix = "highlight-"

export async function renderMarkDownToHTML(markdown, intoThisElement) {
    const file = await unified()
        .use(remarkParse)
        .use(remarkRehype, {allowDangerousHtml: true})
        .use(rehypeStarryNight, {aliases: {script: "urscript"}, grammars: [urscript]})
        .use(rehypeStringify, {allowDangerousHtml: true})
        .process(markdown)

    intoThisElement.appendChild(htmlToElement(String(file)))

    code_container.dispatchEvent(new Event('populated'));
}

/**
 * Starting copied from: https://stackoverflow.com/a/35385518
 *<br>
 * But modified by me, to inject the language class into the code tag.<br>
 * This is done to comply with best practices for accessibility on the web.
 *
 * @param {String} html representing a single element
 * @return {Element}
 */
function htmlToElement(html) {
    const template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;

    const output = template.content.firstChild;

    let language = "";
    for (const classIn of output.classList) {
        if (classIn.startsWith(rehypePrefix)) {
            language = classIn.substring(rehypePrefix.length)
            break;
        }
    }

    // if no language is found, then we don't want to add the language class
    if(language === "") {
        return output;
    }

    output.childNodes.forEach(child => {
        if (child.nodeName !== "PRE") {
            return;
        }
        child.childNodes.forEach(child2 => {
            if (child2.nodeName === "CODE") {
                child2.classList.add(prefix + language)
            }
        })
    })
    return output;
}