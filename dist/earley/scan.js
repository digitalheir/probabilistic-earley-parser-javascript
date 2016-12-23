(function (dependencies, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(dependencies, factory);
    }
})(["require", "exports", "../grammar/category", "./state/state"], function (require, exports) {
    "use strict";
    var category_1 = require("../grammar/category");
    var state_1 = require("./state/state");
    function scan(tokenPosition, token, sr, stateSets) {
        var scanProb = sr.multiplicativeIdentity;
        var statesActiveOnTerminals = stateSets.statesActiveOnTerminals.get(tokenPosition);
        if (statesActiveOnTerminals)
            statesActiveOnTerminals.forEach(function (preScanState) {
                var activeCategory = state_1.getActiveCategory(preScanState);
                if (category_1.isNonTerminal(activeCategory))
                    throw new Error("this is a bug");
                else {
                    var isCategory = activeCategory(token);
                    var preScanForward = stateSets.getForwardScore(preScanState);
                    var preScanInner = stateSets.getInnerScore(preScanState);
                    var postScanState = stateSets.getOrCreate(tokenPosition + 1, preScanState.ruleStartPosition, state_1.advanceDot(preScanState), preScanState.rule, token);
                    stateSets.setForwardScore(postScanState, calculateForwardScore(sr, preScanForward, scanProb));
                    var postScanInner = calculateInnerScore(sr, preScanInner, scanProb);
                    stateSets.setInnerScore(postScanState, postScanInner);
                    stateSets.setViterbiScore({
                        origin: preScanState,
                        resultingState: postScanState,
                        innerScore: postScanInner
                    });
                }
            });
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