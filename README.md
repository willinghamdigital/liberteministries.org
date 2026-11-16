# Liberté Ministries

A static Astro website for [Liberté Ministries](https://liberteministries.org), migrated from WordPress. Pages and images are stored in this repository; the published site needs no database or application server.

## Development

Use Node.js 24 (`nvm use` if you use nvm), then:

```sh
make setup
make dev
```

Open the URL printed by Astro, including `/liberteministries.org/`. `make help` lists all commands. `make test` builds the site and validates local links, anchors, and assets. `make lint` checks formatting; `make fmt` fixes formatting. Output is in `site/dist/`.

## Editing

- Site templates and styles: `site/src/`.
- Original page and post layouts: `site/src/data/wordpress.json` and `wordpress-posts.json`.
- Original self-hosted CSS, fonts, and image variants: `site/public/wordpress/`.
- Native menu, accordion, slider, and entrance animations: `site/src/scripts/interactions.ts`.
- Local photographs and other assets: `site/public/`.
- Deployment: `.github/workflows/deploy.yml`.

Keep internal links and image paths compatible with Astro's configured base path. The site uses external services or direct contact links for actions that cannot run on static hosting.

### Donations, contact, and newsletter

Donations keep the existing Donorbox campaign. Contact goes to `arvy@liberteministries.org`.

The email form in `site/src/components/Newsletter.astro` uses the Mailchimp embed supplied on November 16, 2026. Its action URL (including `u`, `id`, and `f_id`) and audience-specific honeypot field live in `site/src/data/newsletter.json`; no API key or WordPress backend is needed. The form collects a required email address and optional first and last names, and preserves the newsletter preference with Mailchimp's `MMERGE5` field. The supplied embed's field names, validation script, and response containers are retained, with responsive styling from the site instead of Mailchimp's fixed-width stylesheet. Unused SMS helpers are omitted because this form has no SMS fields.

Mailchimp's validation script displays responses and handles its CAPTCHA handoff. Without the script, the form posts directly to Mailchimp in a new tab. CAPTCHA and double opt-in must be enabled and verified in Mailchimp; replacing embed code does not enable those account settings. After changing form settings, regenerate the embed if Mailchimp requires it. Verify with a controlled email address that the signup requires confirmation before the contact becomes subscribed, and check duplicate submissions and CAPTCHA enforcement. The static site checks do not submit live subscriptions or verify Mailchimp account settings.

The original Elementor HTML and CSS are retained as static assets to preserve the WordPress design. Small native browser scripts replace the WordPress plugin runtime for entrance animations, the mobile menu, FAQs, and testimonial slides. Reduced-motion preferences are respected. No PHP, WordPress APIs, or WordPress JavaScript run on the published site.

The migration preserves 39 published posts, 11 content pages plus the homepage and news index, and their available public assets. Four old newsletter posts have no attachment in the source; their available text is retained. Original PDF download URLs are preserved. Old `give.html`, `contact.html`, and `go.html` links redirect to their current pages.

## Publishing

Repository: [willinghamdigital/liberteministries.org](https://github.com/willinghamdigital/liberteministries.org).

GitHub Pages publishes each push to `main` after the build and checks pass. Set **Settings → Pages → Source** to **GitHub Actions**. The initial project URL is [willinghamdigital.github.io/liberteministries.org/](https://willinghamdigital.github.io/liberteministries.org/).

The workflow reads the configured Pages origin and base path automatically, so it also supports a custom domain. To preview a custom-domain build locally:

```sh
SITE_URL=https://liberteministries.org SITE_BASE=/ make test
```

### Domain cutover

Before retiring the WordPress host, configure `liberteministries.org` as the repository's Pages custom domain and point the domain's web DNS records to GitHub Pages. Keep mail-related DNS records unchanged. Use [GitHub's custom-domain instructions](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) for the current records and HTTPS steps. Push or rerun the deployment after setting the domain so the build uses its new origin and base path.

DNS changes require access to the domain's DNS provider; publishing this repository alone does not move the existing domain.
