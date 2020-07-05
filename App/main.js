const {app, BrowserWindow, ipcMain, Menu, MenuItem, globalShortcut, webContents} = require('electron');
const url = require('url');
const path = require('path');
const iconPath = path.join(__dirname, 'pic.jpg');
const {query} = require('./pg.js');

let win; 

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
    globalShortcut.unregisterAll();
    client.end();
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

//const {Pool, Client} = require('pg');
//const exec = require('child_process').exec;
//// Use getos from npm for returning linux distros as well (apt-get vs pacman)
//
//exec(`
//     sudo apt-get update
//     sudo apt-get install postgresql postgresql-contrib
//     echo 'CREATE DATABASE TestingDatabase;' | psql -U postgres`
//    , (err, stdout, stderr) => {
//    console.log('stdout:' + stdout);
//    console.error('stderr:',stderr);
//    if(err != null) {
//        console.error('execution error: ', error); 
//    }
//})
//
//const client = new Client({
//    user: 'postgres',
//    host: 'localhost',
//    database: 'testingdatabase', 
//    password: '1',
//    port: 5432 
//});
//
//client.connect();
//
//let showRes = false;
//
//function query(query, callback) {
//    client.query(query, (err, res) => {
//        if(err) {
//           console.error(`error ${res.command}:`, err.stack);
//        } 
//        if(showRes) {
//            console.log(res);
//        }
//        callback(res);
//    });
//};

ipcMain.on('fetch-result', (event, args) => {
    const query = query(args, (result) => {
        console.log('got result: ' + JSON.stringify(result));
        win.webContents.send('got-query', result);
    })
})
//query(`CREATE table IF NOT EXISTS Person
//    (
//		Person_ID SERIAL PRIMARY KEY,
//		First_Name varchar(20) NOT NULL,
//		Last_Name varchar(20) NOT NULL
//    );`);
//
//query(`CREATE table IF NOT EXISTS Exercise_Types 
//    (
//		Exercise_Type_ID SERIAL PRIMARY KEY,
//		Exercise_Type_Name varchar(20) UNIQUE NOT NULL
//    );`);
//
//query(`CREATE table IF NOT EXISTS Exercise 
//    (
//		Exercise_ID SERIAL PRIMARY KEY,
//		Exercise_Type_ID smallint REFERENCES Exercise_Types(Exercise_Type_ID),
//		Exercise_Name varchar(40) UNIQUE NOT NULL
//    );`);
//
//query(`CREATE table IF NOT EXISTS Exercise_Routine 
//    (
//		Routine_ID SERIAL PRIMARY KEY,
//		Exercise_IDs smallint[]
//    );`);
//
//query(`CREATE table IF NOT EXISTS Workout_History 
//	(
//		Person_ID smallint REFERENCES Person(Person_ID),
//		Routine_ID smallint REFERENCES Exercise_Routine(Routine_ID),
//		Exercise_ID smallint REFERENCES Exercise(Exercise_ID),
//		Start_Time timestamp,
//		Workout_Duration smallint,
//		Average_Rest smallint,
//		Reps_Per_Set smallint[]
//		
//	);`);
//
//
//// Initial Values if tables are empty
//query(`
//INSERT INTO Person (first_name, last_name) SELECT
//		'First Test', 'Last Test' WHERE NOT EXISTS (SELECT * FROM Person); 
//`);
//
//query(`
//INSERT INTO Exercise_Types (Exercise_Type_Name) SELECT
//		'Test' WHERE NOT EXISTS (SELECT ALL * FROM Exercise_Types);
//`);
//
//query(`
//INSERT INTO Exercise (Exercise_Type_ID, Exercise_Name) SELECT
//		1, 'Push Ups' WHERE NOT EXISTS (SELECT ALL * FROM Exercise); 
//`);
//
//query(`
//INSERT INTO Exercise_Routine (Exercise_IDs) SELECT
//		'{1,2}' WHERE NOT EXISTS (SELECT ALL * FROM Exercise_Routine); 
//`);
//
//query(`
//INSERT INTO Workout_History (Person_ID, Routine_ID, Exercise_ID,
//                             Start_Time, Workout_Duration, Average_Rest, Reps_Per_Set) SELECT
//	
//		1, 1, 1, now(), 1, 1, '{3,2,4}' WHERE NOT EXISTS (SELECT ALL * FROM Workout_History); 
//`);
//
