import {State} from "./state";
import {ProbabilitySemiringMapping} from "../../grammar/grammar";

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