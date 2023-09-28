class PlotGroup {
    /**
     * @type {Cycle}
     */
    cycle = undefined

    /**
     * @type {PlotRequest[]}
     */
    plotRequests;
    _variablesForMaxima;
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
    updateInformation= [];

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

        console.log(plotlyCharts)
        console.log(this.plotRequests)

        const divs = await createDivsForPlotlyCharts(plotlyCharts)
        for (let plotRequest of this.plotRequests) {
            if (plotRequest.type !== plotTypes.table) {
                this.addGroupClass(divs[plotRequest.chartId])
            }
        }
        createDivForTable(table.chartId, table.plotName, ["Variable", "Value"]).then(div => this.addGroupClass(div))
    }

    /**
     * @param div {HTMLDivElement}
     */
    addGroupClass(div){
        div.classList.add(`group-${this.identifier}`)
    }

    // /**
    //  *
    //  * @param plotRequest {PlotRequest}
    //  * @private
    //  */
    // _createDivForPlot(plotRequest) {
    //     switch (plotRequest.type) {
    //         case plotTypes.line:
    //
    //     }
    // }

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
     * @param plotRequest {PlotRequest}
     * @returns {Promise<void>}
     * @private
     */
    _plot(plotRequest) {
        switch (plotRequest.type) {
            case plotTypes.line:
                return plot_line_graph(this.cycle.sequentialDataPoints, this.cycle.timestamps, plotRequest.chartId, this.cycle.errors, this.identifier)
            case plotTypes.robot:
                return plot3dVis(this.cycle.sequentialDataPoints, plotRequest.chartId, this.identifier)
            case plotTypes.direction:
                return plotDirection(plotRequest.plotName, plotRequest.chartId, this.cycle.sequentialDataPoints, this.cycle.timestamps, plotRequest.dataNames, this.identifier)
            case plotTypes.table:
                return Promise.resolve()
        }
    }

    getPlotPromises() {
        const plotPromises = []
        for (let i = 0; i < this.plotRequests.length; i++) {
            plotPromises.push(this._plot(this.plotRequests[i]))
        }
        return plotPromises
    }


    addUpdateInformation(chartId, updateInformation){
        this.updateInformation.push([chartId, updateInformation])
    }

    getUpdateInformation(){
        return this.updateInformation
    }


}


/**
 * @typedef {"line"| "robot"| "direction"| "table"} PlotType
 */

// noinspection JSValidateTypes
/**
 * "line", "robot", "direction", "table"
 * @type {Readonly<{line: string, robot: string, direction: string, table: string}>}
 */
const plotTypes = createEnum(["line", "robot", "direction", "table"])

class PlotRequest {
    plotName = undefined

    chartId = undefined

    dataNames = undefined

    /**
     *
     * @type {PlotType}
     */
    type = undefined

    static get availablePlotTypes() {
        return plotTypes;
    }

    /**
     *
     * @param plotName {string}
     * @param chartId {string}
     * @param dataNames {string[]}
     * @param type {PlotType}
     */
    constructor(plotName, chartId, dataNames, type) {
        this.plotName = plotName;
        this.chartId = chartId;
        this.dataNames = dataNames;
        this.type = type;
    }
}

class Cycle {
    /**
     * Used for storing the data points in this cycle
     * @type {DataPoint[]}
     */
    sequentialDataPoints = undefined

    /**
     * dataPointsDictionary is a dictionary that maps a timestamp to a datapoint object.
     * This mapping should follow the datapoint that is visualized at this timestamp by plotly.
     * It is used for debugging by printing the datapoint to the console. As well as for highlighting the line hit
     * @type {Object<number, DataPoint>}
     */
    dataPointsDictionary = {}

    /**
     * The data points in this cycle stored in a traversable data structure.
     * Used for stepping with the arrow keys.
     * @type {LinkedList}
     */
    traversableDataPoints = new LinkedList()

    /**
     * The timestamps of the data points in this cycle
     * @type {Timestamp[]}
     */
    timestamps = []

    /**
     * The TimespanErrors that occurred in this cycle
     * @type {TimespanError[]}
     */
    errors = undefined

    constructor(sequentialDataPoints) {
        addHighlightLineToDataPoints(sequentialDataPoints)
        this.sequentialDataPoints = sequentialDataPoints

        for (let i = 0; i < sequentialDataPoints.length; i++) {
            const stepCount = sequentialDataPoints[i].time.stepCount
            this.dataPointsDictionary[stepCount] = sequentialDataPoints[i]
            this.timestamps.push(stepCount)
            this.traversableDataPoints.push(stepCount)
        }

        this.errors = detectErrors(this.sequentialDataPoints)
    }


}