# joekarlsson.com

[![CI](https://github.com/JoeKarlsson/joekarlsson.com/actions/workflows/ci.yml/badge.svg)](https://github.com/JoeKarlsson/joekarlsson.com/actions/workflows/ci.yml)
[![External Links](https://github.com/JoeKarlsson/joekarlsson.com/actions/workflows/links.yml/badge.svg)](https://github.com/JoeKarlsson/joekarlsson.com/actions/workflows/links.yml)

Personal website and blog for Joe Karlsson — software engineer, developer advocate, and homelab enthusiast.

Built with [Astro](https://astro.build), Tailwind CSS, and MDX.

## Development

```bash
npm install
npm run dev        # Start dev server at localhost:4321
npm run build      # Build for production
npm run preview    # Preview production build locally
```

## Deploy

The site is self-hosted on a Proxmox LXC container. Deploy with:

```bash
./deploy.sh
```

This builds the site and rsyncs the output to the server.

## Tech Stack

- **Framework**: Astro 5
- **Styling**: Tailwind CSS
- **Content**: MDX blog posts via Astro Content Collections
- **Hosting**: Caddy on Proxmox LXC

## License

Content (blog posts, images) is copyright Joe Karlsson. Source code is MIT.
