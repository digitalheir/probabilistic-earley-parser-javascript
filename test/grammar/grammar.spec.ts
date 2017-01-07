import {NonTerminal, Terminal} from "../../src/grammar/category";
import {parseSentenceIntoChart,getViterbiParseFromChart} from "../../src/earley/parser";
import {Grammar} from "../../src/grammar/grammar";
import {ParseTree} from  "../../src/earley/parsetree";
import * as Mocha from 'mocha'
import {expect} from 'chai';

import {g, A, B, C, D, X,simpleRecursiveGrammar,S2a,S2SS,p,q,a,S } from "../sample-grammar";

describe('examples from paper', () => {
        const tokens = ["a", "a", "a"];

        const [chart, i, init] = parseSentenceIntoChart(S, simpleRecursiveGrammar, tokens);
        const finalState = chart.getOrCreate(
            tokens.length,
            0,
            init.rule.right.length,
            init.rule
        );
        const parseTree:ParseTree<string> = getViterbiParseFromChart(finalState, chart);

        const prob = simpleRecursiveGrammar.probabilityMapping.toProbability;

        const α = chart.getForwardScore.bind(chart);
        const γ = chart.getInnerScore.bind(chart);

        it('State set 0', () => {
            const s00Sa = chart.getState(S2a, 0, 0, 0);

            expect(prob(α(s00Sa))).to.equal(1.0);
            expect(prob(γ(s00Sa))).to.equal(p);


            const s00SSS = chart.getState(S2SS, 0, 0, 0);

            expect(prob(α(s00SSS))).to.equal(q / p);
            expect(prob(γ(s00SSS))).to.equal(q);


              });

              it('State set 1', () => {

        // scanned
        const s01Sa1  = chart.getState(S2a, 1, 0, 1);
        expect(prob(α(s01Sa1))).to.equal(1);
        expect(prob(γ(s01Sa1))).to.equal(p);

        // completed
        const s01SSS1 = chart.getState(S2SS, 1, 0, 1);

        expect(prob(α(s01SSS1))).to.equal(q);
        expect(prob(γ(s01SSS1))).to.be.above((p * q)-0.000001).and.below((p * q)+0.000001);

        // predicted
        const s11Sa0 = chart.getState(S2a, 1, 1, 0);
        expect(prob(α(s11Sa0))).to.equal(q);
        expect(prob(γ(s11Sa0))).to.equal(p);

        const s11SSS0 = chart.getState(S2SS, 1, 1, 0);
        expect(prob(α(s11SSS0))).to.be.above((Math.pow(q, 2) / p) - 0.0001).and.below((Math.pow(q, 2) / p) + 0.0001);
        expect(prob(γ(s11SSS0))).to.equal(q);

        }); it('State set 2', () => {
        // scanned
        const s12Sa1 = chart.getState(S2a, 2, 1, 1);
        expect(prob(α(s12Sa1))).to.equal(q);
        expect(prob(γ(s12Sa1))).to.equal(p);

        // completed
        const s12SSS1  = chart.getState(S2SS, 2, 1, 1);
        expect(prob(α(s12SSS1))).to.equal(q * q);
        expect(prob(γ(s12SSS1))).to.be.above((p * q)-0.000001).and.below((p * q)+0.000001);

        const s02SSS2 = chart.getState(S2SS, 2, 0, 2);
        expect(prob(α(s02SSS2))).to.be.above((p * q)-0.000001).and.below((p * q)+0.000001);
        expect(prob(γ(s02SSS2))).to.be.above((p*p * q)-0.000001).and.below((p*p * q)+0.000001);

        const s02SSS1 = chart.getState(S2SS, 2, 0, 1);
        expect(prob(α(s02SSS1))).to.be.above((p * q * q) - 0.0001).and.below(((p * q * q) + 0.0001));
        expect(prob(γ(s02SSS1))).to.be.above((p * p * q * q) - 0.0001).and.below(((p * p * q * q) + 0.0001));

        const s02S1 = chart.getState(init.rule, 2, 0, 1);
        expect(prob(α(s02S1))).to.be.above((p * p * q) - 0.0001).and.below(((p * p * q)+0.0001));
        expect(prob(γ(s02S1))).to.be.above((p * p * q) - 0.0001).and.below(((p * p * q)+0.0001));

        // predicted
        const s22S0 = chart.getState(S2a, 2, 2, 0);

        expect(prob(γ(s22S0))).to.equal(p);
        expect(prob(α(s22S0))).to.be.above(((1 + p) * q * q) - 0.00000001).and.below(((1 + p) * q * q) + 0.000000000000001);

        const s22SS0 = chart.getState(S2SS, 2, 2, 0);
        expect(prob(α(s22SS0))).to.be.above(((1 + (1 / p)) * q * q * q) - 0.0001).and.below(((1 + 1 / p) * q * q * q) + 0.0001);
        expect(prob(γ(s22SS0))).to.equal(q);

        }); it('State set 3', () => {
        // scanned
        const s23Sa1 = chart.getState(S2a, 3, 2, 1);
        expect(prob(α(s23Sa1))).to.be.below(((1 + p) * q * q)+0.0001).and.above(((1 + p) * q * q)-0.000001);
        expect(prob(γ(s23Sa1))).to.equal(p);

        // completed
        const s23S1 = chart.getState(S2SS, 3, 2, 1);
        expect(prob(α(s23S1))).to.be.below(((1 + p) * q * q * q) + 0.0001).and.above(((1 + p) * q * q * q) - 0.0001);
        expect(prob(γ(s23S1))).to.be.below((p * q) + 0.0001).and.above((p * q) - 0.0001);

        const s13S2 = chart.getState(S2SS, 3, 1, 2);
        expect(prob(α(s13S2))).to.be.below((p * q * q) + 0.0001).and.above((p * q * q) - 0.0001);
        expect(prob(γ(s13S2))).to.be.below((p * p * q) + 0.0001).and.above((p * p * q) - 0.0001);

        const s13S1 = chart.getState(S2SS, 3, 1, 1);
        expect(prob(α(s13S1))).to.be.above((p * q * q * q)-0.0001).and.below((p * q * q * q)+0.0001);
        expect(prob(γ(s13S1))).to.be.above((p * p * q * q)-0.0001).and.below((p * p * q * q)+0.0001);

        const s03S2 = chart.getState(S2SS, 3, 0, 2);
        expect(prob(α(s03S2))).to.be.above((2 * p * p * q * q) - 0.0001).and.below(((2 * p * p * q * q) + 0.0001));
        expect(prob(γ(s03S2))).to.be.above((2 * p * p * p * q * q) - 0.0001).and.below(((2 * p * p * p * q * q) + 0.0001));

        const s03S1 = chart.getState(S2SS, 3, 0, 1);
        expect(prob(α(s03S1))).to.be.above((2 * p * p * q * q * q) - 0.0001).and.below((2 * p * p * q * q * q) + 0.0001);
        expect(prob(γ(s03S1))).to.be.above((2 * p * p * p * q * q * q) - 0.0001).and.below((2 * p * p * p * q * q * q) + 0.0001);
/*
        const s33S1 =  new State(Rule.create(sr, Category.START, S), 0, 3, 1);
        final Set<State> states3s = chart.getStates(3);
        Assert.assertTrue(states3s.contains(s33S1));
        expect(prob(α(s33S1)), 2 * (Math.pow(p, 3) * Math.pow(q, 2)), 0.0001);
        expect(prob(γ(s33S1)), 2 * (Math.pow(p, 3) * Math.pow(q, 2)), 0.0001);
*/
/*

        for (int j = 0; j <= tokens.size(); j++) {
            chart.getStates(j).forEach(s -> {
                double probFw = sr.toProbability(chart.getForwardScore(s));
                double probInn = sr.toProbability(chart.getInnerScore(s));
                double v = 0.0;
                if (chart.getViterbiScore(s) == null) {
                    //System.out.println();
                } else
                    v = sr.toProbability(chart.getViterbiScore(s).getScore());

                //System.out.println(s + "[" + probFw + "]" + "[" + probInn + "] v: " + v);
            });
        }
            */
        });

    });


