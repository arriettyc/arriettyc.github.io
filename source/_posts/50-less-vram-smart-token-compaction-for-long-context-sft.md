---
title: '50% Less VRAM: Smart Token Compaction for Long-Context Supervised Training'
date: 2026-07-02 19:27:45
tags:
mathjax: true
---

> **tl;dr** Throw away context tokens and only keep the active tokens (assistant responses) for loss calculation. Only keep the last layer's active `hidden_states` before passing to `lm_head`. Cut VRAM usage by ~50%.

In vanilla LLM SFT training, the final loss calculation is often the biggest memory bottleneck for long context. The memory needed:

$$
\Large \text{batch_size} \times \text{seq_len} \times \text{vocab_size} \times \text{precision}
$$

With 32k context, Qwen3's 151k vocab size, and FP32 precision, a single tensor takes 10-15GB VRAM right at the end of forward pass. Liger's chunked cross-entropy helps, but there's something simpler we can do before `lm_head`.

Do we really need to project every token's `hidden_states` through `lm_head` for SFT? No. We only need the active tokens (the assistant's responses). For single-turn CoT or multi-turn data, context easily takes 50-90% of input tokens. Those unused tokens spike memory and cause OOM.

You can do this with `trl.SFTConfig(...loss_type="chunked_nll"...)`, or roll your own:

```python
def memory_efficient_loss(lm_head: nn.Module,
                         hidden_states: torch.Tensor, # (b, s, h)
                         labels: torch.Tensor,): # (b, s)
   flatten_hidden_states = hidden_states.reshape(-1, hidden_states.shape[-1]) # (b*s, h)
   flatten_labels = labels.reshape(-1) #(b*s, )

   active_mask = flatten_labels != -100 # (b*s, )

   # if a batch happens to contain no target tokens,
   # return a dummy zero loss to keep the training loop from crashing.
   if not active_mask.any():
       return torch.tensor(0.0, device=hidden_states.device, requires_grad=True)

   activate_hidden_states = flatten_hidden_states[active_mask, :] #(active_num, h)
   active_labels = flatten_labels[active_mask] #(active_num, )

   logits = lm_head(activate_hidden_states)
   from flash_attn.losses.cross_entropy import CrossEntropyLoss
   loss_fct = CrossEntropyLoss(reduction="mean")
   loss = loss_fct(logits, active_labels)
   return loss

# during training
output = self.model(**model_inputs, output_hidden_states=True)
loss = self.memory_efficient_loss(
   lm_head=self.model.lm_head,
   hidden_states=output.hidden_states[-1],
   labels=batch["labels"],)
(loss / self.training_args.gradient_accumulation_steps).backward()
```

This immediately solved my OOM issues. Using PyTorch's [memory visualization tool](https://docs.pytorch.org/memory_viz), the loss memory spike dropped from **11.2GB to 5.2GB** — pretty much cut in half. 

## Appendix
A peek at the token length distribution with a small sample size

<img src="/files/token_len_plot.png" alt="Token Length Distribution" style="display: block; margin-left: 0;" />
