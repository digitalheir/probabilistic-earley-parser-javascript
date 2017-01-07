import { Grammar } from "../grammar/grammar";
import { NonTerminal } from "../grammar/category";
import { State } from "./chart/state";
import { Chart } from "./chart/chart";
import { ParseTree } from "./parsetree";
export declare function getViterbiParseFromChart<S, T>(state: State<S, T>, chart: Chart<T, S>): ParseTree<T>;
export declare function parseSentenceIntoChart<S, T>(Start: NonTerminal, grammar: Grammar<T, S>, tokens: T[]): [Chart<T, S>, number, State<S, T>];
export interface ParseTreeWithScore<T> {
    parseTree: ParseTree<T>;
    probability: number;
}
export declare function getViterbiParse<S, T>(Start: NonTerminal, grammar: Grammar<T, S>, tokens: T[]): ParseTreeWithScore<T>;
