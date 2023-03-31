const { ipcRenderer } = require('electron')

let plugindataobject = null

window.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.window-btn-close').onclick = () => {
        ipcRenderer.send('close-me')
    }
    document.querySelector('.searchbtn').onclick = () => {
        window.alert('Feature coming soon!')
    }

    let pluginlistholder = document.querySelector('.plugin-list')
    let startedAt = null
    const addPlugins = () => {
        if(startedAt === null){startedAt = Date.now()}
        if(plugindataobject != null){
            for (const plugin of plugindataobject) {
                generatePluginListItem(plugin,pluginlistholder).then(btn=>{
                    btn.addEventListener('click', ()=>{
                        fetch(plugin.fileURL).then(res=>res.text()).then(res=>{
                            ipcRenderer.send('save_plugin', plugin.name, res)
                        })   
                    })
                })
            }
        } else {
            if((Date.now()-startedAt) > 11e3){
                window.alert('Error while fetching, please report to the developer.')
            }
            setTimeout(addPlugins, 100)
        }
    }
    addPlugins()
})

fetch('https://radioactiveserver.bluzed.repl.co/pluginlist').then(res=>res.json()).then(res=>{
    plugindataobject=res
})

async function generatePluginListItem(plugin,holder) {
    let animname = randomString()
    const HTML = `
    <div class="pluginList-item">
        <div class="item-name">${plugin.name}</div>
        <a target="_blank" href="${plugin.author.link}" class="item-author">${plugin.author.name}</a>
        <div class="item-actions" style="animation: ${animname} 8s infinite step-end;">
            <div class="action-btns">
                <button class="action-btn-install addplugin_${animname}">Add</button>
            </div>
        </div>
    </div>
    <style>
    @keyframes ${animname} {
        0% {
            background-image: url(${plugin.images[0]});
        }
        50% {
            background-image: url(${plugin.images[1]});
        } 
        100% {
            background-image: url(${plugin.images[0]});
        }
    }
    </style>
    `
    holder.insertAdjacentHTML('beforeend',HTML)
    return document.querySelector('.addplugin_'+animname)
}

function randomString() {
    const allChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    let toReturn = ''
    for(let i = 0; i < 5; i++){
        toReturn += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
    return toReturn
}

/*
[
{
    name: 'a plugin',
    author: {name:'author', link:'author link'},
    fileURL: "https://pluginsfileurl",
    images:["https://image1","https://image2"]
}
]
*/