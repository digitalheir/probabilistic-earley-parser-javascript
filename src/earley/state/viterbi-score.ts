import {State, advanceDot, isCompleted} from "./state";
import {ProbabilitySemiringMapping} from "../../grammar/grammar";
import {Rule} from "../../grammar/rule";
import {Chart} from "./chart";
import {NonTerminal} from "../../grammar/category";

/**
 * Representing a Viterbi score coming from a certain state,
 * transition to a result state computing
 * using a certain semiring
 */
export interface ViterbiScore<S, T> {
    origin: State<S,T>;
    resultingState: State<S,T>;
    innerScore: S;
    //sr: ProbabilitySemiringMapping<S>;
}


/**
 * For finding the Viterbi path, we can't conflate production recursions (ie can't use the left star corner),
 * exactly because we need it to find the unique Viterbi path.
 * Luckily, we can avoid looping over unit productions because it only ever lowers probability
 * (assuming p = [0,1] and Occam's razor).
 * ~This method does not guarantee a left most parse.~
 *
 * @param stateSets
 * @param completedState Completed state to calculate Viterbi score for
 * @param originPathTo
 * @param m
 *///TODO write tests
export function setViterbiScores<S,T>(stateSets: Chart<T, S>,
                               completedState: State<S,T>,
                               originPathTo: Set<State<S,T>>,
                               m: ProbabilitySemiringMapping<S>): void {
    const sr = m.semiring;
    let newStates: State<S,T>[] = null; // init as null to avoid array creation
    let newCompletedStates: State<S,T>[] = null; // init as null to avoid array creation

    if (!stateSets.viterbiScores.has(completedState))
        throw new Error("Expected Viterbi score to be set on completed state. This is a bug.");

    const completedViterbi: S = stateSets.viterbiScores
        .get(completedState)
        .innerScore;



    const Y: NonTerminal = completedState.rule.left;
    //Get all states in j <= i, such that <code>j: X<sub>k</sub> →  λ·Yμ</code>
    const pos: number = completedState.position;
    stateSets.getStatesActiveOnNonTerminal(
        Y, completedState.ruleStartPosition, pos
    ).forEach((stateToAdvance) => {
        if (stateToAdvance.position > pos || stateToAdvance.position != completedState.ruleStartPosition)
            throw new Error("Index failed. This is a bug.");

        const ruleStart: number = stateToAdvance.ruleStartPosition;
        const nextDot: number = advanceDot(stateToAdvance);
        const rule: Rule<T> = stateToAdvance.rule;

        let resultingState = stateSets.states.getState(rule, pos, ruleStart, nextDot);
        if (!resultingState) {
            resultingState = stateSets.getOrCreate(pos, ruleStart, nextDot, rule);
            if (!newStates) newStates = [];
            newStates.push(resultingState);
        }

        if (originPathTo.has(resultingState))
            throw new Error("This is a bug: Already went past " + resultingState);

        const viterbiScore: ViterbiScore<S,T> = stateSets.viterbiScores.get(resultingState);
        const prevViterbi: ViterbiScore<S,T> = stateSets.viterbiScores.get(stateToAdvance);

        const prev:S = !!prevViterbi ? prevViterbi.innerScore : sr.multiplicativeIdentity;
        const newViterbiScore: ViterbiScore<S,T> = {
            innerScore: sr.times(completedViterbi, prev),
            origin: completedState,
            resultingState
        };

        if (!viterbiScore
            ||
            m.toProbability(viterbiScore.innerScore)<m.toProbability(newViterbiScore.innerScore)
        ) {
            stateSets.setViterbiScore(newViterbiScore);
            if (isCompleted(resultingState)) {
                if (!newCompletedStates) newCompletedStates = [];
                newCompletedStates.push(resultingState);
            }
        }

    });

    // Add new states to chart
    if (!!newStates)
        newStates.forEach(a => stateSets.addState(a));

    // Recurse with new states that are completed
    if (!!newCompletedStates) newCompletedStates.forEach(resultingState => {
        const path: Set<State<S,T>> = new Set<State<S,T>>(originPathTo);
        path.add(resultingState);
        setViterbiScores(stateSets, resultingState, path, m);
    });
}

