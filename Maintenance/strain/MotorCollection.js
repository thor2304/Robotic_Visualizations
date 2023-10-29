import {Joints} from "../datastructures/datastructures.js";
import {MotorParams} from "./MotorParams.js";

export class MotorCollection{
    /**
     * @private
     * @type {MotorParams[]}
     */
    _motors = [];

    /**
     * @param motors {MotorParams[] | {_ratedTorque: number, _torqueConstant: number, _gearRatio: number}[]} The motorParams must be  ordered from Base to wrist
     */
    constructor(motors) {
        this._motors = motors.map(motor => new MotorParams(motor._ratedTorque, motor._torqueConstant, motor._gearRatio));
    }

    /**
     * @param index {number}
     */
    getMotor(index){
        return this._motors[index]
    }

    /**
     * @param joint {Joint}
     */
    getMotorForJoint(joint){
        let index = 0;
        switch (joint) {
            case Joints.Base:
                index = 0;
                break;
            case Joints.Shoulder:
                index = 1;
                break;
            case Joints.Elbow:
                index = 2;
                break;
            case Joints["Wrist 1"]:
                index = 3;
                break;
            case Joints["Wrist 2"]:
                index = 4;
                break;
            case Joints["Wrist 3"]:
                index = 5;
                break;
        }
        return this.getMotor(index)
    }
}