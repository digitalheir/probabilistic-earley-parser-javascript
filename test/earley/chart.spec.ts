import {NonTerminal, isNonTerminal, Category} from "../../src";
import {Rule, isUnitProduction} from "../../src";

import {expect} from "chai";
import {Chart} from "../../src/earley/chart/chart";
import {g} from "../sample-grammar";
import {isPassive, isCompleted, State, isActive, getActiveCategory} from "../../src/earley/chart/state";
import {getOrCreateSet, getOrCreateMap} from "../../src/util";

describe("Chart", () => {
    // ss.getStatesActiveOnNonTerminalWithNonZeroUnitStarScoreToY();
    // ss.getStatesActiveOnNonTerminal();
    // ss.getState();
    // ss.getOrCreate();
    // ss.hasState();
    // ss.has();
    // ss.addState();
    // ss.getCompletedStatesThatAreNotUnitProductions();
    // ss.getCompletedStates();
    // ss.getStatesActiveOnNonTerminals();
    // ss.getStatesActiveOnTerminals();

    it("should index new states correctly", () => {
        // ss.addState()
        // expect(ss.states).to.exist;
        g.rules.forEach((r: Rule<string>, i) => {
            const s: State< number, string> = {
                rule: r,
                ruleStartPosition: 1,
                ruleDotPosition: 1,
                position: 2,
                scannedToken: "state " + i
            };
            expect(ss.has(r, 2, 1, 1)).to.equal(false);
            expect(ss.hasState(s)).to.equal(false);

            const state: State<number, string> =
                ss.getOrCreate(2, 1, 1, r, "state " + i);
            expect(state).to.exist;
            expect(ss.has(r, 2, 1, 1)).to.equal(true);
            expect(ss.hasState(s)).to.equal(true);

            expect(isCompleted(s)).to.equal(r.right.length === 1);
            expect(ss.getCompletedStates(s.position).has(state)).to.equal(isCompleted(state));
            expect(getOrCreateSet(getOrCreateMap(ss.completedStatesFor, (state.position)), r.left).has(state)).to.equal(isCompleted(state));
            expect(getOrCreateSet(ss.completedStatesThatAreNotUnitProductions, (state.position)).has(state)).to.equal(isCompleted(state) && !isUnitProduction(state.rule));

            const activeCategory: Category<string> = getActiveCategory(state);
            expect((ss.getStatesActiveOnNonTerminals(state.position)).has(state)).to.equal(isActive(state) && isNonTerminal(activeCategory));

            const nonZeroScoresToNonTerminals = g.unitStarScores.getNonZeroScoresToNonTerminals(activeCategory);
            if (!!nonZeroScoresToNonTerminals) nonZeroScoresToNonTerminals.forEach((FromNonTerminal: NonTerminal) => expect(getOrCreateSet(getOrCreateMap(ss.nonTerminalActiveAtIWithNonZeroUnitStarToY, (state.position)), FromNonTerminal).has(state)).to.equal(true));

            expect(
                getOrCreateSet(getOrCreateMap(ss.statesActiveOnNonTerminal, activeCategory), state.position)
                    .has(state)
            )
                .to.equal(isActive(state) && isNonTerminal(activeCategory));
            // TODO
            // expect(
            //     getOrCreateMap(ss.statesActiveOnTerminals, state.position)
            //         .has(state)
            // ).to.equal(isActive(state) && !isNonTerminal(activeCategory));
        });

        // readonly byIndex: Map<number, Set<State<S, T>>>;
        // readonly forwardScores: Map<State<S, T>, S>;
        // readonly innerScores: Map<State<S, T>, S>;
        // readonly viterbiScores: Map<State<S, T>, ViterbiScore<T,S>>;

        // console.log(ss);
        // ss.getForwardScore()
    });
    const ss = new Chart(g);
    const ZERO = g.probabilityMapping.ZERO;
    const ONE = g.probabilityMapping.ONE;
    const plus = g.probabilityMapping.semiring.plus;
    const rulesIterator = g.rules.values();
    const r0: Rule<string> = rulesIterator.next().value;
    // const r1: Rule<string> = rulesIterator.next().value;
    it("should handle forward scores correctly", () => {
        const s1: State< number, string> = {
            rule: r0,
            ruleStartPosition: 1,
            ruleDotPosition: 2,
            position: 3,
            scannedToken: "a",
            scannedCategory: r0.right[0]
        };

        const s2: State< number, string> = {
            rule: r0,
            ruleStartPosition: 1,
            ruleDotPosition: 2,
            position: 3,
            scannedToken: "a",
            scannedCategory: r0.right[0]
        };

        // expect(ss.hasForwardScore(s1)).to.equal(false);
        expect(ss.getForwardScore(s2)).to.equal(ZERO);
        ss.addForwardScore(s1, ONE, g.probabilityMapping.semiring);
        // expect(ss.hasForwardScore(s1)).to.equal(true);
        ss.addForwardScore(s2, ONE, g.probabilityMapping.semiring);
        expect(ss.getForwardScore(s1)).to.equal(plus(plus(ZERO, ONE), ONE));
        // expect(ss.hasForwardScore(s1)).to.equal(true);
        ss.setForwardScore(s1, ONE);
        expect(ss.getForwardScore(s2)).to.equal(ONE);
        // expect(ss.hasForwardScore(s1)).to.equal(true);
    });
    it("should handle inner scores correctly", () => {
        const s1: State< number, string> = {
            rule: r0,
            ruleStartPosition: 1,
            ruleDotPosition: 2,
            position: 3,
            scannedToken: "a",
            scannedCategory: r0.right[0]
        };
        const s2: State< number, string> = {
            rule: r0,
            ruleStartPosition: 1,
            ruleDotPosition: 2,
            position: 3,
            scannedToken: "a",
            scannedCategory: r0.right[0]
        };

        // expect(ss.hasForwardScore(s1)).to.equal(false);
        expect(ss.getInnerScore(s1)).to.equal(ZERO);
        ss.setInnerScore(s2, ONE);
        // expect(ss.hasForwardScore(s1)).to.equal(true);
        expect(ss.getForwardScore(s1)).to.equal(ONE);

    });

    it("should handle viterbi scores correctly", () => {
        const s1: State< number, string> = {
            rule: r0,
            ruleStartPosition: 0,
            ruleDotPosition: 0,
            position: 0,
            scannedToken: "b",
            scannedCategory: r0.right[1]
        };
        const s2: State< number, string> = {
            rule: r0,
            ruleStartPosition: 1,
            ruleDotPosition: 2,
            position: 3,
            scannedToken: "a",
            scannedCategory: r0.right[0]
        };

        const viterbiScore = {
            origin: s1,
            resultingState: s2,
            innerScore: ONE
        };

        expect(ss.hasViterbiScore(s1)).to.equal(false);
        expect(ss.hasViterbiScore(s2)).to.equal(false);
        expect(ss.getViterbiScore(s1)).to.equal(undefined);
        ss.setViterbiScore(viterbiScore); // TODO check if viterbiscore is valid?
        expect(ss.getViterbiScore(s2)).to.equal(viterbiScore);

    });

});

describe("State", () => {
    it("isUnitProduction should behave correctly", () => {
        g.rules.forEach((rule: Rule<string>) => {
            if (rule.right.length === 1 && isNonTerminal(rule.right[0]))
                isUnitProduction(rule);
        });
    });

    it("isPassive should behave correctly", () => {
        g.rules.forEach((r: Rule<string>) => {
            expect(isPassive(r, r.right.length)).to.equal(true);
            expect(isPassive(r, r.right.length - 1)).to.equal(false);
            expect(isPassive(r, 0)).to.equal(false);
        });
    });

    it("isCompleted should behave correctly", () => {
        g.rules.forEach((r: Rule<string>) => {
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
