import {StateSets} from "../state-sets";
import {Grammar} from "../../grammar/grammar";
import {DeferredStateScoreComputations} from "./addable-expressions-container";
import {Expression, Semiring} from "semiring";
/**
 * A chart produced by an  Earley parser.
 *
 * Charts contain sets of {@link State states} mapped to the string indices where
 * they originate. Since the state sets are {@link Set sets}, an state can only
 * be added at a given index once (as sets do not permit duplicate members).
 * State sets are not guaranteed to maintain states in their order of insertion.
 */
public interface Chart<S,T> {
    stateSets:StateSets<T,S>;
    grammar:Grammar<T,S> ;
}



