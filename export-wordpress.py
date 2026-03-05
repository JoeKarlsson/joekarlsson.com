#!/usr/bin/env python3
"""Export WordPress content to Astro-compatible Markdown files."""

import json
import os
import re
import sys
import time
import urllib.request
import urllib.error
from base64 import b64encode
from html import unescape
from pathlib import Path

# Config
WP_URL = "https://www.joekarlsson.com"
WP_USER = "JoeCarlson"
WP_PASS = "u5y6 Jnd6 Ot4G wNVL tCym yYBe"
OUTPUT_DIR = Path(__file__).parent
CONTENT_DIR = OUTPUT_DIR / "src" / "content" / "blog"
PAGES_DIR = OUTPUT_DIR / "src" / "content" / "pages"
IMAGES_DIR = OUTPUT_DIR / "public" / "images" / "blog"

AUTH = b64encode(f"{WP_USER}:{WP_PASS}".encode()).decode()


def wp_api(endpoint, params=None):
    """Fetch from WordPress REST API with pagination."""
    url = f"{WP_URL}/wp-json/wp/v2/{endpoint}"
    if params:
        query = "&".join(f"{k}={v}" for k, v in params.items())
        url += f"?{query}"
    req = urllib.request.Request(url, headers={
        "Authorization": f"Basic {AUTH}",
        "User-Agent": "Mozilla/5.0 WordPress-Export"
    })
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        print(f"  API error {e.code} for {url}")
        return []


def wp_api_all(endpoint, extra_params=None):
    """Fetch all pages of a paginated endpoint."""
    all_items = []
    page = 1
    while True:
        params = {"per_page": "100", "page": str(page)}
        if extra_params:
            params.update(extra_params)
        items = wp_api(endpoint, params)
        if not items:
            break
        all_items.extend(items)
        if len(items) < 100:
            break
        page += 1
    return all_items


