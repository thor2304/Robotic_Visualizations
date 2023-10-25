
import {dataFileName} from "../helper_scripts/load_csv_data.js";
import {has, save} from "./Cache.js";
import {MyFile} from "./Datastructures/MyFile.js";

/**
 *
 * @param folder {MyDirectory}
 */
export async function handleFolder(folder){
    const flightData = folder.getChild("files").getChild("realtimedata.csv").content

    const file = new MyFile("realtimedata.csv", flightData, folder)
    file.setDataSource("FlightRecord")

    await save(dataFileName, file)
    console.log("Saved flight data")
    // has(dataFileName).then(console.log)
}