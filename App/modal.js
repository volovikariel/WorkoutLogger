const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;

ipcRenderer.on('load-information', (event, args) => {
    let form = document.getElementById('form');
    if(args == 'workout_history') {
        let label = document.createElement('label');
        label.innerHTML = `${args}:`;
        form.appendChild(label); 
       
        let input = document.createElement('input');
        input.id = 'input-test';
        input.autofocus = true;
        form.appendChild(input); 
    }
    else if(args == 'exercise') {
    }
    else if(args == 'exercise_routine') {
    }
    let title = document.createElement('title');
    title.innerHTML = args;
    form.appendChild(title);

});

ipcRenderer.on('get-modalwindow-info', () => {
    
    ipcRenderer.send('input-test', document.getElementById('input-test').value); 

});
