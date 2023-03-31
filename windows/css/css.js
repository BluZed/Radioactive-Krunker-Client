const manager = require('./cssmanager.js')
const { ipcRenderer } = require('electron')

let cssdataobject = null

window.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.window-btn-close').onclick = () => {
        ipcRenderer.send('close-me')
    }
    document.querySelector('.Reset').onclick = () => {
        manager.unset()
        ipcRenderer.send('get_current_css')
    }
    document.querySelector('.searchbtn').onclick = () => {
        window.alert('Feature coming soon!')
    }
    let csslistholder = document.querySelector('.css-list')
    let startedAt = null
    const addCss = () => {
        if(startedAt === null){startedAt = Date.now()}
        if(cssdataobject != null){
            for (const css of cssdataobject) {
                generateCSSListItem(css,csslistholder).then(btn=>{
                    btn.addEventListener('click', ()=>{
                        manager.set(css.link)
                        ipcRenderer.send('get_current_css')
                    })
                })
            }
        } else {
            if((Date.now()-startedAt) > 11e3){
                window.alert('Error while fetching, please report to the developer.')
            }
            setTimeout(addCss, 100)
        }
    }
    addCss()
})

fetch('https://radioactiveserver.bluzed.repl.co/csslist').then(res=>res.json()).then(res=>{
    cssdataobject=res
})


async function generateCSSListItem(css,holder) {
    let animname = randomString()
    const HTML = `
    <div class="cssList-item">
        <div class="item-name">${css.name}</div>
        <a target="_blank" href="${css.author.link}" class="item-author">${css.author.name}</a>
        <div class="item-actions" style="animation: ${animname} 8s infinite step-end;">
            <div class="action-btns">
                <button class="action-btn-install addcss_${animname}">Add</button>
            </div>
        </div>
    </div>
    <style>
    @keyframes ${animname} {
        0% {
            background-image: url(${css.images[0]});
        }
        50% {
            background-image: url(${css.images[1]});
        } 
        100% {
            background-image: url(${css.images[0]});
        }
    }
    </style>
    `
    holder.insertAdjacentHTML('beforeend',HTML)
    return document.querySelector('.addcss_'+animname)
}

function randomString() {
    const allChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    let toReturn = ''
    for(let i = 0; i < 5; i++){
        toReturn += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
    return toReturn
}