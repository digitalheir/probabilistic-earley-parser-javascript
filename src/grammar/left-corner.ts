import {NonTerminal, Category, isNonTerminal} from "./category";
import {Rule, isUnitProduction} from "./rule";
import {getOrCreateMap, getOrCreateSet} from "../util";
//noinspection ES6UnusedImports
import {Set, Map} from "core-js";

/**
 * Returns the inverse of matrix `M`.
 * Use Gaussian Elimination to calculate the inverse:
 * (1) 'augment' the matrix (left) by the identity (on the right)
 * (2) Turn the matrix on the left into the identity by elemetry row ops
 * (3) The matrix on the right is the inverse (was the identity matrix)
 *
 * There are 3 elementary row ops: (I combine b and c in my code)
 * (a) Swap 2 rows
 * (b) Multiply a row by a scalar
 * (c) Add 2 rows
 */
function invert(M: number[][]) {
    // if the matrix isn't square
    if (M.length !== M[0].length) throw new Error("Matrix must be square");

    // create the identity matrix (I), and a copy (C) of the original

    const dim = M.length;
    const I: number[][] = [];
    const C: number[][] = [];
    for (let i = 0; i < dim; i += 1) {
        // Create the row
        I[I.length] = [];
        C[C.length] = [];
        for (let j = 0; j < dim; j += 1) {

            // if we're on the diagonal, put a 1 (for identity)
            if (i == j) {
                I[i][j] = 1;
            }
            else {
                I[i][j] = 0;
            }

            // Also, make the copy of the original
            C[i][j] = M[i][j];
        }
    }

    // Perform elementary row operations
    for (let i = 0; i < dim; i += 1) {
        // get the element e on the diagonal
        let e: number = C[i][i];

        // if we have a 0 on the diagonal (we'll need to swap with a lower row)
        if (e === 0) {
            // look through every row below the i'th row
            for (let ii = i + 1; ii < dim; ii += 1) {
                // if the ii'th row has a non-0 in the i'th col
                if (C[ii][i] !== 0) {
                    // it would make the diagonal have a non-0 so swap it
                    for (let j = 0; j < dim; j++) {
                        e = C[i][j];       // temp store i'th row
                        C[i][j] = C[ii][j]; // replace i'th row by ii'th
                        C[ii][j] = e;      // repace ii'th by temp
                        e = I[i][j];       // temp store i'th row
                        I[i][j] = I[ii][j]; // replace i'th row by ii'th
                        I[ii][j] = e;      // repace ii'th by temp
                    }
                    // don't bother checking other rows since we've swapped
                    break;
                }
            }
            // get the new diagonal
            e = C[i][i];
            // if it's still 0, not invertable (error)
            if (e == 0)
                throw new Error("Matrix was not invertable");
        }

        // Scale this row down by e (so we have a 1 on the diagonal)
        for (let j = 0; j < dim; j++) {
            C[i][j] = C[i][j] / e; // apply to original matrix
            I[i][j] = I[i][j] / e; // apply to identity
        }

        // Subtract this row (scaled appropriately for each row) from ALL of
        // the other rows so that there will be 0's in this column in the
        // rows above and below this one
        for (let ii = 0; ii < dim; ii++) {
            // Only apply to other rows (we want a 1 on the diagonal)
            if (ii == i) {
                continue;
            }

            // We want to change this element to 0
            e = C[ii][i];

            // Subtract (the row above(or below) scaled by e) from (the
            // current row) but start at the i'th column and assume all the
            // stuff left of diagonal is 0 (which it should be if we made this
            // algorithm correctly)
            for (let j = 0; j < dim; j++) {
                C[ii][j] -= e * C[i][j]; // apply to original matrix
                I[ii][j] -= e * I[i][j]; // apply to identity
            }
        }
    }

    // we've done all operations, C should be the identity
    // matrix I should be the inverse:
    return I;
}


/**
 * Information holder for left-corner relations and left*-corner relations. Essentially a map from {@link Category}
 * to {@link Category} with some indexing.
 */
export class LeftCorners<T> {
    /**
     * X -L> Y probability, undefined for 0.0
     */
    private map: Map<Category<T>, Map<Category<T>, number>>;
    /**
     * X -L> Y is greater than 0.0
     */
    private nonZeroScores: Map<Category<T>, Set<Category<T>>>;
    /**
     * X -L> Y is greater than 0.0, and Y is a non-terminal
     */
    private nonZeroScoresToNonTerminals: Map<Category<T>, Set<NonTerminal>>;

    readonly ZERO: number;

