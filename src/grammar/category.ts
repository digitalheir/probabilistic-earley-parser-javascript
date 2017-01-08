export type Category<T> = Terminal<T> | NonTerminal;
export type Terminal<T> = (t: T) => boolean;
export type NonTerminal = string;

export interface WordWithTypes<T> {
    types: Terminal<T>[];
    word: T;
}

export function isNonTerminal(element: any): element is NonTerminal {
    return typeof element === "string";
}