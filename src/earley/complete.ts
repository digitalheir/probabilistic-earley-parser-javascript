import {State, getActiveCategory, advanceDot, isPassive, isCompleted} from "./chart/state";
import {Chart} from "./chart/chart";
import {Grammar} from "../grammar/grammar";
import {NonTerminal, Category} from "../grammar/category";
import {Rule, isUnitProduction} from "../grammar/rule";
import {Expression} from "semiring/abstract-expression/expression";
import {DeferredStateScoreComputations} from "./chart/addable-expressions-container";
import {Atom} from "semiring/abstract-expression/atom";
import {DeferredValue} from "./expression/value";
/**
 * Completes states exhaustively and makes resolvable expressions for the forward and inner scores.
 * Note that these expressions can only be resolved to actual values after finishing completion, because they may depend on one another.
 *
 * @param position         State position
 * @param states           Completed states to use for deducing what states to proceed
 * @param addForwardScores Container / helper for adding to forward score expressions
 * @param addInnerScores   Container / helper for adding to inner score expressions
 * @param grammar
 * @param stateSets
 */
function completeNoViterbi<S,T>(position: number,
                                states: Set<State<S,T>>,
                                addForwardScores: DeferredStateScoreComputations<S,T>,
                                addInnerScores: DeferredStateScoreComputations<S,T>,
                                grammar: Grammar<T, S>,
                                stateSets: Chart<T, S>) {
    let possiblyNewStates: DeferredStateScoreComputations<S,T>;

    // For all states
    //      i: Y<sub>j</sub> → v·    [a",y"]
    //      j: X<sub>k</suv> → l·Zm  [a',y']
    //
    //  such that the R*(Z =*> Y) is nonzero
    //  and Y → v is not a unit production
    states.forEach((completedState: State<S,T>) => {
        const j: number = completedState.ruleStartPosition;
        //noinspection JSSuspiciousNameCombination
        const Y: NonTerminal = completedState.rule.left;
        const probM = grammar.probabilityMapping;



        const innerScore: S = stateSets.getInnerScore(completedState);
        // TODO pre-create atom?
        const unresolvedCompletedInner: DeferredValue<S> = addInnerScores.getOrCreateByState(
            completedState,
            new Atom(innerScore)
        );


        //TODO investigate error, probably somwhere inners arent added well

        stateSets.getStatesActiveOnNonTerminalWithNonZeroUnitStarScoreToY(j, Y).forEach((stateToAdvance: State<S,T>) => {
            if (j !== stateToAdvance.position) throw new Error("Index failed. This is a bug.");
            // Make i: X_k → lZ·m
            const innerScore2 = stateSets.getInnerScore(stateToAdvance);
            // TODO pre-create atom?
            const prevInner: DeferredValue<S> = addInnerScores.getOrCreateByState(stateToAdvance,
                new Atom(innerScore2)
            );
            const forwardScore = stateSets.getForwardScore(stateToAdvance);
            // TODO pre-create atom?
            const prevForward: DeferredValue<S> = addForwardScores.getOrCreateByState(stateToAdvance,
                new Atom(forwardScore)
            );

            const Z: Category<T> = getActiveCategory(stateToAdvance);

            // TODO pre-create atom?
            const unitStarScore: Expression<S> = new Atom(
                probM.fromProbability(
                    grammar.getUnitStarScore(Z, Y)
                )
            );
            const sr = grammar.deferrableSemiring;
            const fw: Expression<S> = sr.times(
                unitStarScore,
                sr.times(prevForward, unresolvedCompletedInner)
            );
            const inner: Expression<S> = sr.times(
                unitStarScore,
                sr.times(prevInner, unresolvedCompletedInner)
            );

            const newStateRule: Rule<T> = stateToAdvance.rule;
            const newStateDotPosition: number = advanceDot(stateToAdvance);
            const newStateRuleStart: number = stateToAdvance.ruleStartPosition;


            addForwardScores.plus(
                newStateRule,
                position,
                newStateRuleStart,
                newStateDotPosition,
                fw
            );



            // If this is a new completed chart that is no unit production,
            // make a note of it it because we want to recursively call *complete* on these states
            if (
                isPassive(newStateRule, newStateDotPosition)/*isCompleted*/
                && !isUnitProduction(newStateRule)
                && !stateSets.has(newStateRule, position, newStateRuleStart, newStateDotPosition)) {
                if (!possiblyNewStates) possiblyNewStates = new DeferredStateScoreComputations<S,T>(sr);
                possiblyNewStates.plus(
                    newStateRule,
                    position,
                    newStateRuleStart,
                    newStateDotPosition,
                    fw
                );
            }

            addInnerScores.plus(
                newStateRule,
                position,
                newStateRuleStart,
                newStateDotPosition,
                inner,true
            );
        });
    });


    if (!!possiblyNewStates) {
        const newCompletedStates: Set<State<S,T>> = new Set<State<S,T>>();
        possiblyNewStates.forEach(
            (index: number,
             ruleStart: number,
             dot: number,
             rule: Rule<T>,
             score: Expression<S>) => {
                //const isNew: boolean = !stateSets.has(index, ruleStart, dot, rule);

                if (stateSets.has(rule, index, ruleStart, dot)) {
                    throw new Error("State wasn't new");
                }

                const state: State<S,T> = stateSets.getOrCreate(index, ruleStart, dot, rule);
                if (!isCompleted(state) || isUnitProduction(state.rule))
                    throw new Error("Unexpected chart found in possible new states. This is a bug.");

                newCompletedStates.add(state);
            });
        if (newCompletedStates != null && newCompletedStates.size > 0) {
            completeNoViterbi(position,
                newCompletedStates,
                addForwardScores,
                addInnerScores,
                grammar, stateSets
            );
        }
    }
}

/**
 * Makes completions in the specified chart at the given index.
 *
 * @param i The index to make completions at.
 * @param stateSets
 * @param grammar
 */
export function complete<S,T>(i: number,
                              stateSets: Chart<T,S>,
                              grammar: Grammar<T, S>) {
    const addForwardScores = new DeferredStateScoreComputations(grammar.deferrableSemiring);
    const addInnerScores = new DeferredStateScoreComputations(grammar.deferrableSemiring);

    const completeOnStates = stateSets.getCompletedStatesThatAreNotUnitProductions(i);

    if (!!completeOnStates) completeNoViterbi(
        i,
        completeOnStates,
        addForwardScores,
        addInnerScores,
        grammar,
        stateSets
    );

    // Resolve and set forward score
    addForwardScores.forEach((position, ruleStart, dot, rule, score) => {
        const state: State<S,T> = stateSets.getOrCreate(position, ruleStart, dot, rule);
        // TODO dont getorcreate chart
        stateSets.setForwardScore(state, score.resolve());
    });

    // Resolve and set inner score
    addInnerScores.forEach((position, ruleStart, dot, rule, score) => {
        // TODO dont getorcreate chart
        const state: State<S,T> = stateSets.getOrCreate(position, ruleStart, dot, rule);
        stateSets.setInnerScore(state, score.resolve());
    });
}