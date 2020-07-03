const {app, BrowserWindow, ipcMain, Menu, MenuItem, globalShortcut, webContents} = require('electron');

const url = require('url');
const path = require('path');
const iconPath = path.join(__dirname, 'pic.jpg');

let win; 
let status = 0;


function createWindow() {
    
    win = new BrowserWindow({
            minHeight: 600, 
            minWidth: 800, 
            webPreferences: {
                nodeIntegration:true 
            }, 
            show: false
        });
   
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file', 
        slashes: true
    }))
   
    win.once('ready-to-show', () => {
        win.show();
    })
    
    win.on('closed', () => {
        win = null;
    })
}

// App Stuff---------------------------------------------------------------------------------------------
app.on('ready', function() {
    
    //TODO: Check if database works, if so, createwindow

    createWindow();

    const template = [
        {
            label: 'Window commands',
            submenu: [
                {
                    label: 'Quit',
                    click: function() {
                        app.quit();
                    },
                    accelerator: 'ESC'
                } 
            ]
        },
        {
            label: 'Toggle Developer',
            click: function() {
                win.webContents.toggleDevTools();
            }
        }
    ]

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    globalShortcut.register('F1', function() {
        win.show();
    });
});


app.on('will-quit', function(){
    db.end((err) => {
        if(err) {
            console.error('Error closing database', err.stack);
        }
    });
    globalShortcut.unregisterAll();
});
//-------------------------------------------------------------
// IPC
ipcMain.on('form-clicked', (event, args) => {

    win.webContents.send('popup-message', 'All clear!');
   
    const modalWindow = new BrowserWindow({
        minHeight: 300,
        minWidth: 600,
        modal: true,
        webPreferences: {
            nodeIntegration: true
        }
    })

    modalWindow.on('ready-to-show', () => {
        modalWindow.show();
    })

    modalWindow.setTitle(args);

    modalWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'modal.html'),
        protocol: 'file',
        slashes: true
    }));
   
    modalWindow.webContents.on('did-finish-load', (event, args) => {
        modalWindow.webContents.send('load-information', args);
    });
});

//--------------------------------------------------------------
// Postgres stuff

const {Client} = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres', 
    password: '1',
    port: 5432 
});

client.connect((err) => {
    if(err) {
        console.error('Client connection error', err.stack);
    }
    else {
        console.log('Client connected');
    }
});



client.query(`SELECT 'CREATE DATABASE workout'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'workout')\\gexec`, (err, res) => {
        console.error(`Err Create Workout Error: ${err}`); 
        console.error(`Err Create Workout Result: ${JSON.stringify(res)}`);
});

client.query('SELECT * FROM workout', (err, res) => {
    console.log(`Result In Workout: ${res}`);
});

client.end((err) => {
    if(err) {
        console.error('Error ending Client', err.stack);
    }
    else {
        console.log('Client connection ended');
    }
});

const db = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'workout',
    password: '1',
    port: 5432
});

db.connect((err) => {
    if(err) {
        console.error('db connection error', err.stack);
    }
    else {
        console.log('db connected');
    }
});



// Connect to the Workout database
//const db = new Client({
//    user: 'postgres',
//    host: 'localhost',
//    database: 'workout',
//    password: '1',
//    port: 5432
//});

//db.connect();

db.query(`CREATE table IF NOT EXISTS Person
    (
		Person_ID SERIAL PRIMARY KEY,
		First_Name varchar(20) NOT NULL,
		Last_Name varchar(20) NOT NULL
    );`);

db.query(`CREATE table IF NOT EXISTS Exercise_Types 
    (
		Exercise_Type_ID SERIAL PRIMARY KEY,
		Exercise_Type_Name varchar(20) UNIQUE NOT NULL
    );`);

db.query(`CREATE table IF NOT EXISTS Exercise 
    (
		Exercise_ID SERIAL PRIMARY KEY,
		Exercise_Type_ID smallint REFERENCES Exercise_Types(Exercise_Type_ID),
		Exercise_Name varchar(40) UNIQUE NOT NULL
    );`);

db.query(`CREATE table IF NOT EXISTS Exercise_Routine 
    (
		Routine_ID SERIAL PRIMARY KEY,
		Exercise_IDs smallint[]
    );`);

db.query(`CREATE table IF NOT EXISTS Workout_History 
	(
		Person_ID smallint REFERENCES Person(Person_ID),
		Routine_ID smallint REFERENCES Exercise_Routine(Routine_ID),
		Exercise_ID smallint REFERENCES Exercise(Exercise_ID),
		Start_Time timestamp,
		Workout_Duration smallint,
		Average_Rest smallint,
		Reps_Per_Set smallint[]
		
	);`);


// Initial Values if tables are empty
db.query(`
INSERT INTO Person (first_name, last_name) SELECT
		'First Test', 'Last Test' WHERE NOT EXISTS (SELECT * FROM Person); 
`);

db.query(`
INSERT INTO Exercise_Types (Exercise_Type_Name) SELECT
		'Test' WHERE NOT EXISTS (SELECT ALL * FROM Exercise_Types);
`);

db.query(`
INSERT INTO Exercise (Exercise_Type_ID, Exercise_Name) SELECT
		1, 'Push Ups' WHERE NOT EXISTS (SELECT ALL * FROM Exercise); 
`);

db.query(`
INSERT INTO Exercise_Routine (Exercise_IDs) SELECT
		'{1,2}' WHERE NOT EXISTS (SELECT ALL * FROM Exercise_Routine); 
`);

db.query(`
INSERT INTO Workout_History (Person_ID, Routine_ID, Exercise_ID,
                             Start_Time, Workout_Duration, Average_Rest, Reps_Per_Set) SELECT
	
		1, 1, 1, now(), 1, 1, '{3,2,4}' WHERE NOT EXISTS (SELECT ALL * FROM Workout_History); 
`);
