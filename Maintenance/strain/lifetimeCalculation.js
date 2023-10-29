import {DataPoint} from "../datastructures/datastructures.js";
import {loadJson} from "../file_upload/Cache.js";
import {MotorCollection} from "./MotorCollection.js";

const LN = 35000

const ratedSpeed = 2 * Math.PI * 2000 / 101 / 60

// Per robot and joint

function getLifeForJoint(dataPoints, jointNumber, motorCollection) {
    const speeds = dataPoints.map(dp => Math.abs(dp.custom[`Actual velocity j${jointNumber} [rad/s]`]))
    const currents = dataPoints.map(dp => Math.abs(dp.custom[`Actual current j${jointNumber} [A]`]))

    const avg_speed = speeds.reduce((a, b) => a + b, 0) / speeds.length
    const avg_current = currents.reduce((a, b) => a + b, 0) / currents.length

    const speed_factor = ratedSpeed / (avg_speed * (60 / (2 * Math.PI)))
    const current_factor = motorCollection.getMotor(jointNumber).ratedTorque / (
        avg_current
        * motorCollection.getMotor(jointNumber).torqueConstant
        * motorCollection.getMotor(jointNumber).gearRatio)

    return (LN / 5) * speed_factor * (current_factor ** 3)
}

/**
 *
 * @param dataPoints {DataPoint[]}
 */
export async function calculateRemainingLife(dataPoints) {
    const motorParamRaw = await loadJson("motorParams.json")
    if (motorParamRaw === null) {
        console.log("No motor params found. Maybe you did not load a flight record?")
        return undefined
    }

    const motorCollection = new MotorCollection(motorParamRaw.content._motors)

    const jointNumbers = [0, 1, 2, 3, 4, 5]

    return jointNumbers.map((jointNumber) => getLifeForJoint(dataPoints, jointNumber, motorCollection))
}