// noinspection JSValidateTypes
import {createEnum} from "../helper_scripts/helpers.js";

/**
 * @typedef {"line"| "robot"| "direction"| "table" | "bar" |"coordinate"} PlotType
 */


/**
 * "line", "robot", "direction", "table", "bar", "coordinate"
 * @type {Readonly<{line: string, robot: string, direction: string, table: string, bar: string, coordinate: string}>}
 */
export const plotTypes = createEnum(["line", "robot", "direction", "table", "bar", "coordinate"])

export class PlotRequest {
    plotName = undefined

    chartId = undefined

    dataNames = undefined

    /**
     *
     * @type {PlotType}
     */
    type = undefined

    unit = undefined

    static get availablePlotTypes() {
        return plotTypes;
    }

    /**
     *
     * @param plotName {string}
     * @param chartId {string}
     * @param dataNames {string[]}
     * @param type {PlotType}
     * @param unit {String}
     */
    constructor(plotName, chartId, dataNames, type, unit = undefined) {
        this.plotName = plotName;
        this.chartId = chartId;
        this.dataNames = dataNames;
        this.type = type;
        this.unit = unit;
    }
}