---
title: "Personal Website"
description: "My personal portfolio and blog built with Astro, TailwindCSS, and React."
pubDate: 2024-01-01
tags: ["astro", "tailwindcss", "react", "typescript"]
repo: "https://github.com/JamesAlexanderHill/personal-website"
featured: true
---

# Personal Website

This is the website you're currently viewing! Built with modern web technologies for optimal performance and developer experience.

## Tech Stack

- **Astro** - Static site generation with component islands
- **TailwindCSS** - Utility-first CSS framework
- **React** - Interactive components (role animator, contact form)
- **TanStack Form** - Form state management
- **TypeScript** - Type safety throughout

## Features

### Trainstation Letter Animation

The role animator on the homepage uses a flip animation inspired by old train station departure boards. Each letter flips independently to create a mechanical feel.

### Content Collections

Blog posts and projects are managed through Astro's content collections, providing type-safe markdown handling with frontmatter validation.

### Contact Form

The contact form uses TanStack Form for validation and state management, making it easy to extend with backend integration later.

## Performance

Thanks to Astro's zero-JS-by-default approach, this site scores highly on Core Web Vitals:

- **LCP** - Under 1.5s
- **FID** - Under 100ms
- **CLS** - Near zero

## Lessons Learned

Building this site reinforced my appreciation for static site generation and the power of shipping less JavaScript to the client.
