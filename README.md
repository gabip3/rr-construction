# R&R Construction

Marketing site for R&R Construction (Revive & Remodeling), residential remodeling in Atlanta, Georgia.

Static HTML, CSS and vanilla JavaScript. No build step, no framework, no runtime dependencies. Open `index.html` or serve the folder and it runs.

```bash
npx --yes serve -l 5178 .
```

---

## Files

```
index.html                  home
gallery.html                gallery, grouped by room
assets/css/tokens.css       colour, type, spacing, motion, layout variables
assets/css/base.css         reset, document type, layout primitives, reveal system
assets/css/components.css   logo, buttons, links, header/nav, form fields, before-after
assets/css/sections.css     each section, in document order
assets/css/gallery.css      gallery page only: grids and lightbox
assets/js/main.js           intro, reveals, header, nav, sliders, form, lightbox
assets/img/photos/          photography used on the home page
assets/img/gallery/         photography used only on the gallery page
assets/img/logo/            logo variants and the social card
```

Load order matters: `tokens` → `base` → `components` → `sections` → `gallery`. Later files assume the earlier ones. One stylesheet and one script serve both pages; each behaviour bails out quietly when its markup is absent.

## The gallery

`gallery.html` groups 29 photographs into six sections: Kitchens, Living Rooms, Dining Rooms, Stairs & Carpentry, Flooring, Entryways & Trim. A sticky index bar jumps between them.

Finished rooms sit alongside the stages that produced them, tagged **Before** or **In progress** so nobody mistakes a framing shot for a finished one.

Clicking any photograph opens a lightbox that moves within that photograph's group only. It supports arrow keys, swipe, Escape, a focus trap, and returns focus to the tile that opened it.

**The layout is column masonry, not a row grid.** The set is 17 portrait and 12 landscape photographs. A fixed-ratio grid cropped the verticals into landscape boxes and left holes wherever the spans failed to tile. Masonry lets every photograph keep its own proportions, so nothing is cut and there are no gaps. Adding one needs no CSS or JavaScript change: copy an `<li class="gal-item">` block into the relevant `<ul data-lightbox-group="...">`. Keep the `width` and `height` attributes accurate, they are what reserves the right shape before the image loads.

## The intro

A full-screen warm white panel with the logo, a line, and a loading bar drawn as the same dimension line used across the site, complete with end ticks and a travelling gold tick.

**The line is picked at random per visit** from five, all things that actually happen on a jobsite:

- Letting the paint dry.
- Still faster than a permit.
- Sawdust settling.
- Snapping the chalk line.
- Measure twice.

Edit the `INTRO_LINES` array near the top of `assets/js/main.js` to change them. The copy in the HTML is only the pre-JavaScript default and should stay one of the five.

It shows **once per session**, so moving between the home page and the gallery does not replay it. On screen for about 3.3 seconds: the bar travels for 2.1s, holds at full for a moment, then fades over 0.55s. Loading can push that longer but never shorter, so a fast connection cannot cut the line short. A 4.5 second cap means a slow asset can never hold the site behind it.

Hidden entirely for `prefers-reduced-motion`, never appears without JavaScript, and carries a CSS-only failsafe that clears it at 6 seconds even if the script never arrives. To remove it, delete the `<div class="intro">` block from both pages.

---

## Things you need to do before this goes live

### 1. Photographs (done, but read this)

Real photography is in. The originals live in `Fotos RR/`; web versions were resized and re-encoded into `assets/img/photos/`. Nothing references the originals, so exclude `Fotos RR/` when you deploy.

| Web file | Source | Used for |
| --- | --- | --- |
| `hero-hallway.jpg` | `rr.jpeg` | Hero |
| `service-kitchen.jpg` | `RRPic (2).jpeg` | Kitchen Remodeling feature |
| `service-carpentry.jpg` | `RR (1).jpeg` | Custom Carpentry & Trim feature |
| `project-greatroom.jpg` | `RR (3).jpeg` | Projects, large |
| `project-kitchen.jpg` | `RR_Kitchen (3).jpeg` | Projects |
| `project-flooring.jpg` | `RR (4).jpeg` | Projects |
| `ba-fireplace-before/after.jpg` | `RRPic (13)`, `RR (6)` | Before & After, pair one |
| `ba-dining-before/after.jpg` | `RRPic (15)`, `RRPic (17)` | Before & After, pair two |
| `why-protection.jpg` | `RRPic (6).jpeg` | "The part that isn't on the estimate" |
| `about-living.jpg` | `RRPic (7).jpeg` | About |

**Three things to check.**

**There are no bathroom photos in the set.** The brief called for Kitchen and Bathroom as the two photo features. Rather than show a bathroom with a placeholder, the second feature is Custom Carpentry & Trim, built around the staircase wall, which is the strongest carpentry work in the folder. Bathroom Remodeling is still first in the services list. Send bathroom photos and it swaps straight back.

**The project locations all say "Atlanta, GA".** I don't know which neighbourhood each job was in, so I used the general service area rather than invent one. Correct these in `index.html` under each `project__place`.

