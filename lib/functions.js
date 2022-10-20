module.exports = {
    hasProperty(obj, value) {
        return Object.hasOwnProperty.call(obj, value)
    },
    isObject(obj) {
        return Object.prototype.toString.call(obj) === '[object Object]'
    },
    isArray(arr) {
        return arr && arr.constructor === Array
    },
    isStr(str) {
        return typeof str === "string"
    },
    isSassNumber(val) {
        return this.isNumber(val) || /^[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?(ms|s|deg|rad|grad|turn|Hz|kHz|em|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|px|pt|pc|%|dpi|dpcm|dppx)?$/.test(val);
    },
    isNumber(val) {
        return typeof val === 'number'
    },
    isBoolean(val) {
        return typeof val === "boolean";
    },
    isUndefined(val) {
        return typeof val === "undefined";
    },
    isSymbol(val) {
        return typeof val === "symbol";
    },
    isFunction(val) {
        return typeof val === "function";
    },
    getNumber(val) {
        if(this.isNumber(val)) return [val, undefined]
        const unit = val.replace(/\d+/g, '')
        if(val.includes('.')) return [parseFloat(val), unit]
        return [parseInt(val), unit]
    }
}