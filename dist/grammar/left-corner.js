(function (dependencies, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(dependencies, factory);
    }
})(["require", "exports", "./category", "./rule", "../util", "core-js"], function (require, exports) {
    "use strict";
    var category_1 = require("./category");
    var rule_1 = require("./rule");
    var util_1 = require("../util");
    var core_js_1 = require("core-js");
    function invert(M) {
        if (M.length !== M[0].length)
            throw new Error("Matrix must be square");
        var dim = M.length;
        var I = [];
        var C = [];
        for (var i = 0; i < dim; i += 1) {
            I[I.length] = [];
            C[C.length] = [];
            for (var j = 0; j < dim; j += 1) {
                if (i == j) {
                    I[i][j] = 1;
                }
                else {
                    I[i][j] = 0;
                }
                C[i][j] = M[i][j];
            }
        }
        for (var i = 0; i < dim; i += 1) {
            var e = C[i][i];
            if (e === 0) {
                for (var ii = i + 1; ii < dim; ii += 1) {
                    if (C[ii][i] !== 0) {
                        for (var j = 0; j < dim; j++) {
                            e = C[i][j];
                            C[i][j] = C[ii][j];
                            C[ii][j] = e;
                            e = I[i][j];
                            I[i][j] = I[ii][j];
                            I[ii][j] = e;
                        }
                        break;
                    }
                }
                e = C[i][i];
                if (e == 0)
                    throw new Error("Matrix was not invertable");
            }
            for (var j = 0; j < dim; j++) {
                C[i][j] = C[i][j] / e;
                I[i][j] = I[i][j] / e;
            }
            for (var ii = 0; ii < dim; ii++) {
                if (ii == i) {
                    continue;
                }
                e = C[ii][i];
                for (var j = 0; j < dim; j++) {
                    C[ii][j] -= e * C[i][j];
                    I[ii][j] -= e * I[i][j];
                }
            }
        }
        return I;
    }
    var LeftCorners = (function () {
        function LeftCorners(ZERO) {
            if (ZERO === void 0) { ZERO = 0; }
            this.ZERO = ZERO;
            this.map = new core_js_1.Map();
            this.nonZeroScores = new core_js_1.Map();
            this.nonZeroScoresToNonTerminals = new core_js_1.Map();
        }
        LeftCorners.prototype.add = function (x, y, probability) {
            var newProbability = this.get(x, y) + probability;
            if (!isFinite(newProbability))
                throw new Error("Invalid left-[*]-corner probability: " + newProbability + " for " + x + " -L> " + y + " ... ");
            this.set(x, y, newProbability);
        };
        LeftCorners.prototype.get = function (x, y) {
            if (!this.map)
                throw new Error("Map was not defined");
            var yToP = util_1.getOrCreateMap(this.map, x);
            if (!yToP)
                return this.ZERO;
            else
                return yToP.get(y) || this.ZERO;
        };
        LeftCorners.prototype.set = function (x, y, val) {
            if (val !== this.ZERO) {
                var yToProb = util_1.getOrCreateMap(this.map, x);
                yToProb.set(y, val);
                util_1.getOrCreateSet(this.nonZeroScores, x).add(y);
                if (category_1.isNonTerminal(y))
                    util_1.getOrCreateSet(this.nonZeroScoresToNonTerminals, x).add(y);
            }
        };
        LeftCorners.prototype.getNonZeroScores = function (x) {
            return this.nonZeroScores.get(x);
        };
        LeftCorners.prototype.getNonZeroScoresToNonTerminals = function (x) {
            return this.nonZeroScoresToNonTerminals.get(x);
        };
        return LeftCorners;
    }());
    exports.LeftCorners = LeftCorners;
    function getReflexiveTransitiveClosure(nonTerminals, P, zero) {
        if (zero === void 0) { zero = 0.0; }
        var nonterminalz = [];
        nonTerminals.forEach(function (a) { return nonterminalz.push(a); });
        var R_L_inverse = [];
        for (var row = 0; row < nonterminalz.length; row++) {
            var X = nonterminalz[row];
            R_L_inverse[row] = [];
            for (var col = 0; col < nonterminalz.length; col++) {
                var Y = nonterminalz[col];
                var prob = P.get(X, Y);
                R_L_inverse[row][col] = (row === col ? 1 : 0) - prob;
            }
        }
        var R_L = invert(R_L_inverse);
        var m = new LeftCorners(zero);
        for (var roww = 0; roww < nonterminalz.length; roww++) {
            for (var coll = 0; coll < nonterminalz.length; coll++) {
                m.set(nonterminalz[roww], nonterminalz[coll], R_L[roww][coll]);
            }
        }
        return m;
    }
    exports.getReflexiveTransitiveClosure = getReflexiveTransitiveClosure;
    function getUnitStarCorners(rules, nonTerminals, zero) {
        if (zero === void 0) { zero = 0.0; }
        var P_U = new LeftCorners(zero);
        rules.forEach(function (rule) {
            if (rule_1.isUnitProduction(rule))
                P_U.add(rule.left, rule.right[0], rule.probability);
        });
        return getReflexiveTransitiveClosure(nonTerminals, P_U, zero);
    }
    exports.getUnitStarCorners = getUnitStarCorners;
    function getLeftCorners(rules, ZERO) {
        if (ZERO === void 0) { ZERO = 0.0; }
        var leftCorners = new LeftCorners(ZERO);
        rules.forEach(function (rule) {
            if (rule.right.length > 0 && category_1.isNonTerminal(rule.right[0]))
                leftCorners.add(rule.left, rule.right[0], rule.probability);
        });
        return leftCorners;
    }
    exports.getLeftCorners = getLeftCorners;
});
//# sourceMappingURL=left-corner.js.map