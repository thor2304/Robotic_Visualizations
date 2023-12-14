import {LinkedList} from "./linked_list.js";
import {addHighlightLineToDataPoints} from "../helper_scripts/scrubCorrection.js";
import {detectErrors} from "./timespanError.js";

export class Cycle {
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

    /**
     * @type {number}
     */
    cycleIndex = undefined

    timeForThisCycle = undefined

    constructor(sequentialDataPoints, cycleIndex) {
        addHighlightLineToDataPoints(sequentialDataPoints)
        this.sequentialDataPoints = sequentialDataPoints
        this.cycleIndex = cycleIndex

        for (let i = 0; i < sequentialDataPoints.length; i++) {
            const stepCount = sequentialDataPoints[i].time.stepCount
            this.dataPointsDictionary[stepCount] = sequentialDataPoints[i]
            this.timestamps.push(stepCount)
            this.traversableDataPoints.push(stepCount)
        }

        this.errors = detectErrors(this.sequentialDataPoints)

        this.timeForThisCycle = this.sequentialDataPoints[this.sequentialDataPoints.length - 1].time.timestamp - this.sequentialDataPoints[0].time.timestamp
    }

    hasError() {
        return this.errors.length > 1
    }

    hasWarning() {
        return this.errors.length === 1
    }

}