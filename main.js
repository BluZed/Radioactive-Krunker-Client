const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron')
const path = require('path')
const settings = require('./windows/settings/settings.js')
const setupFolders = require('./game/folders.js').checkForFolders
Menu.setApplicationMenu(null)

console.log('=== Radioactive Client v'+app.getVersion()+' ===')

const updateUrl = 'https://github.com/BluZed/Radioactive-Krunker-Client/releases/latest'

const setupSwitches = async() => {
    await setupFolders(app)
    await settings.checkForDefaults()

    if(settings.get("disableFrameRateLimit") != "false"){
        app.commandLine.appendSwitch("--disable-frame-rate-limit")
        app.commandLine.appendSwitch("--disable-gpu-vsync")
        console.log('> Frame rate cap disabled')
    }
    
    if (settings.get("perfflags") != "false") {
        app.commandLine.appendSwitch("--force_high_performance_gpu")
        app.commandLine.appendSwitch("--force-high-performance-gpu")
        app.commandLine.appendSwitch("--no-sandbox")
        app.commandLine.appendSwitch("--disable-breakpad")
        app.commandLine.appendSwitch("--disable-component-update")
        app.commandLine.appendSwitch("--disable-print-preview")
        app.commandLine.appendSwitch("--disable-metrics")
        app.commandLine.appendSwitch("--disable-metrics-repo")
        app.commandLine.appendSwitch("--enable-javascript-harmony")
        app.commandLine.appendSwitch("--enable-future-v8-vm-features")
        app.commandLine.appendSwitch("--enable-webgl2-compute-context")
        app.commandLine.appendSwitch("--disable-hang-monitor")
        app.commandLine.appendSwitch("--no-referrers")
        app.commandLine.appendSwitch("--enable-quic")
        app.commandLine.appendSwitch("--high-dpi-support", 1)
        app.commandLine.appendSwitch("--ignore-gpu-blacklist")
        app.commandLine.appendSwitch("--disable-2d-canvas-clip-aa")
        app.commandLine.appendSwitch("--disable-bundled-ppapi-flash")
        app.commandLine.appendSwitch("--disable-logging")
        app.commandLine.appendSwitch("--disable-web-security")
        app.commandLine.appendSwitch("--webrtc-max-cpu-consumption-percentage=100")
        app.commandLine.appendSwitch("--enable-zero-copy")
        app.commandLine.appendSwitch("--disable-gpu-rasterization")
        app.commandLine.appendSwitch("--disable-gpu-driver-bug-workarounds")
        
        console.log('> Performance switches enabled')
    }

    const continueWithApp = async() => {
        if(settings.get('localmods') != "false"){
            await require('./game/localMod.js').setup(app)
        }

        // create window!
        createSplashWindow(createGameWindow)
        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) {createSplashWindow(createGameWindow)}
        })
    }

    if(app.isReady()){
        continueWithApp()
    } else {
        app.whenReady().then(() => {
            continueWithApp()
        })
    }
}
setupSwitches()

function createGameWindow() {
    const mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        show: false,
        fullscreen: false,
        webPreferences: {
            preload: path.join(__dirname, '/game/main.js')
        }
    })
    mainWindow.loadURL('https://krunker.io')

    mainWindow.webContents.on('before-input-event', (e, f) => {
        switch (f.key){
            case "F11":
                mainWindow.setFullScreen(!mainWindow.isFullScreen())
                e.preventDefault()
                break 
            case "F4":
                mainWindow.loadURL('https://krunker.io')
                e.preventDefault()
                break 
            case "F5":
                mainWindow.reload()
                e.preventDefault()
                break 
            case "Escape":
                mainWindow.webContents.executeJavaScript('document.exitPointerLock()')
                break
            case "F9":
                mainWindow.webContents.openDevTools()
                break
        }
    })

    mainWindow.webContents.on('new-window', (e, url) => {
        if (!url) { return }
        if (url.startsWith('https://krunker.io/?game=')) {
            e.preventDefault()
            mainWindow.loadURL(url)
        } else {
            shell.openExternal(url)
        }
    })
  
    ipcMain.on('GAME_get_setting', (e,name,sendID)=>{
        console.log("> Requested "+name)
        mainWindow.webContents.send(sendID, name, settings.get(name))
    })

    ipcMain.on('request_accounts_info', (e,id)=>{
        let unparsed = settings.get('ac')
        let accountsdata
        if (unparsed != undefined && unparsed != null) {
            accountsdata = unparsed
        } else {
            accountsdata = 'W10=' //encoded for []
        }
        mainWindow.webContents.send(id, accountsdata)
    })

    let canBeShown = false
    mainWindow.once('ready-to-show', () => {
        canBeShown = true
    })
    mainWindow.on('closed', ()=>{app.exit(1)})

    mainWindow.webContents.once('dom-ready',async()=>{
        //css
        mainWindow.webContents.send('current_css',settings.get('css'))

        //plugins
        if(settings.get('pluginsenabled') != "false"){
            const manager = require('./game/pluginmanager.js')
            const all_plugins = await manager.getAllPlugins()
            mainWindow.webContents.send('start_plugins', JSON.stringify(all_plugins))
            console.log('> Plugins are enabled')

            ipcMain.on('save_plugin',(e,name,data)=>{
                manager.savePlugin(name,data)
            })
        } else {
            console.log('> Plugins are disabled')
        }
    })

    return (start) => {
        if(start === false){
            mainWindow.destroy()
        } else {
            const show = () => {
                if (canBeShown) {
                    mainWindow.show()
                    mainWindow.setFullScreen(settings.get('fullscreen') === "true")
                } else {
                    setTimeout(show, 100)
                }
            }
            show()
        }  
    }
}

