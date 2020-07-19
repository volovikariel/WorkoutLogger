const ipcRenderer = require('electron').ipcRenderer;

ipcRenderer.on('create-form', (event, args) => {
    
    let title = document.createElement('h1');
    title.id = 'title';
    title.innerHTML = args;
    
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
        let form = document.getElementById('form');
        form.appendChild(title);
        
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
        dropDown.id = 'dropDown';
       
        ipcRenderer.send('get-info', {tableName: 'exercise', param:'exercise_name'});

    }
    else if(args == 'exercise_routine') {
        let form = document.getElementById('form');
        form.appendChild(title);

        let labelName = document.createElement('label');
        labelName.innerHTML = `Exercise Routine name:`;
        form.appendChild(labelName); 
       
        let input = document.createElement('input');
        input.id = 'input';
        input.autofocus = true;
        form.appendChild(input); 

        let dropDown = document.createElement('select');
        dropDown.id = 'dropDown';
       
        ipcRenderer.send('get-info', {tableName: 'exercise_types', param:'exercise_type_name'});
    }

});

ipcRenderer.on('get-modalwindow-info', () => {
    ipcRenderer.send('input', document.getElementById('input').value); 

    // Empty it once enter is pressed
    document.getElementById('input').value = '';
});


ipcRenderer.on('send-info', (args) => {
    let res = JSON.parse(args.result);
    let dropDown = document.getElementById('dropDown');
    for(let i = 0; i < res.rows.length; i++) {
        dropDown.add(JSON.stringify(res.rows[i]));
    }
    let form = document.getElementById('form');
    form.appendChild(dropDown);
});
