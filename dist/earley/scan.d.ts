import { Semiring } from "semiring/semiring";
import { Chart } from "./state/chart";
export declare function scan<S, T>(tokenPosition: number, token: T, sr: Semiring<S>, stateSets: Chart<T, S>): void;
