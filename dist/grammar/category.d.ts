export declare type Category<T> = Terminal<T> | NonTerminal;
export declare type Terminal<T> = (t: T) => boolean;
export declare type NonTerminal = string;
export declare function isNonTerminal(element: any): element is NonTerminal;
