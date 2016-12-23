import { Chart } from "./state/chart";
import { Grammar } from "../grammar/grammar";
export declare function complete<S, T>(i: number, stateSets: Chart<T, S>, grammar: Grammar<T, S>): void;
