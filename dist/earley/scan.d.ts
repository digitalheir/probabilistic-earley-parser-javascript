import { Semiring } from "semiring/semiring";
import { Chart } from "./chart/chart";
export declare function scan<S, T>(tokenPosition: number, token: T, sr: Semiring<S>, stateSets: Chart<T, S>): any[];
