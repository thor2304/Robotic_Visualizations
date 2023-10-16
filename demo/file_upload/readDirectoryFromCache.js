import {MyDirectory} from "./MyDirectory.js";
import {MyFile} from "./MyFile.js";

export function parsejson(json) {
    if (json === undefined) {
        return undefined
    }
    return JSON.parse(json, (key, value) => {
        if (!value){
            return value
        }

        if (value.isDirectory) {
            return new MyDirectory(value.name, value.children)
        } else if (value.isFile) {
            return new MyFile(value.name, value.content)
        }
        return value
    })
}
