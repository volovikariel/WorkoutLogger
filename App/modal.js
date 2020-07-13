const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;

ipcRenderer.on('load-information', (event, args) => {
    let form = document.getElementById('form');
    
    let title = document.createElement('h1');
    title.id = 'title';
    title.innerHTML = args;
    form.appendChild(title);
    
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
        let labelName = document.createElement('label');
        labelName.innerHTML = `Exercise name:`;
        form.appendChild(labelName); 
       
        let input = document.createElement('input');
        input.id = 'input-test';
        input.autofocus = true;
        form.appendChild(input); 

        let labelType = document.createElement('label');
        labelType.innerHTML = 'Exercise Type:';
        form.appendChild(labelType);

        let dropDown = document.createElement('select');
       
        ipcRenderer.send('get-info', {tableName: 'exercise', param:'exercise_name'});
        
        ipcRenderer.on('send-info', (args) => {
            let res = JSON.parse(args.result);
            ipcRenderer.send('send-message', res);
           // for(let i = 0; i < res.rows.length; i++) {
           //     dropDown.add(JSON.stringify(res.rows[i]));
           //     ipcRenderer.send('log', `Res rows i: ${JSON.stringify(res.rows)}`);
           // }

           // form.appendChild(dropDown);
        });
    }
    else if(args == 'exercise_routine') {
    }

});

ipcRenderer.on('get-modalwindow-info', () => {
    
    ipcRenderer.send('input-test', document.getElementById('input-test').value); 

});

ipcRenderer.on('duplicate', () => {
    document.getElementById('title').innerHTML = 'Duplicate Found'
});

ipcRenderer.on('the-message', (args) => {
    document.getElementById('title').innerHTML = args;
});
