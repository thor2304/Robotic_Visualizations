import {dataFileName} from "../helper_scripts/load_csv_data.js";
import {save} from "./Cache.js";
import {MyFile} from "./Datastructures/MyFile.js";
import {MotorParams} from "../strain/MotorParams.js";
import {MotorCollection} from "../strain/MotorCollection.js";

function getFileNamesForMotorConfs(urcontrolFolder) {
    const urConf = urcontrolFolder.getChild("urcontrol.conf").content

    console.log("urConf", urConf, urConf.split("\n"))

    let jointConfArrayString = urConf.split("\n").filter((line) => line.startsWith("joint = "))[0]
    jointConfArrayString = jointConfArrayString.substring(jointConfArrayString.indexOf("[") + 1, jointConfArrayString.indexOf("]"))
    const jointConfArray = jointConfArrayString.split(",")
        .map((value) =>
            value.replace(" ", "")
                .replaceAll("'", "")
        )
    return jointConfArray
}

function getMotorParamFromFile(urcontrolFolder, fileName) {
    const motorConf = urcontrolFolder.getChild(fileName).content
    const motorLines = motorConf.split("\n")

    const torqueConstantLine = motorLines.filter((line) => line.startsWith("torque_constant = "))[0].split("=")
    const torqueConstant = torqueConstantLine[torqueConstantLine.length - 1].replace(" ", "")
    const gearRatioLine = motorLines.filter((line) => line.startsWith("gear_ratio = "))[0].split("=")
    const gearRatio = gearRatioLine[gearRatioLine.length - 1].replace(" ", "")
    const ratedTorqueLine = motorLines.filter((line) => line.startsWith("torque_max = "))[0].split("=")
    const ratedTorque = ratedTorqueLine[ratedTorqueLine.length - 1].replace(" ", "")

    return new MotorParams(Number.parseFloat(ratedTorque), Number.parseFloat(torqueConstant), Number.parseFloat(gearRatio));
}

function getMotorParams(folder) {
    const urcontrolFolder = folder.getChild("files").getChild("urcontrol")
    const fileNames = getFileNamesForMotorConfs(urcontrolFolder);

    return new MotorCollection(fileNames.map((fileName) => getMotorParamFromFile(urcontrolFolder, fileName)))
}

/**
 *
 * @param folder {MyDirectory}
 */
export async function handleFolder(folder){
    const flightData = folder.getChild("files").getChild("realtimedata.csv").content

    // Save motordata for strain calculation
    const motorCollection = getMotorParams(folder);
    const motorFile = new MyFile("motorParams.json", motorCollection, folder)
    await save("motorParams.json", motorFile)
    console.log(motorFile)

    // Save flight data for visualization
    const file = new MyFile("realtimedata.csv", flightData, folder)
    file.setDataSource("FlightRecord")
    await save(dataFileName, file)
    console.log("Saved flight data")
    // has(dataFileName).then(console.log)

    // Save DH params for visualization

}