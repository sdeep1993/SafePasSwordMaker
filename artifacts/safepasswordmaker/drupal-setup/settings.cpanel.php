<?php
/**
 * SafePassWordmaker — cPanel Shared Hosting Settings
 *
 * 1. Fill in your actual database credentials below
 * 2. Upload this file to: public_html/cms/web/sites/default/settings.local.php
 * 3. Include it from settings.php (see README.md)
 */

// ─── Database (cPanel MySQL) ──────────────────────────────────────────────────
// Replace the values below with your cPanel database credentials.
// In cPanel, your DB name is prefixed with your username, e.g.: cpuser_safepassmaker
$databases['default']['default'] = [
  'database' => 'cpuser_safepassmaker',   // ← Your cPanel DB name
  'username' => 'cpuser_spmuser',          // ← Your cPanel DB username
  'password' => 'YOUR_DB_PASSWORD_HERE',   // ← Your cPanel DB password
  'prefix'   => '',
  'host'     => 'localhost',
  'port'     => '3306',
  'driver'   => 'mysql',
  'namespace' => 'Drupal\\mysql\\Driver\\Database\\mysql',
  'autoload'  => 'core/modules/mysql/src/Driver/Database/mysql/',
];

// ─── CORS — Allow your React frontend domain ──────────────────────────────────
// Replace yourdomain.com with your actual domain
$settings['cors.config'] = [
  'enabled'         => TRUE,
  'allowedHeaders'  => ['*'],
  'allowedMethods'  => ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  'allowedOrigins'  => [
    'https://yourdomain.com',              // ← Your frontend domain
    'https://www.yourdomain.com',
    'https://*.replit.app',                // If hosting React on Replit
    'https://*.repl.co',
  ],
  'exposedHeaders'  => ['Content-Type', 'Authorization', 'X-Requested-With'],
  'maxAge'          => 1728000,
  'supportsCredentials' => TRUE,
];

// ─── Trusted host patterns ────────────────────────────────────────────────────
// Replace cms.yourdomain.com with your actual Drupal subdomain
$settings['trusted_host_patterns'] = [
  '^cms\.yourdomain\.com$',
  '^www\.yourdomain\.com$',
];

// ─── File paths ───────────────────────────────────────────────────────────────
$settings['file_public_path']  = 'sites/default/files';
$settings['file_private_path'] = '../private';
$settings['file_temp_path']    = '/tmp';

// ─── Hash salt (IMPORTANT: use a unique random value!) ───────────────────────
// Generate one at: https://www.drupal.org/project/drupal/issues/2842416
$settings['hash_salt'] = 'CHANGE-THIS-TO-A-LONG-RANDOM-STRING-50-CHARS-MIN';

// ─── Performance: enable caching for production ───────────────────────────────
$config['system.performance']['css']['preprocess'] = TRUE;
$config['system.performance']['js']['preprocess']  = TRUE;

// ─── Reverse proxy (cPanel nginx/apache in front) ────────────────────────────
// Uncomment if your host uses a reverse proxy
// $settings['reverse_proxy'] = TRUE;
// $settings['reverse_proxy_addresses'] = ['127.0.0.1'];
