/// <reference types="core-js" />
import { NonTerminal, Category } from "./category";
import { Rule } from "./rule";
export declare class LeftCorners<T> {
    private map;
    private nonZeroScores;
    private nonZeroScoresToNonTerminals;
    readonly ZERO: number;
    constructor(ZERO?: number);
    add(x: Category<T>, y: Category<T>, probability: number): void;
    get(x: Category<T>, y: Category<T>): number;
    set(x: Category<T>, y: Category<T>, val: number): void;
    getNonZeroScores(x: Category<T>): Set<Category<T>>;
    getNonZeroScoresToNonTerminals(x: Category<T>): Set<NonTerminal>;
}
export declare function getReflexiveTransitiveClosure<T>(nonTerminals: Set<NonTerminal>, P: LeftCorners<T>, zero?: number): LeftCorners<T>;
export declare function getUnitStarCorners<T>(rules: Set<Rule<T>>, nonTerminals: Set<NonTerminal>, zero?: number): LeftCorners<T>;
export declare function getLeftCorners<T>(rules: Set<Rule<T>>, ZERO?: number): LeftCorners<T>;
