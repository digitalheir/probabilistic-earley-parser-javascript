import {Grammar} from "../grammar/grammar";
import {Chart} from "./chart/chart";
import {State, StateWithScore, getActiveCategory} from "./chart/state";
import {Category, isNonTerminal, NonTerminal} from "../grammar/category";
import {Rule} from "../grammar/rule";


/**
 * Makes predictions in the specified chart at the given index.

 * For each chart at position i, look at the the nonterminal at the dot position,
 * plus a chart that expands that nonterminal at position i, with the dot position at 0
 *
 * @param index The string index to make predictions at.
 * @param grammar
 * @param stateSets
 */
export function predict<S, T>(index: number,
                              grammar: Grammar<T, S>,
                              stateSets: Chart<T, S>) {
    const changes: any[] = [];
    const statesToPredictOn: Set<State<S, T>> = stateSets.getStatesActiveOnNonTerminals(index);
    if (statesToPredictOn) {
        const newStates = new Set<State<S,T>>();
        const probMap = grammar.probabilityMapping;
        const sr = probMap.semiring;
        const fromProb = probMap.fromProbability;
        // O(|stateset(i)|) = O(|grammar|): For all states <code>i: X<sub>k</sub> → λ·Zμ</code>...
        statesToPredictOn.forEach((statePredecessor: State<S,T>) => {
            const Z: Category<T> = getActiveCategory(statePredecessor);
            const prevForward: S = stateSets.getForwardScore(statePredecessor);

            // For all productions Y → v such that R(Z =*L> Y) is nonzero
            grammar.leftStarCorners
                .getNonZeroScores(Z)
                .forEach((Y: Category<T>) => {
                    // TODO ? can be more efficient by indexing on Y?
                    if (isNonTerminal(Y) && grammar.ruleMap.has(Y))
                        grammar.ruleMap.get(Y).forEach((Y_to_v: Rule<T>) => {
                            // we predict chart <code>i: Y<sub>i</sub> → ·v</code>
                            // noinspection JSSuspiciousNameCombination
                            const Y: NonTerminal = Y_to_v.left;


                            // γ' = P(Y → v)
                            const Y_to_vScore: S = fromProb(Y_to_v.probability);

                            // α' = α * R(Z =*L> Y) * P(Y → v)
                            let fw: S = sr.times(
                                prevForward,
                                sr.times(
                                    fromProb(grammar.getLeftStarScore(Z, Y)),
                                    Y_to_vScore
                                )
                            );

                            let predicted: State<S, T>;

                            // We might want to increment the probability of an existing chart
                            let isNew = !stateSets.has(Y_to_v, index, index, 0);
                            predicted = isNew ? {
                                    position: index,
                                    ruleStartPosition: index,
                                    ruleDotPosition: 0,
                                    rule: Y_to_v
                                } : stateSets.getOrCreate(index, index, 0, Y_to_v);
                            if (isNew) // save for later
                                newStates.add(predicted);

                            const innerScore: S = stateSets.getInnerScore(predicted);
                            if (!(Y_to_vScore === innerScore || probMap.ZERO === innerScore))throw new Error(Y_to_vScore + " != " + innerScore);

                            const viterbi = {
                                origin: statePredecessor,
                                resultingState: predicted,
                                innerScore: Y_to_vScore,
                            };

                            stateSets.addForwardScore(predicted, fw, sr);
                            stateSets.setInnerScore(predicted, Y_to_vScore);
                            stateSets.setViterbiScore(viterbi);


                            let change = {
                                state: predicted,
                                innerScore: Y_to_vScore,
                                forwardScore: fw,
                                viterbiScore: viterbi,
                                origin: statePredecessor
                            };
                            changes.push(change)
                        })
                })
        });

        newStates.forEach(ss => stateSets.getOrCreate(ss.position, ss.ruleStartPosition, ss.ruleDotPosition, ss.rule));
    }
    return changes;
}
