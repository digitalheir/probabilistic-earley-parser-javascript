import {Category, NonTerminal, isNonTerminal} from "./category";
export interface Rule<T> {
    left: NonTerminal;
    right: Category<T>[];
    probability: number;
}

export function invalidDotPosition<T>(dotPosition: number, ...right: Category<T>[]) {
    throw new Error("Invalid dot position: " + dotPosition + ", " + right);
}

export function isUnitProduction<T>(rule:Rule<T>):boolean  {
    return rule.right.length === 1 && isNonTerminal(rule.right[0]);
}

/**
 * Gets the active category in the underlying rule, if any.
 *
 * @return The category at this dotted rule's
 * dot position in the underlying rule's
 * right side category sequence. If this rule's
 * dot position is already at the end of the right side category sequence,
 * returns <code>null</code>.
 */
export function getActiveCategory<T>(rule:Rule<T>, dotPosition:number):Category<T> {
    if (dotPosition < 0 || dotPosition > rule.right.length)
        invalidDotPosition(dotPosition, ...rule.right);
    else if (dotPosition < rule.right.length) {
        const returnValue:Category <T> = rule.right[dotPosition];
        if (!returnValue)
            throw new Error("category did not exist at position "+dotPosition+": "+returnValue);
        else
            return returnValue;
    } else
        return null;
}

