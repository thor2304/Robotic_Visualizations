export class MotorParams {
    /**
     * @private
     * @param ratedTorque {number}
     */
    _ratedTorque;

    /**
     * @private
     * @type {number}
     */
    _torqueConstant;

    /**
     * @private
     * @param gearRatio {number}
     */
    _gearRatio;

    constructor(ratedTorque, torqueConstant, gearRatio) {
        this._ratedTorque = ratedTorque;
        this._torqueConstant = torqueConstant;
        this._gearRatio = gearRatio;
    }


    get ratedTorque() {
        return this._ratedTorque;
    }

    get torqueConstant() {
        return this._torqueConstant;
    }

    get gearRatio() {
        return this._gearRatio;
    }
}