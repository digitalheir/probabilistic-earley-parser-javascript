import {Rule} from "../../grammar/rule";
import {getOrCreateMap} from "../../util";
import {State} from "./state";

export class StateToObjectMap<T, O> {
    private map: Map<Rule<T>,
        /* index */Map<number,
        /*rule start*/Map<number,
        /*dot position*/Map<number,
        O>>>> = new Map<Rule<T>,
        /*index*/Map<number,
        /*rule start*/Map<number,
        /*dot position*/Map<number, O>>>>();
    // private _size: number = 0;

    constructor() {
    }

    put(rule: Rule<T>, position: number, ruleStartPosition: number, ruleDotPosition: number, value: O) {
        getOrCreateMap(getOrCreateMap(getOrCreateMap(this.map, rule), position), ruleStartPosition).set(ruleDotPosition, value);
    }

    has(rule: Rule<T>, position: number, ruleStartPosition: number, ruleDotPosition: number): boolean {
        return getOrCreateMap(getOrCreateMap(getOrCreateMap(this.map, rule), position), ruleStartPosition).has(ruleDotPosition);
    }

    get(rule: Rule<T>, position: number, ruleStartPosition: number, ruleDotPosition: number): O {
        return getOrCreateMap(getOrCreateMap(getOrCreateMap(this.map, rule), position), ruleStartPosition).get(ruleDotPosition);
    }

    putByState<S>(state: State<S, T>, value: O): void {
        this.put(state.rule, state.position, state.ruleStartPosition, state.ruleDotPosition, value);
    }

    getOrDefault<S>(rule: Rule<T>, position: number, ruleStartPosition: number, ruleDotPosition: number, _default: O): O {
        if (this.has(rule, position, ruleStartPosition, ruleDotPosition))
            return this.get(rule, position, ruleStartPosition, ruleDotPosition);
        else
            return _default;
    }

    getByStateOrDefault<S>(state: State<S, T>, _default: O): O {
        return this.getOrDefault(state.rule, state.position, state.ruleStartPosition, state.ruleDotPosition, _default);
    }

    getByState<S>(state: State<S, T>): O {
        return this.get(state.rule, state.position, state.ruleStartPosition, state.ruleDotPosition);
    }

    hasByState<S>(state: State<S, T>): boolean {
        return this.has(state.rule, state.position, state.ruleStartPosition, state.ruleDotPosition);
    }

    forEach(f: (index: number, ruleStart: number, dot: number, rule: Rule<T>, score: O) => any) {
        this.map.forEach(
            (val, rule) => {
                val.forEach(
                    (val2, position) => {
                        val2.forEach(
                            (val3, start) => {
                                val3.forEach(
                                    (object: O, dot: number) => f(position, start, dot, rule, object)
                                );
                            });
                    });
            });
    }

    // size(): number {
    //     return this._size;
    // }
}