
import {dataFileName} from "../helper_scripts/load_csv_data.js";
import {save} from "./Cache.js";
import {MyFile} from "./Datastructures/MyFile.js";
import {updateVersionNumber} from "./statusVisualizations.js";

/**
 *
 * @param folder {MyDirectory}
 */
export async function handleFolder(folder){
    const flightData = folder.getChild("files").getChild("realtimedata.csv").content

    const file = new MyFile("realtimedata.csv", flightData, folder)
    file.setDataSource("FlightRecord")

    updateVersionNumber()

    await save(dataFileName, file)
    console.log("Saved flight data")
    // has(dataFileName).then(console.log)
}