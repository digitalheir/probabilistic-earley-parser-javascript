//noinspection ES6UnusedImports
import {Set, Map} from 'core-js'
import {Rule} from "../grammar/rule";
import {State} from "./state/state";
import {getOrCreateMap} from "../util";

export class StateIndex<SemiringType,TokenType> {
    private states: Map<Rule<TokenType>,
        /*index*/
        Map<number,
            /*rule start*/
            Map<number,
                /*dot position*/
                Map<number,
                    State<SemiringType,TokenType>
                    >
                >
            >
        >;

    constructor() {
        this.states = new Map<Rule<TokenType>,
            /*index*/
            Map<number,
                /*rule start*/
                Map<number,
                    /*dot position*/
                    Map<number,
                        State<SemiringType,TokenType>
                        >
                    >
                >
            >();
    }

    public addState(state: State<SemiringType,TokenType>) {
        const m = getOrCreateMap(getOrCreateMap(getOrCreateMap(this.states,
            state.rule), state.positionInInput), state.ruleStartPosition);
        if (m.has(state.ruleDotPosition)) throw new Error("State set already contained state. This is a bug.");
        m.set(state.ruleDotPosition, state);
    }

    public getState(rule: Rule<TokenType>, index: number, ruleStart: number, ruleDot: number): State<SemiringType,TokenType> {
        const state = getOrCreateMap(getOrCreateMap(getOrCreateMap(this.states,
            rule), index), ruleStart).get(ruleDot);
        if (!state) throw new Error("State did not exist");
        return state;
    }

    public has(rule: Rule<TokenType>, index: number, ruleStart: number, ruleDot: number): boolean {
        if (this.states.has(rule)) {
            const b = this.states.get(rule);
            if (b.has(index)) {
                const c = b.get(index);
                if (c.has(ruleStart)) {
                    const d = c.get(ruleStart);
                    if (d.has(ruleDot))
                        return !!d.get(ruleDot);
                }
            }
        }
        return false;
    }

    // public getRuleStartToDotToState(rule: Rule<T>, index: number): Map<number,Map<number,State<T,E>>> {
    //     return getOrCreateMap(getOrCreateMap(this.states, rule), index);
    // }
    //
    
// private TIntObjectMap<State> getDotPositionToState(int ruleStart, TIntObjectMap<TIntObjectMap<State>> ruleStartToDotToState) {
//     if (!ruleStartToDotToState.containsKey(ruleStart))
//         ruleStartToDotToState.put(ruleStart, new TIntObjectHashMap<>(50));
//     return ruleStartToDotToState.get(ruleStart);
// }

// public TIntObjectMap<State> getDotToState(Rule rule, int index, int ruleStart) {
//     if (!states.containsKey(rule)) states.put(rule, new TIntObjectHashMap<>(30));
//     TIntObjectMap<TIntObjectMap<TIntObjectMap<State>>> iToRest = states.get(rule);
//
//     if (!iToRest.containsKey(index))
//         iToRest.put(index, new TIntObjectHashMap<>(50));
//     TIntObjectMap<TIntObjectMap<State>> ruleStartToDotToState = iToRest.get(index);
//
//     if (!ruleStartToDotToState.containsKey(ruleStart))
//         ruleStartToDotToState.put(ruleStart, new TIntObjectHashMap<>(50));
//     return ruleStartToDotToState.get(ruleStart);
// }
}