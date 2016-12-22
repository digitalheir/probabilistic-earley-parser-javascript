import {NonTerminal, Terminal} from "../../src/grammar/category";
import {Grammar} from "../../src/grammar/grammar";

import * as Mocha from 'mocha'
import {expect} from 'chai';
import {scan} from "../../src/earley/scan";
import {LogSemiring} from "semiring";
import {ss} from "./state-set.spec";
import {StateSets} from "../../src/earley/state-sets";
import {g, A} from "../sample-grammar";
import {parseAndCountTokens} from "../../src/earley/parser";

//TODO
describe('parser', () => {
    it('should scan correctly', () => {
        scan(
            0,
            "e",
            LogSemiring,
            ss
        )
    });
    it('should complete correctly', () => {
        // complete(
        //     0,
        //     "e",
        //     LogSemiring,
        //     ss
        // )
    });
    it('should predict correctly', () => {
        // complete(
        //     0,
        //     "e",
        //     LogSemiring,
        //     ss
        // )
    });
    it('should parse', () => {
        const tokens = ["a","a","a","e"];
        const [sets, i, init] = parseAndCountTokens(
            A,
            g,
            tokens
        );

        expect(sets.completedStates.get(tokens.length).has(
            sets.getOrCreate(
                tokens.length, 0, init.rule.right.length, init.rule
            )
        )).to.equal(true);

        console.log(g.probabilityMapping.toProbability(
            sets.viterbiScores.get(sets.getOrCreate(
                tokens.length, 0, init.rule.right.length, init.rule
            )).innerScore));
    });
});
