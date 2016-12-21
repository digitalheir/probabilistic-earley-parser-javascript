import {NonTerminal, isNonTerminal, Category} from "../../src/grammar/category";
import {Rule, isUnitProduction} from "../../src/grammar/rule";

import * as Mocha from 'mocha'
import {expect} from 'chai';
import {StateSets} from "../../src/earley/state-sets";
import {g} from "../sample-grammar";
import {isCompleted, State, isActive, getActiveCategory} from "../../src/earley/state/state";
import {getOrCreateSet, getOrCreateMap} from "../../src/util";

export const ss = new StateSets<string, number>(g);

describe('StateSets', () => {
    it('should behave correctly', () => {
        //ss.addState()
        expect(ss.states).to.exist;
        g.rules.forEach((r: Rule<string>, i) => {
            expect(ss.states.has(r, 2, 1, 1)).to.equal(false);

            const state: State<number, string> =
                ss.getOrCreate(2, 1, 1, r, "meme " + i);
            expect(state).to.exist;
            expect(ss.states.has(r, 2, 1, 1)).to.equal(true);

            expect(getOrCreateSet(ss.completedStates, (state.positionInInput)).has(state)).to.equal(isCompleted(state));
            expect(getOrCreateSet(getOrCreateMap(ss.completedStatesFor, (state.positionInInput)), r.left).has(state)).to.equal(isCompleted(state));
            expect(getOrCreateSet(ss.completedStatesThatAreNotUnitProductions, (state.positionInInput)).has(state)).to.equal(isCompleted(state) && !isUnitProduction(state.rule));

            const activeCategory: Category<string> = getActiveCategory(state);
            expect(getOrCreateSet(ss.statesActiveOnNonTerminals, (state.positionInInput)).has(state)).to.equal(isActive(state) && isNonTerminal(activeCategory));

            const nonZeroScoresToNonTerminals = g.unitStarScores.getNonZeroScoresToNonTerminals(activeCategory);
            if (!!nonZeroScoresToNonTerminals) nonZeroScoresToNonTerminals.forEach((FromNonTerminal: NonTerminal) => expect(getOrCreateSet(getOrCreateMap(ss.nonTerminalActiveAtIWithNonZeroUnitStarToY, (state.positionInInput)), FromNonTerminal).has(state)).to.equal(true));

            expect(getOrCreateSet(getOrCreateMap(ss.statesActiveOnNonTerminal, activeCategory), state.positionInInput).has(state)).to.equal(isActive(state) && isNonTerminal(activeCategory));
            expect(getOrCreateSet(ss.statesActiveOnTerminals, state.positionInInput).has(state)).to.equal(isActive(state) && !isNonTerminal(activeCategory));
        });

        //readonly byIndex: Map<number, Set<State<S, T>>>;
        // readonly forwardScores: Map<State<S, T>, S>;
        // readonly innerScores: Map<State<S, T>, S>;
        // readonly viterbiScores: Map<State<S, T>, ViterbiScore<T,S>>;

        //console.log(ss);
        // ss.getForwardScore()
    });
});