**The "before" in the fireplace pair has framing already started.** It is the earliest photo of that wall in the set and still shows the original brass surround and builder mantel. If a true pre-demolition shot exists, swap it in.

To replace any photo, drop the new file in `assets/img/photos/` and update the `src` plus the `width`/`height` attributes in `index.html`. Every frame uses `object-fit: cover`, so a different ratio still fills correctly, but keep the attributes accurate: they reserve layout space and stop the page shifting as images load.

### 2. Logo (done, but read this)

The real logo is wired in, derived from `LOGO RR SEM FUNDO.png`. Generated assets live in `assets/img/logo/`:

| File | Size | Used for |
| --- | --- | --- |
| `rr-logo.png` | 700 × 504 | Header. Full lockup, original colours |
| `rr-logo-light.png` | 420 × 302 | Footer. Full lockup recoloured for the black band |
| `rr-mark.png` | 260 × 152 | Roof, chimney and R&R monogram only (spare) |
| `rr-mark-light.png` | 260 × 152 | Same mark, recoloured for dark surfaces (spare) |
| `og-card.png` | 1200 × 630 | Social share card |

Two things worth knowing:

**The header is sized around the lockup.** The master logo is very vertical, roof over `R&R` over `CONSTRUCTION` over `REVIVE & REMODELING`, so the header stands at 106px and condenses to 78px once you scroll. Even so, at header scale the `REVIVE & REMODELING` line is only a few pixels tall and will not be readable. That is unavoidable with a stacked lockup in a horizontal bar. If you want a legible tagline up there, a horizontal variant from your designer is the fix; `rr-mark.png` is in the folder as a starting point.

**The light variant is generated, not hand-drawn.** Low-saturation dark pixels were mapped up into the warm-white range while the gold was left untouched, so the bevel shading survives. If you have a proper light version from your designer, drop it in over `rr-logo-light.png` at the same dimensions.

The two source PNGs at the project root (`LOGO RR COM FUNDO.png`, `LOGO RR SEM FUNDO.png`) are your masters. They total 2.3MB and are not referenced by the site, so exclude them when you deploy.

### 3. Paste the Web3Forms access key

The form is wired to Web3Forms and needs one value. In `index.html`, find:

```html
<input type="hidden" name="access_key" value="PASTE-YOUR-WEB3FORMS-ACCESS-KEY-HERE">
```

