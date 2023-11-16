export function sendToBottom(){
    const bottomVis = document.querySelector(".bottom-vis");

    const bottomVisParent = bottomVis.parentElement;

    bottomVisParent.removeChild(bottomVis);

    bottomVisParent.appendChild(bottomVis);
}