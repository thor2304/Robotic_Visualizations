// Math.js reference:
// https://mathjs.org/docs/datatypes/matrices.html#arrays-and-matrices

// jointDHParameters[i] provides an array of [theta, a, d, alpha] for the i-th joint
import {Position} from "../datastructures/datastructures.js";

const jointDHParameters = [
    [0, 0, 0.089159, math.pi / 2],
    [0, -0.425, 0, 0],
    [0, -0.39225, 0, 0],
    [0, 0, 0.10915, math.pi / 2],
    [0, 0, 0.09465, -math.pi / 2],
    [0, 0, 0.0823, 0]
];


// const alpha = jointDHParameters[i][3];

const cos_alphas = [
    math.cos(jointDHParameters[0][3]),
    math.cos(jointDHParameters[1][3]),
    math.cos(jointDHParameters[2][3]),
    math.cos(jointDHParameters[3][3]),
    math.cos(jointDHParameters[4][3]),
    math.cos(jointDHParameters[5][3])
];

const sin_alphas = [
    math.sin(jointDHParameters[0][3]),
    math.sin(jointDHParameters[1][3]),
    math.sin(jointDHParameters[2][3]),
    math.sin(jointDHParameters[3][3]),
    math.sin(jointDHParameters[4][3]),
    math.sin(jointDHParameters[5][3])
];

const alpha_d_array_arrays = [
    [0, sin_alphas[0], cos_alphas[0], jointDHParameters[0][2]],
    [0, sin_alphas[1], cos_alphas[1], jointDHParameters[1][2]],
    [0, sin_alphas[2], cos_alphas[2], jointDHParameters[2][2]],
    [0, sin_alphas[3], cos_alphas[3], jointDHParameters[3][2]],
    [0, sin_alphas[4], cos_alphas[4], jointDHParameters[4][2]],
    [0, sin_alphas[5], cos_alphas[5], jointDHParameters[5][2]]
]

const last_array = [0, 0, 0, 1]


// input-rotations must be an array of rotation angles, corresponding to the theta value
// The output is an array where position 0 is the computed positions and position 1 is the computed rotation matrix
export function computePositionAndRotation(inputRotationsPerJoint) {

    if (inputRotationsPerJoint.length !== jointDHParameters.length) throw new Error("Input rotations must have the same length as the DH-parameters array");


    let outputPositions = [];

    const transformationMatrices = [];

    for (let i = 0; i < inputRotationsPerJoint.length; i++) {
        const theta = inputRotationsPerJoint[i] + jointDHParameters[i][0];
        const r = jointDHParameters[i][1]; // also known as a in the DH-parameters
        const cos_theta = math.cos(theta);
        const sin_theta = math.sin(theta);
        const cos_alpha = cos_alphas[i];
        const sin_alpha = sin_alphas[i];
        const jointTransformationMatrix = math.matrix([
            [cos_theta, -sin_theta * cos_alpha, sin_theta * sin_alpha, r * cos_theta],
            [sin_theta, cos_theta * cos_alpha, -cos_theta * sin_alpha, r * sin_theta],
            alpha_d_array_arrays[i].slice(),
            last_array.slice()
        ]);

        transformationMatrices.push(jointTransformationMatrix);
    }

    let currentTransformationMatrix = transformationMatrices[0];
    outputPositions.push(currentTransformationMatrix.subset(math.index([0, 1, 2], 3)).toArray());

    // intentionally starting on one, since we have already looked at the first joint
    for (let i = 1; i < transformationMatrices.length; i++) {
        currentTransformationMatrix = math.multiply(currentTransformationMatrix, transformationMatrices[i]);
        outputPositions.push(currentTransformationMatrix.subset(math.index([0, 1, 2], 3)).toArray());
    }

    outputPositions = outputPositions.map((position) => {
        return new Position(position[0][0], position[1][0], position[2][0]);
    });

    return [outputPositions, currentTransformationMatrix.subset(math.index([0, 1, 2], [0, 1, 2])).toArray()];
}
