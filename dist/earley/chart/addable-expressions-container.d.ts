import { Semiring } from "semiring/semiring";
import { Expression } from "semiring/abstract-expression/expression";
import { State } from "./state";
import { Rule } from "../../grammar/rule";
export declare class DeferredStateScoreComputations<SemiringType, TokenType> {
    readonly semiring: Semiring<Expression<SemiringType>>;
    private states;
    private ZERO;
    constructor(semiring: Semiring<Expression<SemiringType>>);
    getExpression(rule: Rule<TokenType>, index: number, ruleStart: number, dot: number): Expression<SemiringType>;
    private setScore(rule, index, ruleStart, dotPosition, set);
    getOrCreateByState(state: State<SemiringType, TokenType>, defaultValue: Expression<SemiringType>): Expression<SemiringType>;
    getOrCreate(rule: Rule<TokenType>, index: number, ruleStart: number, dotPosition: number, defaultValue: Expression<SemiringType>): Expression<SemiringType>;
    plus(rule: Rule<TokenType>, index: number, ruleStart: number, dotPosition: number, addValue: Expression<SemiringType>): void;
    forEach(f: (index: number, ruleStart: number, dot: number, rule: Rule<TokenType>, score: Expression<SemiringType>) => any): void;
}
