import {LogSemiring} from "semiring";
import {expect} from 'chai';
import {Chart} from "../../src/earley/chart/chart";
import {simpleRecursiveGrammar as g, S} from "../sample-grammar";
import {parseSentenceIntoChart, addState} from "../../src/earley/parser";
import {scan} from "../../src/earley/scan";
import {predict} from "../../src/earley/predict";
import {complete} from "../../src/earley/complete";

//TODO
describe('parser', () => {
    it('should scan correctly', () => {
        const ss = new Chart(g);
        const init = addState(
            ss, 0, 0, 0,
            {left: "<start>", right: [S], probability: 1.0},
            g.probabilityMapping.ONE,
            g.probabilityMapping.ONE
        );

        const predict0 = predict(0, g, ss);
        predict0.forEach(
            p => {
                expect(p.state.ruleDotPosition).to.equal(0);
                expect(p.state.ruleStartPosition).to.equal(0);
                expect(p.state.position).to.equal(0);
            }
        );
        const scan0 = scan(
            0,
            "a",
            LogSemiring,
            ss
        );
        const complete0 = complete(0,ss,g);
        const predict1 = predict(1, g, ss);
        const scan1 = scan(1, "a",LogSemiring,ss);
        const complete1 = complete(1, ss,g);
        const predict2 = predict(2, g, ss);
        const scan2 = scan(2, "a",LogSemiring,ss);
        const complete2 = complete(2, ss,g);
        const predict3 = predict(3, g, ss);
        const scan3 = scan(3, "a",LogSemiring,ss);
        const complete3 = complete(3, ss,g);

    });
});