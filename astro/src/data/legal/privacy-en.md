## Introduction

qnury.es (the "Site") is a personal website operated by an individual (Qnurye). This Privacy Policy explains how the Site collects, uses, and protects your personal information. This policy should be read alongside our [Terms of Service](/terms).

For any privacy-related questions, please contact contact@qnury.es.

## Data We Collect

### A. Data You Provide Voluntarily

**Comments**
- Display name (required)
- Email address (optional)
- Comment text (required)

**Guestbook**
- Nickname (required, max 50 characters)
- Email address (optional, used for moderation result notifications)
- Personal website URL (optional)
- Message (optional, max 140 characters)
- Drawn signature (required, SVG path data)

**Newsletter Subscription**
- Email address (required)
- First name (required)
- Language preference

**Reactions**
- Your emoji selection (no personal data is submitted, but your IP address is logged for rate limiting)

### B. Data Collected Automatically

- **IP address** — Captured by Cloudflare and the API for rate limiting and security. Stored in the database for comments and guestbook submissions. Also used as user identifier for comment like deduplication.
- **Country code** — Derived from your IP address via Cloudflare's `CF-IPCountry` header, stored alongside comments.
- **Browser and device information** — Collected by Google Analytics (user agent, screen size, etc.).
- **Page visit data** — Collected by Google Analytics (pages viewed, referrer, session duration, etc.).

### C. Data Stored Locally on Your Device

- **Theme preference** — Light/dark mode setting is stored in your browser's localStorage and is never sent to the server.

## How We Use Your Data

- **Display names and comment content** — To display user interactions on blog posts
- **Email addresses** — To send newsletter content (with your consent); guestbook moderation result notifications
- **IP addresses** — Rate limiting (reactions: 30 per IP per minute; guestbook: 3 per IP per hour), spam prevention, comment like deduplication
- **Country codes** — Stored alongside comments (currently not used for any user-facing feature)
- **Analytics data** — To understand site usage and improve content
- **Signature data** — To display approved guestbook entries on the public guestbook wall

## Legal Basis for Processing (GDPR)

If you are located in the European Economic Area (EEA), we process your personal data on the following legal bases:

- **Consent** — Newsletter subscription (double opt-in), voluntary submission of comments and guestbook entries
- **Legitimate interest** — Rate limiting, spam prevention, security, analytics for site improvement
- **Performance of service** — Displaying user-submitted content as intended

## Third-Party Services

The Site uses the following third-party services that process data:

### Cloudflare (CDN, Security, Hosting)

- **Purpose**: Content delivery, DDoS protection, DNS, hosting (Pages + Workers + D1 + KV)
- **Data processed**: IP address, request headers, TLS information
- **May set cookies**: Security-related cookies (e.g., `__cflb`, `cf_clearance`)
- **Privacy policy**: [cloudflare.com/privacypolicy](https://www.cloudflare.com/privacypolicy/)

### Google Analytics

- **Purpose**: Website usage analytics
- **Data processed**: Page views, session data, device/browser info, approximate location
- **Cookies set**: `_ga` (2-year expiry), `_gid` (24-hour expiry), etc.
- **Privacy policy**: [policies.google.com/privacy](https://policies.google.com/privacy)
- **Opt out**: Use the [Google Analytics Opt-out Browser Add-on](https://tools.google.com/dlpage/gaoptout)

### Resend (Email Service)

- **Purpose**: Newsletter delivery, guestbook notification emails
- **Data processed**: Email address, first name, language preference
- **Privacy policy**: [resend.com/legal/privacy-policy](https://resend.com/legal/privacy-policy)

### Google Fonts

- **Purpose**: Web font delivery
- **Data processed**: IP address (when fonts are fetched)
- **Privacy policy**: [policies.google.com/privacy](https://policies.google.com/privacy)

## Cookies and Tracking Technologies

### First-Party Cookies

The Site itself does not set any cookies.

### Third-Party Cookies

- **Google Analytics** — `_ga` (2-year expiry), `_gid` (24-hour expiry), used to distinguish users and sessions
- **Cloudflare** — May set cookies when security features are triggered (e.g., `cf_clearance`)

### localStorage

- Stores theme preference (light/dark mode) only. This is not a cookie and is not sent to the server.

### Managing Cookies

You can manage or disable cookies through your browser settings. Google Analytics can be blocked via browser extensions or [Google's opt-out tool](https://tools.google.com/dlpage/gaoptout).

## Data Storage and Retention

- **Comments and likes** — Stored indefinitely in Cloudflare D1 (unless deletion is requested)
- **Guestbook submissions** — Stored indefinitely in D1 (pending, approved, or rejected)
- **Newsletter subscribers** — Stored in Resend until unsubscribed
- **Rate limit data** — Temporary, auto-expires (reactions: 60 seconds; guestbook: 1 hour)
- **Subscription confirmation tokens** — 15-minute TTL, auto-deleted
- **Guestbook review tokens** — 7-day expiry
- **Analytics data** — Per Google Analytics retention settings
- **Server location** — Cloudflare's global network (data may be processed across multiple regions)

## International Data Transfers

Your data is processed by Cloudflare (global CDN), Google (US), and Resend (US). These transfers may involve data leaving your country of residence.

These service providers maintain appropriate data protection measures. By using the Site, you acknowledge these international data transfers.

This site’s servers are not located in mainland China and have not undergone ICP registration. According to the "Regulations on Internet Information Services of the People's Republic of China," this site should not be accessed within mainland China’s network environment. Accessing this site may involve **cross-border data transmission**. Users should evaluate the associated risks and decide whether to proceed at their own discretion.

## Your Rights

Depending on your location, you may have the following rights under privacy laws such as GDPR and CCPA:

- **Right to access** — Request a copy of your personal data
- **Right to correction** — Request correction of inaccurate data
- **Right to deletion** — Request deletion of your data (comments can be removed or anonymized; guestbook entries can be deleted; newsletter subscription can be cancelled)
- **Right to restrict processing** — Request limitation of how your data is used
- **Right to data portability** — Receive your data in a structured format
- **Right to object** — Object to processing based on legitimate interest
- **Right to withdraw consent** — Unsubscribe from the newsletter at any time

### How to Exercise Your Rights

Please email contact@qnury.es and we will respond within 7 working days.

**Please note**: Some data (such as IP-based rate limit keys) is temporary and auto-deleted, making it impractical to retrieve. Where content integrity needs to be maintained (e.g., keeping comment text but removing author information), anonymization may be used instead of full deletion.

## Children's Privacy

The Site is not directed at children under the age of 13 (or 16 in the EU). The Site does not knowingly collect personal data from children.

If you are a parent or guardian and believe your child has submitted personal data to the Site, please contact contact@qnury.es to request removal.

## Data Security

We take the following measures to protect your data:

- All data is transmitted over HTTPS/TLS
- Cloudflare provides DDoS protection and Web Application Firewall
- The API uses rate limiting to prevent abuse
- Guestbook review tokens are SHA-256 hashed before storage
- Sensitive fields (email, IP) are not exposed in public API responses
- Honeypot fields are used for bot detection

While we strive to protect your data, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security.

## Changes to This Policy

This Privacy Policy may be updated from time to time. Material changes will be reflected by updating the "Last Updated" date at the top of this page.

Continued use of the Site after changes constitutes acceptance of the updated policy.

Historical versions of this policy are available through the Site's public Git repository.

## Contact Information

For any privacy-related questions or to exercise your rights, please contact:

**Email**: contact@qnury.es
