import {NonTerminal, Terminal, Category} from "../../src/grammar/category";
import {getViterbiParse, ParseTreeWithScore, Grammar} from "../../src/index";

import * as Mocha from 'mocha'
import {expect} from 'chai';
import {scan} from "../../src/earley/scan";
import {LogSemiring} from "semiring";
import {ss} from "./state-set.spec";
import {Chart} from "../../src/earley/state/chart";
import {g, A} from "../sample-grammar";
import {parseSentenceIntoChart} from "../../src/earley/parser";

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
    it('should parse the man chase the man with a stick', () => {
        const S: NonTerminal = "S";
        const NP: NonTerminal = "NP";
        const VP: NonTerminal = "VP";
        const TV: NonTerminal = "TV";
        const Det: NonTerminal = "Det";
        const N: NonTerminal = "N";
        const Mod: NonTerminal = "Mod";

        // Token types (terminals) are functions that should return true when the parameter is of given type.
        const transitiveVerb: Terminal<string> = (token) => !!token.match(/(hit|chased)/);
        // Some utility terminal types are pre-defined:
        const the: Terminal<string> = (token) => !!token.match(/the/i);
        const a: Terminal<string> = (token) => !!token.match(/a/i);
        const man: Terminal<string> = (token) => !!token.match(/man/);
        const stick: Terminal<string> = (token) => !!token.match(/stick/);
        const with_: Terminal<string> = (token) => !!token.match(/with/);

        const grammar: Grammar<string,number> = Grammar.builder("test")
        //.setSemiring(new LogSemiring()) // If not set, defaults to Log semiring which is probably what you want
            .addNewRule(
                1.0,   // Probability between 0.0 and 1.0, defaults to 1.0. The builder takes care of converting it to the semiring element
                S,     // Left hand side of the rule
                [NP, VP] // Right hand side of the rule
            )
            .addNewRule(
                1.0,
                NP,
                [Det, N] // eg. The man
            )
            .addNewRule(
                1.0,
                NP,
                [Det, N, Mod] // eg. The man (with a stick)
            )
            .addNewRule(
                0.4,
                VP,
                [TV, NP, Mod] // eg. (chased) (the man) (with a stick)
            )
            .addNewRule(
                0.6,
                VP,
                [TV, NP] // eg. (chased) (the man with a stick)
            )
            .addNewRule(1.0, Det, [a])
            .addNewRule(1.0, Det, [the])
            .addNewRule(1.0, N, [man])
            .addNewRule(1.0, N, [stick])
            .addNewRule(1.0, TV, [transitiveVerb])
            .addNewRule(1.0, Mod, [with_, NP]) // eg. with a stick
            .build();

        const tokens = ["The", "man", "chased", "the", "man", "with", "a", "stick"];
        const viterbi: ParseTreeWithScore<string> = getViterbiParse(
            S,
            grammar,
            tokens
        );
        console.log(JSON.stringify(viterbi.parseTree)); // {"category":"<start>","children":[{"category":"S","children":[{"category":"NP","children":[{"category":"Det","children":[{"token":"The","children":[    ]}]},{"category":"N","children":[{"token":"man","children":[]}]}]},{"category":"VP","children":[{"category":"TV","children":[{"token":"chased","children":[]}]},{"category":"NP","children":[{"category":"Det","children":[{"token":"the","children":[]}]},{"category":"N","children":[{"token":"man","c        hildren":[]}]},{"category":"Mod","children":[{"token":"with","children":[]},{"category":"NP","children":[{"category":"Det","children":[{"token":"a",        "children":[]}]},{"category":"N","children":[{"token":"stick","children":[]}]}]}]}]}]}]}]}
        console.log(viterbi.probability); // 0.6
        //Parser.recognize(S, grammar, Tokens.tokenize("the", "stick", "chased", "the", "man"))
    });


it('should parse aaaaa', () => {
        const tokens = ["a", "a", "a", "e"];
        const [chart, i, init] = parseSentenceIntoChart(
            A,
            g,
            tokens
        );

        expect(chart.completedStates.get(tokens.length).has(
            chart.getOrCreate(
                tokens.length, 0, init.rule.right.length, init.rule
            )
        )).to.equal(true);

        console.log(g.probabilityMapping.toProbability(
            chart.viterbiScores.get(chart.getOrCreate(
                tokens.length, 0, init.rule.right.length, init.rule
            )).innerScore));
    });
});
