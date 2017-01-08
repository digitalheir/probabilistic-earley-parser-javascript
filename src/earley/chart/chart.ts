//noinspection ES6UnusedImports
import {Set, Map} from "core-js";
import {StateIndex} from "./state-index";
import {Grammar} from "../../grammar/grammar";
import {State, isCompleted, isActive, getActiveCategory} from "./state";
import {NonTerminal, Terminal, isNonTerminal} from "../../grammar/category";
import {Semiring} from "semiring";
import {getOrCreateSet, getOrCreateMap} from "../../util";
import {isUnitProduction, Rule, invalidDotPosition} from "../../grammar/rule";
import {ViterbiScore} from "./viterbi-score";
import {StateToObjectMap} from "./state-to-object-map";

export class Chart<T, S> {
    readonly grammar: Grammar<T, S>;

    private states = new StateIndex<S, T>();
    private byIndex = new Map<number, Set<State<S, T>>>();

    /**
     * The forward probability <code>α_i</code> of a chart is
     * the sum of the probabilities of
     * all constrained paths of length i that end in that chart, do all
     * paths from start to position i. So this includes multiple
     * instances of the same history, which may happen because of recursion.
     */
    private forwardScores = new StateToObjectMap<T, S>();

    /**
     * The inner probability <code>γ_{i}</code> of a chart
     * is the sum of the probabilities of all
     * paths of length (i - k) that start at position k (the rule's start position),
     * and end at the current chart and generate the input the input symbols up to k.
     * Note that this is conditional on the chart happening at position k with
     * a certain non-terminal X
     */
    private innerScores = new StateToObjectMap<T, S>();
    private viterbiScores = new StateToObjectMap<T, ViterbiScore<S, T>>();

    completedStates = new Map<number, Set<State<S, T>>>();
    completedStatesFor = new Map<number, Map<NonTerminal, Set<State<S, T>>>>();
    completedStatesThatAreNotUnitProductions = new Map<number, Set<State<S, T>>>();
    statesActiveOnNonTerminals = new Map<number, Set<State<S, T>>>();

    nonTerminalActiveAtIWithNonZeroUnitStarToY = new Map<number, Map<NonTerminal, Set<State<S, T>>>>();
    statesActiveOnTerminals = new Map<number, Map<Terminal<T>, Set<State<S, T>>>>();
    statesActiveOnNonTerminal = new Map<NonTerminal, Map<number, Set<State<S, T>>>>();
    private EMPTY_SET: Set<State<S, T>> = new Set<State<S, T>>();


    constructor(grammar: Grammar<T, S>) {
        this.grammar = grammar;
    }

// getCompletedStates(int i, NonTerminal s):Set<State<SemiringType, T>> {
//     Multimap<NonTerminal, State> m = this.completedStatesFor.get(i);
//     if (m != null && m.containsKey(s)) return m.get(s);
//     return Collections.emptySet();
// }
//
// public Set<State> getCompletedStates(int index) {
//     return getCompletedStates(index, true);
// }
//
// public Set<State> getCompletedStatesThatAreNotUnitProductions(int index) {
//     return getCompletedStates(index, false);
// }
//
// public Set<State> getCompletedStates(int index, boolean allowUnitProductions) {
//     if (allowUnitProductions) {
//         if (!completedStates.containsKey(index))
//             completedStates.put(index, new HashSet<>());
//         return completedStates.get(index);
//     } else {
//         if (!completedStatesThatAreNotUnitProductions.containsKey(index))
//             completedStatesThatAreNotUnitProductions.put(index, new HashSet<>());
//         return completedStatesThatAreNotUnitProductions.get(index);
//     }
// }
//

    getStatesActiveOnNonTerminalWithNonZeroUnitStarScoreToY(index: number, Y: NonTerminal): Set<State<S, T>> {
        return getOrCreateSet(getOrCreateMap(this.nonTerminalActiveAtIWithNonZeroUnitStarToY, index), Y);
    }

