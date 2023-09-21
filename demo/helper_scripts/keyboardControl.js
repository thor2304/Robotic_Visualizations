async function stepToNextTimestamp() {
    const nextTimestamp = datapoints_linked.next();
    await updateVisualizations(nextTimestamp);
}

async function stepToPreviousTimestamp(){
    const previousTimeStamp = datapoints_linked.previous();
    if (previousTimeStamp === undefined){
        return;
    }
    await updateVisualizations(previousTimeStamp);
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