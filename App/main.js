const {app, BrowserWindow, ipcMain, Menu, MenuItem, globalShortcut} = require('electron');
const url = require('url');
const path = require('path');
const {query} = require('./pg.js');

let win; 
let modalWin;

// Create window and pass in the main window html, index.html which references index.js
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
// Everything to do with communication from main.js (the main process)
ipcMain.on('form-clicked', (event, args) => {
    // Setting an element of the window (placeHolder text) to be the
    // "section's" name (exercise, workout_routine, or whatever else)
    win.webContents.send('set-placeholder', args);
   
    const modalWin = new BrowserWindow({
        minHeight: 300,
        minWidth: 600,
        modal: true,
        webPreferences: {
            nodeIntegration: true
        },
        title: args,
    })

    modalWin.webContents.toggleDevTools(); 

    // Send a message to modal.js to populate its html 
    modalWin.webContents.on('did-finish-load', () => {
        modalWin.webContents.send('create-form', args);
    });

    modalWin.on('ready-to-show', () => {
        modalWin.show();
    })

    modalWin.loadURL(url.format({
        pathname: path.join(__dirname, 'modal.html'),
        protocol: 'file',
        slashes: true
    }));
   
    // Shortcuts
    const menu = new Menu();
    menu.append(new MenuItem({
        label: 'Submit',
        accelerator: 'Enter',
        click: () => {
            modalWin.webContents.send('get-modalwindow-info');
        }
    }))

    modalWin.setMenu(menu);

    ipcMain.on('get-info', (event, args) => {
        if(args.tableName == 'exercise') { 
            query(`SELECT exercise_type_name FROM exercise_types;`, (result) => {
                modalWin.webContents.send('send-info', {table: args.tableName, res: JSON.stringify(result)});
            });
        }
    });
});

ipcMain.on('input', (event, args) => {
    query(`SELECT * FROM exercise WHERE exercise_name = '${args}';`, (result) => {
        if(result.rows.length != 0) {
            console.log('Duplicate value found, not inserting.');
        }
        else {
            query(`INSERT INTO exercise(exercise_name) VALUES ('${args}')`, (result) => {});
        }
    });
});


ipcMain.on('request-table', (event, args) => {
    console.log(`In request-table, query is: ${args.query} ${args.tableName}`);
    query(`${args.query} ${args.tableName};`, (result) => {
        win.webContents.send('load-table', {
            tableName: args.tableName,
            result: JSON.stringify(result)
        });
    })

    win.on('closed', () => {
        modalWindow = null;
    })
})
