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

ipcMain.on('fetch-result', (event, args) => {
    query(`${args.query} ${args.tableName};`, (result) => {
        console.log(`${args.query} ${args.tableName};`);
        win.webContents.send('got-query', {tableName: args.tableName,result: JSON.stringify(result)});
    })
})
