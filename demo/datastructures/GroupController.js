export class GroupController {
    /**
     * @private
     * @type {{plotGroup: PlotGroup, options: PlotGroup[]}}
     */
    A={
        plotGroup: undefined,
        options: []
    };
    /**
     * @private
     * @type {{plotGroup: PlotGroup, options: PlotGroup[]}}
     */
    B={
        plotGroup: undefined,
        options: []
    };

    constructor() {
    }

    /**
     * @param groupA {PlotGroup}
     * @param groupB {PlotGroup}
     * @returns {void}
     */
    initialize(groupA, groupB){
        this.A.plotGroup = groupA;
        this.B.plotGroup = groupB;
        this.addOption(groupA);
        this.addOption(groupB);
    }

    /**
     * @param groupIdentifier {PlotGroupIdentifier}
     * @param optionIndex {number | string}
     */
    set(groupIdentifier, optionIndex){
        const index = typeof optionIndex === "string" ? parseInt(optionIndex) : optionIndex;
        const activePlotGroup = this.getOptions(groupIdentifier)[index]
        this[groupIdentifier].plotGroup = activePlotGroup;
        // This updates the visualizations to use this new cycle
        activePlotGroup.getPlotPromises().forEach(promise => promise.then())
    }

    /**
     * @param group {PlotGroup}
     * @returns {void}
     */
    addOption(group) {
        this[group.identifier].options.push(group);
    }

    /**
     * @param identifier {PlotGroupIdentifier}
     * @returns {PlotGroup[]}
     */
    getOptions(identifier){
        return this[identifier].options;
    }

    /**
     * @param option {PlotGroupIdentifier}
     * @returns {PlotGroup}
     */
    get(option){
        return this[option].plotGroup
    }

    /**
     * @returns {PlotGroupIdentifier[]}
     */
    getGroupIdentifiers(){
        return ["A", "B"]
    }

}