(function (dependencies, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(dependencies, factory);
    }
})(["require", "exports", "./state/state", "../grammar/category"], function (require, exports) {
    "use strict";
    var state_1 = require("./state/state");
    var category_1 = require("../grammar/category");
    function predict(index, grammar, stateSets) {
        var statesToPredictOn = stateSets.statesActiveOnNonTerminals.get(index);
        if (statesToPredictOn) {
            var newStates_1 = new Set();
            var probMap_1 = grammar.probabilityMapping;
            var sr_1 = probMap_1.semiring;
            var fromProb_1 = probMap_1.fromProbability;
            statesToPredictOn.forEach(function (statePredecessor) {
                var Z = state_1.getActiveCategory(statePredecessor);
                var prevForward = stateSets.getForwardScore(statePredecessor);
                grammar.leftStarCorners
                    .getNonZeroScores(Z)
                    .forEach(function (Y) {
                    if (category_1.isNonTerminal(Y) && grammar.ruleMap.has(Y))
                        grammar.ruleMap.get(Y).forEach(function (Y_to_v) {
                            var Y = Y_to_v.left;
                            var Y_to_vScore = fromProb_1(Y_to_v.probability);
                            var fw = sr_1.times(prevForward, sr_1.times(fromProb_1(grammar.getLeftStarScore(Z, Y)), Y_to_vScore));
                            if (stateSets.states.has(Y_to_v, index, index, 0)) {
                                var predicted = stateSets.getOrCreate(index, index, 0, Y_to_v);
                                var innerScore = stateSets.getInnerScore(predicted);
                                if (!(Y_to_vScore === innerScore || probMap_1.ZERO === innerScore))
                                    throw new Error(Y_to_vScore + " != " + innerScore);
                                stateSets.addForwardScore(predicted, fw, sr_1);
                                stateSets.setInnerScore(predicted, Y_to_vScore);
                                stateSets.setViterbiScore({
                                    origin: statePredecessor,
                                    resultingState: predicted,
                                    innerScore: Y_to_vScore,
                                });
                            }
                            else {
                                var predicted2 = {
                                    position: index,
                                    ruleStartPosition: index,
                                    ruleDotPosition: 0,
                                    rule: Y_to_v
                                };
                                stateSets.setViterbiScore({
                                    origin: statePredecessor,
                                    resultingState: predicted2,
                                    innerScore: Y_to_vScore,
                                });
                                newStates_1.add({
                                    state: predicted2,
                                    innerScore: Y_to_vScore,
                                    forwardScore: fw,
                                    origin: undefined
                                });
                            }
                        });
                });
            });
            newStates_1.forEach(function (ss) {
                stateSets.addState(ss.state);
                stateSets.addForwardScore(ss.state, ss.forwardScore, sr_1);
                stateSets.setInnerScore(ss.state, ss.innerScore);
            });
        }
    }
    exports.predict = predict;
});
//# sourceMappingURL=predict.js.map