<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
      <head>
        <title><xsl:value-of select="/rss/channel/title"/> - RSS Feed</title>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            background: #0a0a0f;
            color: #a0a0b0;
            font-family: "SF Mono", "Fira Code", "Fira Mono", "Roboto Mono", monospace;
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
            color: #fdae84;
            font-weight: bold;
          }
          .info {
            color: #a0a0b0;
            margin-top: 0.5rem;
          }
          .url {
            color: #8bcbc8;
          }
          .section-title {
            color: #fdae84;
            font-weight: bold;
            margin-bottom: 1rem;
          }
          .post {
            margin-bottom: 1.25rem;
          }
          .post-date {
            color: #666680;
            display: inline;
          }
          .post-title {
            color: #e0e0e8;
            display: inline;
            margin-left: 0.5rem;
          }
          .post-link {
            display: block;
            color: #8bcbc8;
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
          <span class="prompt">~$ cat rss.xml</span>

<span class="info">Hey, you found my RSS feed!

RSS is a way to subscribe to websites and get updates
in a feed reader instead of checking back manually.
It's like email newsletters but you control the inbox.

To subscribe, copy this URL into your feed reader:
<a class="url" href="https://www.joekarlsson.com/rss.xml">https://www.joekarlsson.com/rss.xml</a>

Popular feed readers: NetNewsWire (Mac), Feedly,
Miniflux (self-hosted), or Thunderbird.</span>
        </div>

        <div class="section-title">Recent posts:</div>

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
