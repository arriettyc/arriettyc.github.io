---
title: Constrained Decoding
date: 2025-03-23 22:26:30
tags:
---

In some LLM-as-judge tasks, i.e. data labelling, we want the LLM to output response in a certain format -- JSON. For an instruct model, prompting with a few shots is the most easy and straight forwards method, but cannot guarantee the format is always right.

Then you may ask -- how can SOTA close source models ensure it's tools call can 99.99% returning in a fixed format? How did they do that? Hmm.. i don't know but i have the same question with you, so here let's talk something called "constrained decoding".

### What is "constrained decoding"?

It's any decoding method that **limits which tokens the LLM is allowed to emit next** so that the final string must satisfy some rule: a regex, a context-free grammar(EBNF), a trie of allowed prefixes, or a JSON schema. Instead of hoping the model follows instructions, you **mask out** illegal tokens at each step (or reject sampling) so invalid strings are impossible.

### Ways to guarantee JSON output from soft to hard

#### Prompting
Ask for "Return in JSON, no prose", include an example, wrapped the example in ''"{..}''' and set a stop sequence like \n\n.

Often works, but not guaranteed

#### Retry - post-validate and repair loop
Let the model response, then `json.load`, if it fails, send the error back to the model "Fix this to valid JSON matching this schema", retry a few times.

Better, simple and effective

#### Regex / prefix constraints
Maintain a **trie (prefix tree)** or a **regex** that only accepts JSON. At each step, mask tokens that would break the regex / prefix.

Good for small, fixed objects i.e. a shortlist with known keys

#### Grammar - constrained decoding 
Provide a formal grammar i.e. EBNF / PEG for the JSON structure
The decoder keeps a parser state, tokens that would violate the grammar are masked -> output is guaranteed to parse
Supported by several runtimes i.e. llama.cpp grammars, HF integrations via custom `LogitsProcessor` libs like Outlines/LMQL/Guidance






