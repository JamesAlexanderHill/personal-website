---
title: "Getting Started with Astro"
description: "My journey exploring Astro as a static site generator and why I chose it for my personal website."
pubDate: 2024-01-15
tags: ["astro", "web-dev", "static-sites"]
---

# Getting Started with Astro

Astro has quickly become my go-to framework for building static websites. Here's why I made the switch and what I've learned along the way.

## Why Astro?

After trying various frameworks, Astro stood out for several reasons:

1. **Zero JavaScript by default** - Ships no JS unless you need it
2. **Component Islands** - Interactive components only where needed
3. **Content Collections** - Type-safe markdown handling
4. **Framework agnostic** - Use React, Vue, Svelte, or vanilla JS

## Key Concepts

### Content Collections

Astro's content collections provide a type-safe way to work with markdown:

```typescript
import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  schema: z.object({
    title: z.string(),
    pubDate: z.date(),
  }),
});
```

### Component Islands

The `client:*` directives control when components hydrate:

- `client:load` - Immediately on page load
- `client:idle` - When the browser is idle
- `client:visible` - When the component is visible

## Conclusion

Astro has been a joy to work with. Its focus on performance and developer experience makes it perfect for content-focused sites like this one.
