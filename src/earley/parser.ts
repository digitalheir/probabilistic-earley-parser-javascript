import {Grammar, ProbabilitySemiringMapping} from "../grammar/grammar";
import {NonTerminal, Category} from "../grammar/category";
import {Rule} from "../grammar/rule";
import {State, advanceDot, isCompleted} from "./state/state";
import {StateSets} from "./state-sets";
import {ViterbiScore} from "./state/viterbi-score";
import {scan} from "./scan";
import {predict} from "./predict";
import {complete} from "./complete";
// import {Semiring} from "semiring/semiring";

function addState<S,T>(stateSets: StateSets<T, S>,
                       index: number,
                       ruleStartPosition: number,
                       ruleDotPosition: number,
                       rule: Rule<T>,
                       forward: S,
                       inner: S):State<S,T> {
    const state = stateSets.getOrCreate(index, ruleStartPosition, ruleDotPosition, rule);
    stateSets.setInnerScore(state, inner);
    stateSets.setForwardScore(state, forward);
    if (!!stateSets.viterbiScores.get(state))
        throw new Error("Viterbi score was already set for new state?!");
    // stateSets.setViterbiScore(
    //     {
    //         origin: null,
    //         innerScore:
    //     }
    //         State.ViterbiScore(
    //         grammar.getSemiring().one(), null, state, grammar.getSemiring()
    //     )
    // );
    return state;
}

export interface ChartWithInputPosition<S,T> {
    stateSets: StateSets<T,S>,
    i:number
}

export function parseAndCountTokens<S,T>(Start: NonTerminal,
                                         grammar: Grammar<T,S>,
                                         tokens: T[]): [StateSets<T,S>, number, State<S,T>] {
    //ScanProbability scanProbability//TODO

    const stateSets: StateSets<T,S> = new StateSets(grammar);
    // Initial state
    //const initialState:State<S,T> = undefined;//todo
    // new State(
    //     Rule.create(sr, 1.0, Category.START, S), 0
    // );

    const init = addState(
        stateSets, 0, 0, 0,
        {left: "<start>", right: [Start], probability: 1.0},
        grammar.probabilityMapping.ONE,
        grammar.probabilityMapping.ONE
    );

    // Cycle through input
    let i: number = 0;
    tokens.forEach(
        (token: T) => {
            predict(i, grammar, stateSets);
            scan(i, token, grammar.probabilityMapping.semiring, stateSets);
            complete(i + 1, stateSets, grammar);

            const completedStates: State<S,T>[] = [];
            const completedStatez = stateSets.completedStates.get(i + 1);
            if (!!completedStatez) completedStatez.forEach(s => completedStates.push(s));

            completedStates.forEach(s => setViterbiScores(stateSets,
                s,
                new Set<State<S,T>>(),
                grammar.probabilityMapping));
            i++;
        }
    );


    //Set<State> completed = chart.getCompletedStates(i, Category.START);
    //if (completed.size() > 1) throw new Error("This is a bug");
    return [stateSets, i, init];
}


/**
 * For finding the Viterbi path, we can't conflate production recursions (ie can't use the left star corner),
 * exactly because we need it to find the unique Viterbi path.
 * Luckily, we can avoid looping over unit productions because it only ever lowers probability
 * (assuming p = [0,1] and Occam's razor). ~This method does not guarantee a left most parse.~
 *
 * @param stateSets
 * @param completedState Completed state to calculate Viterbi score for
 * @param originPathTo
 * @param m
 *///TODO write tests
function setViterbiScores<S,T>(stateSets: StateSets<T, S>,
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

