# EAYDI — Eunice Ameh Youth Development Initiative

The public website for EAYDI: a youth-centred development organisation empowering
young people and women across Africa through education, leadership development,
health promotion, economic empowerment and community engagement.

Plain static HTML, CSS and JavaScript. **No build step, no dependencies, no
npm install.** Open `index.html` in a browser and it works.

---

## Pages

| File | Purpose |
|---|---|
| `index.html` | Home — hero, pillars, flagship campaign, theory of change, gallery |
| `about.html` | Vision, mission, seven core values, full theory of change, how we work |
| `programmes.html` | The five programme pillars in detail |
| `impact.html` | Figures, the Combating Period Poverty case study, honest accounting, FAQ |
| `gallery.html` | Photo gallery with keyboard-navigable lightbox |
| `get-involved.html` | Volunteer, partner, donate, ambassador + sign-up form |
| `contact.html` | Contact form, details and FAQ |
| `404.html` | Not-found page |

## Running it locally

Just open `index.html`. Or, to serve it properly:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploying

Any static host works — GitHub Pages, Netlify, Vercel, Cloudflare Pages, or plain
shared hosting. Upload the whole repository as-is.

For **GitHub Pages**: Settings → Pages → deploy from branch, choose the branch and
the `/` (root) folder. The `.nojekyll` file is already there so Pages serves the
files untouched.

After you have a real domain, update it in three places: `site/build.py`
(`SITE_URL`), `robots.txt`, and `sitemap.xml`.

---

## Editing content

Two options — pick one and stick with it.

**Option A — edit the HTML directly.** The root `.html` files are ordinary,
readable HTML. Change the words, save, done. If you do this, you can ignore the
`site/` folder entirely.

**Option B — use the generator.** The header, navigation and footer are identical
on every page, so keeping them in sync by hand is easy to get wrong. Instead:

```bash
python3 site/build.py
```

That takes the shared shell in `site/base.html` plus each body fragment in
`site/pages/`, and regenerates every root `.html` file. Edit the shell once and
all eight pages update together.

> If you use Option B, **edit `site/pages/*.html`, not the root files** — running
> the build overwrites the root files.

### Adding a page

1. Create `site/pages/your-page.html`, starting with a meta comment:
   ```html
   <!--
   title: Your page title — EAYDI
   desc: One-sentence description for search results and link previews.
   ogimg: outreach-advocacy.jpg
   nav: your-page
   -->
   ```
2. Add it to the `NAV` list in `site/build.py` if it belongs in the menu.
3. Run `python3 site/build.py`.

## Project layout

```
index.html, about.html, …    the live site (generated, or edit directly)
assets/css/styles.css        design tokens + all styles
assets/css/fonts.css         self-hosted @font-face rules
assets/fonts/                Bricolage Grotesque + Plus Jakarta Sans (woff2)
assets/js/main.js            nav drawer, scroll reveal, counters, accordion, lightbox
assets/img/                  full-size photos (max 1800px wide)
assets/img/thumbs/           900px versions used in grids
site/base.html               shared page shell
site/pages/                  per-page body content
site/build.py                optional generator
```

## Brand

| Token | Value | Used for |
|---|---|---|
| `--ink` | `#0A0A0B` | Primary black — dark sections, buttons, footer |
| `--gold` | `#FFC220` | Brand yellow — accents, CTAs, highlights |
| `--gold-ink` | `#8A6200` | Darker gold for small text on light backgrounds |
| `--paper` / `--paper-2` | `#FFFFFF` / `#FAF8F3` | Page backgrounds |

Headings are **Bricolage Grotesque**, body text **Plus Jakarta Sans** — both
self-hosted in `assets/fonts/`, so the site loads with no third-party request.

Change any colour once in the `:root` block of `assets/css/styles.css` and it
updates everywhere. If you change `--gold-ink`, keep it at 4.5:1 or better against
white.

## Accessibility

Verified in-browser across all eight pages at desktop and mobile widths:

- All text meets **WCAG AA** contrast (alpha-composited backgrounds included)
- Keyboard operable throughout — skip link, visible focus rings, `Escape` closes
  the menu and lightbox, arrow keys move between photos, focus returns to the
  element that opened a dialog
- Every image has descriptive alt text
- Honours `prefers-reduced-motion` — animations and count-ups are disabled
- No horizontal scrolling at 390px

Please keep these intact when editing.

---

## Before going live

Search the HTML for `PLACEHOLDER` and `TODO` — each marks something only EAYDI can
supply:

- [ ] **Contact details** — email addresses, phone number, office address
      (currently `hello@eaydi.org`, `+234 000 000 0000`, "Abuja, Nigeria")
- [ ] **Social media links** — all currently `href="#"` in `site/base.html` and
      `contact.html`
- [ ] **Impact figures** — the four counters on `impact.html` and three in the
      home hero are illustrative placeholders
- [ ] **Giving amounts** — the four unit costs on `get-involved.html`
- [ ] **Donation details** — bank account or payment link on `get-involved.html`
- [ ] **Testimonials** — the three quotes on `impact.html` need real, consented ones
- [ ] **Founder bio** — the three paragraphs in the founder section on `about.html` are
      written from EAYDI's stated values, not from Eunice Ameh. Replace with her own
      words, and confirm both quotes attributed to her (home page and About)
- [ ] **Partner list** — replace the text chips on the home page with real partners
- [ ] **Form handling** — both forms currently show a message instead of sending.
      Point `action=` at Formspree, Netlify Forms or your own handler, then remove
      the `data-demo-form` attribute and the matching block in `assets/js/main.js`
- [ ] **Logo** — `assets/img/favicon.svg` is a placeholder mark; swap in the real
      EAYDI logo and update the inline SVG in `site/base.html`
- [ ] **Two photo gaps** — the Leadership Development and Economic Empowerment pillars
      on `programmes.html` still borrow images from other programmes. A leadership
      training or cohort photo, and a vocational training or woman-at-her-business
      photo, would let each pillar stand on its own.

## Photo credits and consent

Photographs come from two programmes: the Combating Period Poverty outreach
delivered with Youth Arise Africa, and a school-based education programme. The
portrait is of Eunice Ameh, founder.

The gallery page states publicly that images are published with consent and will
be removed on request — please honour that.
