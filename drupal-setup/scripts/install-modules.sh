#!/bin/bash
# SafePassWordmaker — Drupal module installer
# Run this from your Drupal root after installing Drupal
# Usage: bash drupal-setup/scripts/install-modules.sh

set -e

DRUSH="./vendor/bin/drush"

echo "=== Installing Drupal modules for SafePassWordmaker ==="

# Install via Composer
composer require \
  drupal/simple_oauth:^5.2 \
  drupal/jsonapi_extras:^3.23 \
  drupal/cors:^1.1 \
  drupal/pathauto:^1.12 \
  drupal/token:^1.13 \
  --no-interaction

echo "=== Enabling modules ==="
$DRUSH en simple_oauth jsonapi_extras pathauto token -y

echo "=== Enabling JSON:API write access ==="
$DRUSH config:set jsonapi.settings read_only false -y

echo "=== Creating Contributor role ==="
$DRUSH role:create contributor "Contributor" || echo "Role may already exist"

$DRUSH role:perm:add contributor \
  "access content, create article content, edit own article content, delete own article content, view own unpublished content" \
  -y

echo "=== Generating OAuth keys ==="
mkdir -p ../private/oauth-keys
openssl genrsa -out ../private/oauth-keys/private.key 2048
openssl rsa -in ../private/oauth-keys/private.key -pubout > ../private/oauth-keys/public.key
chmod 600 ../private/oauth-keys/private.key
chmod 644 ../private/oauth-keys/public.key
echo "Keys saved to: ../private/oauth-keys/"

echo ""
echo "=== Next steps ==="
echo "1. Go to admin/config/people/simple_oauth"
echo "   Set key paths to: ../private/oauth-keys/private.key and public.key"
echo "2. Go to admin/config/services/consumer"
echo "   Add a new consumer with client_id=safepassmaker and note the secret"
echo "3. Set VITE_DRUPAL_CLIENT_ID and VITE_DRUPAL_CLIENT_SECRET in your React .env"
echo ""
$DRUSH cr
echo "=== Done ==="
