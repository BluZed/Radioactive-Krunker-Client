const { session, protocol } = require("electron")
const AdmZip = require("adm-zip")
const getFolderPath = require('./folders.js').getPath

const createZip = async(folder,outpath) => {
    const zip = new AdmZip()
    zip.addFile("README.txt", Buffer.from("This is a temporary zip that will be loaded into the game on load.", "utf8"))
    zip.addLocalFolder(folder)
    zip.writeZip(outpath)
    return
}

module.exports.setup = async(app) => {
    const [swapperPath,tempZipPath] = getFolderPath('swapper')
    await createZip(swapperPath, tempZipPath)    
    protocol.registerFileProtocol('radioactivelocalmod', (details, callback) => {
        callback(tempZipPath)
    })   
    session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
        if(details.url === "https://user-assets.krunker.io/localmodradioactiveclient/mod.zip"){
            callback({redirectURL: 'radioactivelocalmod://get-mod'})
            return
        }
        callback({})
    }) 
}