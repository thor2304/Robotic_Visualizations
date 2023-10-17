import {MyDirectory} from "./Datastructures/MyDirectory.js";
import {MyFile} from "./Datastructures/MyFile.js";

//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
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
            const file = new MyFile(value.name, value.content);
            if(value.dataSource){
                file.setDataSource(value.dataSource)
            }
            return file
        }
        return value
    })
}
