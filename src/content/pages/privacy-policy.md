---
title: 'JoeKarlsson.com Privacy Policy'
date: 2018-08-10
slug: 'privacy-policy'
description: 'This page contains the Privacy Policy for JoeKarlsson.com. Activity Log This feature only records the activities of a site’s registered users, and the retention duration of activity data will depend...'
heroImage: '/images/blog/privacy-policy/4.jpg'
---

This page contains the Privacy Policy for JoeKarlsson.com.

### Activity Log

**_This feature only records the activities of a site’s registered users, and the retention duration of activity data will depend on the site’s plan and activity type._**

**Data Used:** To deliver this functionality and record activities around site management, the following information is captured: user email address, user role, user login, user display name, WordPress.com and local user IDs, the activity to be recorded, the WordPress.com-connected site ID of the site on which the activity takes place, the site’s Jetpack version, and the timestamp of the activity. Some activities may also include the actor’s IP address (login attempts, for example) and user agent.

**Activity Tracked:** Login attempts/actions, post and page update and publish actions, comment/pingback submission and management actions, plugin and theme management actions, widget updates, user management actions, and the modification of other various site settings and options. Retention duration of activity data depends on the site’s plan and activity type. [See the complete list of currently-recorded activities (along with retention information)](https://jetpackme.wordpress.com/support/activity-log/#data-retention).

**Data Synced ([?](https://jetpack.com/support/what-data-does-jetpack-sync/)):** Successful and failed login attempts, which will include the actor’s IP address and user agent.

---

### Carousel

**_Image views are only recorded if the site owner, has explicitly enabled image view stats tracking for this feature via the `jetpack_enable_carousel_stats` filter._**

**Data Used:** If image view tracking is enabled, the following information is used: IP address, WordPress.com user ID (if logged in), WordPress.com username (if logged in), user agent, visiting URL, referring URL, timestamp of event, browser language, country code.

**Activity Tracked:** Image views.

---

### Contact Form

**Data Used:** If [Akismet](https://akismet.com/) is enabled on the site, the contact form submission data - IP address, user agent, name, email address, website, and message - is submitted to the [Akismet](https://akismet.com/) service (also owned by [Automattic](https://automattic.com/)) for the sole purpose of spam checking. The actual submission data is stored in the database of the site on which it was submitted and is emailed directly to the owner of the form (i.e. the site author who published the page on which the contact form resides). This email will include the submitter’s IP address, timestamp, name, email address, website, and message.

**Data Synced ([?](https://jetpack.com/support/what-data-does-jetpack-sync/)):** Post and post metadata associated with a user’s contact form submission. If [Akismet](https://akismet.com/) is enabled on the site, the IP address and user agent originally submitted with the comment are synced, as well, as they are stored in post meta.

---

### Google Analytics

**_This feature is only available to sites on the Premium and Professional plans._**

**Data Used:** Please refer to the appropriate [Google Analytics documentation](https://developers.google.com/analytics/resources/concepts/gaConceptsTrackingOverview#howAnalyticsGetsData) for the specific type of data it collects. For sites running [WooCommerce](https://woocommerce.com/) (also owned by [Automattic](https://automattic.com/)) and this feature simultaneously and having all purchase tracking explicitly enabled, purchase events will send Google Analytics the following information: order number, product id and name, product category, total cost, and quantity of items purchased. Google Analytics does offer [IP anonymization](https://support.google.com/analytics/answer/2763052?hl=en), which can be enabled by the site owner.

**Activity Tracked:** This feature sends page view events (and potentially video play events) over to Google Analytics for consumption. For sites running WooCommerce-powered stores, some additional events are also sent to Google Analytics: shopping cart additions and removals, product listing views and clicks, product detail views, and purchases. Tracking for each specific WooCommerce event needs to be enabled by the site owner.

---

### Gravatar Hovercards

**Data Used:** This feature will send a hash of the user’s email address (if logged in to the site or WordPress.com - or if they submitted a comment on the site using their email address that is attached to an active Gravatar profile) to the [Gravatar](https://gravatar.com/) service (also owned by [Automattic](https://automattic.com/)) in order to retrieve their profile image.

---

### Likes

**_This feature is only accessible to users logged in to WordPress.com._**

**Data Used:** In order to process a post like action, the following information is used: IP address, WordPress.com user ID, WordPress.com username, WordPress.com-connected site ID (on which the post was liked), post ID (of the post that was liked), user agent, timestamp of event, browser language, country code.

**Activity Tracked:** Post likes.

---

### Protect

**Data Used:** In order to check login activity and potentially block fraudulent attempts, the following information is used: attempting user’s IP address, attempting user’s email address/username (i.e. according to the value they were attempting to use during the login process), and all IP-related HTTP headers attached to the attempting user.

**Activity Tracked:** Failed login attempts (these include IP address and user agent). We also set a cookie (`jpp_math_pass`) for 1 day to remember if/when a user has successfully completed a math captcha to prove that they’re a real human. [Learn more about this cookie.](https://jetpack.com/support/cookies/#protect)

**Data Synced ([?](https://jetpack.com/support/what-data-does-jetpack-sync/)):** Failed login attempts, which contain the user’s IP address, attempted username or email address, and user agent information.

---

### Search

**_This feature is only available to sites on the Professional plan._**

**Data Used:** Any of the visitor-chosen search filters and query data in order to process a search request on the WordPress.com servers.

---

### Sharing

**Data Used:** When sharing content via email (this option is only available if [Akismet](https://akismet.com/) is active on the site), the following information is used: sharing party’s name and email address (if the user is logged in, this information will be pulled directly from their account), IP address (for spam checking), user agent (for spam checking), and email body/content. This content will be sent to [Akismet](https://akismet.com/) (also owned by [Automattic](https://automattic.com/)) so that a spam check can be performed. Additionally, if [reCAPTCHA](http://www.google.com/recaptcha) (by Google) is enabled by the site owner, the sharing party’s IP address will be shared with that service. You can find Google’s privacy policy [here](https://www.google.com/policies/privacy/).

---

### WordPress.com Stats

**Data Used:** IP address, WordPress.com user ID (if logged in), WordPress.com username (if logged in), user agent, visiting URL, referring URL, timestamp of event, browser language, country code. _Important:_ The site owner does **not** have access to any of this information via this feature. For example, a site owner can see that a specific post has 285 views, but he/she cannot see which specific users/accounts viewed that post. Stats logs - containing visitor IP addresses and WordPress.com usernames (if available) - are retained by [Automattic](https://automattic.com/) for 28 days and are used for the sole purpose of powering this feature.

**Activity Tracked:** Post and page views, video plays (if videos are hosted by WordPress.com), outbound link clicks, referring URLs and search engine terms and country. When this module is enabled, Jetpack also tracks performance on each page load that includes the Javascript file used for tracking stats. This is exclusively for aggregate performance tracking across Jetpack sites in order to make sure that our plugin and code are not causing performance issues. This includes the tracking of page load times and resource loading duration (image files, Javascript files, CSS files, etc.). The site owner has the ability to force this feature [to honor DNT settings of visitors](https://jetpack.com/support/wordpress-com-stats/#honoring-dnt). By default, DNT is currently not honored.

---
