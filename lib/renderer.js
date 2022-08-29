const sass = require("sass")
const fs = require("fs")
const path = require("path")
const { load } = require("js-yaml")
const _ = require('./functions')
const {_extend} = require('util')
const crypto = require('crypto')

function getOptions(data) {
    options = {
        sourceMap: !!data.sourceMap
    }
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

function saveFile(file, css){
    fs.writeFile(file, css, err => { if(err) throw new Error(err) })
}

function saveSouceMap(file, source){
    saveFile(file + '.map', source)
}

function addSourceMapPath(css, path, opt){
    const index = path.match(/themes\/.*?\/source\/(.*)/)
    return `${css}\n\n/*# sourceMappingURL=/${index[1]}.map */`
}

function returnCSS(opt, css, path, done){
    const file = addPrefix(path, opt.sass.prefix || '')
    const data = opt.sass.sourceMap ? addSourceMapPath(css, path, opt) : css
    if(opt.sass.save){
        saveFile(file, data)
    }
    done(data)
}

const md5 = data => crypto.createHash('md5').update(data).digest("hex")
let mapHash = ""

module.exports = function (data) {
    const opt = _extend(this.config || {}, load(fs.readFileSync(path.join(__dirname, "../../../themes", this.config.theme, "_config.yml"), 'utf8')) || {})
    const config = getOptions(opt.sass)
    setFunctions(config, opt)
    return new Promise((resolve, reject) => {
        return sass.compileAsync(data.path, config)
        .then(result => {
            if(opt.sass.sourceMap) {
                const hash = md5(Buffer.from(JSON.stringify(result.sourceMap)))
                if(hash !== mapHash){
                    mapHash = hash
                    saveSouceMap(data.path, JSON.stringify(result.sourceMap))
                }
            }
            
            if(opt.sass.autoprefixer){
                const postcss = require('postcss')
                const autoprefixer = require('autoprefixer')
                return postcss([autoprefixer]).process(result.css).then(r=>{
                    returnCSS(opt, r.css, data.path, resolve)
                })
            }
            returnCSS(opt, result.css, data.path, resolve)
        })
        .catch(err => {
            console.log(err)
            reject(err)
        })
    })
}