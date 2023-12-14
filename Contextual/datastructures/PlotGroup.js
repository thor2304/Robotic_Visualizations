import {plotLineChart} from "../helper_scripts/factories/LinePlotFactory.js";
import {plot3dVis} from "../helper_scripts/factories/robotVisFactory.js";
import {plotDirection} from "../helper_scripts/factories/directionPlotFactory.js";
import {createDivForTable, createDivsForPlotlyCharts} from "../helper_scripts/factories/chartDivFactory.js";
import {LinkedList} from "./linked_list.js";
import {plotBarChart} from "../helper_scripts/factories/BarChartFactory.js";
import {plotCoordinates} from "../helper_scripts/factories/CoordinatePlotFactory.js";
import {groups} from "../csv_driven_3d.js";
import {plotTypes} from "./PlotRequest.js";

export class PlotGroup {
    /**
     * @type {Cycle}
     */
    cycle = undefined

    /**
     * @type {PlotRequest[]}
     */
    plotRequests;
    _variablesForMaxima;
    /**
     * @type {{[p: string]: {stepcount: number, value: number}}}
     */
    maxima;
    /**
     * @typedef {"A"|"B"} PlotGroupIdentifier
     */
    /**
     * @type {PlotGroupIdentifier}
     */
    identifier;

    /**
     * "DatapointMap" is a dictionary that maps a timestamp to a datapoint object.
     * This mapping should follow the datapoint that is visualized at this timestamp by plotly.
     * It is used for debugging by printing the datapoint to the console. As well as for highlighting the line hit
     * @type {Object<Timestamp, DataPoint>}
     */
    groupedDataPoints;

    /**
     * @type {LinkedList}
     */
    dataPointsLinked;

    /**
     * This is a list of all the plots that are currently updating.
     * Push information as arrays, that are to be passed to Plotly.animate(plot_name, settings)
     * @private
     * @type {Array<[string, {}]>}
     */
    updateInformation = [];

    /**
     *
     * @type {Record<string, boolean>}
     */
    updateInformationLookup = {};

    /**
     * @param plotRequests {PlotRequest[]}
     * @param variablesForMaxima {string[]}
     * @param identifier {PlotGroupIdentifier}
     */
    constructor(plotRequests, variablesForMaxima, identifier) {
        this.plotRequests = plotRequests;
        this._variablesForMaxima = variablesForMaxima;
        this.identifier = identifier;
    }

    async createDivsForPlots() {
        /**
         * Stores the ids of the divs to be created
         * @type {string[]}
         */
        const plotlyCharts = []

        /**
         * @type {PlotRequest}
         */
        let table;

        this.plotRequests.forEach(plotRequest => {
            if (plotRequest.type === plotTypes.table) {
                table = plotRequest
            } else {
                plotlyCharts.push(plotRequest.chartId)
            }
        })

        const divs = await createDivsForPlotlyCharts(plotlyCharts)
        for (let plotRequest of this.plotRequests) {
            if (plotRequest.type !== plotTypes.table) {
                this.addGroupClass(divs[plotRequest.chartId])
            }
        }
        if (table !== undefined) {
            createDivForTable(table.chartId, table.plotName, ["Variable", "Value"]).then(div => this.addGroupClass(div))
        }
    }

    /**
     * @param div {HTMLDivElement}
     */
    addGroupClass(div) {
        div.classList.add(`group-${this.identifier}`)
    }

    /**
     * Sets the cycle for this plot group to visualize
     * @param cycle {Cycle}
     */
    setCycle(cycle) {
        this.cycle = cycle
        this.maxima = findMaxOfVariables(this.cycle.sequentialDataPoints, this._variablesForMaxima);
        this.groupedDataPoints = this.cycle.dataPointsDictionary
        this.dataPointsLinked = this.cycle.traversableDataPoints
    }

    /**
     * @returns {Cycle}
     */
    getCycle() {
        return this.cycle
    }

    /**
     * @param plotRequest {PlotRequest}
     * @returns {Promise<void>}
     * @private
     */
    _plot(plotRequest) {
        switch (plotRequest.type) {
            case plotTypes.line:
                return plotLineChart(plotRequest.plotName, plotRequest.chartId, this.cycle.sequentialDataPoints, this.cycle.timestamps, plotRequest.dataNames, plotRequest.unit, this.cycle.errors, this)
            case plotTypes.robot:
                return plot3dVis(this.cycle.sequentialDataPoints, plotRequest.chartId, plotRequest.plotName, this)
            case plotTypes.direction:
                return plotDirection(plotRequest.plotName, plotRequest.chartId, this.cycle.sequentialDataPoints, this.cycle.timestamps, plotRequest.dataNames, this)
            case plotTypes.table:
                return Promise.resolve()
            case plotTypes.bar:
                return plotBarChart(plotRequest.plotName, plotRequest.chartId, this.cycle.sequentialDataPoints, this.cycle.timestamps, plotRequest.dataNames[0], this.cycle.errors, this)
            case plotTypes.coordinate:
                return plotCoordinates(plotRequest.chartId, plotRequest.dataNames, groups, plotRequest.plotName, this)
        }
    }

    getPlotPromises() {
        /**
         * @type {Promise<void>[]}
         */
        const plotPromises = []
        for (let i = 0; i < this.plotRequests.length; i++) {
            plotPromises.push(this._plot(this.plotRequests[i]))
        }
        return plotPromises
    }

    /**
     * Adds a chart to the list of charts that are updating in this plot group.
     * @param chartId {string}
     * @param updateInformation {{mode: string, transition: {duration: number, easing: string}, frame: {duration: number, redraw: boolean}}}
     * @param frames
     */
    addUpdateInformation(chartId, updateInformation, frames) {
        if (this.updateInformationLookup[chartId]) {
            return
        }
        this.updateInformationLookup[chartId] = true
        this.updateInformation.push([chartId, updateInformation, frames])
    }

    getUpdateInformation() {
        return this.updateInformation
    }
}

/**
 * { [x: string]: {stepcount:string, value: number} }
 * @param dataPoints {Array<DataPoint>}
 * @param variablePathArray {Array<String>} An array of paths that will be passed to DataPoint.traversed_attribute()
 * @returns {{ [x: string]: {stepcount:number, value: number} }}  Of the form {variablePath: {stepcount: number, value: number}}
 */
export function findMaxOfVariables(dataPoints, variablePathArray) {
    const currentMax = {}
    for (let variablePath of variablePathArray) {
        currentMax[variablePath] = {
            stepcount: undefined,
            value: 0
        }
    }

    for (let i = 0; i < dataPoints.length; i++) {
        const dataPoint = dataPoints[i];
        for (let variablePath of variablePathArray) {
            const value = dataPoint.traversed_attribute(variablePath)
            if (value > currentMax[variablePath].value) {
                currentMax[variablePath].value = value
                currentMax[variablePath].stepcount = dataPoint.time.stepCount
            }
        }
    }

    return currentMax
}


