import {Grammar} from "../grammar/grammar";
import {NonTerminal, Category, isNonTerminal} from "../grammar/category";
import {Rule} from "../grammar/rule";
import {State} from "./chart/state";
import {setViterbiScores, ViterbiScore} from "./chart/viterbi-score";
import {Chart} from "./chart/chart";
import {scan} from "./scan";
import {predict} from "./predict";
import {complete} from "./complete";
import {ParseTree, addRightMost} from "./parsetree";

export function addState<S, T>(stateSets: Chart<T, S>,
                       index: number,
                       ruleStartPosition: number,
                       ruleDotPosition: number,
                       rule: Rule<T>,
                       forward: S,
                       inner: S): State<S, T> {
    const state = stateSets.getOrCreate(index, ruleStartPosition, ruleDotPosition, rule);
    stateSets.setInnerScore(state, inner);
    stateSets.setForwardScore(state, forward);

    if (stateSets.hasViterbiScore(state))
        throw new Error("Viterbi score was already set for new chart?!");
    // stateSets.setViterbiScore(
    //     {
    //         origin: null,
    //         innerScore:
    //     }
    //         State.ViterbiScore(
    //         grammar.getSemiring().one(), null, chart, grammar.getSemiring()
    //     )
    // );
    return state;
}

/**
 * Performs the backward part of the forward-backward algorithm
 */
export function getViterbiParseFromChart<S, T>(state: State<S, T>, chart: Chart<T, S>): ParseTree<T> {
    switch (state.ruleDotPosition) {
        case 0:
            // Prediction chart
            return {category: state.rule.left, children: []};
        default:
            const prefixEnd: Category<T> = state.rule.right[state.ruleDotPosition - 1];
            if (!isNonTerminal(prefixEnd)) {
                // Scanned terminal chart
                if (!state.scannedToken)
                    throw new Error("Expected chart to be a scanned chart. This is a bug.");

                // let \'a = \, call
                const T: ParseTree<T> = getViterbiParseFromChart(
                    chart.getOrCreate(
                        state.position - 1,
                        state.ruleStartPosition,
                        state.ruleDotPosition - 1,
                        state.rule
                    ),
                    chart
                );
                addRightMost(T, {token: state.scannedToken, category: state.scannedCategory, children: []});
                return T;
            } else {
                // Completed non-terminal chart
                const viterbi: ViterbiScore<S, T> = chart.getViterbiScore(state); // must exist

                // Completed chart that led to the current chart
                const origin: State<S, T> = viterbi.origin;

                // Recurse for predecessor chart (before the completion happened)
                const T: ParseTree<T> = getViterbiParseFromChart(
                    chart.getOrCreate(
                        origin.ruleStartPosition,
                        state.ruleStartPosition,
                        state.ruleDotPosition - 1,
                        state.rule
                    )
                    , chart);

                // Recurse for completed chart
                const Tprime: ParseTree<T> = getViterbiParseFromChart(origin, chart);

                addRightMost(T, Tprime);
                return T;
            }
    }
}

export function parseSentenceIntoChart<S, T>(Start: NonTerminal,
                                            grammar: Grammar<T, S>,
                                            tokens: T[]): [Chart<T, S>, number, State<S, T>] {
    // ScanProbability scanProbability//TODO

    const stateSets: Chart<T, S> = new Chart(grammar);
    // Initial chart
    // const initialState:State<S,T> = undefined;//todo
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
    let i = 0;
    tokens.forEach(
        (token: T) => {
            predict(i, grammar, stateSets);
            scan(i, token, grammar.probabilityMapping.semiring, stateSets);
            complete(i + 1, stateSets, grammar);

            const completedStates: State<S, T>[] = [];
            const completedStatez = stateSets.getCompletedStates(i + 1);
            if (!!completedStatez) completedStatez.forEach(s => completedStates.push(s));

            completedStates.forEach(s => setViterbiScores(stateSets,
                s,
                new Set<State<S, T>>(),
                grammar.probabilityMapping));
            i++;
        }
    );


    // Set<State> completed = chart.getCompletedStates(i, Category.START);
    // if (completed.size() > 1) throw new Error("This is a bug");
    return [stateSets, i, init];
}

export interface ParseTreeWithScore<T> {
    parseTree: ParseTree<T>;
    probability: number;
}

export function getViterbiParse<S, T>(Start: NonTerminal,
                                     grammar: Grammar<T, S>,
                                     tokens: T[]): ParseTreeWithScore<T> {
    const [chart, ignored, init] = parseSentenceIntoChart(Start, grammar, tokens);

    const finalState = chart.getOrCreate(
        tokens.length,
        0,
        init.rule.right.length,
        init.rule
    );

    const parseTree: ParseTree<T> = getViterbiParseFromChart(finalState, chart);
    const toProbability = grammar.probabilityMapping.toProbability;
    const finalScore = chart.getViterbiScore(finalState).innerScore;

    return {
        parseTree,
        probability: toProbability(finalScore)
    };
}