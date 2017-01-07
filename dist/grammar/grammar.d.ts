/// <reference types="core-js" />
import { NonTerminal, Category } from "./category";
import { Rule } from "./rule";
import { LeftCorners } from './left-corner';
import Semiring from "semiring/semiring";
import { Expression } from "semiring/abstract-expression/expression";
export interface ProbabilitySemiringMapping<Y> {
    semiring: Semiring<Y>;
    fromProbability(p: number): Y;
    toProbability(p: Y): number;
    ZERO: Y;
    ONE: Y;
}
export declare class Grammar<T, SemiringType> {
    readonly name: string;
    readonly ruleMap: Map<NonTerminal, Set<Rule<T>>>;
    readonly rules: Set<Rule<T>>;
    readonly nonTerminals: Set<NonTerminal>;
    private leftCorners;
    readonly leftStarCorners: LeftCorners<T>;
    readonly unitStarScores: LeftCorners<T>;
    readonly probabilityMapping: ProbabilitySemiringMapping<SemiringType>;
    readonly deferrableSemiring: Semiring<Expression<SemiringType>>;
    constructor(name: string, ruleMap: Map<NonTerminal, Set<Rule<T>>>, probabilityMapping: ProbabilitySemiringMapping<SemiringType>);
    getLeftStarScore(from: Category<T>, to: Category<T>): number;
    getLeftScore(from: Category<T>, to: Category<T>): number;
    getUnitStarScore(from: Category<T>, to: Category<T>): number;
    static withSemiring<T, Y>(semiringMapping: ProbabilitySemiringMapping<Y>, name?: string): GrammarBuilder<T, Y>;
    static builder<T>(name?: string): GrammarBuilder<T, number>;
}
export declare class GrammarBuilder<T, SemiringType> {
    private ruleMap;
    private name;
    private semiringMapping;
    constructor(semiringMapping: ProbabilitySemiringMapping<SemiringType>, name?: string);
    setSemiringMapping(semiringMapping: ProbabilitySemiringMapping<SemiringType>): this;
    addNewRule(probability: number, left: NonTerminal, right: Category<T>[]): GrammarBuilder<T, SemiringType>;
    addRule(rule: Rule<T>): GrammarBuilder<T, SemiringType>;
    build(): Grammar<T, SemiringType>;
}
