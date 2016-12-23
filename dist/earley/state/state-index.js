(function (dependencies, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(dependencies, factory);
    }
})(["require", "exports", "core-js", "../../util"], function (require, exports) {
    "use strict";
    var core_js_1 = require("core-js");
    var util_1 = require("../../util");
    var StateIndex = (function () {
        function StateIndex() {
            this.states = new core_js_1.Map();
        }
        StateIndex.prototype.addState = function (state) {
            var m = util_1.getOrCreateMap(util_1.getOrCreateMap(util_1.getOrCreateMap(this.states, state.rule), state.position), state.ruleStartPosition);
            if (m.has(state.ruleDotPosition)) {
            }
            else
                m.set(state.ruleDotPosition, state);
        };
        StateIndex.prototype.getState = function (rule, index, ruleStart, ruleDot) {
            var state = util_1.getOrCreateMap(util_1.getOrCreateMap(util_1.getOrCreateMap(this.states, rule), index), ruleStart).get(ruleDot);
            if (!state)
                throw new Error("State did not exist");
            return state;
        };
        StateIndex.prototype.has = function (rule, index, ruleStart, ruleDot) {
            if (this.states.has(rule)) {
                var b = this.states.get(rule);
                if (b.has(index)) {
                    var c = b.get(index);
                    if (c.has(ruleStart)) {
                        var d = c.get(ruleStart);
                        if (d.has(ruleDot))
                            return !!d.get(ruleDot);
                    }
                }
            }
            return false;
        };
        return StateIndex;
    }());
    exports.StateIndex = StateIndex;
});
//# sourceMappingURL=state-index.js.map