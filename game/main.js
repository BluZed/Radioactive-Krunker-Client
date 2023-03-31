const { ipcRenderer } = require('electron')
window.OffCliV = "Radioactive_Client"
window.log = console.log

ipcRenderer.on('start_plugins', async (e, files) => {
    const plugin_files = JSON.parse(files)
    for (const plugin_file of plugin_files) {
        try {
            const PLUGIN = require(plugin_file)
            if (PLUGIN.info && PLUGIN.setup && PLUGIN.remove && PLUGIN.info.name && PLUGIN.info.desc && PLUGIN.info.version) {
                PLUGIN.setup()
            } else {
                window.alert('Plugin failed to load due to insufficient data - ' + plugin_file)
            }
        } catch (e) {
            window.alert('Plugin failed to load')
        }
    }
})

ipcRenderer.on('current_css', (e, css) => {
    const addThisCSS = () => {
        let clientCssElement = document.querySelector('.client-css-element')
        if (clientCssElement === null) {
            let cssElement = document.createElement('link')
            cssElement.setAttribute('href', css)
            cssElement.setAttribute('rel', 'stylesheet')
            cssElement.setAttribute('class', 'client-css-element')
            document.body.appendChild(cssElement)
        } else {
            if (css != 'unset') {
                clientCssElement.setAttribute('href', css)
            } else {
                clientCssElement.remove()
            }
        }
    }
    const checkIfBodyExistsAndAdd = () => {
        if (document.body && document.body != null) {
            addThisCSS()
        } else {
            setTimeout(checkIfBodyExistsAndAdd, 100)
        }
    }
    checkIfBodyExistsAndAdd()
})

window.addEventListener('DOMContentLoaded', () => {
    let menuTimerFunction = null
    checkForLoadAndDo(() => {
        ipcRenderer.send("game_loading")
        try { document.querySelector('.debugInfo').insertAdjacentHTML('beforeend', `<div id="RadioactiveIcon">☢️</div></style>`) } catch { }

        const playerListTab = window.windows.filter((ar) => { if (ar.label) { return ar.label === "player_list" } })[0]
        const getPlayerListHTML = () => { return playerListTab.genList() }

        // Menu Timer Part
        (function menuTimer() {
            if (menuTimerFunction === null) {
                setTimeout(menuTimer, 100)
            } else if (menuTimerFunction != false && typeof (menuTimerFunction) === "function") {
                setInterval(menuTimerFunction, 1e3)
            }
        })()

        //Alt manager logins
        const menuWindow = document.getElementById('menuWindow')
        document.getElementById('signedOutHeaderBar').addEventListener('click', () => {
            setTimeout(() => {
                menuWindow.innerHTML += `<div class="setHed" id="setHed_local">Saved Accounts</div>`
                let acreqid = randomString()
                ipcRenderer.send('request_accounts_info', acreqid)
                ipcRenderer.on(acreqid, (e, data) => {
                    const accounts = JSON.parse(window.atob(data))
                    if (accounts.length === 0) { menuWindow.innerHTML += `<div class="settName">No accounts added.</div>` }
                    for (const account of accounts) {
                        const loginBtn = addAccountsListItem(account.name)
                        loginBtn.onclick = () => {
                            document.getElementById('accName').value = account.name
                            document.getElementById('accPass').value = account.pass
                            window.loginAcc()
                        }
                    }
                })
            }, 100)
        })
        function addAccountsListItem(name) {
            const element = document.createElement('div')
            element.setAttribute('class', 'settName')
            element.innerHTML = name
            const btn = document.createElement('div')
            btn.setAttribute('class', 'settingsBtn')
            btn.innerHTML = "Login"
            element.appendChild(btn)
            menuWindow.appendChild(element)
            return btn
        }
    })
    const menutimersettingReqId = randomString(5)
    ipcRenderer.send('GAME_get_setting', "menutimerenabled", menutimersettingReqId)
    ipcRenderer.on(menutimersettingReqId, (e, name, value) => {
        if (name === "menutimerenabled") {
            if (value === "true") {
                const instructions = document.getElementById('instructions')
                const timer = document.getElementById('timerVal')
                menuTimerFunction = () => {
                    instructions.innerHTML = timer.innerHTML
                }
            } else {
                menuTimerFunction = "false"
            }
        }
    })

    const localmodsettingreqid = randomString(5)
    ipcRenderer.send('GAME_get_setting', "localmods", localmodsettingreqid)
    ipcRenderer.on(localmodsettingreqid, (e, enabled) => {
        if (enabled != "false") {
            loadLocalMod()
        }
    })

    // client settings tab click 
    const settingBtns = [
        {
            name: "Settings",
            color: "#33aaff",
            onclick: () => { ipcRenderer.send('open_settings') }
        },
        {
            name: "CSS",
            color: "#33aaff",
            onclick: () => { ipcRenderer.send('open_csswindow') }
        },
        {
            name: "Accounts",
            color: "#33aaff",
            onclick: () => { ipcRenderer.send('open_accountmgr') }
        },
        {
            name: "Plugins",
            color: "#33aaff",
            onclick: () => { ipcRenderer.send('open_pluginswindow') }
        }
    ]

    function patchClientSetting() {
        if (window.playSelect != undefined && typeof (window.playSelect) === "function") {
            let oldSelect = window.playSelect
            window.playSelect = (e) => {
                setTimeout(() => {
                    const headerTab = document.querySelector('.setHed')
                    if (headerTab != null && headerTab.innerText.includes('No settings found')) {
                        headerTab.innerHTML = "Radioactive Client V2"
                        headerTab.style.textAlign = "center"
                        const settHolder = document.getElementById('settHolder')
                        for (const settingBtn of settingBtns) {
                            createSettingBtn(settingBtn.name, settingBtn.onclick, settingBtn.color, settHolder)
                        }
                    }
                }, 10)
                return oldSelect(e)
            }
        } else {
            setTimeout(patchClientSetting, 100)
        }
    }
    patchClientSetting()
})

