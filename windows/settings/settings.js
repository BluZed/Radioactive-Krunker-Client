const Store = require('electron-store')
const store = new Store()

const default_settings = [
    {
        tabName: "Client",
        settings: [
            {
                "name":"Disable frame rate limit",
                "id":"disableFrameRateLimit",
                "value": "true",
                "type":"checkbox"
            },
            {
                "name":"Enable Performance flags",
                "id":"perfflags",
                "value": "true",
                "type":"checkbox"
            },
            {
                "name":"Start Fullscreen",
                "id":"fullscreen",
                "value": "false",
                "type":"checkbox"
            }
        ]
    },
    {
        tabName: "Game",
        settings: [
            {
                "name":"Enable Menu Timer",
                "id":"menutimerenabled",
                "value": "true",
                "type":"checkbox"
            },
            {
                "name": "Enable Local Mods",
                "id":"localmods",
                "value": "true",
                "type":"checkbox"
            },
            {
                "name": "Enable Plugins",
                "id":"pluginsenabled",
                "value": "true",
                "type":"checkbox"
            }
        ]
    }
]

function getAllSettings() {
    let settings = {}
    for(const tab of default_settings){
        for(const setting of tab.settings){
            settings[setting.id] = setting.value
        }
    }
    return settings
}

async function checkForDefaults() {
    const settings_obj = getAllSettings()
    const setting_ids = Object.keys(settings_obj)
    const setting_vals = Object.values(settings_obj)
    for(const setting of setting_ids){
        if(store.get(setting) === undefined){
            store.set(setting, setting_vals[setting_ids.indexOf(setting)])
            console.log('Settings => '+setting+" reset successfully.")
        }
    }
    return
}

async function reset() {
    const settings_obj = getAllSettings()
    const setting_ids = Object.keys(settings_obj)
    const setting_vals = Object.values(settings_obj)
    for(const setting of setting_ids){
        store.set(setting, setting_vals[setting_ids.indexOf(setting)])
        console.log('Settings => '+setting+" reset successfully.")
    }
    return
}

module.exports = {
    set: (k,v)=>{store.set(k,v);console.log(k+" set as "+v)},
    get: (k)=>{return store.get(k)},
    reset: reset,
    checkForDefaults: checkForDefaults,
    clear: ()=>{store.clear()},
    defaults: default_settings
}