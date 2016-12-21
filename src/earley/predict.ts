import {Grammar} from "../grammar/grammar";
import {StateSets} from "./state-sets";
import {State, StateWithScore, getActiveCategory} from "./state/state";
import {Category, isNonTerminal, NonTerminal} from "../grammar/category";
import {Rule} from "../grammar/rule";

export function predict<S, T>(index: number,
                              grammar: Grammar<T, S>,
                              stateSets: StateSets<T, S>) {
    const statesToPredictOn: Set<State<S, T>> = stateSets.statesActiveOnNonTerminals.get(index);
    if (statesToPredictOn) {
        const newStates = new Set<StateWithScore<S,T>>();
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
                            // we predict state <code>i: Y<sub>i</sub> → ·v</code>
                            // noinspection JSSuspiciousNameCombination
                            const Y: NonTerminal = Y_to_v.left;


                            // γ' = P(Y → v)
                            const Y_to_vScore: S = fromProb(Y_to_v.probability);

                            // α' = α * R(Z =*L> Y) * P(Y → v)
                            const fw: S = sr.times(
                                prevForward,
                                sr.times(
                                    fromProb(grammar.getLeftStarScore(Z, Y)),
                                    Y_to_vScore
                                )
                            );


                            // We might want to increment the probability of an existing state
                            if (stateSets.states.has(Y_to_v, index, index, 0)) {
                                const predicted: State<S, T> = stateSets.getOrCreate(index, index, 0, Y_to_v);
                                const innerScore: S = stateSets.getInnerScore(predicted);
                                if (!(Y_to_vScore === innerScore || probMap.ZERO === innerScore))throw new Error(Y_to_vScore + " != " + innerScore);

                                stateSets.addForwardScore(predicted, fw, sr);
                                stateSets.setInnerScore(predicted, Y_to_vScore);
                                stateSets.setViterbiScore({
                                    origin: statePredecessor,
                                    resultingState: predicted,
                                    innerScore: Y_to_vScore,
                                });
                            } else {
                                const predicted2: State<S,T> = {
                                    positionInInput: index,
                                    ruleStartPosition: index,
                                    ruleDotPosition: 0,
                                    rule: Y_to_v
                                };
                                stateSets.setViterbiScore({
                                    origin: statePredecessor,
                                    resultingState: predicted2,
                                    innerScore: Y_to_vScore,
                                });
                                newStates.add({
                                    state: predicted2,
                                    innerScore: Y_to_vScore,
                                    forwardScore: fw,
                                    origin: undefined
                                });
                            }
                        })
                })
        });

        newStates.forEach(ss => {
            stateSets.addState(ss.state);
            stateSets.addForwardScore(ss.state, ss.forwardScore, sr);
            stateSets.setInnerScore(ss.state, ss.innerScore);
        });
    }
}
