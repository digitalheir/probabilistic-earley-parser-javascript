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
export const a:Terminal<string> = (s) => s === "a";

export const builder = Grammar.builder("test");
export const g:Grammar<string, number>  = builder
    .addRule(1.0, A, [B, C, D, E])
    .addRule(1.0, A, [e])
    .addRule(1.0, X, [Y, Z])
    .addRule(0.5, B, [C])
    .addRule(0.5, C, [D])
    .addRule(0.5, D, [E])
    .addRule(0.5, D, [a])
    .addRule(0.5, E, [E,E])
    .addRule(0.5, E, [e])
    //.addRule(0.1, E, [C])
    .build();