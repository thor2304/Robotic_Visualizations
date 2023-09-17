document.defaultView.addEventListener("resize", async (event) => {
  await updateContainers();
})