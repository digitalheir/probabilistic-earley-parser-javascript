import { Rule } from '../../grammar/rule';
import { Category } from "../../grammar/category";
export interface State<SemiringType, TokenType> {
    rule: Rule<TokenType>;
    ruleStartPosition: number;
    ruleDotPosition: number;
    position: number;
    scannedToken?: TokenType;
    scannedCategory?: Category<TokenType>;
}
export interface StateWithScore<SemiringType, TokenType> {
    forwardScore: SemiringType;
    innerScore: SemiringType;
    state: State<SemiringType, TokenType>;
    origin: State<SemiringType, TokenType>;
}
export declare function isCompleted<T, E>(state: State<T, E>): boolean;
export declare function isActive<T, E>(state: State<T, E>): boolean;
export declare function getActiveCategory<Semi, Token>(state: State<Semi, Token>): Category<Token>;
export declare function isPassive<T>(rule: Rule<T>, dotPosition: number): boolean;
export declare function advanceDot<SemiringType, TokenType>(s: State<SemiringType, TokenType>): number;
