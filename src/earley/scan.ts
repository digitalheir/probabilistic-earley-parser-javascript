import {isNonTerminal} from "../grammar/category";
import {Semiring} from "semiring/semiring";
import {Chart} from "./state/chart";
import {getActiveCategory, State, advanceDot} from "./state/state";


/**
 * Handles a token scanned from the input string.
 *
 * @param tokenPosition   The start index of the scan.
 * @param token           The token that was scanned.
 * //@param scanProbability Function that provides the probability of scanning the given token at this position. Might be null for a probability of 1.0.
 */
export function scan<S, T>(tokenPosition: number,
                           token: T,
                           //scanProbability:(x:T)=>number,//TODO
                           sr: Semiring<S>,
                           stateSets: Chart<T, S>) {
    // TODO
    //const scanProb:number = !scanProbability ? NaN : scanProbability(tokenPosition);
    const scanProb: S = sr.multiplicativeIdentity;

    /*
     * Get all states that are active on a terminal
     *   O(|stateset(i)|) = O(|grammar|): For all states <code>i: X<sub>k</sub> → λ·tμ</code>, where t is a terminal that matches the given token...
     */
    // TODO can this be more efficient, ie have tokens make their category be explicit? (Do we want to maintain the possibility of such "fluid" categories?)

    const statesActiveOnTerminals: Set<State<S, T>> = stateSets.statesActiveOnTerminals.get(tokenPosition);
    if (statesActiveOnTerminals) statesActiveOnTerminals.forEach((preScanState: State<S,T>) => {
        const activeCategory = getActiveCategory(preScanState);
        if (isNonTerminal(activeCategory)) throw new Error("this is a bug");
        else {
            const isCategory: boolean = activeCategory(token);
            // Create the state <code>i+1: X<sub>k</sub> → λt·μ</code>
            const preScanForward: S = stateSets.getForwardScore(preScanState);
            const preScanInner: S = stateSets.getInnerScore(preScanState);
            // Note that this state is unique for each preScanState
            const postScanState: State<S,T> = stateSets.getOrCreate(
                tokenPosition + 1, preScanState.ruleStartPosition,
                advanceDot(preScanState),
                preScanState.rule,
                token
            );

            const postScanForward = calculateForwardScore(sr, preScanForward, scanProb);
            // Set forward score
            stateSets.setForwardScore(
                postScanState,
                postScanForward
            );

            // Get inner score (no side effects)
            const postScanInner: S = calculateInnerScore(sr, preScanInner, scanProb);

            // Set inner score
            stateSets.setInnerScore(
                postScanState,
                postScanInner
            );

            // Set Viterbi score
            stateSets.setViterbiScore({
                origin: preScanState,
                resultingState: postScanState,
                innerScore: postScanInner
            });
        }
    })
}

/**
 * Function to calculate the new inner score from given values
 *
 * @param scanProbability The probability of scanning this particular token
 * @param sr              The semiring to calculate with
 * @param previousInner   The previous inner score
 * @return The inner score for the new state
 */
function calculateInnerScore<S>(sr: Semiring<S>, previousInner: S, scanProbability?: S,): S {
    if (scanProbability === undefined || scanProbability === null)
        return previousInner;
    else
        return sr.times(previousInner, scanProbability);
}

/**
 * Function to compute the forward score for the new state after scanning the given token.
 *
 * @param scanProbability           The probability of scanning this particular token
 * @param sr                        The semiring to calculate with
 * @param previousStateForwardScore The previous forward score
 * @return Computed forward score for the new state
 */
function calculateForwardScore<S>(sr: Semiring<S>, previousStateForwardScore: S, scanProbability?: S): S {
    if (scanProbability === undefined || scanProbability === null)
        return previousStateForwardScore;
    else
        return sr.times(previousStateForwardScore, scanProbability);
}