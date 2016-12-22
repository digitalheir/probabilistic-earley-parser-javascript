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
todo

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
