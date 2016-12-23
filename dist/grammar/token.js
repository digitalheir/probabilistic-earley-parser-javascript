(function (dependencies, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(dependencies, factory);
    }
})(["require", "exports"], function (require, exports) {
    "use strict";
    function from(source) {
        if (!source)
            throw new Error("Source object can't be null for an instantiated token.");
        return { source: source };
    }
    exports.from = from;
});
//# sourceMappingURL=token.js.map