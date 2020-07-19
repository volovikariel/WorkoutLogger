const {app, BrowserWindow, ipcMain, Menu, MenuItem, globalShortcut} = require('electron');
const url = require('url');
const path = require('path');
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

    win.webContents.send('show-modalwindow', args);
   
    const modalWindow = new BrowserWindow({
        minHeight: 300,
        minWidth: 600,
        modal: true,
        webPreferences: {
            nodeIntegration: true
        },
        title: args
    })
    
    modalWindow.webContents.on('did-finish-load', () => {
        modalWindow.webContents.send('create-form', args);
    });

    modalWindow.on('ready-to-show', () => {
        modalWindow.show();
    })

    modalWindow.loadURL(url.format({
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
            modalWindow.webContents.send('get-modalwindow-info');
        }
    }))

    modalWindow.setMenu(menu);

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

    ipcMain.on('get-info', (event, args) => {
        query(`SELECT ${args.param} FROM ${args.tableName};`, (result) => {
            modalWindow.webContents.send('send-info', {result: JSON.stringify(result)});
        });
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
