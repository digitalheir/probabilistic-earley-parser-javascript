(function (dependencies, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(dependencies, factory);
    }
})(["require", "exports", "./earley/parser", "./earley/parsetree", "./earley/state/viterbi-score", "./grammar/grammar", "./grammar/category", "./grammar/rule"], function (require, exports) {
    "use strict";
    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    __export(require("./earley/parser"));
    __export(require("./earley/parsetree"));
    __export(require("./earley/state/viterbi-score"));
    __export(require("./grammar/grammar"));
    __export(require("./grammar/category"));
    __export(require("./grammar/rule"));
});
//# sourceMappingURL=index.js.map