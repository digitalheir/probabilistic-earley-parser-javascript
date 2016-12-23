(function (dependencies, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(dependencies, factory);
    }
})(["require", "exports"], function (require, exports) {
    "use strict";
    function isNonTerminal(element) {
        return typeof element === 'string';
    }
    exports.isNonTerminal = isNonTerminal;
});
//# sourceMappingURL=category.js.map