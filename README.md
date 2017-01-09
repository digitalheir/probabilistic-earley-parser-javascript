![Build Status](https://travis-ci.org/digitalheir/probabilistic-earley-parser-javascript.svg?branch=master)
[![npm version](https://badge.fury.io/js/probabilistic-earley-parser.svg)](https://www.npmjs.com/package/probabilistic-earley-parser)
[![License](https://img.shields.io/npm/l/probabilistic-earley-parser.svg)](https://github.com/digitalheir/probabilistic-earley-parser-javascript/blob/master/LICENSE)

# Probabilistic Earley parser

This is a library for parsing a sequence of tokens (like words) into tree structures, along with the probability that the particular sequence generates that tree structure. This is mainly useful for linguistic purposes, such as morphological parsing, speech recognition and generally information extraction. It also find applications in computational biology. 

For example:

* As a computational linguist, you want [derive all ways to interpret an English sentence along with probabilities](https://web.stanford.edu/~jurafsky/icassp95-tc.pdf)

|tokens|parse tree|
|---|---|
|[i, want, british, food]|![i want british food](https://cloud.githubusercontent.com/assets/178797/21772897/64838a1e-d68d-11e6-9a9d-11c7c17cb996.png)|

* As a computational biologist, you want to [predict the secondary structure for an RNA sequence](https://en.wikipedia.org/wiki/Stochastic_context-free_grammar#RNA_structure_prediction)

|tokens|parse tree|
|---|---|
|`GGGC``UAUU``AGCU``CAGU`<br>`UGGU``UAGA``GCGC``ACCC`<br>`CUGA``UAAG``GGUG``AGGU`<br>`CGCU``GAUU``CGAA``UUCA`<br>`GCAU``AGCC``CA` |![rna secondary structure](https://cloud.githubusercontent.com/assets/178797/21773797/af94f972-d690-11e6-97b4-0aad06071634.jpg)|

* As a 3D artist, [you want to create a cool random-looking tree](https://en.wikipedia.org/wiki/L-system#Stochastic_grammars)![L-system dragon trees](https://upload.wikimedia.org/wikipedia/commons/7/74/Dragon_trees.jpg)

* As a computational linguist, [you want to know the most likely table of contents structure for a list of paragraphs](https://digitalheir.github.io/java-rechtspraak-library/document-structure/)






This library allows you to do these things [efficiently](https://github.com/digitalheir/probabilistic-earley-parser-javascript#runtime-complexity), as long as you can describe the rules as a [Context-free Grammar](https://en.wikipedia.org/wiki/Context-free_grammar) (CFG).

The innovation of this library with respect to the many other parsing libraries is that this one allows the poduction rules in your grammar to have a probability attached to them (ie, it parses [Stochastic Context-free Grammars](https://en.wikipedia.org/wiki/Stochastic_context-free_grammar)). This allows us to make a better choice in case of an ambiguous sentence: you just select the derivation with the highest probability. This is called the Viterbi parse.  If you do not need probabilities attached to your parse trees, you are probably better off using [nearley](http://nearley.js.org) instead.

It is not trivial to calculate the Viterbi parse efficiently. For a theoretical grounding of this work, refer to [*Stolcke; An Efficient Probabilistic Context-Free
           Parsing Algorithm that Computes Prefix
           Probabilities*](http://www.aclweb.org/anthology/J95-2002).
  
## Motivation
While libraries for nondeterministic grammars abound, I could not find an existing JavaScript
implementation of the Probabilistic Earley Parser. I have made a stochastic CYK parser before, but I wanted something
more top down that makes it easier to intervene in the parsing process,
for instance when an unexpected token is encountered. 
In many cases Earley also parses faster than CYK (sparse grammars) and it doesn't require the grammar to be 
rewritten in any normal form.
   
## Usage
````javascript
import {getViterbiParse, Grammar} from 'probabilistic-earley-parser';
import treeify from 'treeify';

// Nonterminals are string
const S = "S"; // : NonTerminal 
const NP = "NP"; // : NonTerminal 
const VP = "VP"; // : NonTerminal 
const TV = "TV"; // : NonTerminal 
const Det = "Det"; // : NonTerminal 
const N = "N"; // : NonTerminal 
const Mod = "Mod"; // : NonTerminal 

// Terminals are functions that should return true when the parameter is of given type
const transitiveVerb = (token) => !!token.match(/(hit|chased)/); // : Terminal<string>
const the = (token) => !!token.match(/the/i);// : Terminal<string> 
const a = (token) => !!token.match(/a/i);// : Terminal<string> 
const man = (token) => !!token.match(/man/);// : Terminal<string> 
const stick = (token) => !!token.match(/stick/);// : Terminal<string> 
const with_ = (token) => !!token.match(/with/);// : Terminal<string> 

const grammar = Grammar.builder("test") //: Grammar<string,number> 
    .addNewRule(
        1.0,   // Probability between 0.0 and 1.0, defaults to 1.0. The builder takes care of converting it to the semiring element
        S,     // Left hand side of the rule
        [NP, VP] // Right hand side of the rule
    )
    // NP -> Det N (1.0)
    .addNewRule(
        1.0,
        NP,
        [Det, N] // eg. The man
    )
    // NP -> Det N Mod (1.0)
    .addNewRule(
        1.0,
        NP,
        [Det, N, Mod] // eg. The man (with a stick)
    )
    // VP -> TV NP Mod (0.4)
    .addNewRule(
        0.4,
        VP,
        [TV, NP, Mod] // eg. (chased) (the man) (with a stick)
    )
    // VP -> TV NP (0.6)
    .addNewRule(
        0.6,
        VP,
        [TV, NP] // eg. (chased) (the man with a stick)
    )
    .addNewRule(1.0, Det, [a])
    .addNewRule(1.0, Det, [the])
    .addNewRule(1.0, N, [man])
    .addNewRule(1.0, N, [stick])
    .addNewRule(1.0, TV, [transitiveVerb])
    .addNewRule(1.0, Mod, [with_, NP]) // eg. with a stick
    .build();

const tokens = ["The", "man", "chased", "the", "man", "with", "a", "stick"];
const viterbi = getViterbiParse(
    S,
    grammar,
    tokens
); // : ParseTreeWithScore<string>

console.log(viterbi.probability); // 0.6

/*
0.6
└─ S
   ├─ NP
   │  ├─ Det
   │  │  └─ The
   │  └─ N
   │     └─ man
   └─ VP
      ├─ TV
      │  └─ chased
      └─ NP
         ├─ Det
         │  └─ the
         ├─ N
         │  └─ man
         └─ Mod
            ├─ with
            └─ NP
               ├─ Det
               │  └─ a
               └─ N
                  └─ stick
*/
function printTree(tree) {
  function makeTree(o){if(o.children && o.children.length > 0){const obj = {};
        for(var i=0;i<o.children.length;i++){
            const name = o.children[i].token?o.children[i].token:o.children[i].category;
            obj[name] = makeTree(o.children[i]);
        }
        return obj;
    }else {if(o.token) {return o.token;}
    else {return o.category;}}
  }
  console.log(treeify.asTree(makeTree(tree)));
}

printTree(viterbi.parseTree);

````

## Some notes on implementation

Written in TypeScript, published as a [commonjs module on NPM](https://www.npmjs.com/package/probabilistic-earley-parser) (ES6; use `--harmony_collections` flag if your Node version is < 6) and a [single-file minified UMD module on Github](https://github.com/digitalheir/probabilistic-earley-parser-javascript/releases) in vulgar ES5.

This is an implementation of a probabilistic Earley parsing algorithm, which can parse any Probabilistic Context Free Grammar (PCFG) (also
known as Stochastic Context Free Grammar (SCFG)),
or equivalently any language described in Backus-Naur Form (BNF). In these grammars, 
rewrite rules may be non-deterministic and have a probability attached to them.

The probability of a parse is defined as the product of the probalities all the applied rules. Usually,
we define probability as a number between 0 and 1 inclusive, and use common algebraic notions of addition and
multiplication.

This code makes it possible to use *any* [semiring](https://en.wikipedia.org/wiki/Semiring) for computing
scores. My use for this is to avoid arithmetic underflow: imagine a computation like 0.1 * 0.1 * ... * 0.1.
At some point, floating point arithmetic will be unable to represent a number so small. To counter, we use the Log
semiring which holds the minus log of the probability. So that maps the numbers 0 and 1 to the numbers
between infinity and zero, skewed towards lower probabilities:

#### Graph plot of f(x) = -log(x)

![Graph for f(x) = -log x](https://leibniz.cloudant.com/assets/_design/ddoc/graph%20for%20-log%20x.PNG)


### Runtime complexity
The Earley algorithm has nice complexity properties. In particular, it can
parse:

* any CFG in O(n³), 
* unambiguous CFGs in O(n²)
* left-recursive unambiguous grammars in O(n)

Note that this implementation does not apply innovations such as [Joop Leo's improvement](http://www.sciencedirect.com/science/article/pii/030439759190180A) to run linearly on on right-recursive grammars as well. It might be complicated to implement this: making the parser stochastic is not as easy for Earley as it is for CYK.

For a faster parser that work on non-probabilistic grammars, look into [nearley](nearley.js.org).

### Limitations
* I have not provisioned for ε-rules (rules with an empty right hand side)
* Rule probability estimation may be performed using the inside-outside algorithm, but is not currently implemented
* Higher level concepts such as wildcards, * and + are not implemented
* Viterbi parsing (querying the most likely parse tree) only returns one single parse. In the case of an ambiguous sentence in which multiple dervation have the highest probability, the returned parse is not guaranteed the left-most parse (I think).

## License
This software is licensed under a permissive [MIT license](https://opensource.org/licenses/MIT).

## References
[Stolcke, Andreas. "An efficient probabilistic context-free parsing algorithm that computes prefix probabilities." *Computational linguistics* 21.2 (1995): 165-201.
APA](http://www.aclweb.org/anthology/J95-2002)
