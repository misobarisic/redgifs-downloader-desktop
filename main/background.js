import {app} from 'electron';
import serve from 'electron-serve';
import {createWindow} from './helpers';

const {ipcMain} = require('electron')
const downloader = require("redgifs-downloader")
const path = require("path")
const fs = require("fs")

const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
    serve({directory: 'app'});
} else {
    app.setPath('userData', `${app.getPath('userData')} (development)`);
}

let status = new Map();  // 0 - downloading, 1 finished, 2 error
let downloadedFiles = new Map();
let fileCount = new Map();

(async () => {
    await app.whenReady();
    const dir = path.join(app.getPath('home'), process.platform === "win32" ? "RedGIFs" : ".redgifs/");

    try {
        fs.mkdirSync(dir);
    } catch (e) {
    }

    ipcMain.on('asynchronous-message', (event, arg) => {
        console.log(arg) // prints "ping"
        event.reply('asynchronous-reply', 'pong')
    })

    ipcMain.on('synchronous-message', (event, arg) => {
        console.log(arg) // prints "ping"
        event.returnValue = 'pong'
    })

    ipcMain.on('getHomeDir', (event, arg) => {
        event.returnValue = dir;
    })

    ipcMain.on('getState', (event, arg) => {
        event.returnValue = {time: Date.now(), status, fileCount, downloadedFiles};
    })

    ipcMain.on('startDownload', (event, arg) => {
        console.log(arg)
        const instance = arg.dir ? downloader.instance(arg.dir) : downloader.instance(dir)
        instance.addEventListener("onStart", info => {
            const {query, date, availableFiles} = info
            const id = `${query}${date}`
            status.set(id, 0)
            fileCount.set(id, availableFiles)
            downloadedFiles.set(id, 0)
        })

        // instance.addEventListener("onFileDownloadStart", console.log)

        instance.addEventListener("onFileDownloadFinish", info => {
            const {query, date} = info
            const id = `${query}${date}`
            downloadedFiles.set(id, downloadedFiles.get(id) + 1)
        })

        instance.addEventListener("onFileDownloadSkip", info => {
            const {query, date} = info
            const id = `${query}${date}`
            downloadedFiles.set(id, downloadedFiles.get(id) + 1)
        })

        instance.addEventListener("onFinish", info => {
            const {query, date} = info
            const id = `${query}${date}`
            status.set(id, 1)
        })

        instance.addEventListener("onFinish", info => {
            const {query, date} = info
            const id = `${query}${date}`
            status.set(id, 2)
        })

        instance.downloadQuery(arg.term, arg)
        event.reply('endDownload', 'pong')
    })


    const mainWindow = createWindow('main', {
        width: 1000,
        height: 600,
    });

    if (isProd) {
        await mainWindow.loadURL('app://./home.html');
    } else {
        const port = process.argv[2];
        await mainWindow.loadURL(`http://localhost:${port}/home`);
        mainWindow.webContents.openDevTools();
    }
})();

app.on('window-all-closed', () => {
    app.quit();
});