def html_to_markdown(html):
    """Convert WordPress HTML to Markdown."""
    if not html:
        return ""
    text = html

    # Remove WordPress comments
    text = re.sub(r'<!--.*?-->', '', text, flags=re.DOTALL)

    # WordPress blocks - extract content
    text = re.sub(r'<div class="wp-block-[^"]*"[^>]*>', '', text)

    # Headings
    for i in range(6, 0, -1):
        text = re.sub(
            rf'<h{i}[^>]*>(.*?)</h{i}>',
            lambda m, level=i: f'\n{"#" * level} {m.group(1).strip()}\n',
            text, flags=re.DOTALL
        )

    # Code blocks
    text = re.sub(
        r'<pre[^>]*><code[^>]*class="[^"]*language-(\w+)[^"]*"[^>]*>(.*?)</code></pre>',
        lambda m: f'\n```{m.group(1)}\n{unescape(m.group(2)).strip()}\n```\n',
        text, flags=re.DOTALL
    )
    text = re.sub(
        r'<pre[^>]*><code[^>]*>(.*?)</code></pre>',
        lambda m: f'\n```\n{unescape(m.group(1)).strip()}\n```\n',
        text, flags=re.DOTALL
    )

    # Inline code
    text = re.sub(r'<code[^>]*>(.*?)</code>', r'`\1`', text)

    # Images
    text = re.sub(
        r'<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*/?>',
        r'![\2](\1)',
        text
    )
    text = re.sub(
        r'<img[^>]*src="([^"]*)"[^>]*/?>',
        r'![](\1)',
        text
    )

    # Links
    text = re.sub(r'<a[^>]*href="([^"]*)"[^>]*>(.*?)</a>', r'[\2](\1)', text, flags=re.DOTALL)

    # Lists
    text = re.sub(r'<ul[^>]*>', '\n', text)
    text = re.sub(r'</ul>', '\n', text)
    text = re.sub(r'<ol[^>]*>', '\n', text)
    text = re.sub(r'</ol>', '\n', text)
    text = re.sub(r'<li[^>]*>(.*?)</li>', r'- \1', text, flags=re.DOTALL)

    # Blockquotes
    text = re.sub(
        r'<blockquote[^>]*>(.*?)</blockquote>',
        lambda m: '\n'.join(f'> {line}' for line in m.group(1).strip().split('\n')),
        text, flags=re.DOTALL
    )

    # Bold and italic
    text = re.sub(r'<strong[^>]*>(.*?)</strong>', r'**\1**', text, flags=re.DOTALL)
    text = re.sub(r'<b[^>]*>(.*?)</b>', r'**\1**', text, flags=re.DOTALL)
    text = re.sub(r'<em[^>]*>(.*?)</em>', r'*\1*', text, flags=re.DOTALL)
    text = re.sub(r'<i[^>]*>(.*?)</i>', r'*\1*', text, flags=re.DOTALL)

    # Horizontal rules
    text = re.sub(r'<hr[^>]*/?>',  '\n---\n', text)

    # Paragraphs and line breaks
    text = re.sub(r'<p[^>]*>(.*?)</p>', r'\n\1\n', text, flags=re.DOTALL)
    text = re.sub(r'<br\s*/?>',  '\n', text)

    # Figure/figcaption
    text = re.sub(r'<figure[^>]*>(.*?)</figure>', r'\1', text, flags=re.DOTALL)
    text = re.sub(r'<figcaption[^>]*>(.*?)</figcaption>', r'*\1*', text, flags=re.DOTALL)

    # iframes (YouTube embeds etc)
    text = re.sub(
        r'<iframe[^>]*src="([^"]*)"[^>]*>.*?</iframe>',
        r'\n[\1](\1)\n',
        text, flags=re.DOTALL
    )

    # Strip remaining HTML tags
    text = re.sub(r'</?(?:div|span|section|article|header|footer|nav|main|aside|table|tr|td|th|thead|tbody|tfoot|caption|colgroup|col|details|summary|dialog|menu|menuitem|fieldset|legend|datalist|keygen|output|progress|meter|audio|video|source|track|embed|object|param|canvas|noscript|script|style|template|slot|small|sup|sub|del|ins|mark|ruby|rp|rt|bdi|bdo|wbr|time|abbr|cite|dfn|kbd|samp|var|data|address|hgroup|picture|map|area)[^>]*>', '', text)

    # Unescape HTML entities
    text = unescape(text)

    # Clean up whitespace
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = text.strip()

    return text


def get_excerpt(content, max_len=160):
    """Generate a plain text excerpt from content."""
    # Strip markdown formatting for excerpt
    plain = re.sub(r'[#*`\[\]()!]', '', content)
    plain = re.sub(r'\n+', ' ', plain).strip()
    if len(plain) > max_len:
        plain = plain[:max_len].rsplit(' ', 1)[0] + '...'
    return plain


