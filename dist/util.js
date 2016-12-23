(function (dependencies, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(dependencies, factory);
    }
})(["require", "exports", "core-js"], function (require, exports) {
    "use strict";
    var core_js_1 = require("core-js");
    function getOrCreateMap(map, key) {
        if (map.has(key))
            return map.get(key);
        else {
            var yToP = new core_js_1.Map();
            map.set(key, yToP);
            return yToP;
        }
    }
    exports.getOrCreateMap = getOrCreateMap;
    function getOrCreateSet(map, key) {
        if (map.has(key))
            return map.get(key);
        else {
            var yToP = new core_js_1.Set();
            map.set(key, yToP);
            return yToP;
        }
    }
    exports.getOrCreateSet = getOrCreateSet;
});
//# sourceMappingURL=util.js.map