let starttedLoadingLocalModAt = null
function loadLocalMod() {
    if (starttedLoadingLocalModAt === null) { starttedLoadingLocalModAt = Date.now() } // just stopping trying to load mod if game is stuck at initializing/loading
    if ((Date.now - starttedLoadingLocalModAt) > 20e3) { return } // no one should be waiting 20 seconds for game to load

    if (typeof (window.loadUserMod) === "function") {
        window.loadUserMod("☢️ Radioactive Local", "https://user-assets.krunker.io/localmodradioactiveclient/mod.zip", "0000", "BluZed", 1) // idk just the normal function
        window.closWind() // close mod loading window since we dont need it
        window.voteMod() // remove donate and like/unlike buttons
    } else {
        setTimeout(loadLocalMod, 100)
    }
}

function checkForLoadAndDo(callback) {
    const chckr = () => {
        if (window.getComputedStyle(document.getElementById('initLoader')).display === "none") {
            callback()
        } else {
            setTimeout(chckr, 200)
        }
    }
    chckr()
}

function getGameTime() {
    const epoch = window.getGameActivity().time
    let minutes_int = (epoch / 3600 % 1) * 60
    let minutes = Math.floor(minutes_int).toString()
    let seconds = Math.floor((minutes_int % 1) * 60).toString()
    if (minutes.length === 1) { minutes = "0" + minutes }
    if (seconds.length === 1) { seconds = "0" + seconds }
    return minutes + ":" + seconds
}

function randomString() {
    const allChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let toReturn = ''
    for (let i = 0; i < 7; i++) {
        toReturn += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
    return toReturn
}

function createSettingBtn(text, onclick, color, inDiv) {
    const newBtn = document.createElement('div')
    newBtn.setAttribute('class', 'settingsBtn')
    newBtn.setAttribute('style', `
    float: left!important;
    width: 8rem!important;
    padding: 1rem;
    background: ${color};
    border-radius: 1rem;
    `)
    newBtn.innerHTML = text
    newBtn.onclick = () => {
        newBtn.style.background = "#ff68ff"
        onclick()
        setTimeout(() => { newBtn.style.background = color }, 200)
    }
    inDiv.insertAdjacentElement('beforeend', newBtn)
}