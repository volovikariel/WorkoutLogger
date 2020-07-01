const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;
const BrowserWindow  = electron.remote.BrowserWindow;
const url = require('url');
const path = require('path');

// Postgres Stuff
const {Client} = require('pg');
const inspector = require('inspector').url;
const { fileURLToPath } = require('url');


const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'Workout', 
    password: 'postgresilikeanime',
    port: 5432 
});

client.connect();

// Event handlers from HTML let currTable = null;
let currTable = 'null';
function exercisesClicked() {
    queryTable('exercise');
    currTable = 'exercise';
} 

function routinesClicked() {
    queryTable('exercise_routine');
    currTable = 'exercise_routine';
} 

function historyClicked() {
    queryTable('workout_history');
    currTable = 'workout_history';
} 

let tableList = ['exercise', 'exercise_routine', 'workout_history'];

// Select and display a table dynamically
let queryTable = function(tableName) {
    
    if(currTable === tableName) // Do nothing if it's already the currently selected table.
        return;
    
    let table = document.getElementById(`table-${tableName}`);

    document.getElementById('addButton').innerHTML = `Add ${tableName}`; 
    document.getElementById('addButton').classList.remove('hidden');
    
    // Creating the table if it doesn't exist
    if(table == null) { 
        table = document.createElement(`table`);
        
        table.setAttribute('id', `table-${tableName}`);
        table.appendChild(document.createElement('thead'));
        table.querySelector('thead').appendChild(document.createElement('tr'));

        client.query(`SELECT * FROM ${tableName}`, (err, res) => {
            // Setting up the COLUMNS
            for(let i = 0; i < Object.keys(res.rows[0]).length; i++) {
                let heading = document.createElement('th');
                heading.textContent = Object.keys(res.rows[0])[i];
                table.querySelector('thead tr').appendChild(heading);
            }
            document.getElementById('wrapper').appendChild(table);

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

            for(let col = 0; col < Object.keys(res.rows[0]).length; col++) {
                let cells = document.querySelectorAll(`.${tableName}-${Object.keys(res.rows[0])[col]}`); 
                console.log(`cell length is: ${cells.length}`);
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
        }
    )} 
    
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

    ipcRenderer.on('popup-message', (event, args) => {
        document.getElementById('placeHolder').innerHTML += args;
    });
}