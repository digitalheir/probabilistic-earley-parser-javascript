import { Grammar } from "../grammar/grammar";
import { Chart } from "./chart/chart";
export declare function predict<S, T>(index: number, grammar: Grammar<T, S>, stateSets: Chart<T, S>): void;
