class Offset {
    constructor(x, y, z) {
        this.x = Number.parseFloat(x);
        this.y = Number.parseFloat(y);
        this.z = Number.parseFloat(z);
    }

    get x_error() {
        return this.x;
    }

    get y_error() {
        return this.y;
    }

    get z_error() {
        return this.z;
    }

    get magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    toArray() {
        return [this.x, this.y, this.z];
    }
}

class Position {
    constructor(x, y, z) {
        this.x = Number.parseFloat(x);
        this.y = Number.parseFloat(y);
        this.z = Number.parseFloat(z);
    }

    subtract(position) {
        return new Offset(this.x - position.x, this.y - position.y, this.z - position.z);
    }

    toArray() {
        return [this.x, this.y, this.z];
    }
}

class Force {
    constructor(x, y, z) {
        this.x = Number.parseFloat(x);
        this.y = Number.parseFloat(y);
        this.z = Number.parseFloat(z);
    }

    get magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }
}

class Payload {
    constructor(expectedWeight, measuredWeight) {
        this.measuredWeight = Number.parseFloat(measuredWeight);
        this.expectedWeight = Number.parseFloat(expectedWeight);
    }

    get weightError() {
        return this.measuredWeight - this.expectedWeight;
    }
}

class Tool {
    constructor(targetPosition, actualPosition, forceX, forceY, forceZ) {
        this.targetPosition = targetPosition;
        this.position = actualPosition;
        this.measuredForce = new Force(forceX, forceY, forceZ);

        // Subtracted in this order since it is viewed to be desirable.
        // Consider the case of targeting 1,1 and arriving at 0.9,0.9
        // In this case I believe the error should be -0.1,-0.1
        // We are thus -0.1,-0.1 away from the target
        this.positionError = this.position.subtract(this.targetPosition);
    }
}

const Joints = createEnum(["Base", "Shoulder", "Elbow", "wrist 1", "wrist 2", "wrist 3"]);
const robot_joint_names = {
    "Base": "base",
    "Shoulder": "shoulder",
    "Elbow": "elbow",
    "wrist 1": "wrist_1",
    "wrist 2": "wrist_2",
    "wrist 3": "wrist_3"
}

class Joint {
    constructor(joint, position, targetPosition, angle, targetAngle) {
        this.joint = joint;
        this.joint_name = robot_joint_names[joint];
        this.position = position;
        this.targetPosition = targetPosition;
        this.angle = Number.parseFloat(angle);
        this.targetAngle = Number.parseFloat(targetAngle);
    }

    get positionError() {
        // Subtracted in this order since it is viewed to be desirable.
        // Consider the case of targeting 1,1 and arriving at 0.9,0.9
        // In this case I believe the error should be -0.1,-0.1
        // We are thus -0.1,-0.1 away from the target
        return this.position.subtract(this.targetPosition);
    }
}

class SafetyStatus {
    constructor(protectiveStop) {
        this.protectiveStop = Boolean(protectiveStop);
    }
}

class Robot {
    joints = {};

    constructor(tool, joints, payload, protectiveStop, blend) {
        // Tool is a Tool object
        // Joints is a list of Joint objects
        // Payload is a Payload object
        this.tool = tool;
        this.payload = payload;
        this.safetyStatus = new SafetyStatus(protectiveStop);
        this.blend = Boolean(blend);

        // Assign each joint to a separate variable
        for (const joint of joints) {
            this.joints[joint.joint_name] = joint;
        }
    }
}

////////////////////////////
// This next section is for the variables
////////////////////////////

class Variable {
    constructor(name, value) {
        this.name = name;
        this.value = value;
    }

    get type() {
        return typeof (this.value);
    }
}

class PhysicalIO extends Variable {
    constructor(name, value) {
        super(name, value);
    }
}

class ScriptVariable extends Variable {
    constructor(name, value) {
        super(name, value);
    }
}

class Register extends Variable {
    constructor(name, value) {
        super(name, value);
    }
}

class PointInTime {
    /**
     * @param timestamp {number}
     * @param lineNumber {number}
     * @param lineString {string}
     * @param stepCount {number}
     */
    constructor(timestamp, lineNumber, lineString, stepCount) {
        this.timestamp = timestamp
        this.lineNumber = Number.parseFloat(lineNumber);
        this.lineString = lineString;
        this.stepCount =  stepCount ? Number.parseFloat(stepCount.value)  : undefined;
    }
}

class Controller {
    constructor(executionTime, cpuUsage, installedMemory, memoryUsage) {
        this.executionTime = Number.parseFloat(executionTime);
        this.cpuUsage = Number.parseFloat(cpuUsage);
        this.installedMemory = Number.parseInt(installedMemory);
        this.memoryUsage = Number.parseInt(memoryUsage);
    }

    get freeMemory() {
        return this.installedMemory - this.memoryUsage;
    }

    get memoryUsagePercentage() {
        // The memory usage in percentage (that means already multiplied by 100)
        return Math.round(this.memoryUsage / this.installedMemory * 100);
    }
}


class DataPoint {
    scriptVariables = {};
    physicalIOBlocks = {};
    registers = {};

    constructor(timestamp, lineNumber, lineString,
                executionTime, cpuUsage, installedMemory, memoryUsage,
                robot, physicalIOBlocks, scriptVariables, registers, raw) {
        // The point in time and the controller objects will be generated but the Robot, PhysicalIO, ScriptVariable and Register objects must be passed in
        // The last three objects should be lists of objects of the respective type
        for (let i = 0; i < scriptVariables.length; i++) {
            this.scriptVariables[scriptVariables[i].name] = scriptVariables[i];
        }

        this.pointInTime = new PointInTime(timestamp, lineNumber, lineString, this.scriptVariables["step_count"]);
        this.controller = new Controller(executionTime, cpuUsage, installedMemory, memoryUsage);
        this.robot = robot;

        for (let i = 0; i < physicalIOBlocks.length; i++) {
            this.physicalIOBlocks[physicalIOBlocks[i].name] = physicalIOBlocks[i];
        }

        for (let i = 0; i < scriptVariables.length; i++) {
            this.scriptVariables[scriptVariables[i].name] = scriptVariables[i];
        }

        for (let i = 0; i < registers.length; i++) {
            this.registers[registers[i].name] = registers[i];
        }

        this.custom = raw;
    }

    /**
     * @returns {PointInTime}
     */
    get time() {
        return this.pointInTime
    }

    traversed_attribute(path) {
        return path.split('.').reduce(function (o, p) {
            return o[p];
        }, this);
    }
}

