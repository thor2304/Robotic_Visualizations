import {parsejson} from "./customParseJson.js";
import {printCacheCalls} from "../featureEnabler.js";

//https://github.com/mdn/dom-examples/blob/main/indexeddb-examples/idbindex/scripts/main.js
// https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB

let db

async function initDb() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("MyTestDatabase", 4);
        request.onerror = (event) => {
            console.error("IndexedDB error: ", event);
            reject(event)
        };
        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(event)
        };

        request.onupgradeneeded = (event) => {
            db = event.target.result;
            db.createObjectStore("files", {keyPath: "name"})
            resolve(event)
        }
    })
}


/**
 *
 * @param name {string}
 * @param content {string|Object}
 */
export async function save(name, content) {
    if (typeof content === "object") {
        content = JSON.stringify(content)
    }

    if (db === undefined) {
        await initDb()
    }

    const transaction = db.transaction(["files"], "readwrite");
    const objectStore = transaction.objectStore("files");
    objectStore.add({name, content});
}

/**
 * @param name {string} The name of the file to load
 * @return {Promise<undefined | string>}
 */
export async function load(name) {
    if (db === undefined) {
        await initDb()
    }
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(["files"], "readwrite");
        const objectStore = transaction.objectStore("files");
        const request = objectStore.get(name);
        if (printCacheCalls) {
            console.log("Loading file: " + name, transaction, objectStore, request)
        }
        request.onsuccess = (event) => {
            if (event.target.result === undefined) {
                resolve(undefined)
                return
            }
            resolve(event.target.result.content)
        }

        request.onerror = (event) => {
            reject(event.target.result)
        }
    })
}

export async function loadJson(name) {
    return parsejson(await load(name))
}

export function has(name) {
    return load(name).then((result) => {
        return result !== undefined
    })
}

export async function remove(name) {
    if (db === undefined) {
        await initDb()
    }
    const request = db
        .transaction(["files"], "readwrite")
        .objectStore("files")
        .delete(name);
    request.onsuccess = (event) => {
        // It's gone!
        console.log("Deleted file: " + name)
    };
}