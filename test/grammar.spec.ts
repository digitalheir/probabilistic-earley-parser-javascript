import {NonTerminal, Terminal} from "../src/grammar/category";
import {Grammar} from "../src/grammar/grammar";

import * as Mocha from 'mocha'
import {expect} from 'chai';
import {g, A, B, C, D, X} from "./sample-grammar";

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
        // setOfrules.add(rule1);
        // setOfrules.add(rule2);
        // Assert.assertEquals(setOfrules, new HashSet<>(g.getRules(rule1.left)));
        // Assert.assertEquals(setOfrules, new HashSet<>(g.getRules(rule2.left)));
        //
        // setOfrules.clear();
        // setOfrules.add(rule3);
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
