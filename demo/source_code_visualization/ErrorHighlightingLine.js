const button_container = document.getElementById("Script-control-button-container");

const button_groups = {};
const all_buttons = [];

async function createButtonJumpingToTimeStamp(timestamp, name) {
    // Create and add the button
    const button = document.createElement("button");
    button.innerHTML = `${name}<br>
    ${timestamp}`;

    button.id = `button-${timestamp}-${name}`;

    button_container.appendChild(button);

    button.addEventListener ("click", async function() {
        await updateVisualizations(timestamp);
    });

    const default_display = button.style.display;

    button.style.display = "none";


    // Add the event listener for the line which shows the buttons

    const datapoint = datapoints[timestamp]

    if(datapoint === undefined){
        console.log(`No datapoint found for timestamp ${timestamp}`)
        return
    }

    const line = await get_line(datapoint.time.lineNumber, scriptOffset)

    if (line === undefined){
        console.log(`No line found for timestamp ${timestamp} and line number ${datapoint.time.lineNumber}`)
        return
    }else{
        console.log(`Found line for timestamp ${timestamp} and line number ${datapoint.time.lineNumber}`)
    }

    line.classList.add("error")


    button_groups[line] = button_groups[line] || []

    if (button_groups[line].length === 0){
        line.addEventListener("click", async function() {
            console.log("timestamp", timestamp)
            hideAllButtons()
            for (let i = 0; i < button_groups[line].length; i++) {
                button_groups[line][i].style.display = default_display;
            }
        });
    }

    button_groups[line].push(button)

    all_buttons.push(button)
}

function hideAllButtons(){
    for (let i = 0; i < all_buttons.length; i++) {
        all_buttons[i].style.display = "none";
    }
}
