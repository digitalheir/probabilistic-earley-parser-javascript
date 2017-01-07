import { Rule } from "../../grammar/rule";
import { State } from "./state";
export declare class StateIndex<SemiringType, TokenType> {
    private states;
    constructor();
    addState(state: State<SemiringType, TokenType>): void;
    getState(rule: Rule<TokenType>, index: number, ruleStart: number, ruleDot: number): State<SemiringType, TokenType>;
    has(rule: Rule<TokenType>, index: number, ruleStart: number, ruleDot: number): boolean;
}
