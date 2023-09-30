class GroupController {
    /**
     * @private
     * @type {PlotGroup}
     */
    A;
    /**
     * @private
     * @type {PlotGroup}
     */
    B;

    /**
     * @type {PlotGroup[]}
     */
    AOptions = [];
    /**
     * @type {PlotGroup[]}
     */
    BOptions = [];

    constructor() {
    }

    /**
     * @param groupA {PlotGroup}
     * @param groupB {PlotGroup}
     * @returns {void}
     */
    initialize(groupA, groupB){
        this.A = groupA;
        this.B = groupB;
        this.addOptionA(groupA);
        this.addOptionB(groupB);
    }

    /**
     * @param groupIdentifier {PlotGroupIdentifier}
     * @param optionIndex {number | string}
     */
    set(groupIdentifier, optionIndex){
        const index = typeof optionIndex === "string" ? parseInt(optionIndex) : optionIndex;
        this[groupIdentifier] = this.getOptions(groupIdentifier)[index]
        // This updates the visualizations to use this new cycle
        this[groupIdentifier].getPlotPromises().forEach(promise => promise.then())
    }

    /**
     * @param group {PlotGroup}
     * @returns {void}
     */
    addOptionA(group) {
        this.AOptions.push(group);
    }

    /**
     * @param group {PlotGroup}
     * @returns {void}
     */
    addOptionB(group) {
        this.BOptions.push(group);
    }

    getAOptions(){
        return this.AOptions;
    }

    /**
     * @param identifier {PlotGroupIdentifier}
     * @returns {PlotGroup[]}
     */
    getOptions(identifier){
        if (identifier === "A") {
            return this.getAOptions()
        } else if (identifier === "B") {
            return this.getBOptions()
        } else {
            throw new Error(`Invalid identifier ${identifier}`)
        }
    }

    getBOptions(){
        return this.BOptions;
    }

    /**
     * @param option {PlotGroupIdentifier}
     * @returns {PlotGroup}
     */
    get(option){
        return this[option]
    }

    /**
     * @returns {PlotGroupIdentifier[]}
     */
    getGroupIdentifiers(){
        return ["A", "B"]
    }

}