---
title: Louvered pergola configurator
summary: Prototype of a 3D configurator in the browser. Pick dimensions, louvers, lighting and furniture, then share the result as a link or export a quote PDF.
year: 2026
role: Concept, 3D pipeline and development
stack: [three.js, WebGL, JavaScript, Blender, Python]
category: side
order: 1
draft: true
---

<!--
DRAFT. Based on the code and files in the Konfigurator folder.
Everything in [square brackets] is for you to fill in or verify.
Check: role (which parts did you build yourself, e.g. the pergola model?), live URL, repo.
Important: the UI follows your employer's design (colors, Inter, 4 px corners).
Clarify whether this may count as a side project or belongs to the company.
-->

## Idea

Anyone buying a patio roof rarely understands a data sheet. They want to see what it looks like at home. The configurator shows a louvered pergola in 3D and lets you change it live, with no installation and no server.

![The configurator in the browser: 3D view on the left, settings on the right](../../../assets/projects/pergola-konfigurator-ui.webp)

## What it does

- **Size and mounting:** width (2.5 to 7 m), depth, clearance height, freestanding or against a wall.
- **Louvers:** opening angle from 0 to 90° with presets, colour for frame, posts and louvers.
- **Equipment:** ZIP screens per side, LED strip and spots (warm or cool, dimmable), infrared heaters.
- **Environment:** day or night, three views (outside, under the roof, top view), furniture that adapts to the size.
- **Output:** a summary (area, height, louvers, posts), a link to the configuration and a PDF for the quote.

## Decisions

### One file, no backend

The whole configuration lives in the link, in the URL. Whoever opens it sees exactly the same pergola. The model and skies are embedded in a single HTML file, and three.js comes from a CDN. That makes the configurator easy to embed anywhere and it needs no database.

### Fast enough for any machine

The louvers are instanced, so turning them stays smooth. Soft shadows and ambient occlusion are a switch (“high quality”), off by default and remembered in the browser.

### Light that matches the sky

A Python script in Blender finds the brightest point of the HDRI sky and stores the sun position and height. The configurator rotates the sky so the sun in the picture sits exactly where the scene light comes from, so shadows and sky agree.

### Two paths, one model

The photorealistic renderings are made in Blender, with CC0 materials and furniture from Poly Haven. In the browser, furniture and house are deliberately simple blocks to keep the page small. Both come from the same scene and are exported by script.

![Rendering of the pergola by day](../../../assets/projects/pergola-render-tag.webp)

![Evening rendering with lighting and heaters](../../../assets/projects/pergola-render-abend.webp)

### Usable for everyone

Choice buttons carry their state (`aria-pressed`), the summary is read out by screen readers, animations respect `prefers-reduced-motion`, and on narrow screens the interface stacks.

## Status

The configurator is a prototype I built over a weekend. The configuration, the 3D view, the shareable link and the PDF work. For real use the business logic is still missing:

- **Pricing logic:** calculate prices from dimensions, equipment and mounting.
- **Data in a database:** options, colours, prices and rules in tables instead of in the code.
- **WooCommerce integration:** turn a configuration into an enquiry or an order.

[Add: is use at your employer planned, and what is the order of the next steps?]

## Retrospective

[What was hardest, for example lighting, performance or the PDF? What would you do differently today?]
