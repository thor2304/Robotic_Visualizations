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
     */
    initialize(groupA, groupB){
        this.A = groupA;
        this.B = groupB;
        this.addOptionA(groupA);
        this.addOptionB(groupB);
    }

    /**
     * @param group {PlotGroup}
     */
    setA(group){
        this.A = group;
        this.A.getPlotPromises().forEach(promise => promise.then())
    }

    /**
     * @param group {PlotGroup}
     */
    setB(group){
        this.B = group;
    }

    /**
     * @param group {PlotGroup}
     */
    addOptionA(group) {
        this.AOptions.push(group);
    }

    /**
     * @param group {PlotGroup}
     */
    addOptionB(group) {
        this.BOptions.push(group);
    }

    getAOptions(){
        return this.AOptions;
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


}