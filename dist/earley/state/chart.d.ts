/// <reference types="core-js" />
import { StateIndex } from "./state-index";
import { Grammar } from "../../grammar/grammar";
import { State } from "./state";
import { NonTerminal } from "../../grammar/category";
import { Semiring } from "semiring/semiring";
import { Rule } from "../../grammar/rule";
import { ViterbiScore } from "./viterbi-score";
export declare class Chart<T, S> {
    readonly grammar: Grammar<T, S>;
    readonly states: StateIndex<S, T>;
    readonly byIndex: Map<number, Set<State<S, T>>>;
    readonly forwardScores: Map<State<S, T>, S>;
    readonly innerScores: Map<State<S, T>, S>;
    readonly viterbiScores: Map<State<S, T>, ViterbiScore<S, T>>;
    readonly completedStates: Map<number, Set<State<S, T>>>;
    readonly completedStatesFor: Map<number, Map<NonTerminal, Set<State<S, T>>>>;
    readonly completedStatesThatAreNotUnitProductions: Map<number, Set<State<S, T>>>;
    readonly statesActiveOnNonTerminals: Map<number, Set<State<S, T>>>;
    readonly nonTerminalActiveAtIWithNonZeroUnitStarToY: Map<number, Map<NonTerminal, Set<State<S, T>>>>;
    readonly statesActiveOnTerminals: Map<number, Set<State<S, T>>>;
    readonly statesActiveOnNonTerminal: Map<NonTerminal, Map<number, Set<State<S, T>>>>;
    constructor(grammar: Grammar<T, S>);
    getStatesActiveOnNonTerminalWithNonZeroUnitStarScoreToY(index: number, Y: NonTerminal): Set<State<S, T>>;
    getStatesActiveOnNonTerminal(y: NonTerminal, position: number, beforeOrOnPosition: number): Set<State<S, T>>;
    getForwardScore(s: State<S, T>): S;
    getOrCreate(positionInInput: number, ruleStartPosition: number, ruleDotPosition: number, rule: Rule<T>, scannedToken?: T): State<S, T>;
    hasState(state: State<S, T>): boolean;
    has(rule: Rule<T>, index: number, ruleStart: number, ruleDot: number): boolean;
    addState(state: State<S, T>): void;
    addForwardScore(state: State<S, T>, increment: S, semiring: Semiring<S>): void;
    setForwardScore(s: State<S, T>, probability: S): void;
    setInnerScore(s: State<S, T>, probability: S): void;
    setViterbiScore(v: ViterbiScore<S, T>): void;
    getInnerScore(s: State<S, T>): S;
}
