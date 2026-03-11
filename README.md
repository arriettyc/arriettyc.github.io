## 3D Dynamic Tags Cloud ✨

Your blog now features a modern, interactive 3D tag cloud! Tags automatically update when you add new posts.

### Features
- **Interactive 3D visualization** - Tags rotate in 3D space
- **Mouse tracking** - Control rotation with your cursor
- **Auto-updating** - New tags appear automatically when you publish posts
- **Dark mode support** - Looks great in both light and dark themes
- **Responsive design** - Works on all devices

📖 See [TAG_CLOUD_IMPLEMENTATION.md](TAG_CLOUD_IMPLEMENTATION.md) for full documentation.

## Create New Post

```bash
git checkout hexo_source
```

```bash
hexo new post "My New Post Title"
```

Edit your post and **add tags**:
```yaml
---
title: My New Post Title
date: 2026-03-01
tags:
  - machine-learning
  - python
  - tutorial
---
```

```bash
hexo clean
hexo generate
hexo server
```

Visit http://localhost:4000/tag/ to see your tags in 3D!

```bash
hexo clean
hexo generate
hexo deploy
```

```bash
git add .
git commit -m "Add new post: My New Post Title"
git push origin hexo_source
```


