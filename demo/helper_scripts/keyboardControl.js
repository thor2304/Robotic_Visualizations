async function stepToNextTimestamp() {
    const nextTimestamp = groupedDataPoints_linked[getActivePlotGroup()].next();
    await updateVisualizations(nextTimestamp, getActivePlotGroup());
}

async function stepToPreviousTimestamp(){
    const previousTimeStamp = groupedDataPoints_linked[getActivePlotGroup()].previous();
    if (previousTimeStamp === undefined){
        return;
    }
    await updateVisualizations(previousTimeStamp, getActivePlotGroup());
}

const right_arrow = "ArrowRight";
const left_arrow = "ArrowLeft";

document.body.addEventListener("keydown", async (e) => {
    try{
        if (e.key === right_arrow) {
            await stepToNextTimestamp()
        } else if (e.key === left_arrow) {
            await stepToPreviousTimestamp()
        }
    } catch (e){
        console.log(e)
    }
})