const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;

ipcRenderer.on('load-information', (event, args) => {
    document.getElementById('text-here').innerHTML = "AHHHHHHHH";
    document.getElementById('form-here').innerHTML += 'Hello';
});