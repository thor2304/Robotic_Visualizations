// Relevant ressources:
// https://developer.mozilla.org/en-US/docs/Web/API/Window/resize_event
// https://developer.mozilla.org/en-US/docs/Web/API/Window
document.defaultView.addEventListener("resize", async (event) => {
  await updateContainers();
})