Replace it with the key from [web3forms.com](https://web3forms.com). That is the only change needed; submissions arrive at whichever email you registered with.

How it behaves:

- Validates first, and only sends once every required field is valid.
- Posts over `fetch`, so the visitor never leaves the page. Success clears the form and confirms in gold; a failure asks them to call or text and says so in red.
- While the key is still the placeholder, submitting does **not** fire a doomed request. It tells the visitor to call or text instead. So the form is safe to publish before you have the key.
- A hidden `botcheck` honeypot is included; Web3Forms discards anything that fills it in.

The `subject` and `from_name` hidden fields set how the email reads in the inbox. Edit them if you want different wording.

### 4. Fill in the placeholders below

- **Testimonials** are written as examples. Replace both with real, attributed reviews. They are marked with a comment in `index.html`.
- **The phone number must be able to receive texts.** Every contact point now offers Call and Text side by side, and the `sms:` links go to the same number as the `tel:` links. If (943) 255-2352 is a landline, the Text buttons will fail silently on the visitor's phone. Point them at a mobile or VoIP number that accepts SMS, or remove them.
- **Social links** in the footer point at `#`. Add the real Instagram, Facebook and Google Business URLs.
- **Before & After descriptions** are written from what the photographs show. Correct any detail that is wrong.
- **Project locations** under each gallery image all read "Atlanta, GA".
- **`<link rel="canonical">`** in `<head>` points at a placeholder domain.
- **Business hours** in the contact section say Monday to Saturday, 8am to 6pm.

**Licensed and insured** now appears in four places: the hero metadata, item 01 of "The part that isn't on the estimate", a gold-ruled line in the footer, and the `GeneralContractor` structured data. Some states require the licence number to be shown wherever the claim is made. Worth a quick check for Georgia, and if so add it beside the footer line.

---

## Design notes

**Palette.** Taken from the logo: black `#242426`, charcoal `#303033`, warm gold `#D99A00`, rich gold `#E7A900`, warm white `#FAF9F6`, soft cream `#F3F0E9`, light warm gray `#E7E3DC`.

One extra tone exists, `--c-gold-deep` `#8A5F00`. Warm gold on a light background only reaches 2.1:1, which fails contrast for text. The deep gold hits 5.4:1 and is used wherever gold needs to carry readable text on a light surface. Bright gold is reserved for dark backgrounds, rules, and non-text detail.

**The recurring device** is a gold hairline used the way a dimension line is used on a construction drawing. It measures, separates, and in the hero it runs out of the text column and crosses 158px into the photograph. It is the only element allowed to travel across the layout, which is what keeps gold from taking over. The four-pane window from the logo reappears as the node marker on the process timeline.

**Full-bleed edges are pure CSS.** Sections whose photograph runs off the viewport edge (hero, both service features, About) are full-width grids with a `--edge` margin track on the side that stays put, defined in `tokens.css`. The percentage inside `--edge` resolves against the grid's own width, which excludes the scrollbar, so bleeds land exactly on the viewport and copy stays aligned with `.container` at every width. No `100vw`, no measuring, no JavaScript. The earlier approach measured the scrollbar in JS and misaligned every bleed by half its width whenever that value went stale.

**Type.** Libre Baskerville for headings, set at 400 rather than 700 at display sizes because the regular weight is more elegant large. Poppins 300 for body, which reads warmer than the 400 that most sites default to. One word in the hero headline is italic; that is the only typographic flourish on the page.

**Section rhythm.** Warm white → warm white → cream → cream → charcoal → warm white → warm white → warm gray band → warm white → charcoal → black. Projects and Before/After share the cream so they read as one portfolio chapter. Charcoal appears twice, bookending the lower half.

**Radius is zero everywhere.** No pills, no glassmorphism, no gradients, no floating decoration.

**"The part that isn't on the estimate" uses icons, not numbers.** The list is not a sequence, so numbering it never carried real information. Six Phosphor marks say more at a glance. It is still a hairline-separated list rather than a grid of cards, and one small icon per row keeps it restrained. On hover the icon and the title trade colours: gold goes white, white goes gold, and a gold rule draws across the row.

**The hero photograph is a plate, not a backdrop.** It starts below the header rather than running behind it, lifts off the bottom edge, and stops on the same right-hand line as every other element on the page instead of running under the scrollbar. The hero grid carries a `--edge` margin track on both sides to do that. The gold measure line stops at the text column rather than crossing into the photograph, which keeps it aligned with the metadata row underneath.

**About uses a finished room, not a jobsite.** "Built around the way you actually live" is about the result, so the photograph is a lived-in living room and kitchen rather than work in progress. It is cropped at `object-position: center 32%` to favour the seating and windows over the floor.

**Call and Text appear together everywhere.** Contact section, footer, and the header above 1240px (in the panel on mobile). Texting is how a lot of Atlanta homeowners prefer to start, so it gets equal billing rather than being buried.

---

## Interaction and motion

Text lifts 18px, gold rules draw from the left, photographs wipe up out of a clip while settling back from a 1.05 scale. Driven by one `IntersectionObserver` over four data attributes: `data-reveal`, `data-rule`, `data-reveal-image`, `data-timeline`.

Reveals use keyframe **animations**, not transitions. Components own their own `transition` shorthands for hover states, and a transition-based reveal gets silently cancelled by them.

Content is visible by default. An inline script in `<head>` adds `.js` to `<html>`, and only then does the hidden start state apply, so a browser that cannot run the script still sees everything. There is also a failsafe: if the observer never delivers an entry within 2.5 seconds, everything reveals anyway.

`prefers-reduced-motion: reduce` disables all of it.

**Before/after sliders.** There are two, and each is independent: its own listeners, its own state, and its own `--ratio` so a comparison keeps the framing its photographs were shot in (4:3 for the fireplace, 16:10 for the dining room; both go 4:3 on a phone). Each supports pointer drag, click-to-jump anywhere on the photo, and the keyboard: arrows move 2%, Shift+arrows and PageUp/PageDown move 10%, Home and End jump to the ends. Each is a proper `role="slider"` with live `aria-valuenow` and `aria-valuetext`.

To add a third, copy a `<figure class="compare" data-compare>` block and set `--ratio` on its frame. The JavaScript picks it up with no changes.

---

## Accessibility

- Every text and background pair on the page was measured; all 50 distinct combinations meet WCAG AA.
- One `h1`, no heading level skips, every section labelled by its heading.
- Skip link, semantic landmarks, visible gold focus rings that switch to the bright gold on dark sections.
- Mobile nav reports `aria-expanded`, closes on Escape and on link activation, and locks body scroll while open.
- All images carry `alt` and intrinsic dimensions; all form fields have real labels and inline errors wired with `aria-invalid`.
- Tap targets on touch viewports are at least 48px.

---

## Third party

**Fonts.** Libre Baskerville and Poppins, served from Google Fonts. The only external request the site makes.

**Icons.** The six marks in "The part that isn't on the estimate" are [Phosphor Icons](https://phosphoricons.com) (regular weight), by Helena Zhang and Tobias Fried, used under the MIT licence.

They are **inlined as SVG in `index.html`**, not pulled from a CDN and not loaded as an icon font. That keeps the page free of runtime dependencies, avoids a render-blocking request for six small shapes, and lets each icon inherit `currentColor` so it can take part in the hover swap. To change one, copy the path from the Phosphor site and replace the `<path>` inside the matching `<svg class="standard__icon">`; keep `fill="currentColor"` or it will stop reacting to hover.

The icons in use are `shield-check`, `chat-teardrop-text`, `list-checks`, `house-line`, `ruler` and `calendar-check`.

## Browser support

Modern evergreen browsers. Uses CSS custom properties, `clamp()`, `aspect-ratio`, `clip-path`, `:focus-visible`, `overflow: clip`, scroll snap, `IntersectionObserver` and Pointer Events. No polyfills, and no IE support.
