(function (dependencies, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(dependencies, factory);
    }
})(["require", "exports", "./state"], function (require, exports) {
    "use strict";
    var state_1 = require("./state");
    function setViterbiScores(stateSets, completedState, originPathTo, m) {
        var sr = m.semiring;
        var newStates = null;
        var newCompletedStates = null;
        if (!stateSets.hasViterbiScore(completedState))
            throw new Error("Expected Viterbi score to be set on completed chart. This is a bug.");
        var completedViterbi = stateSets
            .getViterbiScore(completedState)
            .innerScore;
        var Y = completedState.rule.left;
        var pos = completedState.position;
        stateSets.getStatesActiveOnNonTerminal(Y, completedState.ruleStartPosition, pos).forEach(function (stateToAdvance) {
            if (stateToAdvance.position > pos || stateToAdvance.position != completedState.ruleStartPosition)
                throw new Error("Index failed. This is a bug.");
            var ruleStart = stateToAdvance.ruleStartPosition;
            var nextDot = state_1.advanceDot(stateToAdvance);
            var rule = stateToAdvance.rule;
            var resultingState = stateSets.getState(rule, pos, ruleStart, nextDot);
            if (!resultingState) {
                resultingState = stateSets.getOrCreate(pos, ruleStart, nextDot, rule);
                if (!newStates)
                    newStates = [];
                newStates.push(resultingState);
            }
            if (originPathTo.has(resultingState))
                throw new Error("This is a bug: Already went past " + resultingState);
            var viterbiScore = stateSets.getViterbiScore(resultingState);
            var prevViterbi = stateSets.getViterbiScore(stateToAdvance);
            var prev = !!prevViterbi ? prevViterbi.innerScore : sr.multiplicativeIdentity;
            var newViterbiScore = {
                innerScore: sr.times(completedViterbi, prev),
                origin: completedState,
                resultingState: resultingState
            };
            if (!viterbiScore
                ||
                    m.toProbability(viterbiScore.innerScore) < m.toProbability(newViterbiScore.innerScore)) {
                stateSets.setViterbiScore(newViterbiScore);
                if (state_1.isCompleted(resultingState)) {
                    if (!newCompletedStates)
                        newCompletedStates = [];
                    newCompletedStates.push(resultingState);
                }
            }
        });
        if (!!newStates)
            newStates.forEach(function (a) { return stateSets.addState(a); });
        if (!!newCompletedStates)
            newCompletedStates.forEach(function (resultingState) {
                var path = new Set(originPathTo);
                path.add(resultingState);
                setViterbiScores(stateSets, resultingState, path, m);
            });
    }
    exports.setViterbiScores = setViterbiScores;
});
//# sourceMappingURL=viterbi-score.js.map