<?php
/**
 * SafePassWordmaker — Local Development Settings
 * 
 * Copy this file to: web/sites/default/settings.local.php
 * Then include it from the bottom of settings.php:
 *
 *   if (file_exists($app_root . '/' . $site_path . '/settings.local.php')) {
 *     include $app_root . '/' . $site_path . '/settings.local.php';
 *   }
 */

// ─── Database (XAMPP / Laragon / WAMP local) ─────────────────────────────────
$databases['default']['default'] = [
  'database' => 'safepassmaker_db',
  'username' => 'root',
  'password' => '',          // Leave empty for XAMPP default
  'prefix'   => '',
  'host'     => 'localhost',
  'port'     => '3306',
  'driver'   => 'mysql',
  'namespace' => 'Drupal\\mysql\\Driver\\Database\\mysql',
  'autoload'  => 'core/modules/mysql/src/Driver/Database/mysql/',
];

// ─── CORS — Allow React dev server ───────────────────────────────────────────
$settings['cors.config'] = [
  'enabled'         => TRUE,
  'allowedHeaders'  => ['*'],
  'allowedMethods'  => ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  'allowedOrigins'  => [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:4173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    '*.replit.dev',        // Replit preview
    '*.repl.co',
  ],
  'exposedHeaders'  => ['Content-Type', 'Authorization', 'X-Requested-With'],
  'maxAge'          => 1728000,
  'supportsCredentials' => TRUE,
];

// ─── Trusted host patterns ───────────────────────────────────────────────────
$settings['trusted_host_patterns'] = [
  '^localhost$',
  '^127\.0\.0\.1$',
];

// ─── File paths ───────────────────────────────────────────────────────────────
$settings['file_public_path']  = 'sites/default/files';
$settings['file_private_path'] = '../private';
$settings['file_temp_path']    = '/tmp';

// ─── Hash salt (change in production!) ───────────────────────────────────────
$settings['hash_salt'] = 'safepassmaker-local-dev-hash-salt-change-in-prod';

// ─── Development: disable caching ────────────────────────────────────────────
$settings['cache']['bins']['render']  = 'cache.backend.null';
$settings['cache']['bins']['dynamic_page_cache'] = 'cache.backend.null';
$settings['cache']['bins']['page']    = 'cache.backend.null';

$config['system.performance']['css']['preprocess'] = FALSE;
$config['system.performance']['js']['preprocess']  = FALSE;
