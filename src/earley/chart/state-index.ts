// import {Set, Map} from "core-js"
import {Rule} from "../../grammar/rule";
import {State} from "./state";
import {StateToObjectMap} from "./state-to-object-map";

export class StateIndex<SemiringType, TokenType> {
    private states: StateToObjectMap<TokenType, State<SemiringType, TokenType>>;

    constructor() {
        this.states = new StateToObjectMap<TokenType, State<SemiringType, TokenType>>();
    }

    public addState(state: State<SemiringType, TokenType>) {
        if (this.states.hasByState(state))
            throw new Error("State set already contained chart. This is a bug.");
        else
            this.states.putByState(state, state);
    }

    public getState(rule: Rule<TokenType>, index: number, ruleStart: number, ruleDot: number): State<SemiringType, TokenType> {
        if (!this.states.has(rule, index, ruleStart, ruleDot))
            throw new Error("State did not exist. This is a bug.");
        else
            return this.states.get(rule, index, ruleStart, ruleDot);
    }

    public has(rule: Rule<TokenType>, index: number, ruleStart: number, ruleDot: number): boolean {
        return this.states.has(rule, index, ruleStart, ruleDot);
    }

    // /**
    //  * Runs in O(1)
    //  * @returns {number}
    //  */
    // public size(): number {
    //     this.states.size();
    // }
}