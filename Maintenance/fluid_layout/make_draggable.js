// Starting structure borrowed from webdevSimplified
// https://www.youtube.com/watch?v=jfYWwQrtzzY
// https://github.com/WebDevSimplified/Drag-And-Drop/blob/master/script.js
let draggables = document.querySelectorAll('.draggable')
const containers = document.querySelectorAll('.drag-container')

export function makeAllDraggable() {
    draggables = document.querySelectorAll('.draggable')

    draggables.forEach(draggable => {
        if (draggable.drag_listener) {
            return
        }
        draggable.drag_listener = true
        draggable.addEventListener('dragstart', () => {
            draggable.classList.add('dragging')
        })

        draggable.addEventListener('dragend', () => {
            draggable.classList.remove('dragging')
        })
    })

    containers.forEach(container => {
        if (container.dragover_listener){
            return
        }
        container.dragover_listener = true
        container.addEventListener('dragover', e => {
            e.preventDefault()
            const afterElement = getDragAfterElement(container, e.clientY)
            const draggable = document.querySelector('.dragging')
            if (afterElement == null) {
                container.appendChild(draggable)
            } else {
                container.insertBefore(draggable, afterElement)
            }
        })
    })
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.draggable:not(.dragging)')]

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect()
        const offset = y - box.top - box.height / 2
        if (offset < 0 && offset > closest.offset) {
            return {offset: offset, element: child}
        } else {
            return closest
        }
    }, {offset: Number.NEGATIVE_INFINITY}).element
}