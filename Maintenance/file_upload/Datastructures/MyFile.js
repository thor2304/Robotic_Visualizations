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
    dataSource = "";
    constructor(name, content, parent) {
        this.name = name
        this.parent = parent
        this.content = content
    }

    /**
     * @param dataSource {string}
     */
    setDataSource(dataSource){
        this.dataSource = dataSource
    }

    toJSON(){
        return {
            name: this.name,
            content: this.content,
            isFile: true,
            dataSource: this.dataSource
        }
    }
}