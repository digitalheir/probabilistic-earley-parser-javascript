(function (dependencies, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(dependencies, factory);
    }
})(["require", "exports", "./state-to-object-map"], function (require, exports) {
    "use strict";
    var state_to_object_map_1 = require("./state-to-object-map");
    var StateIndex = (function () {
        function StateIndex() {
            this.states = new state_to_object_map_1.StateToObjectMap();
        }
        StateIndex.prototype.addState = function (state) {
            if (this.states.hasByState(state))
                throw new Error("State set already contained chart. This is a bug.");
            else
                this.states.putByState(state, state);
        };
        StateIndex.prototype.getState = function (rule, index, ruleStart, ruleDot) {
            if (!this.states.has(rule, index, ruleStart, ruleDot))
                throw new Error("State did not exist. This is a bug.");
            else
                return this.states.get(rule, index, ruleStart, ruleDot);
        };
        StateIndex.prototype.has = function (rule, index, ruleStart, ruleDot) {
            return this.states.has(rule, index, ruleStart, ruleDot);
        };
        return StateIndex;
    }());
    exports.StateIndex = StateIndex;
});
//# sourceMappingURL=state-index.js.map