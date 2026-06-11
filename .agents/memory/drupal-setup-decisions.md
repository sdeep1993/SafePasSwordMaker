---
name: Drupal headless setup decisions
description: Key decisions for SafePassWordmaker's Drupal headless CMS integration
---

The React frontend talks exclusively to Drupal JSON:API (VITE_DRUPAL_URL). Node/Express server still runs but frontend no longer calls it.

**Pre-configured credentials** (used in drush-setup.sh and Setup.tsx wizard):
- Drupal admin: `admin` / `SafePass@2024!`
- OAuth Client ID: `safepassmaker` / Secret: `Spm@Secret2024!`

**Why plain_text body format:** Posts use `format: "plain_text"` so body.value returns raw markdown (not processed HTML). renderMarkdown() in BlogPost.tsx then works for both static and Drupal posts.

**Why body.value priority over body.processed:** processed may HTML-encode markdown, breaking the renderer. Always read value first.

**Static fallback:** Blog.tsx and BlogPost.tsx fall back to static POSTS array when Drupal is not configured or post not found. POSTS/AUTHORS must remain exported from Blog.tsx.

**DrupalPost.author fields:** id, name, email, bio, avatar, role, twitter, linkedin, github — compatible with AuthorCard after coercing optionals to "".

**Setup package location:** `artifacts/safepasswordmaker/drupal-setup/` — README.md, drush-setup.sh, settings.local.php (XAMPP), settings.cpanel.php (cPanel).

**How to apply:** Any new Drupal field added to the Article content type must also be added to mapNode() in drupal.ts and the drush-setup.sh field:create commands.
