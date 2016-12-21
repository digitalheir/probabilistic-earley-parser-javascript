//noinspection ES6UnusedImports
import {Set, Map} from 'core-js'
import {StateIndex} from "./state-index";
import {Grammar} from "../grammar/grammar";
import {State, isCompleted, isActive, getActiveCategory} from "./state/state";
import {NonTerminal, Terminal, isNonTerminal} from "../grammar/category";
import {Semiring} from "semiring/semiring";
import {getOrCreateSet, getOrCreateMap} from "../util";
import {isUnitProduction, Rule} from "../grammar/rule";
import {ViterbiScore} from "./state/viterbi-score";

export class StateSets<T, S> {
    readonly grammar: Grammar<T,S>;

    readonly states: StateIndex<S,T>;
    readonly byIndex: Map<number, Set<State<S, T>>>;

    /**
     * The forward probability <code>α_i</code> of a state is
     * the sum of the probabilities of
     * all constrained paths of length i that end in that state, do all
     * paths from start to position i. So this includes multiple
     * instances of the same history, which may happen because of recursion.
     */
    readonly forwardScores: Map<State<S, T>, S>;

    /**
     * The inner probability <code>γ_{i}</code> of a state
     * is the sum of the probabilities of all
     * paths of length (i - k) that start at position k (the rule's start position),
     * and end at the current state and generate the input the input symbols up to k.
     * Note that this is conditional on the state happening at position k with
     * a certain non-terminal X
     */
    readonly innerScores: Map<State<S, T>, S>;
    readonly viterbiScores: Map<State<S, T>, ViterbiScore<S,T>>;

    readonly completedStates: Map<number, Set<State<S, T>>>;
    readonly completedStatesFor: Map<number, Map<NonTerminal, Set<State<S, T>>>>;
    readonly completedStatesThatAreNotUnitProductions: Map<number, Set<State<S, T>>>;
    readonly statesActiveOnNonTerminals: Map<number, Set<State<S, T>>>;

    readonly nonTerminalActiveAtIWithNonZeroUnitStarToY: Map<number, Map<NonTerminal, Set<State<S, T>>>>;
    readonly statesActiveOnTerminals: Map<number, Set<State<S, T>>>;
    readonly statesActiveOnNonTerminal: Map<NonTerminal, Map<number, Set<State<S, T>>>>;


