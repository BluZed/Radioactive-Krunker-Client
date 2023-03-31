const { ipcRenderer } = require('electron')

// Credit goes to the respective owners
const backgrounds = [
    {
        url:'./bgs/lostworld.webp',
        author:'https://www.reddit.com/user/nick10498/'
    },
    {
        url:'./bgs/oasis.webp',
        author:'https://www.reddit.com/user/nick10498/'
    },
    {
        url:'./bgs/sandstorm.jpg',
        author:'https://www.reddit.com/user/Slymex_/'
    },
    {
        url:'./bgs/evacuation.jpg',
        author:'https://www.reddit.com/user/Slymex_/'
    }
]

window.addEventListener('DOMContentLoaded', () => {
    document.body.style.backgroundImage="url("+backgrounds[parseInt(Math.random()*(backgrounds.length-1))].url+")"

    const state = document.getElementById('stateText')
    const stateHolder = document.getElementById('stateHolder')

    document.querySelector('.setting').onclick = () => { ipcRenderer.send('open_settings') }
    document.querySelector('.accounts').onclick = () => { ipcRenderer.send('open_accountmgr') }
    document.querySelector('.css').onclick = () => { ipcRenderer.send('open_csswindow') }
    document.querySelector('.scripts').onclick = () => { ipcRenderer.send('open_pluginswindow') }

    try {
        let timeout = setTimeout(()=>{
            document.querySelector('.vtext').innerHTML = "Error"
            document.querySelector('.vtext').removeAttribute('style')
        },10e3)
        fetch('https://radioactiveserver.bluzed.repl.co/version/').then((res) => res.json()).then((res) => {
            clearTimeout(timeout)
            ipcRenderer.send("SPLASH_latest_version", JSON.stringify(res))
            document.querySelector('.vtext').innerHTML = res.version
            document.querySelector('.vtext').removeAttribute('style')
            const updateInfoList = document.querySelector('.versionInfoList')
            for (const info of res.changes) {
                updateInfoList.insertAdjacentHTML("beforeend", `<li class="versionListItem">${info}</li>`)
            }
        })
    } catch {
        ipcRenderer.send("SPLASH_latest_version", null)
    }

    const showGameBtn = () => {
        state.innerHTML = "CLICK TO GAME!"
        stateHolder.setAttribute('class', 'gameLoaded')
        stateHolder.onclick = () => { ipcRenderer.send('SPLASH_EXIT') }
    }

    ipcRenderer.on("UPDATE_AVAILABLE", (e, thisv) => {
        const updateBtn = document.querySelector('.updateBtn')
        updateBtn.style.display = "block"
        updateBtn.onclick = () => {
            ipcRenderer.send('START_UPDATE')
        }
        setTimeout(showGameBtn, 1e3)
    })
    ipcRenderer.on("UPDATE_UNAVAILABLE", () => {
        setTimeout(showGameBtn, 1e3)
    })

    // In case the update check fails
    setTimeout(showGameBtn, 10e3)
})