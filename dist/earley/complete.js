(function (dependencies, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(dependencies, factory);
    }
})(["require", "exports", "./state/state", "../grammar/rule", "./state/addable-expressions-container", "semiring/abstract-expression/atom"], function (require, exports) {
    "use strict";
    var state_1 = require("./state/state");
    var rule_1 = require("../grammar/rule");
    var addable_expressions_container_1 = require("./state/addable-expressions-container");
    var atom_1 = require("semiring/abstract-expression/atom");
    function completeNoViterbi(position, states, addForwardScores, addInnerScores, grammar, stateSets) {
        var possiblyNewStates;
        states.forEach(function (completedState) {
            var j = completedState.ruleStartPosition;
            var Y = completedState.rule.left;
            var innerScore = stateSets.getInnerScore(completedState);
            var unresolvedCompletedInner = addInnerScores.getOrCreateByState(completedState, new atom_1.Atom(innerScore));
            stateSets.getStatesActiveOnNonTerminalWithNonZeroUnitStarScoreToY(j, Y).forEach(function (stateToAdvance) {
                if (j !== stateToAdvance.position)
                    throw new Error("Index failed. This is a bug.");
                var innerScore2 = stateSets.getInnerScore(stateToAdvance);
                var prevInner = addInnerScores.getOrCreateByState(stateToAdvance, new atom_1.Atom(innerScore2));
                var forwardScore = stateSets.getForwardScore(stateToAdvance);
                var prevForward = addForwardScores.getOrCreateByState(stateToAdvance, new atom_1.Atom(forwardScore));
                var Z = state_1.getActiveCategory(stateToAdvance);
                var probM = grammar.probabilityMapping;
                var unitStarScore = new atom_1.Atom(probM.fromProbability(grammar.getUnitStarScore(Z, Y)));
                var sr = grammar.deferrableSemiring;
                var fw = sr.times(unitStarScore, sr.times(prevForward, unresolvedCompletedInner));
                var inner = sr.times(unitStarScore, sr.times(prevInner, unresolvedCompletedInner));
                var newStateRule = stateToAdvance.rule;
                var newStateDotPosition = state_1.advanceDot(stateToAdvance);
                var newStateRuleStart = stateToAdvance.ruleStartPosition;
                addForwardScores.add(newStateRule, position, newStateRuleStart, newStateDotPosition, fw);
                if (state_1.isPassive(newStateRule, newStateDotPosition)
                    && !rule_1.isUnitProduction(newStateRule)
                    && !stateSets.has(newStateRule, position, newStateRuleStart, newStateDotPosition)) {
                    if (!possiblyNewStates)
                        possiblyNewStates = new addable_expressions_container_1.DeferredStateScoreComputations(sr);
                    possiblyNewStates.add(newStateRule, position, newStateRuleStart, newStateDotPosition, fw);
                }
                addInnerScores.add(newStateRule, position, newStateRuleStart, newStateDotPosition, inner);
            });
        });
        if (!!possiblyNewStates) {
            var newCompletedStates_1 = new Set();
            possiblyNewStates.forEach(function (index, ruleStart, dot, rule, score) {
                var state = stateSets.getOrCreate(index, ruleStart, dot, rule);
                if (!state_1.isCompleted(state) || rule_1.isUnitProduction(state.rule))
                    throw new Error("Unexpected state found in possible new states. This is a bug.");
                newCompletedStates_1.add(state);
            });
            if (newCompletedStates_1 != null && newCompletedStates_1.size > 0) {
                completeNoViterbi(position, newCompletedStates_1, addForwardScores, addInnerScores, grammar, stateSets);
            }
        }
    }
    function complete(i, stateSets, grammar) {
        var addForwardScores = new addable_expressions_container_1.DeferredStateScoreComputations(grammar.deferrableSemiring);
        var addInnerScores = new addable_expressions_container_1.DeferredStateScoreComputations(grammar.deferrableSemiring);
        var completeOnStates = stateSets.completedStatesThatAreNotUnitProductions.get(i);
        if (!!completeOnStates)
            completeNoViterbi(i, completeOnStates, addForwardScores, addInnerScores, grammar, stateSets);
        addForwardScores.forEach(function (position, ruleStart, dot, rule, score) {
            var state = stateSets.getOrCreate(position, ruleStart, dot, rule);
            stateSets.setForwardScore(state, score.resolve());
        });
        addInnerScores.forEach(function (position, ruleStart, dot, rule, score) {
            var state = stateSets.getOrCreate(position, ruleStart, dot, rule);
            stateSets.setInnerScore(state, score.resolve());
        });
    }
    exports.complete = complete;
});
//# sourceMappingURL=complete.js.map