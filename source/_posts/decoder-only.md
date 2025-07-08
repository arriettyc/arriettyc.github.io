---
title: Decoder Only
date: 2025-01-08
tags:
---

Origin Transformers = Encoder + Decoder

When the Transformer model architecture was originally introduced in the paper *Attention is All You Need*, it has 2 parts

|   Part   | Purpose  | Example |
|:---------|:--------| :--------|
| Encoder   | Reads the input and builds a contextual hidden representation ("understands" the input)   | reads an Chinese sentence
| Decoder    | Generates output tokens one-by-one, using the both previous outputs (causal attention) and encoder outputs (cross attention)    | outputs an English sentence

## Decoder-Only Model

A decoder-only model only uses the decoder stack, it learns to predict the next token in a sequence causally (w/o looking ahead at future tokens).

A decoder-only transformers,
1. Inputs are fed directly into the decoder -- no separate encoder
2. Self-attention is causal (masked)
    - A token can only attend to previous tokens, not future ones
    - Prevents "cheating" during training and generation
3. Auto-regressive generation, token by token prediction -- each new token depends only on earlier ones
4. Training Objective, **Causal Language Modeling (CLM)** -- maximize the probability of the next token


As for today, majority of LLMs are decoder-based model, gpt/llama/mistral.... Encoder-Decoder examples could be BART series, and used for translation / summarization etc

## Why Decoder-Only

With auto-regression, decoder-only model can handel encoder-decoder tasks (translation/summarization) pretty well. But that's not enough, more reasons,
1. **Simple**, only one block (the decoder) makes the architecture lighter
2. **Auto-regressive generation**, perfect for open-ended text generation and dialogue, as mentioned above
3. **Scaling**, easier to parallelize w/o worrying about complex encoder-decoder attention patterns
4. **Unified Interface**, a single sequence concat "prompt" and "response" parts w/o special cross attention rules

In shorts, decoder-only is simpler, faster, and fits LLM pre-training better


A decoder-only transformer is a neural network architecture that uses only the decoder component of the transformer design, applies causal self-attention, and is trained to predict the next token in an auto-regressive fashion, enabling natural text generation w/o a separate encoder.