(function (dependencies, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(dependencies, factory);
    }
})(["require", "exports", "core-js", "./category", "./left-corner", "semiring"], function (require, exports) {
    "use strict";
    var core_js_1 = require("core-js");
    var category_1 = require("./category");
    var left_corner_1 = require("./left-corner");
    var semiring_1 = require("semiring");
    function getOrCreateSet(map, x) {
        if (map.has(x))
            return map.get(x);
        else {
            var yToP = new core_js_1.Set();
            map.set(x, yToP);
            return yToP;
        }
    }
    var Grammar = (function () {
        function Grammar(name, ruleMap, probabilityMapping) {
            var _this = this;
            this.name = name;
            this.ruleMap = ruleMap;
            this.nonTerminals = new core_js_1.Set();
            this.rules = new core_js_1.Set();
            this.probabilityMapping = probabilityMapping;
            this.deferrableSemiring = semiring_1.makeDeferrable(probabilityMapping.semiring);
            var values = ruleMap.values();
            var done = false;
            while (!done) {
                var next = values.next();
                done = next.done;
                if (!done) {
                    var rulez = next.value;
                    rulez.forEach(function (rule) {
                        _this.rules.add(rule);
                        _this.nonTerminals.add(rule.left);
                        rule.right.filter(category_1.isNonTerminal).forEach(function (a) {
                            return _this.nonTerminals.add(a);
                        });
                    });
                }
            }
            var zero = 0.0;
            this.leftCorners = left_corner_1.getLeftCorners(this.rules, zero);
            this.leftStarCorners = left_corner_1.getReflexiveTransitiveClosure(this.nonTerminals, this.leftCorners, zero);
            this.unitStarScores = left_corner_1.getUnitStarCorners(this.rules, this.nonTerminals, zero);
        }
        Grammar.prototype.getLeftStarScore = function (from, to) {
            return this.leftStarCorners.get(from, to);
        };
        Grammar.prototype.getLeftScore = function (from, to) {
            return this.leftCorners.get(from, to);
        };
        Grammar.prototype.getUnitStarScore = function (from, to) {
            return this.unitStarScores.get(from, to);
        };
        Grammar.withSemiring = function (semiringMapping, name) {
            return new GrammarBuilder(semiringMapping, name);
        };
        Grammar.builder = function (name) {
            return new GrammarBuilder(LOG_SEMIRING, name);
        };
        return Grammar;
    }());
    exports.Grammar = Grammar;
    var LOG_SEMIRING = {
        semiring: semiring_1.LogSemiring,
        fromProbability: function (x) { return -Math.log(x); },
        toProbability: function (x) { return Math.exp(-x); },
        ZERO: semiring_1.LogSemiring.additiveIdentity,
        ONE: semiring_1.LogSemiring.multiplicativeIdentity
    };
    var GrammarBuilder = (function () {
        function GrammarBuilder(semiringMapping, name) {
            this.ruleMap = new core_js_1.Map();
            this.name = name;
            this.semiringMapping = semiringMapping;
        }
        GrammarBuilder.prototype.setSemiringMapping = function (semiringMapping) {
            this.semiringMapping = semiringMapping;
            return this;
        };
        GrammarBuilder.prototype.addNewRule = function (probability, left, right) {
            this.addRule({
                left: left,
                right: right,
                probability: probability
            });
            return this;
        };
        GrammarBuilder.prototype.addRule = function (rule) {
            if (!rule.probability || typeof rule.probability !== 'number')
                throw new Error("Probability not defined: " + rule.probability);
            if (!rule.left)
                throw new Error("Left hand side not defined: " + rule.left);
            if (!rule.right || !rule.right.length || typeof rule.right.length !== 'number' || rule.right.length <= 0)
                throw new Error("Right hand side not defined: " + rule.right);
            if (this.ruleMap.has(rule.left)) {
                this.ruleMap.get(rule.left).forEach(function (rle) {
                    if (rule.right.length === rle.right.length) {
                        for (var i = 0; i < rule.right.length; i++)
                            if (rule.right[i] !== rle.right[i])
                                return;
                        throw new Error("Already added rule " + rule.left + " -> " + rule.right.toString());
                    }
                });
            }
            getOrCreateSet(this.ruleMap, rule.left).add(rule);
        };
        GrammarBuilder.prototype.build = function () {
            return new Grammar(this.name, this.ruleMap, this.semiringMapping);
        };
        return GrammarBuilder;
    }());
    exports.GrammarBuilder = GrammarBuilder;
});
//# sourceMappingURL=grammar.js.map