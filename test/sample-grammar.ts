import {Terminal, NonTerminal} from "../src/grammar/category";
import {Grammar} from "../src/grammar/grammar";
export const A:NonTerminal = "A";
export const B:NonTerminal = "B";
export const C:NonTerminal = "C";
export const D:NonTerminal = "D";
export const E:NonTerminal = "E";
export const X:NonTerminal = "X";
export const Y:NonTerminal = "Y";
export const Z:NonTerminal = "Z";
export const e:Terminal<string> = (s) => s === "e";
export const a = (t:string) =>!!t.match(/a/i);

const builder = Grammar.builder("test");
export const g:Grammar<string, number>  = builder
    .addNewRule(1.0, A, [B, C, D, E])
    .addNewRule(1.0, A, [e])
    .addNewRule(1.0, X, [Y, Z])
    .addNewRule(0.5, B, [C])
    .addNewRule(0.5, C, [D])
    .addNewRule(0.5, D, [E])
    .addNewRule(0.5, D, [a])
    .addNewRule(0.5, E, [E,E])
    .addNewRule(0.5, E, [e])
    //.addRule(0.1, E, [C])
    .build();

export const p:number = (0.6);
export const q:number = (0.4);
export const S = "S";

export const S2a = {left: S, right:[a],probability:p};
export const S2SS = {left: S, right:[S,S],probability:q};

export const simpleRecursiveGrammar:Grammar<string, number> = Grammar.builder("simple-recursive-grammar")
    .addRule(S2a)
    .addRule(S2SS)
    .build();