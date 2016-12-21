import {State, getActiveCategory, advanceDot, isPassive, isCompleted} from "./state";
import {StateSets} from "../state-sets";
import {Grammar} from "../../grammar/grammar";
import {NonTerminal, Category} from "../../grammar/category";
import {Rule, isUnitProduction} from "../../grammar/rule";
import {makeDeferrable} from "semiring";
import {Expression} from "semiring/abstract-expression/expression";
import {DeferredStateScoreComputations} from "./addable-expressions-container";
import {Atom} from "semiring/abstract-expression/atom";
import {StateIndex} from "../state-index";
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
export function completeNoViterbi<S,T>(position: number,
                                       states: Set<State<S,T>>,
                                       addForwardScores: DeferredStateScoreComputations<S,T>,
                                       addInnerScores: DeferredStateScoreComputations<S,T>,
                                       grammar: Grammar<T, S>,
                                       stateSets: StateSets<T, S>) {
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

        const innerScore: S = stateSets.getInnerScore(completedState);
        // TODO pre-create atom?
        const unresolvedCompletedInner: Expression<S> = addInnerScores.getOrCreateByState(
            completedState,
            new Atom(innerScore)
        );

        //noinspection Convert2streamapi
        stateSets.getStatesActiveOnNonTerminalWithNonZeroUnitStarScoreToY(j, Y).forEach((stateToAdvance: State<S,T>) => {
            if (j !== stateToAdvance.positionInInput) throw new Error("Index failed. This is a bug.");
            // Make i: X_k → lZ·m
            const innerScore2 = stateSets.getInnerScore(stateToAdvance);
            // TODO pre-create atom?
            const prevInner: Expression<S> = addInnerScores.getOrCreateByState(stateToAdvance,
                new Atom(innerScore2)
            );
            const forwardScore = stateSets.getForwardScore(stateToAdvance);
            // TODO pre-create atom?
            const prevForward: Expression<S> = addForwardScores.getOrCreateByState(stateToAdvance,
                new Atom(forwardScore)
            );

            const Z: Category<T> = getActiveCategory(stateToAdvance);

            // TODO pre-create atom?
            const probM = grammar.probabilityMapping;
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

            addForwardScores.add(
                newStateRule,
                position,
                newStateRuleStart,
                newStateDotPosition,
                fw
            );

            // If this is a new completed state that is no unit production,
            // make a note of it it because we want to recursively call *complete* on these states
            if (
                isPassive(newStateRule, newStateDotPosition)/*isCompleted*/
                && !isUnitProduction(newStateRule)
                && !stateSets.has(newStateRule, position, newStateRuleStart, newStateDotPosition)) {
                if (!possiblyNewStates) possiblyNewStates = new DeferredStateScoreComputations<S,T>(sr);
                possiblyNewStates.add(
                    newStateRule,
                    position,
                    newStateRuleStart,
                    newStateDotPosition,
                    fw
                );
            }

            addInnerScores.add(
                newStateRule,
                position,
                newStateRuleStart,
                newStateDotPosition,
                inner
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

                const state: State<S,T> = stateSets.getOrCreate(index, ruleStart, dot, rule);
                if (/*!isNew || */!isCompleted(state) || isUnitProduction(state.rule))
                    throw new Error("Unexpected state found in possible new states. This is a bug.");

                newCompletedStates.add(state);
            });
        if (newCompletedStates != null && newCompletedStates.size > 0) {
            this.completeNoViterbi(position,
                newCompletedStates,
                addForwardScores,
                addInnerScores,
                grammar, stateSets
            );
        }
    }
}