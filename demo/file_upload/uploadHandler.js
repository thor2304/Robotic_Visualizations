import {handleFile} from "./fileHandler.js";

const upload = document.getElementById('upload');

export function onFile() {
    /**
     * @type {File}
     */
    const file = upload.files[0];
    const name = file.name.replace(/.[^/.]+$/, '');
    console.log(`${name} selected`)
    handleFile(file);
}

upload.addEventListener('dragenter', function (e) {
    upload.parentNode.className = 'area dragging';
}, false);

upload.addEventListener('dragleave', function (e) {
    upload.parentNode.className = 'area';
}, false);

upload.addEventListener('dragdrop', function (e) {
    onFile();
}, false);

upload.addEventListener('change', function (e) {
    onFile();
}, false);