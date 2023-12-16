// Relevant ressources:
// https://developer.mozilla.org/en-US/docs/Web/API/Window/resize_event
// https://developer.mozilla.org/en-US/docs/Web/API/Window
import {updateContainers} from "./column_resize.js";

document.defaultView.addEventListener("resize",  updateContainers)