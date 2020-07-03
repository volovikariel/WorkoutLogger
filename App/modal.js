const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;

ipcRenderer.on('load-information', (event, args) => {
    let form = document.getElementById('form');
    let label = document.createElement('label');
    label.innerHTML = 'Label:';
    let input = document.createElement('input');
    form.appendChild(label, input); 
});
