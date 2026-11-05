<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <!-- Each feed declares its own URL (atom:link rel=self); the blog feed is the fallback -->
    <xsl:variable name="feedUrl">
      <xsl:choose>
        <xsl:when test="/rss/channel/atom:link[@rel='self']/@href"><xsl:value-of select="/rss/channel/atom:link[@rel='self']/@href"/></xsl:when>
        <xsl:otherwise>https://www.joekarlsson.com/rss.xml</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
      <head>
        <title><xsl:value-of select="/rss/channel/title"/> - RSS Feed</title>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg"/>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&amp;display=swap"/>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            background: #000000;
            color: #a3a3a3;
            font-family: "JetBrains Mono", "SF Mono", "Fira Code", "Fira Mono", "Roboto Mono", monospace;
            font-size: 14px;
            line-height: 1.6;
            padding: 2rem;
            max-width: 720px;
            margin: 0 auto;
          }
          .header {
            margin-bottom: 2.5rem;
            white-space: pre-wrap;
          }
          .prompt {
            color: #ff4fd8;
            font-weight: bold;
          }
          .info {
            color: #a3a3a3;
            margin-top: 0.5rem;
          }
          .url {
            color: #ededed;
            text-decoration-color: #ff4fd8;
          }
          .section-title {
            color: #ff4fd8;
            font-weight: bold;
            margin-bottom: 1rem;
          }
          .post {
            margin-bottom: 1.25rem;
          }
          .post-date {
            color: #a3a3a3;
            display: inline;
          }
          .post-title {
            color: #ededed;
            display: inline;
            margin-left: 0.5rem;
          }
          .post-link {
            display: block;
            color: #ff4fd8;
            text-decoration: none;
            padding-left: 12ch;
          }
          .post-link:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <span class="prompt">~$ cat rss.xml</span><xsl:text>&#10;</xsl:text>

<span class="info">Hey, you found my RSS feed!

RSS is a way to subscribe to websites and get updates
in a feed reader instead of checking back manually.
It's like email newsletters but you control the inbox.

To subscribe, copy this URL into your feed reader:
<a class="url" href="{$feedUrl}"><xsl:value-of select="$feedUrl"/></a>

Popular feed readers: NetNewsWire (Mac), Feedly,
Miniflux (self-hosted), or Thunderbird.</span>
<xsl:text>&#10;&#10;</xsl:text><span class="info"><xsl:choose>
<xsl:when test="contains($feedUrl, '/newsletter/')">This is the feed for my newsletter. For blog posts, follow:
<a class="url" href="https://www.joekarlsson.com/rss.xml">https://www.joekarlsson.com/rss.xml</a></xsl:when>
<xsl:otherwise>My newsletter, Works on My Machine, has its own feed:
<a class="url" href="https://www.joekarlsson.com/newsletter/rss.xml">https://www.joekarlsson.com/newsletter/rss.xml</a></xsl:otherwise>
</xsl:choose></span>
        </div>

        <div class="section-title">
          <xsl:choose>
            <xsl:when test="contains($feedUrl, '/newsletter/')">Recent issues:</xsl:when>
            <xsl:otherwise>Recent posts:</xsl:otherwise>
          </xsl:choose>
        </div>

        <xsl:for-each select="/rss/channel/item">
          <div class="post">
            <span class="post-date">
              <xsl:value-of select="substring(pubDate, 13, 4)"/>&#160;<xsl:value-of select="substring(pubDate, 9, 3)"/>&#160;<xsl:value-of select="substring(pubDate, 6, 2)"/>
            </span>
            <span class="post-title">
              <xsl:value-of select="title"/>
            </span>
            <a class="post-link" href="{link}">
              <xsl:value-of select="link"/>
            </a>
          </div>
        </xsl:for-each>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
