(function (dependencies, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(dependencies, factory);
    }
})(["require", "exports", "../grammar/category", "./chart/state"], function (require, exports) {
    "use strict";
    var category_1 = require("../grammar/category");
    var state_1 = require("./chart/state");
    function scan(tokenPosition, token, sr, stateSets) {
        var changes = [];
        var scanProb = sr.multiplicativeIdentity;
        var statesActiveOnTerminals = stateSets.getStatesActiveOnTerminals(tokenPosition);
        if (statesActiveOnTerminals)
            statesActiveOnTerminals.forEach(function (preScanState) {
                var activeCategory = state_1.getActiveCategory(preScanState);
                if (category_1.isNonTerminal(activeCategory))
                    throw new Error("this is a bug");
                else {
                    if (activeCategory(token)) {
                        var preScanForward = stateSets.getForwardScore(preScanState);
                        var preScanInner = stateSets.getInnerScore(preScanState);
                        var postScanState = stateSets.getOrCreate(tokenPosition + 1, preScanState.ruleStartPosition, state_1.advanceDot(preScanState), preScanState.rule, token);
                        var postScanForward = calculateForwardScore(sr, preScanForward, scanProb);
                        stateSets.setForwardScore(postScanState, postScanForward);
                        var postScanInner = calculateInnerScore(sr, preScanInner, scanProb);
                        stateSets.setInnerScore(postScanState, postScanInner);
                        var viterbiScore = {
                            origin: preScanState,
                            resultingState: postScanState,
                            innerScore: postScanInner
                        };
                        stateSets.setViterbiScore(viterbiScore);
                        changes.push({
                            state: postScanState,
                            viterbi: viterbiScore,
                            inner: postScanInner,
                            forward: postScanForward
                        });
                    }
                }
            });
        return changes;
    }
    exports.scan = scan;
    function calculateInnerScore(sr, previousInner, scanProbability) {
        if (scanProbability === undefined || scanProbability === null)
            return previousInner;
        else
            return sr.times(previousInner, scanProbability);
    }
    function calculateForwardScore(sr, previousStateForwardScore, scanProbability) {
        if (scanProbability === undefined || scanProbability === null)
            return previousStateForwardScore;
        else
            return sr.times(previousStateForwardScore, scanProbability);
    }
});
//# sourceMappingURL=scan.js.map