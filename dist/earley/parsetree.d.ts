import { Category } from "../grammar/category";
export interface ParseTree<T> {
    category: Category<T>;
    children: ParseTree<T>[];
    token?: T;
}
export declare function createParseTree<T>(category: Category<T>, children?: ParseTree<T>[]): ParseTree<T>;
export declare function addRightMost<T>(addTo: ParseTree<T>, addMe: ParseTree<T>): void;
