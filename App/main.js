const {app, Tray, BrowserWindow, ipcMain, Menu, shell, dialog, MenuItem, globalShortcut, webContents} = require('electron');
const url = require('url');
const path = require('path');
const iconPath = path.join(__dirname, 'pic.jpg');

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
    
    // Tray Icon and right click functionality 
    let tray = new Tray(iconPath);

    let template = [
        {
            label: 'Temp', 
            submenu:[
                {
                    label: 'Temp',
                    type: 'radio',
                    checked: true
                },
                {
                    label: 'Temp',
                    type: 'radio'
                }
            ]
        }
    ]

    const ctxMenu = Menu.buildFromTemplate(template);
    tray.setContextMenu(ctxMenu);
    tray.setToolTip('Temp Tooltip');

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

// Context Menu stuff
    const contextMenu = new Menu();
    contextMenu.append(new MenuItem({
        label: 'Temp',
        click: function() {
        
        }
    }));

    win.webContents.on('context-menu', function(event, params) {
        contextMenu.popup(win, params.x, params.y);
    });

    globalShortcut.register('F1', function() {
        win.show();
    });
//-------------------------------------------------------------
});

app.on('will-quit', function(){
    globalShortcut.unregisterAll();
});

// IPC
ipcMain.on('form-clicked', (event, args) => {

    win.webContents.send('popup-message', 'All clear!');
   
    let modalWindow = new BrowserWindow({
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
   
    modalWindow.webContents.on('did-finish-load', () => {
        modalWindow.webContents.send('load-information', args);
    });
});



//--------------------------------------------------------------
// Postgres stuff

//const {Client} = require('pg');

//const client = new Client({
    //user: 'postgres',
    //host: 'localhost',
    //database: 'Workout', 
    //password: 'postgresilikeanime',
    //port: 5432 
//});

//client.connect();

//// Select and display a table dynamically~
//client.query('SELECT * FROM exercise_types', (err, res) => {
    //console.log(`Keys: ${JSON.stringify(Object.keys(res.rows[0]))}\n`);

    //for(let i = 0; i < res.rowCount; i++) { 
        //console.log(`Values ${i}: ${JSON.stringify(Object.values(res.rows[i]))}`);
        //console.log(`Value of: ${res.rows[i]['exercise_type_name']}\n`); // Can just go through the keys by doing Object.keys(res.rows[0], 1, etc.)
    //}

    
    //client.end();
//})