import {Category} from "../grammar/category";
/**
 * A parse tree that represents the derivation of a string based on the
 * rules in a {@link Grammar}. Parse trees recursively contain
 * {@link #getChildren() other parse trees}, so they can be iterated through to
 * find the entire derivation of a category.
 * <p>
 * Parse trees are essentially partial views of a Chart from a
 * given {@link State} or {@link Category}. They represent the completed
 * category at a given string index and origin position.
 */
export interface ParseTree<T> {
    category: Category<T>;
    children: ParseTree<T>[];
    token?: T;
}

//noinspection JSUnusedGlobalSymbols
/**
 * Creates a new parse tree with the specified category, parent, and
 * child trees.
 *
 * @param category The category of the {@link #getCategory() category} of this parse
 *                 tree.
 * @param children The list of children of this parse tree, in their linear
 *                 order.
 */
export function createParseTree<T>(category: Category<T>, children: ParseTree<T>[] = []): ParseTree<T> {
    return {category, children};
}

export function addRightMost<T>(addTo: ParseTree<T>, addMe: ParseTree<T>) {
    addTo.children.push(addMe);
}


// public static class Token<E> extends ParseTree {
//     public final org.leibnizcenter.cfg.token.Token<E> token;
//
//     public Token(org.leibnizcenter.cfg.token.Token<E> scannedToken, Category category) {
//     super(category, null);
//     this.token = scannedToken;
// }
//
// public Token(ScannedTokenState<E> scannedState) {
//     this(scannedState.scannedToken, scannedState.scannedCategory);
// }
//
//
// @Override
// public int hashCode() {
//     return super.hashCode() + token.hashCode();
// }
//
// @Override
// public boolean equals(Object o) {
//     return o instanceof Token && super.equals(o) && token.equals(((Token) o).token);
// }
// }
//
// public static class NonToken extends ParseTree {
//     public NonToken(Category node) {
//     super(node);
// }
//
// public NonToken(Category node, LinkedList<ParseTree> children) {
//     super(node, children);
// }
//
// @Override
// public boolean equals(Object o) {
//     return o instanceof NonToken && super.equals(o);
// }
// }
// }