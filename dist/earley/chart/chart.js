(function (dependencies, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(dependencies, factory);
    }
})(["require", "exports", "core-js", "./state-index", "./state", "../../grammar/category", "../../util", "../../grammar/rule", "./state-to-object-map"], function (require, exports) {
    "use strict";
    var core_js_1 = require("core-js");
    var state_index_1 = require("./state-index");
    var state_1 = require("./state");
    var category_1 = require("../../grammar/category");
    var util_1 = require("../../util");
    var rule_1 = require("../../grammar/rule");
    var state_to_object_map_1 = require("./state-to-object-map");
    var Chart = (function () {
        function Chart(grammar) {
            this.EMPTY_SET = new core_js_1.Set();
            this.states = new state_index_1.StateIndex();
            this.grammar = grammar;
            this.forwardScores = new state_to_object_map_1.StateToObjectMap();
            this.innerScores = new state_to_object_map_1.StateToObjectMap();
            this.viterbiScores = new state_to_object_map_1.StateToObjectMap();
            this.byIndex = new core_js_1.Map();
            this.completedStates = new core_js_1.Map();
            this.completedStatesFor = new core_js_1.Map();
            this.completedStatesThatAreNotUnitProductions = new core_js_1.Map();
            this.statesActiveOnNonTerminals = new core_js_1.Map();
            this.nonTerminalActiveAtIWithNonZeroUnitStarToY = new core_js_1.Map();
            this.statesActiveOnTerminals = new core_js_1.Map();
            this.statesActiveOnNonTerminal = new core_js_1.Map();
        }
        Chart.prototype.getStatesActiveOnNonTerminalWithNonZeroUnitStarScoreToY = function (index, Y) {
            return util_1.getOrCreateSet(util_1.getOrCreateMap(this.nonTerminalActiveAtIWithNonZeroUnitStarToY, index), Y);
        };
        Chart.prototype.getStatesActiveOnNonTerminal = function (y, position, beforeOrOnPosition) {
            if (position <= beforeOrOnPosition)
                return util_1.getOrCreateSet(util_1.getOrCreateMap(this.statesActiveOnNonTerminal, y), position);
            else
                throw new Error("Querying position after what we're on?");
        };
        Chart.prototype.getForwardScore = function (s) {
            return this.forwardScores.getByStateOrDefault(s, this.grammar.probabilityMapping.ZERO);
        };
        Chart.prototype.addForwardScore = function (state, increment, semiring) {
            var theState = state;
            this.setForwardScore(theState, semiring.plus(this.getForwardScore(theState), increment));
        };
        Chart.prototype.setForwardScore = function (s, probability) {
            return this.forwardScores.putByState(s, probability);
        };
        Chart.prototype.hasForwardScore = function (s) {
            return this.forwardScores.hasByState(s);
        };
        Chart.prototype.getState = function (rule, positionInInput, ruleStartPosition, ruleDotPosition) {
            return this.states.getState(rule, positionInInput, ruleStartPosition, ruleDotPosition);
        };
        Chart.prototype.getOrCreate = function (positionInInput, ruleStartPosition, ruleDotPosition, rule, scannedToken) {
            if (this.states.has(rule, positionInInput, ruleStartPosition, ruleDotPosition)) {
                return this.states.getState(rule, positionInInput, ruleStartPosition, ruleDotPosition);
            }
            else {
                var scannedCategory = scannedToken
                    ? rule.right[ruleDotPosition - 1]
                    : undefined;
                var state = {
                    rule: rule,
                    position: positionInInput,
                    ruleStartPosition: ruleStartPosition,
                    ruleDotPosition: ruleDotPosition,
                    scannedToken: scannedToken,
                    scannedCategory: scannedCategory
                };
                this.addState(state);
                return state;
            }
        };
        Chart.prototype.hasState = function (state) {
            return this.states.has(state.rule, state.position, state.ruleStartPosition, state.ruleDotPosition);
        };
        Chart.prototype.has = function (rule, index, ruleStart, ruleDot) {
            return this.states.has(rule, index, ruleStart, ruleDot);
        };
        Chart.prototype.addState = function (state) {
            var _this = this;
            if (state.ruleDotPosition < 0 || state.ruleDotPosition > state.rule.right.length)
                rule_1.invalidDotPosition(state.ruleDotPosition, state);
            this.states.addState(state);
            var position = state.position;
            util_1.getOrCreateSet(this.byIndex, position).add(state);
            if (state_1.isCompleted(state)) {
                util_1.getOrCreateSet(this.completedStates, position).add(state);
                if (!rule_1.isUnitProduction(state.rule))
                    util_1.getOrCreateSet(this.completedStatesThatAreNotUnitProductions, position).add(state);
                util_1.getOrCreateSet(util_1.getOrCreateMap(this.completedStatesFor, state.position), state.rule.left)
                    .add(state);
            }
            if (state_1.isActive(state)) {
                var activeCategory = state_1.getActiveCategory(state);
                if (category_1.isNonTerminal(activeCategory)) {
                    util_1.getOrCreateSet(util_1.getOrCreateMap(this.statesActiveOnNonTerminal, activeCategory), state.position)
                        .add(state);
                    util_1.getOrCreateSet(this.statesActiveOnNonTerminals, state.position)
                        .add(state);
                    this.grammar.unitStarScores
                        .getNonZeroScoresToNonTerminals(activeCategory)
                        .forEach(function (FromNonTerminal) {
                        util_1.getOrCreateSet(util_1.getOrCreateMap(_this.nonTerminalActiveAtIWithNonZeroUnitStarToY, position), FromNonTerminal).add(state);
                    });
                }
                else {
                    util_1.getOrCreateSet(this.statesActiveOnTerminals, position).add(state);
                }
            }
        };
        Chart.prototype.setInnerScore = function (s, probability) {
            this.innerScores.putByState(s, probability);
        };
        Chart.prototype.setViterbiScore = function (v) {
            this.viterbiScores.putByState(v.resultingState, v);
        };
        Chart.prototype.getViterbiScore = function (s) {
            return this.viterbiScores.getByState(s);
        };
        Chart.prototype.hasViterbiScore = function (s) {
            return this.viterbiScores.hasByState(s);
        };
        Chart.prototype.getInnerScore = function (s) {
            return this.innerScores.getByStateOrDefault(s, this.grammar.probabilityMapping.ZERO);
        };
        Chart.prototype.getCompletedStatesThatAreNotUnitProductions = function (position) {
            return this.completedStatesThatAreNotUnitProductions.get(position);
        };
        Chart.prototype.getCompletedStates = function (position) {
            if (this.completedStates.has(position))
                return this.completedStates.get(position);
            else
                return this.EMPTY_SET;
        };
        Chart.prototype.getStatesActiveOnNonTerminals = function (index) {
            return this.statesActiveOnNonTerminals.get(index);
        };
        Chart.prototype.getStatesActiveOnTerminals = function (index) {
            return this.statesActiveOnTerminals.get(index);
        };
        return Chart;
    }());
    exports.Chart = Chart;
});
//# sourceMappingURL=chart.js.map