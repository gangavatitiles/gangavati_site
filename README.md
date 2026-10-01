# Gangavati Tiles

A static showroom website built with HTML, CSS, and vanilla JavaScript. There is no build step.

The production domain in canonical links, Open Graph tags, `robots.txt`, and `sitemap.xml` is a placeholder: `https://www.gangavatitiles.com`. Replace it before launch. It was not supplied with the project.

## Preview locally

From this folder:

```bash
python3 serve.py
```

Open [http://127.0.0.1:8080](http://127.0.0.1:8080). The address bar uses page names:

- `/` home
- `/about`
- `/collections`
- `/collections/marble-look`
- `/inspiration`
- `/contact`

`serve.py` is a small Python server with no extra packages. It serves the HTML files at those names and redirects old `about.html` style addresses. `python3 -m http.server` will not do that.

## Deploy

Upload the folder to a static host. Do not run a compiler. Point the host at this directory so `index.html` is the default document.

Apache reads `.htaccess`. Netlify and Cloudflare Pages read `_redirects`. Both map the same names as `serve.py`.

Do not change DNS or publish to a live domain unless you mean to.

## Update the business details

Edit `assets/js/config.js` for the phone, WhatsApp number, address, hours, email, social links, form endpoint, and production URL.

Also update the same details where they are written in the HTML, so the site still reads correctly if JavaScript does not run:

- Address, phone, and hours in each page footer
- WhatsApp links (`https://wa.me/919324210777`)
- The contact page and homepage visit block
- LocalBusiness JSON-LD on `index.html` and `contact.html`

Leave `email` and `hours` empty until real values exist. `social` stays an empty array until real profile URLs are available; empty icons are not shown.

`formEndpoint` stays empty on purpose. The contact form explains that it is not connected and will not pretend a message was sent. When a real HTTPS endpoint exists, set `formEndpoint` to that URL. Do not put secret keys in this repository.

WhatsApp enquiry links turn on only when `whatsapp` contains digits.

## Replace the logo

`assets/images/logo.png` is the supplied artwork with the original black field removed so the blue mark sits on the ivory navbar. Colours were not recolored.

Replace that file with a transparent PNG of the same name, or change the `src` on every `.logo img` and `.footer-logo`. Favicon files are `favicon.png` and `assets/images/apple-touch-icon.png`.

## Replace imagery

Photographs are Unsplash references for layout and atmosphere. They are not photographs of the Gangavati showroom or of completed projects. Each page says so where a visitor might assume otherwise.

Files live in `assets/images/` as `-960.webp` and `-1800.webp` pairs. `og-cover.jpg` is the social preview.

Unsplash photo IDs used:

| File | Unsplash ID |
|---|---|
| marble-bath | photo-1701251786408-d0320ecaad8d |
| marble-white | photo-1759223607861-f0ef3e617739 |
| marble-floor | photo-1656646523907-97b094c7e63a |
| stone-tiles | photo-1565535068096-76c74f9a5338 |
| pattern-floor | photo-1767554261805-95185e9ecf87 |
| wood-planks | photo-1513694203232-719a280e022f |
| wood-living | photo-1551298370-9d3d53740c72 |
| terrace | photo-1600585152915-d208bec867a1 |
| hero-interior | photo-1600607687939-ce8a6c25118c |
| hero-living | photo-1600210492486-724fe5c67fb0 |
| hero-bath | photo-1552321554-5fefe8c9ef14 |
| space-living | photo-1618221195710-dd6b41faaea6 |
| space-bath | photo-1620626011761-996317b8d101 |
| space-kitchen | photo-1556912173-46c336c7fd55 |
| space-outdoor | photo-1600585153490-76fb20a32601 |
| space-commercial | photo-1497366216548-37526070297c |
| inspire-kitchen-1 | photo-1600489000022-c2086d79f9d4 |
| inspire-bath-1 | photo-1584622650111-993a426fbf0a |
| about-interior | photo-1600210491369-e753d80a41f3 |

Images are used under the [Unsplash License](https://unsplash.com/license).

## Replace the catalogue

Collection copy, filter attributes, and galleries are in `collections.html`, `collection.html`, and the homepage. The same IDs are listed in `assets/js/config.js` under `catalogue`.

Keep `data-spaces`, `data-finishes`, and `data-colours` on each card in sync with the filter buttons. Add a size filter only when real sizes exist.

`/collections/marble-look` selects a collection. Unknown names such as `/collections/does-not-exist` show a not-found state. The HTML file still has a generic title until the browser reads the address, so social previews use that generic title.

## Theme

Dark is the default on a first visit. The choice is stored as `gt-theme` in `localStorage`. `assets/js/theme-init.js` runs before CSS so the wrong theme does not flash.

## Missing real assets

- Confirmed opening hours
- Email address
- Social profile URLs
- Showroom photography
- Real collection names, sizes, finishes, and prices if you choose to publish them
- A connected enquiry endpoint
- The production website address
