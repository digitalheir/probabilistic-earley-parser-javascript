(function (dependencies, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(dependencies, factory);
    }
})(["require", "exports", "../../util"], function (require, exports) {
    "use strict";
    var util_1 = require("../../util");
    var StateToObjectMap = (function () {
        function StateToObjectMap() {
            this.map = new Map();
        }
        StateToObjectMap.prototype.put = function (rule, position, ruleStartPosition, ruleDotPosition, value) {
            util_1.getOrCreateMap(util_1.getOrCreateMap(util_1.getOrCreateMap(this.map, rule), position), ruleStartPosition).set(ruleDotPosition, value);
        };
        StateToObjectMap.prototype.has = function (rule, position, ruleStartPosition, ruleDotPosition) {
            return util_1.getOrCreateMap(util_1.getOrCreateMap(util_1.getOrCreateMap(this.map, rule), position), ruleStartPosition).has(ruleDotPosition);
        };
        StateToObjectMap.prototype.get = function (rule, position, ruleStartPosition, ruleDotPosition) {
            return util_1.getOrCreateMap(util_1.getOrCreateMap(util_1.getOrCreateMap(this.map, rule), position), ruleStartPosition).get(ruleDotPosition);
        };
        StateToObjectMap.prototype.putByState = function (state, value) {
            this.put(state.rule, state.position, state.ruleStartPosition, state.ruleDotPosition, value);
        };
        StateToObjectMap.prototype.getOrDefault = function (rule, position, ruleStartPosition, ruleDotPosition, _default) {
            if (this.has(rule, position, ruleStartPosition, ruleDotPosition))
                return this.get(rule, position, ruleStartPosition, ruleDotPosition);
            else
                return _default;
        };
        StateToObjectMap.prototype.getByStateOrDefault = function (state, _default) {
            return this.getOrDefault(state.rule, state.position, state.ruleStartPosition, state.ruleDotPosition, _default);
        };
        StateToObjectMap.prototype.getByState = function (state) {
            return this.get(state.rule, state.position, state.ruleStartPosition, state.ruleDotPosition);
        };
        StateToObjectMap.prototype.hasByState = function (state) {
            return this.has(state.rule, state.position, state.ruleStartPosition, state.ruleDotPosition);
        };
        StateToObjectMap.prototype.forEach = function (f) {
            this.map.forEach(function (val, rule) {
                val.forEach(function (val2, position) {
                    val2.forEach(function (val3, start) {
                        val3.forEach(function (object, dot) { return f(position, start, dot, rule, object); });
                    });
                });
            });
        };
        return StateToObjectMap;
    }());
    exports.StateToObjectMap = StateToObjectMap;
});
//# sourceMappingURL=state-to-object-map.js.map