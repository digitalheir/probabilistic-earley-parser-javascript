import { Category, NonTerminal } from "./category";
export interface Rule<T> {
    left: NonTerminal;
    right: Category<T>[];
    probability: number;
}
export declare function invalidDotPosition<T>(dotPosition: number, rule: any): void;
export declare function isUnitProduction<T>(rule: Rule<T>): boolean;
export declare function getActiveCategory<T>(rule: Rule<T>, dotPosition: number): Category<T>;
