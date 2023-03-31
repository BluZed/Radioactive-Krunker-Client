const fs = require('fs')
const getFolderPath = require('./folders.js').getPath
let pluginsFolder = getFolderPath('plugins')
module.exports = {
    getAllPlugins: async()=>{
        let all = (Array.from(fs.readdirSync(pluginsFolder)).filter(e=>{return e.endsWith('.js')}))
        let withfullpath = []
        for(const e of all){
            withfullpath.push(pluginsFolder+"/"+e)
        }
        return withfullpath
    },
    savePlugin:(name,data)=>{
        fs.writeFileSync(pluginsFolder+"/"+name.replaceAll(' ','')+".js", data)
    }
}
