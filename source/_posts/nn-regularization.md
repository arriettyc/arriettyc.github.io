---
layout: post
title: NN Regularization -- Dropout in Additional Transformer Head
date: 2025-01-10 21:48:42
tags:
---

### What is Regularization
Regularization refers to any technique used to prevent overfitting in machine learning models. Overfitting happens when a model performs well on training data but poorly on unseen (test) data because it “memorizes” patterns instead of learning general rules.

### Purpose of Regularization
Regularization helps models:

1. Generalize better to new data.
2. Avoid relying too much on specific features or neurons.
3. Learn smoother, more robust representations.

### Regularization Techniques

| Method | What It Does |
|--------|--------------|
| Dropout | Randomly zeroes out neurons during training |
| L2 Regularization | Adds a penalty for large weights (also called weight decay) |
| Early Stopping | Stops training when validation loss stops improving |
| Data Augmentation | Adds variety to training data to avoid memorization |

### Dropout In Real World
Imagine the learning process is a student taking an exam, dropout is like giving the student slightly incomplete notes every time they study. Over time, they learn the underlying concepts instead of memorizing exact phrases – leaning to better generalization.

### Dropout Example In Transformer Classifier Head Training
“Add regularization before the final classifier” --> (What does it mean?) --> “Apply dropout or another technique to the features passed to the final classification layer to prevent overfitting and encourage generalization”

```python
sequence_output = self.dropout(sequence_output)
classifier_logits = self.score(sequence_output)
```

### Summary
Adding dropout before the classifier introduces controlled noise, making it harder for the model to memorize patterns – this encourage learning of generalizable features instead.