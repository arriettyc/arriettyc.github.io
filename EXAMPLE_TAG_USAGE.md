# Example: Adding Tags to Your Posts

## Current Situation
Currently, only one of your posts has tags defined. Let's add meaningful tags to all your posts!

## Recommended Tags for Your Existing Posts

### 1. hunting-down-a-4x-pytorch-memory-leak-in-a-serverless-environment.md
**Current tags**: `memory, gc, container, pytorch, cache`
**Recommendation**: These are already good! Consider splitting into array format:

```yaml
---
title: Hunting Down a 4x PyTorch Memory Leak in a Serverless Environment
date: 2026-02-26
tags:
  - memory-management
  - garbage-collection
  - container
  - pytorch
  - caching
  - serverless
  - debugging
  - python
---
```

### 2. nn-regularization.md
**Current tags**: (empty)
**Recommended tags**:

```yaml
---
title: Neural Network Regularization
date: 2025-01-10
tags:
  - neural-networks
  - regularization
  - machine-learning
  - deep-learning
  - dropout
  - batch-normalization
  - overfitting
---
```

### 3. tokenizer-toy-box.md
**Current tags**: (empty)
**Recommended tags**:

```yaml
---
title: Tokenizer Toy Box
date: 2025-03-12
tags:
  - nlp
  - tokenization
  - transformers
  - text-processing
  - bpe
  - wordpiece
---
```

### 4. Decoder-Only.md
**Current tags**: (empty)
**Recommended tags**:

```yaml
---
title: Decoder-Only Transformers
date: 2025-01-08
tags:
  - transformers
  - decoder
  - architecture
  - attention-mechanism
  - gpt
  - llm
---
```

### 5. grpo_r1.md
**Current tags**: Has tags field but may be incomplete
**Recommended tags**:

```yaml
---
title: GRPO and R1
date: 2025-02-02
tags:
  - reinforcement-learning
  - rlhf
  - grpo
  - r1
  - policy-optimization
  - llm-training
---
```

### 6. auto-regressive.md
**Current tags**: (empty)
**Recommended tags**:

```yaml
---
title: Auto-regressive Models
date: 2024-12-21
tags:
  - auto-regressive
  - language-models
  - sequence-modeling
  - transformers
  - generation
---
```

### 7. From-stochastic-to-deterministic-with-Minimize-Entropy.md
**Current tags**: (empty)
**Recommended tags**:

```yaml
---
title: From Stochastic to Deterministic with Minimize Entropy
date: 2024-12-13
tags:
  - entropy
  - stochastic-processes
  - deterministic
  - information-theory
  - machine-learning
---
```

## Tag Categories to Consider

### Technical Topics
- `machine-learning`
- `deep-learning`
- `neural-networks`
- `transformers`
- `nlp`
- `computer-vision`

### Frameworks & Tools
- `pytorch`
- `tensorflow`
- `python`
- `javascript`
- `docker`
- `kubernetes`

### Concepts
- `architecture`
- `optimization`
- `regularization`
- `attention-mechanism`
- `training`
- `inference`

### Practical
- `debugging`
- `performance`
- `deployment`
- `serverless`
- `tutorial`
- `best-practices`

## How Tags Appear in 3D Cloud

After adding these tags, your 3D tag cloud will show:

**Most Common Tags** (larger and more prominent):
- `machine-learning` (appears in 4+ posts)
- `neural-networks` (appears in 3+ posts)
- `transformers` (appears in 4+ posts)

**Medium Frequency Tags**:
- `python`, `pytorch`, `deep-learning`, `nlp`

**Specific Tags** (smaller, but colorful):
- `grpo`, `r1`, `tokenization`, `entropy`, `debugging`

## Benefits of Good Tagging

1. **Better Navigation**: Readers can find related content easily
2. **SEO**: Search engines index your content better
3. **Content Discovery**: Tags help readers discover topics
4. **Visual Appeal**: More tags = more impressive 3D cloud!
5. **Topic Clustering**: See which topics you write about most

## Quick Tag Adding Script

Want to add tags to all posts quickly? Here's a template:

```bash
# For each post file, add tags in the frontmatter:
# source/_posts/your-post.md

---
title: Your Post Title
date: 2025-01-01
tags:
  - tag1
  - tag2
  - tag3
---

Your post content here...
```

## Viewing Your Tags

After adding tags to your posts:

```bash
hexo clean
hexo generate
hexo server
```

Then visit: **http://localhost:4000/tag/**

You'll see all your tags floating in beautiful 3D space! 🎨

## Tag Best Practices

### Do ✅
- Use 3-7 tags per post
- Use lowercase with hyphens: `machine-learning`
- Be specific: `pytorch` instead of just `ml`
- Use consistent naming across posts
- Include both broad and specific tags

### Don't ❌
- Don't use spaces: `machine learning` ❌
- Don't use too many tags (>10)
- Don't use single-letter tags
- Don't create tags for one-time topics
- Avoid redundant tags: `ml` + `machine-learning`

## Example: Perfect Post Tagging

```yaml
---
title: Building a Transformer from Scratch
date: 2026-03-01
tags:
  - transformers        # Main topic
  - attention-mechanism # Core concept
  - pytorch            # Framework
  - tutorial           # Content type
  - nlp                # Domain
  - deep-learning      # Broad category
---

In this post, we'll build a transformer architecture from scratch...
```

This post will contribute to 6 different tags in your 3D cloud!

## Next Steps

1. **Edit your posts** - Add tags to posts without them
2. **Run `hexo generate`** - Rebuild your site
3. **Visit `/tag/`** - See your beautiful 3D tag cloud
4. **Write new posts** - With proper tags from the start!

Happy tagging! 🏷️✨
