# SafePassWordmaker — Drupal Backend Setup Guide

This guide walks you through setting up the Drupal headless CMS backend for SafePassWordmaker.
The same Drupal installation works for **local development** (XAMPP/Laragon/WAMP) and **cPanel shared hosting**.

---

## Pre-configured Credentials

Use exactly these credentials during setup. They match what the React frontend expects.

| Setting             | Value                 |
|---------------------|-----------------------|
| Drupal Admin User   | `admin`               |
| Drupal Admin Pass   | `SafePass@2024!`      |
| OAuth Client ID     | `safepassmaker`       |
| OAuth Client Secret | `Spm@Secret2024!`     |
| DB Name (local)     | `safepassmaker_db`    |
| DB User (local)     | `root`                |
| DB Pass (local)     | *(empty)*             |

---

## Option A — Local Setup (XAMPP / Laragon / WAMP)

### 1. Install XAMPP (if not already)
Download XAMPP from https://www.apachefriends.org and install it.
Start **Apache** and **MySQL** from the XAMPP Control Panel.

### 2. Download Drupal 10
```bash
# Download to your htdocs folder
cd C:\xampp\htdocs     # Windows
# OR
cd /Applications/XAMPP/htdocs  # macOS

# Download Drupal 10 (via Composer — recommended)
composer create-project drupal/recommended-project safepassmaker-cms
cd safepassmaker-cms
```

Or download the ZIP from https://www.drupal.org/download and extract to `htdocs/safepassmaker-cms/`

### 3. Create the Database
Open http://localhost/phpmyadmin and create a database:
- **Database name:** `safepassmaker_db`
- **Collation:** `utf8mb4_unicode_ci`

### 4. Install Drupal via Browser
Open http://localhost/safepassmaker-cms/web and follow the installer:
- Language: English
- Profile: **Standard**
- Database: MySQL, name `safepassmaker_db`, user `root`, password *(empty)*, host `localhost`
- Site name: `SafePassWordmaker CMS`
- Admin email: `admin@safepassmaker.local`
- Admin username: **`admin`**
- Admin password: **`SafePass@2024!`**

### 5. Run the Setup Script
After Drupal is installed, run the setup script from the Drupal root:
```bash
cd C:\xampp\htdocs\safepassmaker-cms
bash ../../safepassmaker-app/drupal-setup/drush-setup.sh
```
*(Adjust path to where you extracted the React app)*

### 6. Copy Local Settings
```bash
cp drupal-setup/settings.local.php web/sites/default/settings.local.php
```
Then add this line to the bottom of `web/sites/default/settings.php`:
```php
if (file_exists($app_root . '/' . $site_path . '/settings.local.php')) {
  include $app_root . '/' . $site_path . '/settings.local.php';
}
```

### 7. Configure the React App (.env)
Create `artifacts/safepasswordmaker/.env`:
```env
VITE_DRUPAL_URL=http://localhost/safepassmaker-cms/web
VITE_DRUPAL_CLIENT_ID=safepassmaker
VITE_DRUPAL_CLIENT_SECRET=Spm@Secret2024!
```

---

## Option B — cPanel Shared Hosting

### 1. Create a Subdomain (Recommended)
In cPanel → **Subdomains**, create: `cms.yourdomain.com`
Note the Document Root path (e.g. `/home/username/public_html/cms`)

### 2. Create a MySQL Database
In cPanel → **MySQL Databases**:
- Create database: `username_safepassmaker` (cPanel prepends your username)
- Create user: `username_spmuser`
- Password: Choose a strong password (save it!)
- Add user to database with **All Privileges**

### 3. Upload Drupal
Download Drupal 10 ZIP from https://www.drupal.org/download
In cPanel → **File Manager** → navigate to your subdomain root → **Upload** the ZIP → **Extract**

Or via SSH (if available):
```bash
composer create-project drupal/recommended-project cms
```

### 4. Install Drupal via Browser
Open `https://cms.yourdomain.com` and follow the installer:
- Database: use the database name, user, and password you created above
- Host: `localhost`
- Site name: `SafePassWordmaker CMS`
- Admin username: **`admin`**
- Admin password: **`SafePass@2024!`**

### 5. Run the Setup Script (SSH required)
If your host provides SSH access:
```bash
cd ~/public_html/cms
bash ~/path-to-react-app/drupal-setup/drush-setup.sh
```

**No SSH?** — Run the manual steps from `drush-setup.sh` as Drush commands via **Softaculous** or the Drupal admin UI.

### 6. Copy cPanel Settings
Upload `drupal-setup/settings.cpanel.php` to `sites/default/settings.local.php` on the server,
then include it from `settings.php` (same as step 6 in Option A).

### 7. Configure CORS for your Domain
In `settings.local.php`, set:
```php
$settings['cors.config']['allowedOrigins'] = ['https://yourdomain.com'];
```

### 8. Configure the React App
Set environment variables on your React hosting (Replit, Vercel, etc.):
```env
VITE_DRUPAL_URL=https://cms.yourdomain.com
VITE_DRUPAL_CLIENT_ID=safepassmaker
VITE_DRUPAL_CLIENT_SECRET=Spm@Secret2024!
```

---

## Drupal Modules Required

The setup script (`drush-setup.sh`) installs these automatically:

| Module | Purpose |
|--------|---------|
| `simple_oauth` | OAuth 2.0 for React login |
| `jsonapi_extras` | JSON:API fine-tuning |
| `consumers` | Register the React app as a consumer |
| `decoupled_router` | URL path resolution |
| `cors` | Allow React frontend cross-origin requests |
| `pathauto` | Auto-generate URL slugs from titles |
| `token` | Token support for Pathauto |

---

## Content Type: Article

The setup script creates an **Article** content type with these custom fields:

| Field Machine Name      | Type        | Purpose |
|------------------------|-------------|---------|
| `field_slug`           | Text        | URL slug (e.g. `my-post-title`) |
| `field_excerpt`        | Text        | Short summary for blog list |
| `field_image_url`      | Text        | Hero image URL (Unsplash, etc.) |
| `field_approved`       | Boolean     | Admin approval gate |
| `field_read_time`      | Text        | "5 min read" |

---

## User Roles

| Role | Can Do |
|------|--------|
| `administrator` | Full access — manage all content, users, settings |
| `contributor` | Create/edit own posts; needs admin approval to publish |

---

## Troubleshooting

**CORS errors in browser console?**
→ Check `settings.local.php` CORS config. Make sure your frontend origin is listed.

**OAuth token errors?**
→ Go to Drupal admin → Configuration → Web services → Consumers → verify the `safepassmaker` consumer exists with the correct secret.

**JSON:API returns 403?**
→ Drupal admin → Configuration → Web services → JSON:API → set to "Accept all JSON:API create, read, update, and delete operations"

**Posts not appearing on frontend?**
→ Ensure the post has `status = Published` AND `field_approved = true`

**Local: "Access denied" on Drupal install?**
→ Rename `sites/default/default.settings.php` to `settings.php` and `chmod 666 sites/default/settings.php`
