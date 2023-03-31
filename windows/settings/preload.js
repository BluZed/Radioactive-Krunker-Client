const settings = require('./settings.js')

/*
i suck at html and css so i just fix em here :D
*/

window.addEventListener('DOMContentLoaded', () => {
    for(const tab of settings.defaults){
        const newtab = createTab(tab.tabName)
        for(const setting of tab.settings){
            addSetting(newtab,setting)
            if(tab.settings.indexOf(setting) === tab.settings.length-1){
                let all = document.querySelectorAll('.settingsListItem')
                all[all.length-1].style.marginBottom = "2rem"
            }
        }
        
        // last tab open
        if(settings.defaults.indexOf(tab) === settings.defaults.length-1){
            document.querySelector('.headerTabBtn').click()
        }
    }

})

function createTab (title) {
    const tab = document.createElement('div')
    tab.setAttribute('class',"headerTabBtn")
    tab.innerHTML = title
    document.querySelector('.headerMenu').insertAdjacentHTML('beforeend',`<div class="divider"></div>`)
    document.querySelector('.headerMenu').appendChild(tab)
    const tabHolder = document.createElement('div')
    tabHolder.setAttribute('class',"tab") 
    document.querySelector('.settingsHolder').appendChild(tabHolder)
    tab.onclick = () => {
        for (const Tab of document.querySelectorAll('.headerTabBtn')){
            Tab.removeAttribute('class')
            Tab.setAttribute('class','headerTabBtn')
        }
        for (const Tab of document.querySelectorAll('.tab')){
            Tab.style.display = "none"
        }
        tab.setAttribute('class','headerTabBtn open')
        tab.holder.style.display = "block"
    }
    Object.defineProperty(tab, "holder", {
        value: tabHolder,
        writable: false,
        enumerable: false
    })
    return tab
} 

function addSetting (tab, setting) {
    const settingDiv = document.createElement('div')
    settingDiv.setAttribute("class","settingsListItem")
    const settingName = document.createElement('div')
    settingName.setAttribute('class',"settingText")
    settingName.innerHTML = setting.name
    settingDiv.appendChild(settingName)
    const settingInput = document.createElement('input')
    settingInput.setAttribute('class', "settingsInput")
    settingInput.setAttribute('id',setting.id)
    settingDiv.appendChild(settingInput)
    tab.holder.appendChild(settingDiv)
    if(setting.type==="checkbox"){
        settingInput.setAttribute('type', 'checkbox')
        if(settings.get(setting.id)==="true"){settingInput.setAttribute('checked','')}
        settingInput.onclick=()=>{
            const value = (document.getElementById(setting.id).checked).toString()
            settings.set(setting.id,value)
        }
    }
}