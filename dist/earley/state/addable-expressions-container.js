(function (dependencies, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(dependencies, factory);
    }
})(["require", "exports", "../../util", "semiring/abstract-expression/atom"], function (require, exports) {
    "use strict";
    var util_1 = require("../../util");
    var atom_1 = require("semiring/abstract-expression/atom");
    var DeferredStateScoreComputations = (function () {
        function DeferredStateScoreComputations(semiring) {
            this.states = new Map();
            this.semiring = semiring;
            this.ZERO = new atom_1.Atom(this.semiring.additiveIdentity.resolve());
        }
        DeferredStateScoreComputations.prototype.getExpression = function (rule, index, ruleStart, dot) {
            if (this.states.has(rule)) {
                var b = this.states.get(rule);
                if (b.has(index)) {
                    var c = b.get(index);
                    if (c.has(ruleStart)) {
                        var d = c.get(ruleStart);
                        if (d.has(dot))
                            return d.get(dot);
                    }
                }
            }
            return undefined;
        };
        DeferredStateScoreComputations.prototype.getExpressionByState = function (state) {
            return this.getExpression(state.rule, state.position, state.ruleStartPosition, state.ruleDotPosition);
        };
        DeferredStateScoreComputations.prototype.setScore = function (rule, index, ruleStart, dotPosition, set) {
            util_1.getOrCreateMap(util_1.getOrCreateMap(util_1.getOrCreateMap(this.states, rule), index), ruleStart).set(dotPosition, set);
        };
        DeferredStateScoreComputations.prototype.getOrCreateByState = function (state, defaultValue) {
            var exp = this.getExpressionByState(state);
            if (!exp) {
                this.setScoreForState(state, defaultValue);
                return defaultValue;
            }
            else
                return exp;
        };
        DeferredStateScoreComputations.prototype.getOrCreate = function (rule, index, ruleStart, dotPosition, defaultValue) {
            var exp = this.getExpression(rule, index, ruleStart, dotPosition);
            if (!exp) {
                this.setScore(rule, index, ruleStart, dotPosition, defaultValue);
                return defaultValue;
            }
            else
                return exp;
        };
        DeferredStateScoreComputations.prototype.setScoreForState = function (state, expression) {
            this.setScore(state.rule, state.position, state.ruleStartPosition, state.ruleDotPosition, expression);
        };
        DeferredStateScoreComputations.prototype.add = function (rule, index, ruleStart, dotPosition, addValue) {
            var current = this.getOrCreate(rule, index, ruleStart, dotPosition, this.ZERO);
            var newValue = this.semiring.plus(addValue, current);
            this.setScore(rule, index, ruleStart, dotPosition, newValue);
        };
        DeferredStateScoreComputations.prototype.forEach = function (f) {
            this.states.forEach(function (val, rule) {
                val.forEach(function (val2, position) {
                    val2.forEach(function (val3, start) {
                        val3.forEach(function (score, dot) { return f(position, start, dot, rule, score); });
                    });
                });
            });
        };
        return DeferredStateScoreComputations;
    }());
    exports.DeferredStateScoreComputations = DeferredStateScoreComputations;
});
//# sourceMappingURL=addable-expressions-container.js.map