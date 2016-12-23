(function (dependencies, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(dependencies, factory);
    }
})(["require", "exports", "./category"], function (require, exports) {
    "use strict";
    var category_1 = require("./category");
    function invalidDotPosition(dotPosition, rule) {
        throw new Error("Invalid dot position: " + dotPosition + ", " + JSON.stringify(rule));
    }
    exports.invalidDotPosition = invalidDotPosition;
    function isUnitProduction(rule) {
        return rule.right.length === 1 && category_1.isNonTerminal(rule.right[0]);
    }
    exports.isUnitProduction = isUnitProduction;
    function getActiveCategory(rule, dotPosition) {
        if (dotPosition < 0 || dotPosition > rule.right.length)
            invalidDotPosition(dotPosition, rule.right);
        else if (dotPosition < rule.right.length) {
            var returnValue = rule.right[dotPosition];
            if (!returnValue)
                throw new Error("category did not exist at position " + dotPosition + ": " + returnValue);
            else
                return returnValue;
        }
        else
            return null;
    }
    exports.getActiveCategory = getActiveCategory;
});
//# sourceMappingURL=rule.js.map