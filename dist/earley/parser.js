(function (dependencies, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(dependencies, factory);
    }
})(["require", "exports", "../grammar/category", "./chart/viterbi-score", "./chart/chart", "./scan", "./predict", "./complete", "./parsetree"], function (require, exports) {
    "use strict";
    var category_1 = require("../grammar/category");
    var viterbi_score_1 = require("./chart/viterbi-score");
    var chart_1 = require("./chart/chart");
    var scan_1 = require("./scan");
    var predict_1 = require("./predict");
    var complete_1 = require("./complete");
    var parsetree_1 = require("./parsetree");
    function addState(stateSets, index, ruleStartPosition, ruleDotPosition, rule, forward, inner) {
        var state = stateSets.getOrCreate(index, ruleStartPosition, ruleDotPosition, rule);
        stateSets.setInnerScore(state, inner);
        stateSets.setForwardScore(state, forward);
        if (stateSets.hasViterbiScore(state))
            throw new Error("Viterbi score was already set for new chart?!");
        return state;
    }
    function getViterbiParseFromChart(state, chart) {
        switch (state.ruleDotPosition) {
            case 0:
                return { category: state.rule.left, children: [] };
            default:
                var prefixEnd = state.rule.right[state.ruleDotPosition - 1];
                if (!category_1.isNonTerminal(prefixEnd)) {
                    if (!state.scannedToken)
                        throw new Error("Expected chart to be a scanned chart. This is a bug.");
                    var T = getViterbiParseFromChart(chart.getOrCreate(state.position - 1, state.ruleStartPosition, state.ruleDotPosition - 1, state.rule), chart);
                    parsetree_1.addRightMost(T, { token: state.scannedToken, category: state.scannedCategory, children: [] });
                    return T;
                }
                else {
                    var viterbi = chart.getViterbiScore(state);
                    var origin = viterbi.origin;
                    var T = getViterbiParseFromChart(chart.getOrCreate(origin.ruleStartPosition, state.ruleStartPosition, state.ruleDotPosition - 1, state.rule), chart);
                    var Tprime = getViterbiParseFromChart(origin, chart);
                    parsetree_1.addRightMost(T, Tprime);
                    return T;
                }
        }
    }
    exports.getViterbiParseFromChart = getViterbiParseFromChart;
    function parseSentenceIntoChart(Start, grammar, tokens) {
        var stateSets = new chart_1.Chart(grammar);
        var init = addState(stateSets, 0, 0, 0, { left: "<start>", right: [Start], probability: 1.0 }, grammar.probabilityMapping.ONE, grammar.probabilityMapping.ONE);
        var i = 0;
        tokens.forEach(function (token) {
            predict_1.predict(i, grammar, stateSets);
            scan_1.scan(i, token, grammar.probabilityMapping.semiring, stateSets);
            complete_1.complete(i + 1, stateSets, grammar);
            var completedStates = [];
            var completedStatez = stateSets.getCompletedStates(i + 1);
            if (!!completedStatez)
                completedStatez.forEach(function (s) { return completedStates.push(s); });
            completedStates.forEach(function (s) { return viterbi_score_1.setViterbiScores(stateSets, s, new Set(), grammar.probabilityMapping); });
            i++;
        });
        return [stateSets, i, init];
    }
    exports.parseSentenceIntoChart = parseSentenceIntoChart;
    function getViterbiParse(Start, grammar, tokens) {
        var _a = parseSentenceIntoChart(Start, grammar, tokens), chart = _a[0], i = _a[1], init = _a[2];
        var finalState = chart.getOrCreate(tokens.length, 0, init.rule.right.length, init.rule);
        var parseTree = getViterbiParseFromChart(finalState, chart);
        var toProbability = grammar.probabilityMapping.toProbability;
        var finalScore = chart.getViterbiScore(finalState).innerScore;
        return {
            parseTree: parseTree,
            probability: toProbability(finalScore)
        };
    }
    exports.getViterbiParse = getViterbiParse;
});
//# sourceMappingURL=parser.js.map