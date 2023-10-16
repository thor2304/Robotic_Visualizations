import {parsejson} from "./customParseJson.js";

const db = new Promise((resolve, reject) => {
    const request = indexedDB.open("MyTestDatabase", 4);
    request.onerror = (event) => {
        console.error("IndexedDB error: ", event);
    };
    request.onsuccess = (event) => {
        resolve(event.target.result);
    };

    request.onupgradeneeded = (event) => {
        resolve(event.target.result)
        db.then((db) => db.createObjectStore("files", {keyPath: "name"}))
    }
});


/**
 *
 * @param name {string}
 * @param content {string|Object}
 */
export async function save(name, content) {
    if (typeof content === "object") {
        content = JSON.stringify(content)
    }

    const transaction = (await db).transaction(["files"], "readwrite");
    const objectStore = transaction.objectStore("files");
    objectStore.add({name, content});
}

/**
 * @param name {string} The name of the file to load
 * @return {Promise<undefined | string>}
 */
export async function load(name) {
    return new Promise(async (resolve, reject) => {
        const transaction = (await db).transaction(["files"], "readwrite");
        const objectStore = transaction.objectStore("files");
        const request = objectStore.get(name);
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

export function has(name){
    return load(name).then((result) => {
        return result !== undefined
    })
}

export async function remove(name) {
    const request = (await db)
        .transaction(["files"], "readwrite")
        .objectStore("files")
        .delete(name);
    request.onsuccess = (event) => {
        // It's gone!
        console.log("Deleted file: " + name)
    };
}