    constructor(grammar: Grammar<T,S>) {
        this.states = new StateIndex<S,T>();
        this.grammar = grammar;

        this.forwardScores = new Map<State<S, T>, S>();
        this.innerScores = new Map<State<S, T>, S>();
        this.viterbiScores = new Map<State<S, T>, ViterbiScore<S,T>>();
        this.byIndex = new Map<number, Set<State<S, T>>>();
        this.completedStates = new Map<number, Set<State<S, T>>>();
        this.completedStatesFor = new Map<number, Map<NonTerminal, Set<State<S, T>>>>();
        this.completedStatesThatAreNotUnitProductions = new Map<number, Set<State<S, T>>>();
        this.statesActiveOnNonTerminals = new Map<number, Set<State<S, T>>>();

        this.nonTerminalActiveAtIWithNonZeroUnitStarToY = new Map<number, Map<NonTerminal, Set<State<S, T>>>>();
        this.statesActiveOnTerminals = new Map<number, Set<State<S, T>>>();
        this.statesActiveOnNonTerminal = new Map<NonTerminal, Map<number, Set<State<S, T>>>>();
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

    getStatesActiveOnNonTerminalWithNonZeroUnitStarScoreToY(index: number, Y: NonTerminal): Set<State<S,T>> {
        return getOrCreateSet(getOrCreateMap(this.nonTerminalActiveAtIWithNonZeroUnitStarToY, index), Y);
    }

//
//
// public Set<State> getStatesActiveOnNonTerminal(NonTerminal y, int position, int beforeOrOnPosition) {
//     // stateToAdvance.getPosition() <= beforeOrOnPosition;
//     if (position <= beforeOrOnPosition) {
//         TIntObjectHashMap<Set<State>> setTIntObjectHashMap = statesActiveOnNonTerminal.get(y);
//         if (setTIntObjectHashMap != null && setTIntObjectHashMap.containsKey(position))
//             return setTIntObjectHashMap.get(position);
//     }
//     return Collections.emptySet();
// }
//
// public Set<State> getStatesActiveOnNonTerminals(int index) {
//     if (!statesActiveOnNonTerminals.containsKey(index)) statesActiveOnNonTerminals.put(index, new HashSet<>());
//     return statesActiveOnNonTerminals.get(index);
// }
//
//
// public Set<State> getStatesActiveOnTerminals(int index) {
//     if (!statesActiveOnTerminals.containsKey(index)) statesActiveOnTerminals.put(index, new HashSet<>());
//     return statesActiveOnTerminals.get(index);
// }

    /**
     * Default zero
     *
     * @param s state
     * @return forward score so far
     */
    public getForwardScore(s: State<S, T>): S {
        return this.forwardScores.has(s)
            ? this.forwardScores.get(s)
            : this.grammar.probabilityMapping.ZERO;
    }


    /**
     * Adds state if it does not exist yet
     *
     * @param positionInInput     State position
     * @param ruleStartPosition    Rule start position
     * @param ruleDotPosition  Rule dot position
     * @param rule         State rule
     * @param scannedToken The token that was scanned to create this state
     * @return State specified by parameter. May or may not be in the state table. If not, it is added.
     */
    public getOrCreate(positionInInput: number,
                       ruleStartPosition: number,
                       ruleDotPosition: number,
                       rule: Rule<T>,
                       scannedToken?: T): State<S,T> {
        if (this.states.has(rule, positionInInput, ruleStartPosition, ruleDotPosition)) {
            return this.states.getState(rule, positionInInput, ruleStartPosition, ruleDotPosition);
        } else {
            // Add state if it does not exist yet
            const scannedCategory: Terminal<T> = scannedToken
                ? <Terminal<T>> rule.right[ruleDotPosition - 1]
                : undefined;
            const state: State<S, T> = {
                rule, positionInInput, ruleStartPosition, ruleDotPosition,
                scannedToken: scannedToken,
                scannedCategory
            };
            this.addState(state);
            return state;
        }
    }

    hasState(state: State<S, T>): boolean {
        return this.states.has(state.rule, state.positionInInput, state.ruleStartPosition, state.ruleDotPosition);
    }

    has(rule: Rule<T>, index: number, ruleStart: number, ruleDot: number): boolean {
        return this.states.has(rule, index, ruleStart, ruleDot);
    }

    addState(state: State<S, T>): void {
        this.states.addState(state);

        const position = state.positionInInput;

        getOrCreateSet(this.byIndex, position).add(state);

        if (isCompleted(state)) {
            getOrCreateSet(this.completedStates, position).add(state);
            if (!isUnitProduction(state.rule))
                getOrCreateSet(this.completedStatesThatAreNotUnitProductions, position).add(state);

            getOrCreateSet(getOrCreateMap(this.completedStatesFor,
                state.positionInInput), state.rule.left)
                .add(state);
        }
        if (isActive(state)) {
            const activeCategory = getActiveCategory(state);
            if (isNonTerminal(activeCategory)) {
                getOrCreateSet(getOrCreateMap(this.statesActiveOnNonTerminal,
                    activeCategory), state.positionInInput)
                    .add(state);
                getOrCreateSet(this.statesActiveOnNonTerminals,
                    state.positionInInput)
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
                getOrCreateSet(this.statesActiveOnTerminals, position).add(state);
            }
        }
    }

    addForwardScore(state: State<S,T>, increment: S, semiring: Semiring<S>) {
        this.forwardScores.set(state, semiring.plus(this.getForwardScore(state)/*default zero*/, increment));
    }

// public void addInnerScore(State state, double increment) {
//     innerScores.put(state, semiring.plus(getInnerScore(state)/*default zero*/, increment));
// }
//
    setForwardScore(s: State<S,T>, probability: S) {
        this.forwardScores.set(s, probability);
    }

    setInnerScore(s: State<S,T>, probability: S) {
        this.innerScores.set(s, probability);
    }

    /**
     * @param v viterbi score
     */
    setViterbiScore(v: ViterbiScore<S,T>) {
        this.viterbiScores.set(v.resultingState, v);
    }

    /**
     * Default zero
     *
     * @param s state
     * @return inner score so far
     */
    public getInnerScore(s: State<S, T>): S {
        return this.innerScores.has(s)
            ? this.innerScores.get(s)
            : this.grammar.probabilityMapping.ZERO;
    }

// public Set<State> getStates(int index) {
//     return byIndex.get(index);
// }
//
//
// public void add(State state) {
//     Rule rule = state.getRule();
//     int ruleStart = state.getRuleStartPosition();
//     int index = state.getPosition();
//
//     TIntObjectMap<TIntObjectMap<State>> forRuleStart = states.getRuleStartToDotToState(rule, index);
//     if (!forRuleStart.containsKey(ruleStart)) forRuleStart.put(ruleStart, new TIntObjectHashMap<>(50));
//     TIntObjectMap<State> dotToState = forRuleStart.get(ruleStart);
//
//     addState(dotToState, state);
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
// public int countStates() {
//     //noinspection unchecked
//     return Arrays.stream(byIndex.values(new Set[byIndex.size()]))
//         .mapToInt(Set::size).sum();
// }
//
}