function createSplashWindow(gameStart) {
    let showGame
    let closedByApp = false
    const splashWindow = new BrowserWindow({
        width: 650,
        height: 430,
        show: false,
        frame: false,
        webPreferences: {
            preload: path.join(__dirname, '/windows/splash/splash.js')
        }
    })
    splashWindow.loadFile(path.join(__dirname, '/windows/splash/index.html'))
    splashWindow.once('ready-to-show', () => {
        splashWindow.show()
        showGame = gameStart()
    })

    ipcMain.on('game_loading', () => {
        if (!splashWindow.isDestroyed()) {
            splashWindow.webContents.send('game_loading')
        }
    })
    ipcMain.on('SPLASH_EXIT', () => {
        if (!splashWindow.isDestroyed()) {
            closedByApp = true
            showGame(true)
            splashWindow.destroy()
        }
    })
    ipcMain.on('SPLASH_latest_version', (e,res) =>{
        if(res && res != null && res != "null"){
            const data = JSON.parse(res)
            if(app.getVersion() != data.version){
                splashWindow.webContents.send('UPDATE_AVAILABLE',app.getVersion())
            } else {
                splashWindow.webContents.send('UPDATE_UNAVAILABLE')
            }
        }
    })
    ipcMain.on('START_UPDATE', () =>{
        showGame(false)
        shell.openExternal(updateUrl)
        app.exit(0)
    })

    splashWindow.on('close', ()=>{
        if(!closedByApp){
            app.exit(0)
        }
    })
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

ipcMain.on('open_settings', ()=>{createNewWindow('/windows/settings/preload.js','/windows/settings/index.html', false)})
ipcMain.on('open_accountmgr', ()=>{createNewWindow('/windows/accounts/accounts.js','/windows/accounts/accounts.html', false)})
ipcMain.on('open_csswindow', ()=>{createNewWindow('/windows/css/css.js','/windows/css/css.html', false, 820, 660, false, true)})
ipcMain.on('open_pluginswindow', ()=>{createNewWindow('/windows/plugin/plugins.js','/windows/plugin/plugin.html', false, 820, 660, false, true)})

function createNewWindow(preload, main, webtools, width, height, frame, addCloseIPCEvent) {
    let addFrame = true 
    if(frame === false){addFrame = false}

    const newWin = new BrowserWindow({
        width: width||540,
        height: height||620,
        show: false,
        frame: addFrame,
        webPreferences: {
            preload: path.join(__dirname, preload)
        }
    })
    newWin.loadFile(path.join(__dirname, main))
    newWin.once('ready-to-show', () => {
        newWin.show()
        if(webtools) {webToolsDebug(newWin)}
    })
    if(addCloseIPCEvent === true){
        ipcMain.on('close-me', () =>{
            if(!newWin.isDestroyed()){
                newWin.destroy()
            }
        })
    }
    newWin.webContents.on('new-window', (e, url) => {
        e.preventDefault()
        shell.openExternal(url)
    })
    return newWin
}

function webToolsDebug(mainWindow) {
    const devtools = new BrowserWindow()
    mainWindow.webContents.setDevToolsWebContents(devtools.webContents)
    mainWindow.webContents.openDevTools({ mode: 'detach' })
    mainWindow.webContents.once('did-finish-load', function () {
        let windowBounds = mainWindow.getBounds()
        devtools.setPosition(windowBounds.x + windowBounds.width, windowBounds.y)
        devtools.setSize(windowBounds.width / 2, windowBounds.height)
    })
    mainWindow.on('move', function () {
        let windowBounds = mainWindow.getBounds()
        devtools.setPosition(windowBounds.x + windowBounds.width, windowBounds.y)
    })
}