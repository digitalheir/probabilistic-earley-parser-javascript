import {Rule, getActiveCategory as getActiveCategoryFromRule, invalidDotPosition} from '../../grammar/rule'
import {Category} from "../../grammar/category";

/**
 * A chart state, describing a pending derivation.
 * <p/>
 * A state is of the form <code>i: X<sub>k</sub> → λ·μ</code>
 * where X is a nonterminal of the grammar, λ and μ are strings of nonterminals and/or
 * terminals, and i and k are indices into the input string. States are derived from productions
 * in the grammar. The above state is derived from a corresponding production
 * X → λμ
 * with the following semantics:
 * <ul>
 * <li>The current position in the input is <code>i</code>, i.e., <code>x<sub>0</sub>...x<sub>i-1</sub></code>
 * have been processed
 * so far. The states describing the parser state at position <code>i</code> are collectively
 * called state set <code>i</code>. Note that there is one more state set than input
 * symbols: set <code>0</code> describes the parser state before any input is processed,
 * while set <code>|x|</code> contains the states after all input symbols have been
 * processed.</li>
 * <li>Nonterminal <code>X</code> was expanded starting at position <code>k</code> in
 * the input, i.e., <code>X</code>
 * generates some substring starting at position <code>k</code>.</li>
 * <li>The expansion of X proceeded using the production <code>X → λμ</code>, and has
 * expanded the right-hand side (RHS) <code>λμ</code> up to the position indicated by
 * the dot. The dot thus refers to the current position <code>i</code>.</li>
 * </ul>
 *
 * A state with the dot to the right of the entire RHS is called a completed state, since
 * it indicates that the left-hand side (LHS) non-terminal has been fully expanded.
 *
 */
export interface State<SemiringType, TokenType> {
    rule: Rule<TokenType>;
    ruleStartPosition: number;
    ruleDotPosition: number;
    positionInInput: number;
    scannedToken?: TokenType;
    scannedCategory?: Category<TokenType>;
}
export interface StateWithScore<SemiringType, TokenType> {
    forwardScore: SemiringType;
    innerScore: SemiringType;
    state: State<SemiringType, TokenType> ;
    origin: State<SemiringType, TokenType> ;
}


export function isCompleted<T,E>(state: State<T,E>): boolean {
    return isPassive(state.rule, state.ruleDotPosition);
}

export function isActive<T,E>(state: State<T,E>): boolean {
    return !isCompleted(state);
}

/**
 * @return Active category for this state. May be null.
 */
export function getActiveCategory<Semi,Token>(state: State<Semi, Token>): Category<Token> {
    return getActiveCategoryFromRule(state.rule, state.ruleDotPosition);
}

/**
 * Tests whether this is a completed edge or not. An edge is completed when
 * its dotted rule contains no
 * {@link #getActiveCategory(int) active category}, or equivalently the dot is at position == |RHS|.
 * Runs in O(1)
 *
 * @return <code>true</code> iff the active category of this edge's dotted
 * rule is <code>null</code>.
 */
export function isPassive<T>(rule: Rule<T>, dotPosition: number) {
    if (dotPosition < 0 || dotPosition > rule.right.length)
        invalidDotPosition(dotPosition, ...this.right);
    return dotPosition === rule.right.length;
}

/**
 * Return dot position advanced by <code>1</code>, or errors if out of bounds.
 *
 * @throws IndexOutOfBoundsException If the dotted rule's dot position
 *                                   is already at the end of its right side.
 */
export function advanceDot<SemiringType, TokenType>(s: State<SemiringType, TokenType>) {
    const position = s.ruleDotPosition;
    if (position < 0 || position > s.rule.right.length) throw new Error(
        "illegal position: " + position + ", " + s.rule);
    return position + 1;
}