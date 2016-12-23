import {NonTerminal} from "./grammar/category";
import {parseSentenceIntoChart,getViterbiParseFromChart} from './earley/parser'
import {Grammar} from "./grammar/grammar";
import {Chart} from "./earley/state/chart";
import {State} from "./earley/state/state";
import {ParseTree} from "./earley/parsetree";

export * from './earley/parser'
export * from './grammar/grammar'
export * from './grammar/rule'
export * from './grammar/token'

export interface ParseTreeWithScore<T> {
    parseTree: ParseTree<T>;
    probability: number;
}

export function getViterbiParse<S,T>(Start: NonTerminal,
                                     grammar: Grammar<T,S>,
                                     tokens: T[]): ParseTreeWithScore<T>{
    const [chart, i, init] = parseSentenceIntoChart(Start, grammar, tokens);

    const finalState = chart.getOrCreate(
        tokens.length,
        0,
        init.rule.right.length,
        init.rule
    );

    const parseTree:ParseTree<T> = getViterbiParseFromChart(finalState, chart);
    const toProbability = grammar.probabilityMapping.toProbability;
    const finalScore = chart.viterbiScores.get(finalState).innerScore;

    return {
        parseTree,
        probability: toProbability(finalScore)
    }
}