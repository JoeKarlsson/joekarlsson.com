# Site metadata

Every tag in the page head, who reads it, and where it comes from. All of it is set in `src/components/BaseHead.astro` unless noted. `tests/build-output.test.ts` checks the built site for most of it, so a missing tag fails `npm test` before it ships.

## Pages pass in

`BaseLayout` takes these props and hands them to `BaseHead`:

| Prop                            | Used for                                                                                      | Set by                                     |
| ------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------ |
| `title`                         | `<title>`, and (minus " \| Joe Karlsson") og/twitter titles, BlogPosting headline, breadcrumb | every page                                 |
| `description`                   | meta description, og/twitter description, JSON-LD                                             | every page                                 |
| `image`, `imageAlt`             | share image and its alt text                                                                  | posts (`heroImage`, `heroAlt`), some pages |
| `type`                          | `og:type`: `website` (default), `article` (posts, newsletter issues), `profile` (/about)      | layouts and pages                          |
| `publishedDate`, `modifiedDate` | `article:published_time` / `modified_time`, BlogPosting dates                                 | posts                                      |
| `keywords`                      | `article:section` (the first), `article:tag` (each), BlogPosting keywords                     | posts (their categories)                   |
| `schemaType`                    | an extra JSON-LD node (`AboutPage`, `WebSite`, `SoftwareSourceCode`...) for non-article pages | pages                                      |
| `faq`, `howToSteps`             | FAQPage and HowTo JSON-LD                                                                     | post frontmatter                           |
| `canonicalUrl`                  | canonical link for cross-posted articles (CData, CloudQuery)                                  | post frontmatter                           |
| `noindex`                       | `robots: noindex, follow` (Substack-era newsletter back issues)                               | newsletter pages                           |

## Browsers and devices

| Tag or file                                      | Read by                                                                 | Why                                                                                                                                                                                                                                            |
| ------------------------------------------------ | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `viewport`                                       | every mobile browser                                                    | lays the page out at device width                                                                                                                                                                                                              |
| `color-scheme: only dark` (meta and `:root` CSS) | all browsers                                                            | the site is dark-only: native form fields, scrollbars and overscroll stay dark, and Chrome or Samsung Internet auto-dark leave it alone                                                                                                        |
| `darkreader-lock`                                | Dark Reader, and the iOS browsers built on it (Firefox, Brave)          | Dark Reader ignores `color-scheme` and re-darkens the page anyway, turning paper boxes brown. This tells it to leave the site alone                                                                                                            |
| `theme-color #000000`                            | Chrome on Android, Samsung Internet, installed apps                     | browser bar color. Safari 26 ignores it and samples the page itself                                                                                                                                                                            |
| `favicon.svg`                                    | Chrome, Firefox, Edge, Safari 17+                                       | sharp tab icon at any size                                                                                                                                                                                                                     |
| `favicon-32x32.png`, `favicon-16x16.png`         | older browsers                                                          | PNG fallback                                                                                                                                                                                                                                   |
| `/favicon.ico` (no tag)                          | RSS readers, Slack, Windows, crawlers that fetch the path directly      | 16/32/48px, drawn with the rest by `npm run brand`                                                                                                                                                                                             |
| `apple-touch-icon.png` (180px)                   | iOS and iPadOS home screen, Safari bookmarks                            | home-screen icon                                                                                                                                                                                                                               |
| `apple-mobile-web-app-title`                     | iOS home screen                                                         | the name under the icon                                                                                                                                                                                                                        |
| `apple-mobile-web-app-status-bar-style: black`   | iOS, opened from the home screen                                        | black status bar to match the page                                                                                                                                                                                                             |
| `format-detection: telephone=no`                 | iOS Safari                                                              | stops numbers like "72-container" turning into phone links                                                                                                                                                                                     |
| `site.webmanifest`                               | Android "Add to home screen", Chrome and Edge install, Samsung Internet | `id`, `start_url`, `scope`, name, description, `standalone` display, black theme and splash. The 192 and 512px icons are also listed as `maskable`: the JK sits inside the 80% safe circle, so Android's round and squircle crops don't cut it |

Bump the `?v=` on the icon links when the icons change. Browsers and Cloudflare hold on to old favicons.

## Link previews

| Tag                                                                                                             | Read by                                                                                             |
| --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `og:title`, `og:description`, `og:url`, `og:site_name`, `og:locale`, `og:type`                                  | Facebook, LinkedIn, Slack, Discord, iMessage, Bluesky, Threads, Mastodon, WhatsApp, Signal          |
| `og:image` + `:width`, `:height`, `:type`, `:alt`                                                               | same. Always a 1200x630 JPEG from `src/pages/og/[...path].jpg.ts`, since LinkedIn won't render WebP |
| `article:published_time`, `modified_time`, `author`, `publisher`, `section`, `tag`                              | Facebook, LinkedIn, Slack (shows the date)                                                          |
| `profile:first_name`, `last_name`, `username`                                                                   | Facebook and LinkedIn, on /about                                                                    |
| `twitter:card` (`summary_large_image`), `twitter:title`, `description`, `image`, `image:alt`, `site`, `creator` | X. Other apps fall back to these when og tags are missing                                           |

Test a preview with the [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/), the [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/), or by pasting the link into a Slack DM to yourself. LinkedIn and Facebook cache previews for days, so re-scrape after changing a share image.

## Search and identity

| Tag or file                                                                                                     | Read by                                                                                                                                       |
| --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `<title>`, `description`, `canonical`, `robots`                                                                 | Google, Bing, DuckDuckGo, AI answer engines. Descriptions stay at 160 characters or under, and a test checks every page                       |
| `author` (every page)                                                                                           | Bing, some AI crawlers and feed readers                                                                                                       |
| JSON-LD `@graph`: WebSite, Person, BlogPosting (with an ImageObject), BreadcrumbList, FAQPage, HowTo, page type | Google rich results, Bing, AI crawlers                                                                                                        |
| `link rel="me"` for each profile                                                                                | IndieWeb and Mastodon identity checks. The same list is the Person `sameAs`, from `PROFILE_URLS` in BaseHead, and a test checks the two match |
| Search engine verification metas                                                                                | Google Search Console, Bing Webmaster, Pinterest, Yandex                                                                                      |
| `link rel="sitemap"`, `/sitemap-index.xml`                                                                      | search engines                                                                                                                                |
| `link rel="alternate"` RSS (blog and newsletter)                                                                | feed readers' autodiscovery                                                                                                                   |
| `/robots.txt`                                                                                                   | crawlers. Also points at `llms.txt` and `llms-full.txt`                                                                                       |
| `/.well-known/security.txt`                                                                                     | security researchers (RFC 9116). **Renew `Expires` every year.** A test fails 30 days before it lapses                                        |

Check rich results with Google's [Rich Results Test](https://search.google.com/test/rich-results) and the [Schema Markup Validator](https://validator.schema.org/).

## Left out on purpose

- `meta name="keywords"`, `meta name="title"`, `twitter:url`: no major search engine or platform reads them. A test keeps them out.
- `msapplication-*` and Safari `mask-icon`: Windows tiles and Safari pinned-tab icons are both retired.
- `apple-mobile-web-app-capable`: deprecated. iOS reads `display: standalone` from the manifest.
- `viewport-fit=cover`: only needed for edge-to-edge layouts that handle the iPhone notch themselves.
- A light theme: the site is dark-only by design.
