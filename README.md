# Brian Kelley · Developer Portfolio

Personal portfolio for a self-taught SQL and Python developer. Built with Vite, React and TypeScript, plain CSS with custom properties, and no UI library.

Live site: https://briankelley-it.github.io

## Run it locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
npm run preview  # serve the build
```

## Editing content

All text lives in `src/data/`. You never need to touch a component to change what the site says.

| File | What it controls |
| --- | --- |
| `src/data/site.ts` | Name, email, GitHub, LinkedIn, hero text, About columns, Contact copy |
| `src/data/skills.ts` | The three skill cards on the home page |
| `src/data/projects.ts` | The five projects: summary, tags, repo link, metrics, case study, code files, results table |
| `src/data/queries.ts` | Query lab questions, SQL, result rows and "Why it works" notes, plus the schema list |
| `src/data/journey.ts` | Learning timeline and the "Learning right now" tags |
| `src/data/certs.ts` | Certifications grid |
| `src/config.ts` | Code theme (`'dark'` or `'light'`), resume filename, theme storage key |

### Adding a project

Add an object to the `projects` array in `src/data/projects.ts`. Set `featured: true` to show it on the home page. Every skill you list in `skills` is counted by the filter buttons automatically; add new filter names to `projectFilters` if you want a button for them.

### Images

Put images in `public/assets/` and reference them without a leading slash:

- Profile illustration: `public/assets/brian-profile.png`
- Project screenshot (16:10): set `screenshot: 'assets/projects/retail.png'`
- Process images (4:3): set `src` on each item in `process`

## Placeholders to replace

Search the code for `PLACEHOLDER` to find each one.

- [ ] Email address in `site.ts` (currently `brian.kelley@email.com`)
- [ ] LinkedIn URL in `site.ts`
- [ ] Repo URL for each project in `projects.ts`
- [ ] `public/Brian-Kelley-Resume.pdf` (currently a placeholder page)
- [ ] Project screenshots and process images (currently empty slots)
- [ ] Certification names, issuers and years in `certs.ts`
- [ ] **Every metric and sample result in `projects.ts`.** Replace them with numbers from your own runs so everything on the site is accurate.
- [ ] `public/assets/brian-profile.png` if you want your own illustration or photo

## Deploying

### GitHub Pages (set up already)

`.github/workflows/deploy.yml` builds the site and publishes it on every push to `main`.

1. Repo **Settings → Pages → Build and deployment → Source: GitHub Actions** (one time).
2. Push to `main`. The **Actions** tab shows the build; the site updates a minute or two later.

You can also edit a data file straight on github.com (pencil icon → Commit changes) and the site redeploys by itself.

### Vercel

Import the repo in Vercel. It detects Vite: build command `npm run build`, output directory `dist`. No other settings are needed.

## Notes

- Hash routing (`#home`, `#projects`, `#projects/<id>`, `#lab`, `#learning`, `#contact`) means every page has a shareable URL and works on any static host.
- The theme follows the visitor's system setting on first visit, then remembers their choice in `localStorage` under `bk-portfolio-theme`.
- All motion turns off when the visitor has "reduce motion" enabled.
- In light mode, solid buttons use accent-700 (`#416180`) rather than `#5980a6`, and code comments use `#8497ab`, so all text passes the 4.5:1 contrast target.
