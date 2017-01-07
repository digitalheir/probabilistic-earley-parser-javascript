/// <reference types="core-js" />
import { Grammar } from "../../grammar/grammar";
import { State } from "./state";
import { NonTerminal } from "../../grammar/category";
import { Semiring } from "semiring/semiring";
import { Rule } from "../../grammar/rule";
import { ViterbiScore } from "./viterbi-score";
export declare class Chart<T, S> {
    readonly grammar: Grammar<T, S>;
    private states;
    private byIndex;
    private forwardScores;
    private innerScores;
    private viterbiScores;
    completedStates: Map<number, Set<State<S, T>>>;
    completedStatesFor: Map<number, Map<NonTerminal, Set<State<S, T>>>>;
    completedStatesThatAreNotUnitProductions: Map<number, Set<State<S, T>>>;
    statesActiveOnNonTerminals: Map<number, Set<State<S, T>>>;
    nonTerminalActiveAtIWithNonZeroUnitStarToY: Map<number, Map<NonTerminal, Set<State<S, T>>>>;
    statesActiveOnTerminals: Map<number, Set<State<S, T>>>;
    statesActiveOnNonTerminal: Map<NonTerminal, Map<number, Set<State<S, T>>>>;
    private EMPTY_SET;
    constructor(grammar: Grammar<T, S>);
    getStatesActiveOnNonTerminalWithNonZeroUnitStarScoreToY(index: number, Y: NonTerminal): Set<State<S, T>>;
    getStatesActiveOnNonTerminal(y: NonTerminal, position: number, beforeOrOnPosition: number): Set<State<S, T>>;
    getForwardScore(s: State<S, T>): S;
    addForwardScore(state: State<S, T>, increment: S, semiring: Semiring<S>): void;
    setForwardScore(s: State<S, T>, probability: S): void;
    private hasForwardScore(s);
    getState(rule: Rule<T>, positionInInput: number, ruleStartPosition: number, ruleDotPosition: number): State<S, T>;
    getOrCreate(positionInInput: number, ruleStartPosition: number, ruleDotPosition: number, rule: Rule<T>, scannedToken?: T): State<S, T>;
    hasState(state: State<S, T>): boolean;
    has(rule: Rule<T>, index: number, ruleStart: number, ruleDot: number): boolean;
    addState(state: State<S, T>): void;
    setInnerScore(s: State<S, T>, probability: S): void;
    setViterbiScore(v: ViterbiScore<S, T>): void;
    getViterbiScore(s: State<S, T>): ViterbiScore<S, T>;
    hasViterbiScore(s: State<S, T>): boolean;
    getInnerScore(s: State<S, T>): S;
    getCompletedStatesThatAreNotUnitProductions(position: number): Set<State<S, T>>;
    getCompletedStates(position: number): Set<State<S, T>>;
    getStatesActiveOnNonTerminals(index: number): Set<State<S, T>>;
    getStatesActiveOnTerminals(index: number): Set<State<S, T>>;
}
