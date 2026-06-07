# SafePassWordmaker — Drupal Headless CMS Setup

This folder contains everything you need to set up Drupal as the headless backend for SafePassWordmaker on cPanel shared hosting.

---

## Architecture

```
cPanel Shared Hosting
└── cms.yourdomain.com/          ← Drupal (PHP 8.2 + MySQL)
    ├── JSON:API  (/jsonapi/...)  ← React frontend fetches content here
    ├── OAuth     (/oauth/token)  ← Auth for admin/contributor logins
    └── Drupal admin UI          ← Content editors use this

React Frontend (static files or another subdomain)
└── yourdomain.com/              ← Built React app (npm run build → upload dist/)
    └── Reads from cms.yourdomain.com/jsonapi/
```

---

## Step 1 — Server Requirements

Verify your cPanel host meets these minimums:
- **PHP 8.1+** (8.2 recommended) — set in cPanel → PHP Version Manager
- **MySQL 8.0** or MariaDB 10.6+
- **Composer** available via SSH (`composer --version`)
- **SSH access** (most cPanel hosts include this)

---

## Step 2 — Create MySQL Database

1. cPanel → **MySQL Databases**
2. Create database: `safepass_drupal`
3. Create user: `safepass_user` with a strong password
4. Add user to database with **All Privileges**

---

## Step 3 — Install Drupal via SSH

```bash
# Connect via SSH (your host provides credentials)
ssh yourusername@yourdomain.com

# Go to public_html (or a subdomain folder)
cd ~/public_html

# If setting up on subdomain cms.yourdomain.com:
# mkdir cms && cd cms

# Download Drupal 10 with Composer
composer create-project drupal/recommended-project:^10 . --no-interaction

# Install Drush (Drupal CLI)
composer require drush/drush

# Install Drupal (replace DB credentials)
./vendor/bin/drush site:install standard \
  --db-url="mysql://safepass_user:YOUR_DB_PASSWORD@localhost/safepass_drupal" \
  --site-name="SafePassWordmaker CMS" \
  --account-name="admin" \
  --account-mail="admin@yourdomain.com" \
  --account-pass="CHOOSE_STRONG_PASSWORD" \
  -y
```

---

## Step 4 — Install Required Modules

```bash
# JSON:API (core, already enabled) + extras
composer require drupal/simple_oauth drupal/jsonapi_extras drupal/cors

# Enable modules
./vendor/bin/drush en simple_oauth jsonapi_extras cors -y

# Clear cache
./vendor/bin/drush cr
```

---

## Step 5 — Configure CORS (allow React frontend to call Drupal API)

Edit `sites/default/services.yml` (create from `default.services.yml` if it doesn't exist):

```yaml
parameters:
  cors.config:
    enabled: true
    allowedHeaders:
      - '*'
    allowedMethods:
      - GET
      - POST
      - PATCH
      - DELETE
      - OPTIONS
    allowedOrigins:
      - 'https://yourdomain.com'       # your React frontend URL
      - 'https://www.yourdomain.com'
    exposedHeaders: false
    maxAge: false
    supportsCredentials: true
```

Then:
```bash
./vendor/bin/drush cr
```

---

## Step 6 — Configure Simple OAuth (for JWT login)

1. Visit `https://cms.yourdomain.com/admin/config/people/simple_oauth`
2. Generate keys:
   ```bash
   mkdir -p ../private/oauth-keys
   openssl genrsa -out ../private/oauth-keys/private.key 2048
   openssl rsa -in ../private/oauth-keys/private.key -pubout > ../private/oauth-keys/public.key
   chmod 600 ../private/oauth-keys/private.key
   ```
3. In Drupal admin, point to those key files
4. Go to `admin/config/services/consumer` → Add Consumer:
   - **Label**: SafePassMaker React App
   - **Client ID**: `safepassmaker`
   - **Redirect URI**: `https://yourdomain.com`
   - **Scopes**: Leave default

Note the **Client ID** and **Client Secret** — you'll put these in React's `.env`.

---

## Step 7 — Import Content Types & Config

```bash
# From your Drupal root, import the config from this repo
cp -r /path/to/drupal-setup/config/* config/sync/

./vendor/bin/drush config:import --source=config/sync -y
./vendor/bin/drush cr
```

This creates:
- **Article** content type with fields: `field_excerpt`, `field_slug`, `field_hero_image`, `field_read_time`, `field_approved`, `field_category`, `field_tags`
- **Categories** taxonomy vocabulary
- **Tags** taxonomy vocabulary
- **User fields**: `field_bio`, `field_designation`, `field_twitter`, `field_linkedin`, `field_github`

---

## Step 8 — Import Sample Blog Posts

```bash
# Import the 6 static posts as Drupal nodes
./vendor/bin/drush php:script /path/to/drupal-setup/scripts/seed_posts.php
```

---

## Step 9 — Configure User Roles

Drupal's built-in roles map to the app's roles:
- **Administrator** → admin (full CMS access)
- **Editor** (create this role) → contributor (can create articles, pending approval)

```bash
# Create Editor role
./vendor/bin/drush role:create editor "Contributor"

# Set permissions for Editor role
./vendor/bin/drush role:perm:add editor \
  "create article content, edit own article content, access content"
```

---

## Step 10 — Update React .env

Create/update `.env` (or `.env.production`) in `artifacts/safepasswordmaker/`:

```env
VITE_DRUPAL_URL=https://cms.yourdomain.com
VITE_DRUPAL_CLIENT_ID=safepassmaker
VITE_DRUPAL_CLIENT_SECRET=your_client_secret_here
VITE_CMS_MODE=drupal
```

---

## Step 11 — Build & Deploy React Frontend

```bash
# In your local project
pnpm --filter @workspace/safepasswordmaker run build

# Upload dist/ folder contents to public_html (or your frontend subdomain)
# Use cPanel File Manager or FTP
```

Add `dist/.htaccess` for React routing:
```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
```

---

## Drupal Admin URL

After setup: `https://cms.yourdomain.com/admin`
Log in with the admin credentials from Step 3.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| CORS errors in browser | Check `services.yml` allowedOrigins matches your frontend URL exactly |
| 403 on JSON:API | Check `admin/config/services/jsonapi` — ensure "Accept all JSON:API module requests" is enabled |
| OAuth 401 | Verify client_id/secret in `.env` match the Drupal consumer |
| Images not loading | Ensure image URIs from JSON:API are prefixed with `VITE_DRUPAL_URL` |
| PHP memory errors | Add `php_value memory_limit 256M` to `.htaccess` |
