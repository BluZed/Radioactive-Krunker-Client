const storage = require('../settings/settings.js')

window.alreadytrying = false

let accounts = getLatestStore()

window.onload = () =>{
    const addBtn = document.querySelector('.add')
    const addWin = document.querySelector('.add-account-window')
    const addCancelBtn = document.querySelector('.input-cancel')
    const addSubmitBtn = document.querySelector('.input-submit')
    const addInputUsername = document.querySelector('.input-name')
    const addInputPass = document.querySelector('.input-pass')
    const addWinStatus = document.querySelector('.status')
    const addResultWin = document.querySelector('.results')
    const addResultName = document.querySelector('.result-name')
    const addResultClan = document.querySelector('.result-clan')
    const addResultCreated = document.querySelector('.result-createdAt')
    const addResultKR = document.querySelector('.result-kr')
    const addAccountConfirmed = document.querySelector('.add-account-confirm')

    addBtn.onclick = () => {
        addWin.removeAttribute('style')
    }
    addCancelBtn.onclick = () => {
        addWin.setAttribute('style','display:none')
    }
    addSubmitBtn.onclick = () => {
        addResultWin.setAttribute('style','display:none')
        addWinStatus.setAttribute('style','display:none')
        if(addInputUsername.value.length > 0 && addInputPass.value.length > 5){
            const username = addInputUsername.value
            const pass = addInputPass.value
            addWinStatus.removeAttribute('style')
            addAccount(username,pass)
            addWin.setAttribute('style','display:none')
            addResultWin.setAttribute('style','display:none')
            addWinStatus.setAttribute('style','display:none')
            addInputUsername.value=""
            addInputPass.value=""
        }
    }

    updateAccounts()
}


function getLatestStore() {
    let unparsed = storage.get('ac')
    if(unparsed != undefined && unparsed != null){
        return JSON.parse(window.atob(unparsed))
    } else {
        const sample = JSON.stringify([])
        storage.set('ac',window.btoa(sample))
        return []
    }
}

function saveAccounts() {
    storage.set('ac',window.btoa(JSON.stringify(accounts)))
}

function addAccount(name,pass){
    for(const account of accounts){
        if(account.name === name){
            return
        }
    }
    if(Array.isArray(accounts)){
        accounts.push({
            "name":name,
            "pass":pass
        })
        saveAccounts()
        updateAccounts()
    } else {
        window.alert('Error while saving account, please reopen this window')
    }
}

function updateAccounts() {
    const accountList = document.querySelector('.accounts-list')
    accountList.innerHTML = ""
    for(const account of accounts){
        createAccountListItem(account.name, ()=>{
            accounts = accounts.filter(e=>{return e.name != account.name})
            saveAccounts()
            updateAccounts()
        }, accountList)
    }
}

function createAccountListItem(name, remove, listElement) {
    listElement.insertAdjacentHTML('beforeend', `
    <div class="list-item">
    <div class="name">${name}</div>
    <div class="options">
        <button class="btn remove">Remove</button>
    </div>
    </div>
    `)
    const allRemove = document.querySelectorAll('.remove')
    allRemove[allRemove.length-1].onclick = remove
}