def download_image(url, slug):
    """Download an image and return the local path."""
    if not url or not url.startswith('http'):
        return url

    # Create filename from URL
    filename = url.split('/')[-1].split('?')[0]
    if not filename:
        return url

    # Create slug-specific directory
    img_dir = IMAGES_DIR / slug
    img_dir.mkdir(parents=True, exist_ok=True)
    local_path = img_dir / filename

    if local_path.exists():
        return f"/images/blog/{slug}/{filename}"

    try:
        # Handle non-ASCII characters in URLs
        from urllib.parse import quote, urlparse, urlunparse
        parsed = urlparse(url)
        safe_path = quote(parsed.path, safe='/')
        safe_url = urlunparse(parsed._replace(path=safe_path))
        req = urllib.request.Request(safe_url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            local_path.write_bytes(resp.read())
        return f"/images/blog/{slug}/{filename}"
    except Exception as e:
        print(f"    Failed to download {url}: {e}")
        return url


def localize_images(content, slug):
    """Download images and update paths to local."""
    def replace_img(m):
        alt = m.group(1)
        url = m.group(2)
        # Only download from the WordPress site
        if 'joekarlsson.com' in url or 'wp-content' in url:
            local = download_image(url, slug)
            return f'![{alt}]({local})'
        return m.group(0)

    return re.sub(r'!\[([^\]]*)\]\(([^)]+)\)', replace_img, content)


def make_frontmatter(post, categories_map, tags_map, is_page=False):
    """Build YAML frontmatter for a post/page."""
    title = unescape(post['title']['rendered']).replace('"', '\\"')
    slug = post['slug']
    date = post['date'][:10]

    # Get excerpt
    excerpt = ""
    if post.get('excerpt', {}).get('rendered'):
        excerpt = html_to_markdown(post['excerpt']['rendered']).strip()
        excerpt = re.sub(r'\n+', ' ', excerpt)
        if len(excerpt) > 200:
            excerpt = excerpt[:200].rsplit(' ', 1)[0] + '...'

    # Resolve categories and tags
    cat_names = [categories_map.get(cid, '') for cid in post.get('categories', [])]
    cat_names = [c for c in cat_names if c]
    tag_names = [tags_map.get(tid, '') for tid in post.get('tags', [])]
    tag_names = [t for t in tag_names if t]

    lines = [
        '---',
        f'title: "{title}"',
        f'date: {date}',
        f'slug: "{slug}"',
    ]

    if excerpt:
        excerpt_escaped = excerpt.replace('"', '\\"')
        lines.append(f'description: "{excerpt_escaped}"')

    if not is_page:
        if cat_names:
            lines.append(f'categories: [{", ".join(f"\"{c}\"" for c in cat_names)}]')
        if tag_names:
            lines.append(f'tags: [{", ".join(f"\"{t}\"" for t in tag_names)}]')

    # Featured image
    if post.get('_embedded', {}).get('wp:featuredmedia'):
        media = post['_embedded']['wp:featuredmedia'][0]
        img_url = media.get('source_url', '')
        if img_url:
            local_img = download_image(img_url, slug)
            lines.append(f'heroImage: "{local_img}"')

    lines.append('---')
    return '\n'.join(lines)


def export_posts():
    """Export all WordPress posts."""
    print("Fetching categories and tags...")
    categories = wp_api_all("categories")
    tags = wp_api_all("tags")
    categories_map = {c['id']: c['name'] for c in categories}
    tags_map = {t['id']: t['name'] for t in tags}
    print(f"  {len(categories)} categories, {len(tags)} tags")

    print("\nFetching posts...")
    posts = wp_api_all("posts", {"_embed": "1"})
    print(f"  {len(posts)} posts found")

    CONTENT_DIR.mkdir(parents=True, exist_ok=True)

    for post in posts:
        slug = post['slug']
        print(f"  Exporting: {slug}")

        frontmatter = make_frontmatter(post, categories_map, tags_map)
        content = html_to_markdown(post['content']['rendered'])
        content = localize_images(content, slug)

        filepath = CONTENT_DIR / f"{slug}.md"
        filepath.write_text(f"{frontmatter}\n\n{content}\n", encoding='utf-8')

    print(f"\nExported {len(posts)} posts to {CONTENT_DIR}")
    return posts


def export_pages():
    """Export all WordPress pages."""
    print("\nFetching pages...")
    pages = wp_api_all("pages", {"_embed": "1"})
    print(f"  {len(pages)} pages found")

    PAGES_DIR.mkdir(parents=True, exist_ok=True)

    for page in pages:
        slug = page['slug']
        print(f"  Exporting page: {slug}")

        frontmatter = make_frontmatter(page, {}, {}, is_page=True)
        content = html_to_markdown(page['content']['rendered'])
        content = localize_images(content, slug)

        filepath = PAGES_DIR / f"{slug}.md"
        filepath.write_text(f"{frontmatter}\n\n{content}\n", encoding='utf-8')

    print(f"\nExported {len(pages)} pages to {PAGES_DIR}")
    return pages


if __name__ == "__main__":
    print("WordPress → Astro Content Export")
    print("=" * 40)

    posts = export_posts()
    pages = export_pages()

    print(f"\n{'=' * 40}")
    print(f"Done! {len(posts)} posts + {len(pages)} pages exported")
    print(f"Content: {CONTENT_DIR}")
    print(f"Pages: {PAGES_DIR}")
    print(f"Images: {IMAGES_DIR}")
