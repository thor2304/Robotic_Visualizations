# Dynamic resizing of the space
https://stackoverflow.com/questions/46044589/dynamically-resize-columns-in-css-grid-layout-with-mouse

Do note that while it is tempting to have the grid layout be of "code" and "vis" and assign the space to those, that would make it difficult to allow them to be dragged around.
Instead a left and right container might be easier.
The left and right containers would be the targets for the resizing, and they would be the targets for dropping off if we rearrange left and right of the code vis. The last part would be slightly more challenging, since it means we should modify the drag and drop code (instead of dropping within the same container we should drop between containers and move the content from one to the other, since we want to preserve that left is left)

https://codepen.io/Thor2304/pen/RweEWqK
Switching to using flex instead of grid should help with this, an implementation of this has been saved to this codepen.
The main idea is to change the flex: x% of code-container and vis-container directly, such that if we change their order relative to each other they will keep their size (something that will be very hard to do with grid).
To make the items draggable i use a button, positioned in the middle, and i add a down and up listener along with a mousemove listener on the body itself (it seemed to make it more stable, but that might be wrong). We use `document.documentElement["clientWidth"]` to get the width, and divide that with the `pageX` coordinate from the `mousemove` event. After this `leftSplit = (e.pageX / windowWidth)* 100` and `rightSplit = 100 - leftSplit`
The complete js is here:
```js
const evilButton = document.getElementById('evil-button');
const visA = document.getElementById("A");
const codeContainer = document.getElementById("code-container");
const visualizationContainer = document.getElementById("visualization-container");

let buttonDown = false;

evilButton.addEventListener('mousedown', (e) => {
  buttonDown = true;
  console.log("pressed")
})

document.body.addEventListener("mouseup", (event) => {
  buttonDown = false;
});

document.body.addEventListener('mousemove', (e) =>{
  if(buttonDown){    
    const windowWidth =  document.documentElement["clientWidth"];
    const leftSplit = (e.pageX / windowWidth)* 100;
    const rightSplit = 100 - leftSplit;
    
    codeContainer.style.flex = `${rightSplit}%`
    visualizationContainer.style.flex = `${leftSplit}%`
    
    console.log(leftSplit)
  }
})
```

The important css is here:
```css
.grid-container{
    display: flex;
}

.grid-container *{
   flex: 50%;
}

#evil-button{
  flex: 0 0;
}
```
The "evilButton" is the middle child of the grid-container (which really should be renamed to flex-container)