import {dataFileName, parseData} from "../helper_scripts/load_csv_data.js";
import * as zip from "https://deno.land/x/zipjs/index.js";
import {MyDirectory} from "./MyDirectory.js";
import {MyFile} from "./MyFile.js";
import {has, loadJson, save} from "./Cache.js";
import {scriptFileName} from "../source_code_visualization/fetch_and_render_sample_code.js";

console.log(await loadJson("files"))

/**
 * @param file {File} a zip file
 * @return {Promise<MyDirectory>} the root directory of the zip file
 */
async function loadZipFile(file) {
    // create a BlobReader to read with a ZipReader the zip from a Blob object
    const reader = new zip.ZipReader(new zip.BlobReader(file));

    let files = null
    // get all entries from the zip
    /**
     * @type {zip.Entry[]}
     */
    const entries = await reader.getEntries();
    if (entries.length) {
        // Create the root directory of the zip file
        files = new MyDirectory("/", null)

        // Loop through all the entries and add them to the root directory
        for (const entry of entries) {
            let filename = entry.filename
            const path = entry.filename.split("/")
            if (!path[path.length-1].endsWith("/")) {
                filename = path.pop()
            }else  {
                continue
            }

            const text = await entry.getData(new zip.TextWriter());
            const currentEntry = new MyFile(filename, text)

            let currentDir = files
            for (const dirName of path) {
                if (dirName === "") {
                    continue
                }
                let dir = currentDir.getChild(dirName)
                if (!dir) {
                    dir = new MyDirectory(dirName)
                    dir.parent = currentDir
                    currentDir.addChild(dir)
                }
                currentDir = dir
            }
            currentEntry.parent = currentDir
            currentDir.addChild(currentEntry)
        }

        console.log(files)
        save("files", files)
    }

// close the ZipReader
    await reader.close();

    return files
}

async function loadScriptFile(file) {
    const text = await loadTextFromFile(file);
    const myfile = new MyFile(file.name, text)
    save(scriptFileName, myfile)
}

/**
 * @param file {File}
 */
export async function handleFile(file) {
    if (file.name.endsWith(".csv")) {
        await loadCsvFile(file)
    } else if (file.name.endsWith(".zip")) {
        await loadZipFile(file)
    } else if (file.name.endsWith(".script")) {
        await loadScriptFile(file)
    }

    checkFilesAndRedirect()
}

function checkFilesAndRedirect() {
    if (has(dataFileName) && has(scriptFileName)) {
        console.log("Redirecting to main.html")
        window.location.href = "../main.html"
    }
}

/**
 *
 * @param file {File}
 * @return {Promise<String>}
 */
async function loadTextFromFile(file) {
    const reader = new FileReader();
    reader.readAsText(file, 'UTF-8');
    return new Promise((resolve, reject) => {
        reader.onloadend = function (e) {
            const text = reader.result;
            resolve(text)
        }
    })
}

/**
 * @param file {File}
 * @return {Promise<Object[]>}
 */
async function loadCsvFile(file) {
    const text = await loadTextFromFile(file);
    const myfile = new MyFile(file.name, text)
    save(dataFileName, myfile)
    return parseData(text);
}