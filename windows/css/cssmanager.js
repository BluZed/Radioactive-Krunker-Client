const storage = require('../settings/settings.js')
let current_css = storage.get('css')
if(current_css != undefined && current_css != null && typeof(current_css) === "string" && current_css.startsWith('https://')){

} else {
    current_css = "unset"
    storage.set('css', 'unset')
}

module.exports.set = (e) => {
    if(typeof(e) === "string" && e.startsWith('https://')){
        storage.set('css', e)
        current_css = e
    }
}

module.exports.unset = () => {
    storage.set('css', 'unset')
    current_css = "unset"
}

module.exports.current = () => {
    return current_css
}