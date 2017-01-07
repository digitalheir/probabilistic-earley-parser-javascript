import { Rule } from "../../grammar/rule";
import { State } from "./state";
export declare class StateToObjectMap<T, O> {
    private map;
    constructor();
    put(rule: Rule<T>, position: number, ruleStartPosition: number, ruleDotPosition: number, value: O): void;
    has(rule: Rule<T>, position: number, ruleStartPosition: number, ruleDotPosition: number): boolean;
    get(rule: Rule<T>, position: number, ruleStartPosition: number, ruleDotPosition: number): O;
    putByState<S>(state: State<S, T>, value: O): void;
    getOrDefault<S>(rule: Rule<T>, position: number, ruleStartPosition: number, ruleDotPosition: number, _default: O): O;
    getByStateOrDefault<S>(state: State<S, T>, _default: O): O;
    getByState<S>(state: State<S, T>): O;
    hasByState<S>(state: State<S, T>): boolean;
    forEach(f: (index: number, ruleStart: number, dot: number, rule: Rule<T>, score: O) => any): void;
}