    /**
     * Information holder for left-corner relations and left*-corner relations. Essentially a map from {@link Category}
     * to {@link Category} with some utility functions to deal with probabilities.
     * @param ZERO Default value if there is no chance; usually 0
     */
    constructor(ZERO = 0) {
        this.ZERO = ZERO;

        this.map = new Map<Category<T>, Map<Category<T>, number>>();
        this.nonZeroScores = new Map<NonTerminal, Set<Category<T>>>();
        this.nonZeroScoresToNonTerminals = new Map<NonTerminal, Set<NonTerminal>>();
    }


    /**
     * Adds the given number to the current value of [X, Y], using standard +
     *
     * @param x           Left hand side
     * @param y           Right hand side
     * @param probability number to plus
     */
    public add(x: Category<T>, y: Category<T>, probability: number) {
        const newProbability = this.get(x, y) /* defaults to zero */ + probability;
        if (!isFinite(newProbability))
            throw new Error("Invalid left-[*]-corner probability: " + newProbability + " for " + x + " -L> " + y + " ... ");
        this.set(x, y, newProbability);
    }

    /**
     * @return stored value in left-corner relationship. this.ZERO by default
     */
    public get(x: Category<T>, y: Category<T>): number {
        if (!this.map) throw new Error("Map was not defined");
        const yToP = getOrCreateMap(this.map, x);
        if (!yToP) return this.ZERO;
        else return yToP.get(y) || this.ZERO;
    }


    /**
     * Sets table entry to a given probability. Will instantiate empty map if it does not exist yet.
     *
     * @param x   LHS
     * @param y   RHS
     * @param val number to set table entry to
     */
    public set(x: Category<T>, y: Category<T>, val: number): void {
        if (val !== this.ZERO) {
            // Set map
            const yToProb = getOrCreateMap(this.map, x);
            yToProb.set(y, val);

            // Set non-zero scores

            getOrCreateSet(this.nonZeroScores, x).add(y);
            if (isNonTerminal(y))
                getOrCreateSet(this.nonZeroScoresToNonTerminals, x).add(y);
        }
    }

    public getNonZeroScores(x: Category<T>): Set<Category<T>> {
        return this.nonZeroScores.get(x);
    }

    public getNonZeroScoresToNonTerminals(x: Category<T>): Set<NonTerminal> {
        return this.nonZeroScoresToNonTerminals.get(x);
    }
}

/**
 * Uses a trick to compute left*Corners (R_L), the reflexive transitive closure of leftCorners:
 *
 * ~~ P must have its scores defines as ordinary probabilities between 0 and 1 ~~
 *
 * <code>R_L = I + P_L R_L = (I - P_L)^-1</code>
 */
export function getReflexiveTransitiveClosure<T>(nonTerminals: Set<NonTerminal>,
                                                 P: LeftCorners<T>,
                                                 zero = 0.0): LeftCorners<T> {
    const nonterminalz: NonTerminal[] = [];
    nonTerminals.forEach(a => nonterminalz.push(a));

    // Create matrix of value I - P_L
    const R_L_inverse: number[][] = [];
    for (let row = 0; row < nonterminalz.length; row++) {
        const X: NonTerminal = nonterminalz[row];
        R_L_inverse[row] = [];
        for (let col = 0; col < nonterminalz.length; col++) {
            const Y: NonTerminal = nonterminalz[col];
            const prob: number = P.get(X, Y);
            // I - P_L
            R_L_inverse[row][col] = (row === col ? 1 : 0) - prob;
        }
    }
    const R_L: number[][] = invert(R_L_inverse);

    const m: LeftCorners<T> = new LeftCorners<T>(zero);
    /**
     * Copy all matrix values into our {@link LeftCorners} object
     */
    for (let roww = 0; roww < nonterminalz.length; roww++) {
        for (let coll = 0; coll < nonterminalz.length; coll++) {
            m.set(nonterminalz[roww], nonterminalz[coll], R_L[roww][coll]);
        }
    }
    return m;
}

export function getUnitStarCorners<T>(rules: Set<Rule<T>>,
                                      nonTerminals: Set<NonTerminal>,
                                      zero = 0.0): LeftCorners<T> {
    // Sum all probabilities for unit relations
    const P_U: LeftCorners<T> = new LeftCorners(zero);
    rules.forEach((rule: Rule<T>) => {
        if (isUnitProduction(rule))
            P_U.add(rule.left, rule.right[0], rule.probability);
    });

    // R_U = (I - P_U)
    return getReflexiveTransitiveClosure(nonTerminals, P_U, zero);
}


/**
 * Compute left corner relations
 */
export function getLeftCorners<T>(rules: Set<Rule<T>>, ZERO = 0.0): LeftCorners<T> {
    const leftCorners = new LeftCorners(ZERO);

    // Sum all probabilities for left corners
    rules.forEach((rule: Rule<T>) => {
        if (rule.right.length > 0 && isNonTerminal(rule.right[0]))
            leftCorners.add(rule.left, rule.right[0], rule.probability);
    });
    return leftCorners;
}