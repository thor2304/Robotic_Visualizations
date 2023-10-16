export class MyFile{
    name = ""
    /**
     * @type {MyDirectory}
     */
    parent = null
    /**
     * @type {string}
     */
    content
    constructor(name, content, parent) {
        this.name = name
        this.parent = parent
        this.content = content
    }

    toJSON(){
        return {
            name: this.name,
            content: this.content,
            isFile: true
        }
    }
}