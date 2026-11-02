# Automotive Dealership Platform — Full-Stack Portfolio Project

**A sanitised, independent technical showcase based on a live UK automotive dealership platform I designed and developed.**

**Live client project:** [Armitage Motors](https://armitagemotorsltd.uk)  
**This repository:** fictional **Northstar Motors** demo — **not connected** to the client's live website, vehicle database, enquiries, login or image bucket.

> **Portfolio / demo only.** This is a fictional dealership used to demonstrate the work. All vehicle records are invented. No real registration numbers, customer information, business contact details, keys, tokens, original listing photographs or database exports are in this repository. Obtain the client's permission before making client-owned code public.

## Design direction

![AI-generated premium automotive hero asset used in the fictional demo](assets/hero-bmw-gold.webp)

*Illustrative AI-generated hero image. The repository deliberately excludes photos of the client’s actual stock.*

## The challenge

The client needed a professional online presence **and** a secure workflow for maintaining rapidly changing vehicle stock without asking a developer to edit the website for every new car.

## What I built

- Responsive multi-page dealership site: Home, Stock, About, Reviews, Part Exchange and Contact.
- Searchable stock with filters, alphabetical sorting, SOLD statuses and rich vehicle galleries.
- Owner-facing portal for adding and editing vehicles, marking sales and uploading/reordering photos.
- Persistent production architecture using **Cloudflare D1** for records and **Cloudflare R2** for photographs.
- Server-side owner authorisation using **Cloudflare Access JWT validation**.
- Customer enquiries and valuations via **Cloudflare Pages Functions**, **Turnstile** and **Resend**.
- Deployments to Cloudflare Pages with a custom domain.

## Technology stack

`HTML` · `CSS` · `JavaScript` · `Cloudflare Pages` · `Pages Functions` · `D1` · `R2` · `Cloudflare Access` · `Turnstile` · `Resend`

## Run the safe demo locally

```bash
python3 -m http.server 8000
```

Open http://localhost:8000. Browse fictional sample vehicles at **/stock/**, or use the **/portal/** to explore the browser-only management interface. Changes are stored in your browser's localStorage, **not** sent to a server or the real dealership. The enquiry forms are deliberately disabled. The demo is clearly labelled as fictional on each public page.

**Note:** The demo is intended for local exploration. Do not deploy it over the real client's Cloudflare Pages project, and don't confuse the demo with the owner's real portal. Cloudflare's Functions are included as architectural reference but require separately provisioned services to run in a new production project.

## Repository tour

| Path | Responsibility |
|---|---|
| `index.html`, `styles.css`, `site.js` | Home page, design system and navigation |
| `stock/`, `script.js`, `stock-store.js` | Stock discovery, filters, details and local demo data layer |
| `portal/` | Owner interface and photograph-management interactions |
| `functions/api/` | Customer-facing API routes (D1, enquiries, optional Google reviews) |
| `functions/portal/`, `functions/_lib/` | Owner-authorised API endpoints and validation |
| `assets/` | AI-generated illustrative demo imagery (no client car photographs) |
| `D1-MIGRATION.sql` | Database schema example (no real records) |
| `docs/ARCHITECTURE.md` | Architecture and data flow |
| `docs/SANITISATION.md` | What's intentionally excluded |

## What I learned

This project strengthened my ability to turn client requirements into a working full-stack product, work with cloud storage and relational data, build access-controlled CRUD interfaces and maintain a production website through iterative feedback.

## Boundaries

This code is provided as a portfolio demonstration only; it does not grant rights to any client's commercial branding or confidential materials. The live site and all associated data remain separate.

## Publishing and privacy

- **Never publish the deployment ZIP used on the client's live website.** Upload only the contents of this sanitised repository.
- No production API keys, actual D1 rows, R2 vehicle photographs, contact records or access tokens are included.
- This demo is **not** linked to the live stock portal, enquiry inbox or production Cloudflare environment.
- **Keep the repository private until you have permission to share the implementation publicly.**
- GitHub is for showcasing the project; the real website continues to run on Cloudflare Pages.
