# R&R Construction

Marketing site for R&R Construction (Revive & Remodeling), residential remodeling in Atlanta, Georgia.

Static HTML, CSS and vanilla JavaScript. No build step, no framework, no runtime dependencies.

The published site lives entirely in `public/`. That folder is what GitHub Pages serves; nothing outside it is part of the live site.

```bash
npx --yes serve -l 5178 public
```

## Structure

```
public/index.html                  home
public/gallery.html                gallery, grouped by room
public/CNAME                       custom domain for GitHub Pages
public/robots.txt                  allow all, points at the sitemap
public/sitemap.xml                 the two pages
public/assets/css/tokens.css       colour, type, spacing, motion, layout variables
public/assets/css/base.css         reset, document type, layout primitives, reveal system
public/assets/css/components.css   logo, buttons, links, header/nav, form fields, before-after
public/assets/css/sections.css     each section, in document order
public/assets/css/gallery.css      gallery page only: grids and lightbox
public/assets/js/main.js           intro, reveals, header, nav, sliders, form, lightbox
public/assets/img/photos/          photography used on the home page
public/assets/img/gallery/         photography used only on the gallery page
public/assets/img/logo/            logo variants and the social share card
```

Stylesheet load order: `tokens` → `base` → `components` → `sections` → `gallery`. One stylesheet set and one script serve both pages.

## Maintenance

**Swap a photo.** Drop the new file in `public/assets/img/photos/` or `public/assets/img/gallery/`, then update the `src` and the `width`/`height` attributes at each place it's used. Frames use `object-fit: cover`, so a different ratio still fills correctly, but keep the attributes accurate — they reserve layout space and stop the page shifting while images load.

**Swap the logo.** Generated files live in `public/assets/img/logo/` (`rr-logo.png`, `rr-logo-light.png` for the dark footer, plus two spare mark-only crops). Replace at the same dimensions to avoid touching CSS.

**Web3Forms.** The estimate form's access key is the hidden `access_key` field near the bottom of `public/index.html`. The `subject` and `from_name` hidden fields control how the notification email reads. The `email` field is required and named so Web3Forms sets it as Reply-To automatically.

**Open items still pending on the live site** (ask if you want the current status on any of these): real testimonials in place of the two examples, real social links in the footer, the exact neighbourhood under each gallery project, and confirming the contact number accepts text messages.

## Accessibility

- One `h1` per page, no heading level skips, every section labelled by its heading.
- Skip link, semantic landmarks, visible focus rings.
- All images carry `alt` and intrinsic dimensions; all form fields have labels and inline errors.
- Reduced-motion preference is respected throughout.

## Third party

**Fonts.** Libre Baskerville and Poppins, served from Google Fonts.

**Icons.** The six marks on the home page are [Phosphor Icons](https://phosphoricons.com) (regular weight) by Helena Zhang and Tobias Fried, used under the MIT licence, inlined as SVG in `index.html`.

## Browser support

Modern evergreen browsers. Uses CSS custom properties, `clamp()`, `aspect-ratio`, `clip-path`, `:focus-visible`, `IntersectionObserver` and Pointer Events. No polyfills, no IE support.
