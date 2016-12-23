/// <reference types="core-js" />
import { State } from "./state";
import { ProbabilitySemiringMapping } from "../../grammar/grammar";
import { Chart } from "./chart";
export interface ViterbiScore<S, T> {
    origin: State<S, T>;
    resultingState: State<S, T>;
    innerScore: S;
}
export declare function setViterbiScores<S, T>(stateSets: Chart<T, S>, completedState: State<S, T>, originPathTo: Set<State<S, T>>, m: ProbabilitySemiringMapping<S>): void;
