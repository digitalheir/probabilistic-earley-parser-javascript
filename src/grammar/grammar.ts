import {Set, Map} from 'core-js'
import {NonTerminal, Category, isNonTerminal} from "./category";
import {Rule} from "./rule";
import {
    getLeftCorners,
    getUnitStarCorners,
    getReflexiveTransitiveClosure,
    LeftCorners
} from './left-corner'

import Semiring from "semiring/semiring";
import {LogSemiring, makeDeferrable} from "semiring";
import {Expression} from "semiring/abstract-expression/expression";

function getOrCreateSet<X,Y>(map: Map<X, Set<Y>>, x: X): Set<Y> {
    if (map.has(x))
        return map.get(x);
    else {
        const yToP: Set<Y> = new Set<Y>();
        map.set(x, yToP);
        return yToP;
    }
}

export interface ProbabilitySemiringMapping<Y> {
    semiring: Semiring<Y>;
    fromProbability(p: number): Y;
    toProbability(p: Y): number;
    ZERO: Y;
    ONE: Y;
}

export class Grammar<T, SemiringType> {
    readonly name: string;
    readonly ruleMap: Map<NonTerminal, Set<Rule<T>>>;
    readonly rules: Set<Rule<T>>;
    readonly nonTerminals: Set<NonTerminal>;

    //
    // pre-compute some scores for efficient earley parsing
    //
    private leftCorners: LeftCorners<T>;
    readonly leftStarCorners: LeftCorners<T>;
    readonly unitStarScores: LeftCorners<T>;
    readonly probabilityMapping: ProbabilitySemiringMapping<SemiringType>;
    readonly deferrableSemiring: Semiring<Expression<SemiringType>>;


    constructor(name: string,
                ruleMap: Map<NonTerminal, Set<Rule<T>>>,
                probabilityMapping: ProbabilitySemiringMapping<SemiringType>) {
        this.name = name;

        this.ruleMap = ruleMap;
        this.nonTerminals = new Set<NonTerminal>();
        this.rules = new Set<Rule<T>>();

        this.probabilityMapping = probabilityMapping;
        this.deferrableSemiring = makeDeferrable(probabilityMapping.semiring);

        const values: IterableIterator<Set<Rule<T>>> = ruleMap.values();

        let done = false;
        while (!done) {
            let next: IteratorResult<Set<Rule<T>>> = values.next();
            done = next.done;
            if (!done) {
                const rulez = next.value;
                rulez.forEach(rule => {
                        this.rules.add(rule);
                        this.nonTerminals.add(rule.left);
                        rule.right.filter(isNonTerminal).forEach((a: NonTerminal) =>
                            this.nonTerminals.add(a)
                        );
                    }
                );
            }
        }

        const zero = 0.0;
        this.leftCorners = getLeftCorners(this.rules, zero);
        this.leftStarCorners = getReflexiveTransitiveClosure(this.nonTerminals, this.leftCorners, zero);
        this.unitStarScores = getUnitStarCorners(this.rules, this.nonTerminals, zero);

    }

    getLeftStarScore(from: Category<T>, to: Category<T>): number {
        return this.leftStarCorners.get(from, to);
    }

    getLeftScore(from: Category<T>, to: Category<T>): number {
        return this.leftCorners.get(from, to);
    }

    getUnitStarScore(from: Category<T>, to: Category<T>): number {
        return this.unitStarScores.get(from, to);
    }

    //noinspection JSUnusedGlobalSymbols
    static withSemiring<T,Y>(semiringMapping: ProbabilitySemiringMapping<Y>, name?: string): GrammarBuilder<T, Y> {
        return new GrammarBuilder<T, Y>(semiringMapping, name);
    }

    static builder<T>(name?: string): GrammarBuilder<T, number> {
        return new GrammarBuilder<T, number>(LOG_SEMIRING, name);
    }

}


const LOG_SEMIRING: ProbabilitySemiringMapping<number> = {
    semiring: LogSemiring,
    fromProbability: (x) => -Math.log(x),
    toProbability: (x) => Math.exp(-x),
    ZERO: LogSemiring.additiveIdentity,
    ONE: LogSemiring.multiplicativeIdentity
};

export class GrammarBuilder<T, SemiringType> {

    private ruleMap: Map<NonTerminal, Set<Rule<T>>>;
    // private rules: Set<Rule>;
    private name: string;
    private semiringMapping: ProbabilitySemiringMapping<SemiringType>;

    constructor(semiringMapping: ProbabilitySemiringMapping<SemiringType>, name?: string) {
        this.ruleMap = new Map<NonTerminal, Set<Rule<T>>>();
        // this.rules = new Set<Rule>();
        this.name = name;
        this.semiringMapping = semiringMapping;
    }

    //noinspection JSUnusedGlobalSymbols
    setSemiringMapping(semiringMapping: ProbabilitySemiringMapping<SemiringType>) {
        this.semiringMapping = semiringMapping;
        return this;
    }

    addNewRule(probability: number, left: NonTerminal, right: Category<T>[]): GrammarBuilder<T, SemiringType> {
        this.addRule({
            left,
            right,
            probability
        });

        return this;
    }

    addRule(rule: Rule<T>): GrammarBuilder<T, SemiringType> {
        if (!rule.probability || typeof rule.probability !== 'number')
            throw new Error("Probability not defined: " + rule.probability);
        if (!rule.left) throw new Error("Left hand side not defined: " + rule.left);
        if (!rule.right || !rule.right.length || typeof rule.right.length !== 'number'! || rule.right.length <= 0)
            throw new Error("Right hand side not defined: " + rule.right);

        if (this.ruleMap.has(rule.left)) {
            this.ruleMap.get(rule.left).forEach(rle => {
                if (rule.right.length === rle.right.length) {
                    for (let i = 0; i < rule.right.length; i++) if (rule.right[i] !== rle.right[i]) return;
                    throw new Error("Already added rule " + rule.left + " -> " + rule.right.toString());
                }
            })
        }

        getOrCreateSet(this.ruleMap, rule.left).add(rule);
        
        return this;
    }

    build(): Grammar<T, SemiringType> {
        return new Grammar(this.name, this.ruleMap, this.semiringMapping);
    }
}
