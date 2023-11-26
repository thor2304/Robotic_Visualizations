import {dataFileName, parseData} from "../helper_scripts/load_csv_data.js";
import * as zip from "https://deno.land/x/zipjs/index.js";
import {MyDirectory} from "./Datastructures/MyDirectory.js";
import {MyFile} from "./Datastructures/MyFile.js";
import {has, loadJson, save} from "./Cache.js";
import {scriptFileName} from "../source_code_visualization/fetch_and_render_sample_code.js";
import {handleFolder} from "./ZipHandler.js";
import {clearDataCache, clearScriptCache} from "./uploadPageHydration.js";
import {updateVersionNumber} from "./statusVisualizations.js";

// https://gildas-lormeau.github.io/zip.js/api/index.html

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
            if (!path[path.length - 1].endsWith("/")) {
                filename = path.pop()
            } else {
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
        await save("files", files)
    }

// close the ZipReader
    await reader.close();

    return files
}

async function loadScriptFile(file) {
    const text = await loadTextFromFile(file);
    const myfile = new MyFile(file.name, text)
    console.log("Saving script file")
    await save(scriptFileName, myfile)
}

/**
 * @param file {File}
 */
export async function handleFile(file) {
    if (file.name.endsWith(".csv")) {
        await loadCsvFile(file)
    } else if (file.name.endsWith(".zip")) {
        await clearDataCache()
        await handleFolder(await loadZipFile(file))
    } else if (file.name.endsWith(".script")) {
        await clearScriptCache()
        await loadScriptFile(file)
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
 *
 * @type {undefined|string}
 */
let lastDataName = undefined
/**
 *
 * @type {undefined|number}
 */
let lastVersion = undefined

/**
 * @param file {File}
 * @return {Promise<void>}
 */
async function loadCsvFile(file) {
    const extensionIndex = file.name.lastIndexOf(".")

    const versionedFileName = file.name.substring(0, extensionIndex)

    const versionLocation = versionedFileName.lastIndexOf("-")

    const fileVersionId = Number.parseInt(versionedFileName.substring(versionLocation + 1))

    const unVersionedFileName = versionedFileName.substring(0, versionLocation)

    console.log(versionedFileName, unVersionedFileName, fileVersionId)

    let text = await loadTextFromFile(file);

    const extendsExistingData = lastDataName === unVersionedFileName

    if(extendsExistingData){
        if(lastVersion !== undefined && fileVersionId !== lastVersion + 1){
            throw new Error("The uploaded file is not the next in order")
        }

        const existingData = await loadJson(dataFileName)

        text = existingData.content + text
    }

    lastVersion = fileVersionId
    lastDataName = unVersionedFileName

    updateVersionNumber(fileVersionId)

    // This fixes a weird bug, where the data is not actually saved, unless it is explicitly cleared first
    await clearDataCache()

    const myFile = new MyFile(unVersionedFileName, text)
    await save(dataFileName, myFile)
}