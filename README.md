# Probabilistic Earley parser

This is an implementation of a probabilistic Earley parsing algorithm, which can parse any Probabilistic Context Free Grammar (PCFG) (also
known as Stochastic Context Free Grammar (SCFG)),
or equivalently any language described in Backus-Naur Form (BNF). In these grammars, 
rewrite rules may be non-deterministic and have a probability attached to them.



For a theoretical grounding of this work, refer to [*Stolcke, An Efficient Probabilistic Context-Free
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
import {getViterbiParse, Grammar} from 'probabilistic-earley-parser-js';

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
console.log(JSON.stringify(viterbi.parseTree)); // {"category":"<start>","children":[{"category":"S","children":[{"category":"NP","children":[{"category":"Det","children":[{"token":"The","children":[    ]}]},{"category":"N","children":[{"token":"man","children":[]}]}]},{"category":"VP","children":[{"category":"TV","children":[{"token":"chased","children":[]}]},{"category":"NP","children":[{"category":"Det","children":[{"token":"the","children":[]}]},{"category":"N","children":[{"token":"man","c        hildren":[]}]},{"category":"Mod","children":[{"token":"with","children":[]},{"category":"NP","children":[{"category":"Det","children":[{"token":"a",        "children":[]}]},{"category":"N","children":[{"token":"stick","children":[]}]}]}]}]}]}]}]}
console.log(viterbi.probability); // 0.6
````

## Some notes on implementation
Written in TypeScript, compiled to ES5 UMD modules.

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
* I have not provisioned for ε-rules
* Rule probability estimation may be performed using the inside-outside algorithm, but is not currently implemented
* Higher level concepts such as wildcards, * and + are not implemented
* Viterbi parsing (querying the most likely parse tree) only returns one single parse. In the case of an ambiguous sentence, the returned parse is not guaranteed the left-most parse.
* Behavior for strangely defined grammars is not defined, such as when the same rule is defined multiple times with
  a different probability

## License
This software is licensed under a permissive [MIT license](https://opensource.org/licenses/MIT).

## References
[Stolcke, Andreas. "An efficient probabilistic context-free parsing algorithm that computes prefix probabilities." *Computational linguistics* 21.2 (1995): 165-201.
APA](http://www.aclweb.org/anthology/J95-2002)
