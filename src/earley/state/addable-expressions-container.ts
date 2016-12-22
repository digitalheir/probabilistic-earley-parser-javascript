import {Semiring} from "semiring/semiring";
import {Expression} from "semiring/abstract-expression/expression";
import {State} from "./state";
import {Rule, invalidDotPosition} from "../../grammar/rule";
import {getOrCreateMap} from "../../util";
import {Atom} from "semiring/abstract-expression/atom";

/**
 * Contains references to deferred computations. Used in completion stage.
 */
export class DeferredStateScoreComputations<SemiringType,TokenType> {
    readonly semiring: Semiring<Expression<SemiringType>>;

    states: Map<Rule<TokenType>,
        /*index*/
        Map<number,
            /*rule start*/
            Map<number,
                /*dot position*/
                Map<number,
                    Expression<SemiringType>
                    >
                >
            >
        >;
    private ZERO: Expression<SemiringType>;

    constructor(semiring: Semiring<Expression<SemiringType>>) {
        this.states = new Map<Rule<TokenType>,
            /*index*/
            Map<number,
                /*rule start*/
                Map<number,
                    /*dot position*/
                    Map<number,
                        Expression<SemiringType>
                        >
                    >
                >
            >();
        this.semiring = semiring;
        this.ZERO = new Atom<SemiringType>(this.semiring.additiveIdentity.resolve());
    }


    getExpression(rule: Rule<TokenType>, index: number, ruleStart: number, dot: number): Expression<SemiringType> {
        if (this.states.has(rule)) {
            const b = this.states.get(rule);
            if (b.has(index)) {
                const c = b.get(index);
                if (c.has(ruleStart)) {
                    const d = c.get(ruleStart);
                    if (d.has(dot))
                        return d.get(dot);
                }
            }
        }
        return undefined;
    }

    getExpressionByState(state: State<SemiringType, TokenType>): Expression<SemiringType> {
        return this.getExpression(state.rule, state.position, state.ruleStartPosition, state.ruleDotPosition);
    }

    setScore(rule: Rule<TokenType>,
             index: number,
             ruleStart: number,
             dotPosition: number,
             set: Expression<SemiringType>): void {
        getOrCreateMap(getOrCreateMap(getOrCreateMap(
            this.states,
            rule), index), ruleStart).set(dotPosition, set);
    }

    getOrCreateByState(state: State<SemiringType,TokenType>,
                       defaultValue: Expression<SemiringType>): Expression<SemiringType> {
        const exp: Expression<SemiringType> = this.getExpressionByState(state);
        if (!exp) {//TODO make prettier
            this.setScoreForState(state, defaultValue);
            return defaultValue;
        } else return exp;
    }

    getOrCreate(rule: Rule<TokenType>,
                index: number,
                ruleStart: number,
                dotPosition: number,
                defaultValue: Expression<SemiringType>): Expression<SemiringType> {
        const exp: Expression<SemiringType> = this.getExpression(rule, index, ruleStart, dotPosition);
        if (!exp) {//TODO make prettier?
            this.setScore(rule, index, ruleStart, dotPosition, defaultValue);
            return defaultValue;
        } else return exp;
    }

    setScoreForState(state: State<SemiringType, TokenType>, expression: Expression<SemiringType>): void {
        this.setScore(
            state.rule,
            state.position,
            state.ruleStartPosition,
            state.ruleDotPosition,
            expression);
    }

    add(rule: Rule<TokenType>,
        index: number,
        ruleStart: number,
        dotPosition: number,
        addValue: Expression<SemiringType>): void {

        const current: Expression<SemiringType> = this.getOrCreate(
            rule, index, ruleStart, dotPosition,
            this.ZERO
        );
        const newValue: Expression<SemiringType> = this.semiring.plus(addValue, current);
        this.setScore(rule, index, ruleStart, dotPosition, newValue);
    }

    forEach(f: (index: number, ruleStart: number, dot: number, rule: Rule<TokenType>, score: Expression<SemiringType>) => void) {
        this.states.forEach(
            (val, rule) => {
                val.forEach(
                    (val2, position) => {
                        val2.forEach(
                            (val3, start) => {
                                val3.forEach(
                                    (score: Expression<SemiringType>, dot: number) => f(position, start, dot, rule, score)
                                )
                            })
                    })
            })
    }
}
