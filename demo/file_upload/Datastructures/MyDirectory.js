export class MyDirectory{
    /**
     *
     * @type {(MyDirectory|MyFile)[]}
     */
    children = []
    /**
     * @type {Object<string, MyDirectory|MyFile>}
     */
    childDict = {}
    name = ""
    parent = null
    constructor(name, children) {
        this.name = name
        if (children) {
            this.children = children
            for (const child of children) {
                child.parent = this
                this.childDict[child.name] = child
            }
        }
    }

    /**
     * @param child {MyDirectory|MyFile}
     */
    addChild(child){
        this.children.push(child)
        this.childDict[child.name] = child
    }

    /**
     * @param name {string}
     */
    getChild(name){
        return this.childDict[name]
    }

    toJSON(){
        return {
            name: this.name,
            children: this.children,
            isDirectory: true
        }
    }
}