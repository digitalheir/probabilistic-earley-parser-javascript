(function (dependencies, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(dependencies, factory);
    }
})(["require", "exports", "../../grammar/rule"], function (require, exports) {
    "use strict";
    var rule_1 = require("../../grammar/rule");
    function isCompleted(state) {
        return isPassive(state.rule, state.ruleDotPosition);
    }
    exports.isCompleted = isCompleted;
    function isActive(state) {
        return !isCompleted(state);
    }
    exports.isActive = isActive;
    function getActiveCategory(state) {
        return rule_1.getActiveCategory(state.rule, state.ruleDotPosition);
    }
    exports.getActiveCategory = getActiveCategory;
    function isPassive(rule, dotPosition) {
        if (dotPosition < 0 || dotPosition > rule.right.length)
            rule_1.invalidDotPosition(dotPosition, rule);
        return dotPosition === rule.right.length;
    }
    exports.isPassive = isPassive;
    function advanceDot(s) {
        var position = s.ruleDotPosition;
        if (position < 0 || position > s.rule.right.length)
            throw new Error("illegal position: " + position + ", " + s.rule);
        return position + 1;
    }
    exports.advanceDot = advanceDot;
});
//# sourceMappingURL=state.js.map