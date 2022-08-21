const sass = require("sass")
const fs = require("fs")
const path = require("path")
const { load } = require("js-yaml")
const _ = require('./functions')

function getOptions(data) {
    options = {}
    if (data.compressed) options.style = "compressed"
    return options
}

function removeQuotes(string) {
    return string.toString().replace(/^['"](.*)["']$/, "$1")
}

function getItem(args, field, cb) {
    const name = removeQuotes(args[0])
    const keys = name.split('.')
    let item = field[keys[0]]
    for(let i = 1; i < keys.length; i++){
        if(typeof item === 'object' && keys[i] in item){
            item = item[keys[i]]
        }else return cb && cb(name)
    }
    if(item === null || _.isUndefined(item)) return sass.sassNull
    if(_.isSassNumber(item)) return sass.SassNumber(..._.getNumber(item))
    if(_.isStr(item)){
        if(item.startsWith("$")) return getItem([item.substring(1)], field, cb)
        return new sass.SassString(item || "none", { quotes: false })
    }
    if(_.isBoolean(item)) return item ? sass.sassTrue : sass.sassFalse
    try{
        return new sass.SassString(item.toString(), { quotes: false })
    }catch(e){
        return new sass.SassString("none", { quotes: false })
    }
}

function setFunctions(config, opt) {
    const data = opt.sass
    config.functions = {
        'theme($name)': (args) => {
            if(!data.theme) throw new Error(`Current theme configure is undefined`)
            return getItem(args, data[data.theme], err => {
                throw new Error(`Theme color "${err}" not found in theme config`)
            })
        },
        'hexo_config($name)': (args) => {
            return getItem(args, opt, err => {
                throw new Error(`"${err}" not found in hexo config`)
            })
        }
    }
}

function addPrefix(path, prefix){
    let index = 0
    for(let i = path.length - 1; i > -1; i--){
        if(path[i] === '/'){
            index = i
            break
        }
    }
    const name = path.substring(index + 1)
    const end = name.split(".")
    end[end.length - 1] = "css"
    return path.substring(0, index + 1) + prefix + end.join(".")
}


module.exports = function (data) {
    const opt = load(fs.readFileSync(path.join(__dirname, "../../../themes", this.config.theme, "_config.yml"), 'utf8')) || this.config || {}
    const config = getOptions(opt.sass)
    setFunctions(config, opt)
    return new Promise((resolve, reject) => {
        return sass.compileAsync(data.path, config)
        .then(result => {
            if(opt.sass.save){
                const file = addPrefix(data.path, opt.sass.prefix || '')
                fs.writeFile(file, result.css, err => { if(err) throw new Error(err) })
            }
            resolve(result.css)
        })
        .catch(err => {
            console.log(err)
            reject(err)
        })
    })
}