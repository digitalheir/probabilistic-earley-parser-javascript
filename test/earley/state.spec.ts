import {NonTerminal, Terminal, isNonTerminal} from "../../src/grammar/category";
import {Grammar} from "../../src/grammar/grammar";
import {Rule, isUnitProduction} from "../../src/grammar/rule";

import * as Mocha from 'mocha'
import {expect} from 'chai';
import {Chart} from "../../src/earley/state/chart";
import {g} from "../sample-grammar";
import {isPassive, isCompleted} from "../../src/earley/state/state";

describe('State', () => {
    it('isUnitProduction should behave correctly', () => {
        const ss = new Chart<string, number>(g);
        //ss.addState()
        expect(ss.states).to.exist;
        g.rules.forEach((rule: Rule<string>, i) => {
            if(rule.right.length === 1 && isNonTerminal(rule.right[0]))
                isUnitProduction(rule);
        });
    });

    it('isPassive should behave correctly', () => {
        const ss = new Chart<string, number>(g);
        //ss.addState()
        expect(ss.states).to.exist;
        g.rules.forEach((r: Rule<string>, i) => {
            expect(isPassive(r, r.right.length)).to.equal(true);
            expect(isPassive(r, r.right.length - 1)).to.equal(false);
            expect(isPassive(r, 0)).to.equal(false);
        });
    });

    it('isCompleted should behave correctly', () => {
        const ss = new Chart<string, number>(g);
        //ss.addState()
        expect(ss.states).to.exist;
        g.rules.forEach((r: Rule<string>, i) => {
            expect(isCompleted({
                rule: r,
                ruleStartPosition: 0,
                ruleDotPosition: r.right.length,
                position: 0
            })).to.equal(true);
            expect(isCompleted({
                rule: r,
                ruleStartPosition: 0,
                ruleDotPosition: 0,
                position: 0
            })).to.equal(false);
            expect(isCompleted({
                rule: r,
                ruleStartPosition: 0,
                ruleDotPosition: r.right.length - 1,
                position: 0
            })).to.equal(false);
        });
    });
});
