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
| `privacy.html` | Plain-language privacy notice (draft — see checklist) |
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
all nine pages update together. It also gives every photo explicit dimensions and a
small/large `srcset`, so phones do not download desktop-sized images.

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
assets/js/main.js            mobile menu, reading progress, counters, accordion, photo viewer, form validation
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

## Navigation and links

- The logo links home; the header carries About, Programmes, Impact, Gallery, Get involved,
  Contact and a **Donate** button that stays visible on phones.
- Below 1060px the links move into a full-screen menu.
- Every link is a plain relative `<a href>`, so the site works from any folder, on any
  host, and with JavaScript switched off.
- **There are no placeholder (`href="#"`) links.** If a destination does not exist yet,
  the link is left out rather than faked — see the social-media and phone notes below.

## Forms

Both forms validate in the browser (inline messages, focus moves to the first problem),
then open the visitor's own email app with the message filled in, addressed to the
form's `data-mailto`. No server is needed, so they work on any static host.

To switch to a form service (Formspree, Netlify Forms…): give the `<form>` an `action`
and `method`, and delete its `data-mailto` attribute. Validation keeps working.

## Accessibility and quality

Checked in a real browser on all nine pages, at desktop and phone sizes:

- **Links:** every link is clicked through to its destination; anchor links land below
  the sticky header, not under it
- **Keyboard:** Tab reaches everything and never lands on something hidden; skip link,
  visible focus rings, `Escape` closes the menu and photo viewer, arrow keys and swipe
  move between photos, focus returns to where it started
- **Contrast:** all text meets WCAG AA
- **Touch:** interactive targets are at least 40px tall on phones
- **Motion:** `prefers-reduced-motion` turns off animation, count-ups and page transitions
- **No JavaScript:** all content is visible and every link works
- **Layout:** no horizontal scrolling at 390px; images carry dimensions so the page does
  not jump while loading

Please keep these intact when editing.

---

## Before going live

Search the HTML for `PLACEHOLDER` and `TODO` — each marks something only EAYDI can
supply:

- [ ] **Email address** — `hello@eaydi.org` is a placeholder. It appears in the footer,
      the contact page, the privacy page and both forms' `data-mailto`. Search and replace
      it everywhere, along with the office location ("Abuja, Nigeria")
- [ ] **Social media links** — the icon row in the footer is commented out in
      `site/base.html` until there are real profile URLs. Paste them in, uncomment, rebuild
- [ ] **Phone number** — removed until there is a real one; a ready-made card is
      commented out in `site/pages/contact.html`
- [ ] **Impact figures** — the four counters on `impact.html` and three in the
      home hero are illustrative placeholders
- [ ] **Giving amounts** — the four unit costs on `get-involved.html`
- [ ] **Donation details** — bank account or payment link on `get-involved.html`
- [ ] **Testimonials** — the three quotes on `impact.html` need real, consented ones
- [ ] **Founder bio** — the three paragraphs in the founder section on `about.html` are
      written from EAYDI's stated values, not from Eunice Ameh. Replace with her own
      words, and confirm both quotes attributed to her (home page and About)
- [ ] **Partner list** — replace the text chips on the home page with real partners
- [ ] **Privacy notice** — `privacy.html` describes how this website actually behaves.
      EAYDI should review it against its own obligations before launch
- [ ] **Global goals** — the SDG mapping on `impact.html` is our reading of the mission;
      confirm or edit
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
