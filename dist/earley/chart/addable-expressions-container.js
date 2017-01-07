(function (dependencies, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(dependencies, factory);
    }
})(["require", "exports", "semiring/abstract-expression/atom", "./state-to-object-map"], function (require, exports) {
    "use strict";
    var atom_1 = require("semiring/abstract-expression/atom");
    var state_to_object_map_1 = require("./state-to-object-map");
    var DeferredStateScoreComputations = (function () {
        function DeferredStateScoreComputations(semiring) {
            this.states = new state_to_object_map_1.StateToObjectMap();
            this.semiring = semiring;
            this.ZERO = new atom_1.Atom(this.semiring.additiveIdentity.resolve());
        }
        DeferredStateScoreComputations.prototype.getExpression = function (rule, index, ruleStart, dot) {
            return this.states.get(rule, index, ruleStart, dot);
        };
        DeferredStateScoreComputations.prototype.setScore = function (rule, index, ruleStart, dotPosition, set) {
            this.states.put(rule, index, ruleStart, dotPosition, set);
        };
        DeferredStateScoreComputations.prototype.getOrCreateByState = function (state, defaultValue) {
            if (this.states.hasByState(state)) {
                return this.states.getByState(state);
            }
            else {
                this.states.putByState(state, defaultValue);
                return defaultValue;
            }
        };
        DeferredStateScoreComputations.prototype.getOrCreate = function (rule, index, ruleStart, dotPosition, defaultValue) {
            if (this.states.has(rule, index, ruleStart, dotPosition)) {
                return this.states.get(rule, index, ruleStart, dotPosition);
            }
            else {
                this.states.put(rule, index, ruleStart, dotPosition, defaultValue);
                return defaultValue;
            }
        };
        DeferredStateScoreComputations.prototype.plus = function (rule, index, ruleStart, dotPosition, addValue) {
            var current = this.getOrCreate(rule, index, ruleStart, dotPosition, this.ZERO);
            var newValue = this.semiring.plus(addValue, current);
            this.setScore(rule, index, ruleStart, dotPosition, newValue);
        };
        DeferredStateScoreComputations.prototype.forEach = function (f) {
            this.states.forEach(f);
        };
        return DeferredStateScoreComputations;
    }());
    exports.DeferredStateScoreComputations = DeferredStateScoreComputations;
});
//# sourceMappingURL=addable-expressions-container.js.map