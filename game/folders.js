const path = require('path')
const fs = require('fs')
const settings = require('../windows/settings/settings.js')
let app = null
module.exports.checkForFolders = async(App) => {
    app = App 

    let clientFolderPath = path.join(app.getPath('documents'), "/Radioactive-Client-V2")
    if(!fs.existsSync(clientFolderPath)){
        fs.mkdirSync(clientFolderPath)
        console.log('> Created '+clientFolderPath)
    } else {
        console.log('> '+clientFolderPath+" exists.")
    }
    
    let swapperPath = path.join(clientFolderPath, "/Local-Mod-Files")
    if(!fs.existsSync(swapperPath)){
        fs.mkdirSync(swapperPath)
        console.log('> Created '+swapperPath)
    } else {
        console.log('> '+swapperPath+" exists.")
    }

    let pluginsPath = path.join(clientFolderPath, "/Plugins")
    if(!fs.existsSync(pluginsPath)){
        fs.mkdirSync(pluginsPath)
        console.log('> Created '+pluginsPath)
    } else {
        console.log('> '+pluginsPath+" exists.")
    }
    return true
}
module.exports.getPath = (name) => {
    if(name === "swapper"){
        let clientFolderPath = path.join(app.getPath('documents'), "/Radioactive-Client-V2")
        let swapperPath = path.join(clientFolderPath, "/Local-Mod-Files")
        let tempZipPath = path.join(clientFolderPath, "/ClientLocalModFile.zip")
        return [swapperPath,tempZipPath]
    }
    if(name === "plugins"){    
        return path.join(path.join(app.getPath('documents'), "/Radioactive-Client-V2"), "/Plugins")
    }
}