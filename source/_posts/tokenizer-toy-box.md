---
title: "Tokenizer Playbook: BPE, SentencePiece, and Multilingual Tricks"
date: 2025-03-12 15:09:21
tags:
---

This post is part of my journey toward pre-training. I see a near future where AI shifts from monolithic “AGI” toward orchestrated **ASI (Artificial Specialized Intelligence)** systems. If Mixture-of-Experts (MoE) is hard to train and expensive to serve, why not split the giant model into several smaller models that are easier to verify, control, deploy, and even run locally?

For that, I’m starting with a core building block: **tokenizers**.

## Basics

A **tokenizer** maps between text and integers.

- **Encode**: take a string → output a list of integers (tokens)  
- **Decode**: take a list of integers → reconstruct the string

Why do we need this? Because training and inference are linear-algebra on numbers, not raw strings.

**Libraries**  
- Use **`tiktoken`** when you need compatibility with OpenAI-style vocabularies.  
- Use **SentencePiece** when you want to **train your own tokenizer** (custom domains, multilingual corpora, pre-training from scratch).

## Tokenization & Compression

Modern tokenization borrows ideas from **data compression**.

**Step 1 — Represent text as integers.**  
The simplest approach is character IDs:

```text
"hi yo" -> ['h','i',' ','y','o'] -> [46, 47, 1, 63, 53]
```

This works but offers **no compression** — longer sequences mean higher cost, slower speed, and shorter effective context.

**Step 2 — Compress.**
Methods like Byte Pair Encoding (BPE) iteratively merge the most frequent adjacent pairs into larger subword units, shrinking average sequence length while retaining full coverage.

> Quick mental model: frequent words/subwords become single tokens; rare words fall back to smaller pieces.

## Out of Vocabulary (OOV)

Modern subword tokenizers avoid “true” OOV. Any string can be expressed as subwords (or ultimately characters/bytes). The trade-off is longer sequences for rare or unusual strings.

## Training (or Adapting) a Tokenizer for Pre-Training

If you’re training a specialized model with rare strings—e.g., clinical dialogs with ICD-10 codes—and you want codes like E11.9 to stay intact, you have two main paths:

### Use an existing tokenizer and add special tokens

Low effort and often sufficient.

```python
import tiktoken

enc = tiktoken.get_encoding("cl100k_base")
custom_enc = tiktoken.Encoding(
    name="custom",
    pat_str=enc._pat_str,
    mergeable_ranks=enc._mergeable_ranks,
    special_tokens={**enc._special_tokens, "E11.9": enc.n_vocab}  # choose an unused ID
)

tokens = custom_enc.encode("Patient diagnosed with E11.9")
print(tokens)  # "E11.9" becomes a single token
```
> Note: This custom mapping affects your tokenizer. A model must have embeddings for these IDs (i.e., be trained/fine-tuned with them) to benefit.

### Train a new tokenizer from your dataset

Most flexible, especially for **multilingual data** (English, Chinese, Japanese, Russian, French, etc.). A strong default is **a joint multilingual Unigram model** with SentencePiece.

#### Training Recipe (SentencePiece)

Guidelines
```text
Model: unigram
Vocab size: 64k–80k (increase if your corpus has lots of code/emoji/URLs)
Normalization: Unicode NFKC (default); do not lowercase if case matters (ICD codes)
CJK coverage: --character_coverage=0.9995 for mixed CJK + Latin
Robustness: --byte_fallback=true (ensures no true OOV)
Domain symbols: pass a user_symbols.txt (e.g., common ICD-10 codes) so they become indivisible tokens
```

CLI
```bash
spm_train \
  --input=all_corpus.txt \
  --model_prefix=spm_unigram_80k \
  --model_type=unigram \
  --vocab_size=80000 \
  --character_coverage=0.9995 \
  --byte_fallback=true \
  --user_defined_symbols=user_symbols.txt \
  --unk_id=0 --bos_id=1 --eos_id=2 --pad_id=3 \
  --input_sentence_size=5000000 --shuffle_input_sentence=true \
  --hard_vocab_limit=false

```
> Tip: Build user_symbols.txt from the top N domain strings in your corpus (e.g., most frequent ICD-10 codes). This preserves what matters without exploding the vocab.

#### Verifying the Tokenizer

Evaluate on a held-out multilingual set:
```text
Tokens per char/word by language (EN/zh/ja/ru/fr). Aim for low token inflation, especially for CJK.
ICD-10 stability: top codes should be single tokens; rare ones should still be short (e.g., E11 + .9).
Round-trip fidelity: exact detokenization (keep punctuation like the dot in E11.9).
Throughput & memory: larger vocab → larger embeddings; find the sweet spot.
```
A tiny probe:
```python
import sentencepiece as spm
sp = spm.SentencePieceProcessor(model_file="spm_unigram_80k.model")

samples = [
  "Dx: E11.9 Type 2 diabetes mellitus without complications.",
  "患者被诊断为E11.9，并建议随访。",
  "患者はE11.9と診断された。",
  "Пациент с диагнозом E11.9.",
  "Le patient présente un E11.9."
]

for s in samples:
    pieces = sp.encode(s, out_type=str)
    print(s, "\n ->", pieces, "\n")
```

## Notes & Alternatives

- Byte-level BPE (HF tokenizers) is excellent for mixed ASCII/code/emoji/URLs. For heavy CJK, Unigram often yields fewer tokens unless you tune BPE carefully.
- If the universe of codes is huge and evolving, consider lightweight wrappers like <dx>E11.9</dx> plus a smaller set of pinned codes.
- Up-weight domain lines when training the tokenizer so frequency-driven merges favor your symbols.

Happy coding, good luck of modeling <3