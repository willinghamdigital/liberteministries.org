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
- Migrated page content: `site/src/data/content.json`.
- Local photographs and other assets: `site/public/`.
- Deployment: `.github/workflows/deploy.yml`.

Keep internal links and image paths compatible with Astro's configured base path. The site uses external services or direct contact links for actions that cannot run on static hosting.

### Donations, contact, and newsletter

Donations keep the existing Donorbox campaign, with a hosted-form link as a fallback. Contact goes to `arvy@liberteministries.org`.

The old newsletter form uses Mailchimp for WordPress (form 762). Its public HTML posts to WordPress and does not expose a direct Mailchimp subscription endpoint. The email field and signup button are implemented in `site/src/components/Newsletter.astro`: set the public Mailchimp embed `action` URL and honeypot field name in `site/src/data/newsletter.json` to enable them. Do not put a Mailchimp API key in this file. Until configured, visitors see an explicit email signup request link to Arvy and the newsletter archive. Automatic Mailchimp subscription is not yet connected.

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
