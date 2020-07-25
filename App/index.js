const ipcRenderer = require('electron').ipcRenderer;

let tableList = ['exercise', 'exercise_routine', 'workout_history', 'exercise_types'];
// Event handlers from HTML let currTable = null;
let currTable = 'none';

function exercisesClicked() {
    ipcRenderer.send('request-table', {query: 'SELECT * FROM', tableName: tableList[0]});
} 

function routinesClicked() {
    ipcRenderer.send('request-table', {query: 'SELECT * FROM', tableName: tableList[1]});
} 

function historyClicked() {
    ipcRenderer.send('request-table', {query: 'SELECT * FROM', tableName: tableList[2]});
}

function exerciseTypesClicked(){
    ipcRenderer.send('request-table', {query: 'SELECT * FROM', tableName: tableList[3]});
}

ipcRenderer.on('load-table', (event, args) => {
    queryTable(args.tableName, JSON.parse(args.result));
    currTable = args.tableName;
});

// Select and display a table dynamically
let queryTable = function(tableName, args) {

    //for(let i = 0; i < tableList.length; i++) {
    //    if(tableList[i] != tableName && document.getElementById(`table-${tableList[i]}`) != null) {
    //        console.log(`Removing a table`);
    //        document.getElementById(`table-${tableList[i]}`).remove();
    //    }
    //}

    let res = args; 

    //if(currTable === tableName) // Do nothing if it's already the currently selected table.
    //    return;
    
    let table = document.getElementById(`table-${tableName}`);
    
    document.getElementById('addButton').innerHTML = `Add ${tableName}`; 
    document.getElementById('addButton').classList.remove('hidden');
    
    // Creating the table if it doesn't exist
    //if(table == null) { 
    
    // Remove the table if it isn't null, so as to refresh it
    if(table != null)
        table.remove();
    table = document.createElement(`table`);
    
    table.setAttribute('id', `table-${tableName}`);
    table.appendChild(document.createElement('thead'));
    table.querySelector('thead').appendChild(document.createElement('tr'));
    
    for(let i = 0; i < res.fields.length; i++) {
        let heading = document.createElement('th');
        heading.textContent = res.fields[i].name;
        table.querySelector('thead tr').appendChild(heading);
    }
    document.getElementById('wrapper').appendChild(table);
        
    console.log('Res: ' + JSON.stringify(res));
    
    if(res.rows.length == 0) {
        return;
    }

    // Setting up the ROWS
    for(let i = 0; i < res.rowCount; i++) {
        let data = Object.values(res.rows[i]);
        let row = document.createElement('tr');

        for(let j = 0; j < Object.keys(res.rows[0]).length; j++) {
            let dataCell = document.createElement('td'); 
            dataCell.textContent = data[j];
            dataCell.classList.add(`${tableName}-${Object.keys(res.rows[0])[j]}`); // Cell now has a classlist of .Object.keys(res.rows[0])[n] (which is the column name)
            row.appendChild(dataCell);
        }
        table.appendChild(row);
    }

    for(let col = 0; col < res.fields.length; col++) {
        let cells = document.querySelectorAll(`.${tableName}-${Object.keys(res.rows[0])[col]}`); 
        for(let row = 0; row < cells.length; row++) {
            cells[row].addEventListener('click', function() {                   
                console.log(
                    `Content: ${cells[row].innerHTML}\n` +                               // Column data
                    `Column: ${Object.keys(res.rows[0])[col]}\n` +                       // Column selected
                    `${Object.keys(res.rows[0])[0]}: ${Object.values(res.rows[row])[0]}` // Primary-Key
                );
                document.getElementById('placeHolder').innerHTML = 
                    `Content: ${cells[row].innerHTML}<br>` +                             // Column data
                    `Column: ${Object.keys(res.rows[0])[col]}<br>` +                     // Column selected
                    `${Object.keys(res.rows[0])[0]}: ${Object.values(res.rows[row])[0]}` // Primary-Key
            })
        }
    }
    //}

// After it's created and/or if it's already created, display it
for(let i = 0; i < tableList.length; i++) {
    if(document.getElementById(`table-${tableList[i]}`) != null) {
        if(tableName != tableList[i]) { document.getElementById(`table-${tableList[i]}`).classList.add('hidden'); } else {
            document.getElementById(`table-${tableList[i]}`).classList.remove('hidden');
        }
    }
}

}


// Event Handlers
function addButtonClicked() {
    ipcRenderer.send('form-clicked', currTable);

    ipcRenderer.on('set-placeholder', (event, args) => {
        document.getElementById('placeHolder').innerHTML = `Table: ${args}`;
    });
}