describe('grammar', () => {
    it('should calculate all left star values', () => {
        expect(
            g.getLeftStarScore(A, B)
        ).to.be.above(0.999).and.below(1.00001);
        expect(
            g.getLeftStarScore(B, C)
        ).to.be.above(0.4999).and.below(0.500001);
        expect(
            g.getLeftStarScore(B, D)
        ).to.be.above(0.24999).and.below(0.2500001);
        expect(
            g.getLeftStarScore(A, D)
        ).to.be.above(0.24999).and.below(0.2500001);
        expect(
            g.getLeftStarScore(A, X)
        ).to.equal(0.0);
    });

    it('should calculate all left values', () => {
        expect(g.getLeftScore(A, B)).to.be.above(0.9999999).and.below(1.00001);
        expect(g.getLeftScore(A, D)).to.be.above(-0.000001).and.below(0.00001);
        expect(g.getLeftScore(A, X)).to.be.above(-0.000001).and.below(0.00001);
        expect(g.getLeftScore(B, C)).to.be.above(0.4999999).and.below(0.50001);
    });

    it('should calculate unit star values', () => {
        //TODO
    });

    it('should get rules', () => {
        //TODO
        // Set<Rule> setOfrules = new HashSet<>();
        // setOfrules.plus(rule1);
        // setOfrules.plus(rule2);
        // Assert.assertEquals(setOfrules, new HashSet<>(g.getRules(rule1.left)));
        // Assert.assertEquals(setOfrules, new HashSet<>(g.getRules(rule2.left)));
        //
        // setOfrules.clear();
        // setOfrules.plus(rule3);
        // Assert.assertEquals(setOfrules, new HashSet<>(g.getRules(rule3.left)));
    });

    it('should contain rules', () => {
        // TODO
        // Assert.assertTrue(g.containsRules(rule1.left));
        // Assert.assertTrue(g.getRules(rule2.left).contains(rule2));
        // Assert.assertFalse(g.getRules(rule3.left).contains(rule2));

        // Assert.assertEquals(ruleB, Rule.create(sr, 0.5, B, C));
        // Assert.assertEquals(ruleC, Rule.create(sr, 0.5, C, D));
        // Assert.assertEquals(ruleD, ruleD);
        // Assert.assertEquals(ruleE, ruleE);
        // Assert.assertEquals(rule1, rule1);
        // Assert.assertEquals(rule2, rule2);
        // Assert.assertEquals(rule3, rule3);

        // Assert.assertNotEquals(Rule.create(sr, 1.0, X, e), Rule.create(sr, 1.0, A, e));
        // Assert.assertNotEquals(Rule.create(sr, 1.0, X, e), Rule.create(sr, 0.5, X, e));
        // Assert.assertEquals(Rule.create(sr, 1.0, X, e), Rule.create(sr, 1.0, X, e));
    });
});
