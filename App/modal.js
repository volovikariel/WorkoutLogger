const ipcRenderer = require('electron').ipcRenderer;

let currTable;

ipcRenderer.on('create-form', (event, args) => {
    currTable = args; 
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

        let labelType = document.createElement('label');
        labelType.innerHTML = 'Exercise Type:';
        form.appendChild(labelType);

       
        ipcRenderer.send('get-info', {tableName: 'workout_history'});

    }
    else if(args == 'exercise') {
        let form = document.getElementById('form');
        form.appendChild(title);
        
        let labelName = document.createElement('label');
        labelName.innerHTML = `Exercise name:`;
        form.appendChild(labelName); 
       
        let input = document.createElement('input');
        input.id = 'exercise_name';
        input.autofocus = true;
        form.appendChild(input); 

        let labelType = document.createElement('label');
        labelType.innerHTML = 'Exercise Type:';
        form.appendChild(labelType);
       
        ipcRenderer.send('get-info', {tableName: 'exercise'});

    }
    else if(args == 'exercise_routine') {
        let form = document.getElementById('form');
        form.appendChild(title);

        let labelName = document.createElement('label');
        labelName.innerHTML = `Exercise Routine name:`;
        form.appendChild(labelName); 
       
        let input = document.createElement('input');
        input.id = 'input-test';
        input.autofocus = true;
        form.appendChild(input); 

    }
    else if(args == 'exercise_types') {
        let form = document.getElementById('form');
        form.appendChild(title);

        let labelName = document.createElement('label');
        labelName.innerHTML = `Exercise Type name:`;
        form.appendChild(labelName); 
       
        let input = document.createElement('input');
        input.id = 'exercise_type_name';
        input.autofocus = true;
        form.appendChild(input);
    }

});

// Sends the contents of the input field and resets the field to being empty
ipcRenderer.on('get-modalwindow-info', () => {
    if(currTable == 'exercise') {
        ipcRenderer.send('input', 
            {
                exercise_name: document.getElementById('exercise_name').value,
                exercise_type_id: document.getElementById('dropDown').selectedIndex + 1,
                exercise_type_name: document.getElementById('dropDown').value, 
                tableName: currTable
            }
        ); 
        document.getElementById('exercise_name').value = '';
    }
    else if(currTable == 'exercise_types') {
        ipcRenderer.send('input', 
            {
                exercise_type_name: document.getElementById('exercise_type_name').value,
                tableName: currTable
            }
        ); 
        document.getElementById('exercise_type_name').value = '';
    }

});


ipcRenderer.on('send-info', (event, args) => {
    if(args.table == 'exercise') {
        let res = JSON.parse(args.res);
        console.log(`Res: ${args.res}`);
        console.log(`Res rows: ${JSON.stringify(res.rows[0].exercise_type_name)}`);
        let dropDown = document.createElement('select');
        dropDown.id = 'dropDown';
        
        for(let i = 0; i < res.rows.length; i++) {
            let option = document.createElement('option');
            option.text = res.rows[i].exercise_type_name;
            option.value = res.rows[i].exercise_type_name;
            dropDown.appendChild(option);
        }
        let form = document.getElementById('form');
        form.appendChild(dropDown);
    }
});
