(function (dependencies, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(dependencies, factory);
    }
})(["require", "exports"], function (require, exports) {
    "use strict";
    function createParseTree(category, children) {
        if (children === void 0) { children = []; }
        return { category: category, children: children };
    }
    exports.createParseTree = createParseTree;
    function addRightMost(addTo, addMe) {
        addTo.children.push(addMe);
    }
    exports.addRightMost = addRightMost;
});
//# sourceMappingURL=parsetree.js.map