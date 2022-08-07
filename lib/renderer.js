const sass = require("sass")
const fs = require("fs")
const path = require("path")
const { load } = require("js-yaml")

function getOptions(data) {
    options = {}
    if (data.compressed) options.style = "compressed"
    return options
}

function removeQuotes(string) {
    return string.toString().replace(/^['"](.*)["']$/, "$1")
}


function setFunctions(config, data) {
    if (!data.theme) return
    const theme = data[data.theme]
    config.functions = {
        'theme($name)': (args) => {
            const name = removeQuotes(args[0])
            let color = theme[name]
            if(color && color.startsWith("$")) color = theme[color.substring(1)]
            if (!color) throw new Error(`Theme color "${name}" not found in config`)
            return new sass.SassString(color, { quotes: false })
        }
    }
}


module.exports = function (data) {
    const opt = load(fs.readFileSync(path.join(__dirname, "../../../themes", this.config.theme, "_config.yml"), 'utf8')).sass || this.config.sass || {}
    const config = getOptions(opt)
    setFunctions(config, opt)
    return new Promise((resolve, reject) => {
        return sass.compileAsync(data.path, config)
        .then(result => {resolve(result.css)})
        .catch(err => {
            console.log(err)
            reject(err)
        })
    })
}