    getStatesActiveOnNonTerminal(y: NonTerminal, position: number, beforeOrOnPosition: number): Set<State<S, T>> {
        if (position <= beforeOrOnPosition)
            return getOrCreateSet(getOrCreateMap(this.statesActiveOnNonTerminal, y), position);
        else
            throw new Error("Querying position after what we're on?");
    }

    /**
     * Default zero
     *
     * @param s chart
     * @return forward score so far
     */
    public getForwardScore(s: State<S, T>): S {
        return this.forwardScores.getByStateOrDefault(s, this.grammar.probabilityMapping.ZERO);
    }


    addForwardScore(state: State<S, T>, increment: S, semiring: Semiring<S>): S {
        const fw = semiring.plus(this.getForwardScore(state)/*default zero*/, increment);
        this.setForwardScore(
            state,
            fw
        );
        return fw;
    }

    setForwardScore(s: State<S, T>, probability: S) {
        return this.forwardScores.putByState(s, probability);
    }

    //noinspection JSUnusedLocalSymbols
    private hasForwardScore(s: State<S, T>): boolean {
        return this.forwardScores.hasByState(s);
    }

    public  getState(rule: Rule<T>,
                     positionInInput: number,
                     ruleStartPosition: number,
                     ruleDotPosition: number): State<S, T> {
        return this.states.getState(rule, positionInInput, ruleStartPosition, ruleDotPosition);
    }

    /**
     * Adds chart if it does not exist yet
     *
     * @param positionInInput     State position
     * @param ruleStartPosition    Rule start position
     * @param ruleDotPosition  Rule dot position
     * @param rule         State rule
     * @param scannedToken The token that was scanned to create this chart
     * @return State specified by parameter. May or may not be in the chart table. If not, it is added.
     */
    public getOrCreate(positionInInput: number,
                       ruleStartPosition: number,
                       ruleDotPosition: number,
                       rule: Rule<T>,
                       scannedToken?: T): State<S, T> {
        if (this.states.has(rule, positionInInput, ruleStartPosition, ruleDotPosition)) {
            return this.states.getState(rule, positionInInput, ruleStartPosition, ruleDotPosition);
        } else {
            // Add chart if it does not exist yet
            const scannedCategory: Terminal<T> = scannedToken
                ? <Terminal<T>> rule.right[ruleDotPosition - 1]
                : undefined;
            const state: State<S, T> = {
                rule,
                position: positionInInput,
                ruleStartPosition,
                ruleDotPosition,
                scannedToken: scannedToken,
                scannedCategory
            };
            this.addState(state);
            return state;
        }
    }

    hasState(state: State<S, T>): boolean {
        return this.states.has(state.rule, state.position, state.ruleStartPosition, state.ruleDotPosition);
    }

    has(rule: Rule<T>, index: number, ruleStart: number, ruleDot: number): boolean {
        return this.states.has(rule, index, ruleStart, ruleDot);
    }

    addState(state: State<S, T>): void {
        if (state.ruleDotPosition < 0 || state.ruleDotPosition > state.rule.right.length)
            invalidDotPosition(state.ruleDotPosition, state);

        this.states.addState(state);

        const position = state.position;

        getOrCreateSet(this.byIndex, position).add(state);

        if (isCompleted(state)) {
            getOrCreateSet(this.completedStates, position).add(state);
            if (!isUnitProduction(state.rule))
                getOrCreateSet(this.completedStatesThatAreNotUnitProductions, position).add(state);

            getOrCreateSet(getOrCreateMap(this.completedStatesFor,
                state.position), state.rule.left)
                .add(state);
        }
        if (isActive(state)) {
            const activeCategory = getActiveCategory(state);
            if (isNonTerminal(activeCategory)) {
                getOrCreateSet(getOrCreateMap(this.statesActiveOnNonTerminal,
                    activeCategory), state.position)
                    .add(state);
                getOrCreateSet(this.statesActiveOnNonTerminals,
                    state.position)
                    .add(state);

                this.grammar.unitStarScores
                    .getNonZeroScoresToNonTerminals(activeCategory)
                    .forEach((FromNonTerminal: NonTerminal) => {
                        getOrCreateSet(getOrCreateMap(
                            this.nonTerminalActiveAtIWithNonZeroUnitStarToY,
                            position), FromNonTerminal).add(state);
                    });
            } else {
                // activeCategory MUST be terminal
                getOrCreateSet(getOrCreateMap(this.statesActiveOnTerminals, position), activeCategory).add(state);
            }
        }
    }

