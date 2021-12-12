import { AtomicValue, Semiring } from "semiring";
import { Expression } from "semiring";
import { State } from "./state";
import { Rule } from "../../grammar/rule";

import { StateToObjectMap } from "./state-to-object-map";
import { DeferredValue } from "../expression/value";

/**
 * Contains references to deferred computations. Only supports addition. Used in completion stage.
 */
export class DeferredStateScoreComputations<SemiringType, TokenType> {
    readonly semiring: Semiring<Expression<SemiringType>>;

    private states: StateToObjectMap<TokenType, DeferredValue<SemiringType>>;
    private readonly ZERO: Expression<SemiringType>;

    constructor(semiring: Semiring<Expression<SemiringType>>) {
        this.states = new StateToObjectMap<TokenType, DeferredValue<SemiringType>>();
        this.semiring = semiring;
        this.ZERO = new AtomicValue<SemiringType>(this.semiring.additiveIdentity.resolve());
    }


    // getExpression(rule: Rule<TokenType>, index: number, ruleStart: number, dot: number): Expression<SemiringType> {
    //     return this.states.get(rule, index, ruleStart, dot).expression;
    // }

    getOrCreateByState(state: State<SemiringType, TokenType>,
                       defaultValue: Expression<SemiringType>): DeferredValue<SemiringType> {
        if (this.states.hasByState(state)) {
            return this.states.getByState(state);
        } else {
            const deferredValue = new DeferredValue(defaultValue);
            this.states.putByState(state, deferredValue);
            return deferredValue;
        }
    }

    getOrCreate(rule: Rule<TokenType>,
                index: number,
                ruleStart: number,
                dotPosition: number,
                defaultValue: Expression<SemiringType>): DeferredValue<SemiringType> {
        if (this.states.has(rule, index, ruleStart, dotPosition)) {
            return this.states.get(rule, index, ruleStart, dotPosition);
        } else {
            const deferredValue = new DeferredValue(defaultValue);
            this.states.put(rule, index, ruleStart, dotPosition, deferredValue);
            return deferredValue;
        }
    }

    get(rule: Rule<TokenType>,
        index: number,
        ruleStart: number,
        dotPosition: number): Expression<SemiringType> {
        if (this.states.has(rule, index, ruleStart, dotPosition)) {
            return this.states.get(rule, index, ruleStart, dotPosition).expression;
        } else {
            return undefined;
        }
    }


    plus(rule: Rule<TokenType>,
         index: number,
         ruleStart: number,
         dotPosition: number,
         addValue: Expression<SemiringType>): void {
        const current: DeferredValue<SemiringType> = this.getOrCreate(
            rule, index, ruleStart, dotPosition,
            this.ZERO
        );
        current.expression = this.semiring.plus(addValue, current.expression);
        this.states.put(rule, index, ruleStart, dotPosition, current);
    }

    forEach(f: (index: number, ruleStart: number, dot: number, rule: Rule<TokenType>, score: Expression<SemiringType>) => any) {
        this.states.forEach((i, r, d, rr, v) => f(i, r, d, rr, v.expression));
    }
}
