/// <reference types="core-js" />
import { Semiring } from "semiring/semiring";
import { Expression } from "semiring/abstract-expression/expression";
import { State } from "./state";
import { Rule } from "../../grammar/rule";
export declare class DeferredStateScoreComputations<SemiringType, TokenType> {
    readonly semiring: Semiring<Expression<SemiringType>>;
    states: Map<Rule<TokenType>, Map<number, Map<number, Map<number, Expression<SemiringType>>>>>;
    private ZERO;
    constructor(semiring: Semiring<Expression<SemiringType>>);
    getExpression(rule: Rule<TokenType>, index: number, ruleStart: number, dot: number): Expression<SemiringType>;
    getExpressionByState(state: State<SemiringType, TokenType>): Expression<SemiringType>;
    setScore(rule: Rule<TokenType>, index: number, ruleStart: number, dotPosition: number, set: Expression<SemiringType>): void;
    getOrCreateByState(state: State<SemiringType, TokenType>, defaultValue: Expression<SemiringType>): Expression<SemiringType>;
    getOrCreate(rule: Rule<TokenType>, index: number, ruleStart: number, dotPosition: number, defaultValue: Expression<SemiringType>): Expression<SemiringType>;
    setScoreForState(state: State<SemiringType, TokenType>, expression: Expression<SemiringType>): void;
    add(rule: Rule<TokenType>, index: number, ruleStart: number, dotPosition: number, addValue: Expression<SemiringType>): void;
    forEach(f: (index: number, ruleStart: number, dot: number, rule: Rule<TokenType>, score: Expression<SemiringType>) => void): void;
}