    setInnerScore(s: State<S, T>, probability: S) {
        this.innerScores.putByState(s, probability);
    }

    /**
     * @param v viterbi score
     */
    setViterbiScore(v: ViterbiScore<S, T>) {
        this.viterbiScores.putByState(v.resultingState, v);
    }

    getViterbiScore(s: State<S, T>): ViterbiScore<S, T> {
        /*if (!this.hasViterbiScore(s))
         throw new Error(
         "Viterbi not available for chart ("
         + s.position + ", " + s.ruleStartPosition + ", " + s.ruleDotPosition
         + ") " + s.rule.left + " -> " + s.rule.right.map(f => f.toString()));
         else */
        return this.viterbiScores.getByState(s);
    }

    hasViterbiScore(s: State<S, T>): boolean {
        return this.viterbiScores.hasByState(s);
    }

    /**
     * Default zero
     *
     * @param s chart
     * @return inner score so far
     */
    public getInnerScore(s: State<S, T>): S {
        return this.innerScores.getByStateOrDefault(s, this.grammar.probabilityMapping.ZERO);
    }

    public getCompletedStatesThatAreNotUnitProductions(position: number) {
        return this.completedStatesThatAreNotUnitProductions.get(position);
    }

    public getCompletedStates(position: number) {
        if (this.completedStates.has(position))
            return this.completedStates.get(position);
        else return this.EMPTY_SET;
    }

    public getStatesActiveOnNonTerminals(index: number) {
        return this.statesActiveOnNonTerminals.get(index);
    }

    public getStatesActiveOnTerminals(index: number, terminal: Terminal<T>) {
        if (this.statesActiveOnTerminals.has(index))
            return this.statesActiveOnTerminals.get(index).get(terminal);
        else
            return undefined;
    }

    // public hasInnerScore(s: State<S, T>): boolean {
    //     let ruleMap = getOrCreateMap(this.innerScores, s.rule);
    //     let posMap = getOrCreateMap(ruleMap, s.position);
    //     let dotMAp = getOrCreateMap(posMap, s.ruleStartPosition);
    //     return dotMAp.has(s.ruleDotPosition);
    // }

// public Set<State> getStatesByIndex(int index) {
//     return byIndex.get(index);
// }
//
//
// public void plus(State chart) {
//     Rule rule = chart.getRule();
//     int ruleStart = chart.getRuleStartPosition();
//     int index = chart.getPosition();
//
//     TIntObjectMap<TIntObjectMap<State>> forRuleStart = states.getRuleStartToDotToState(rule, index);
//     if (!forRuleStart.containsKey(ruleStart)) forRuleStart.put(ruleStart, new TIntObjectHashMap<>(50));
//     TIntObjectMap<State> dotToState = forRuleStart.get(ruleStart);
//
//     addState(dotToState, chart);
// }
//
// public synchronized State getSynchronized(int index, int ruleStart, int ruleDot, Rule rule) {
//     return states.getState(rule, index, ruleStart, ruleDot);
// }
//
// public State get(int index, int ruleStart, int ruleDot, Rule rule) {
//     return states.getState(rule, index, ruleStart, ruleDot);
// }
//
// public countStates():number {
//         return this.states.count();
// }

}