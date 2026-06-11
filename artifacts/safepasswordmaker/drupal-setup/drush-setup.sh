#!/usr/bin/env bash
# =============================================================================
# SafePassWordmaker — Drupal Configuration Script
# Run this from your Drupal root directory after a fresh Drupal install.
# Requires Drush 12+ (included in the Composer project)
# =============================================================================

set -e

DRUSH="./vendor/bin/drush"

echo ""
echo "================================================="
echo "  SafePassWordmaker — Drupal Backend Setup"
echo "================================================="
echo ""

# ─── 1. Install required modules ─────────────────────────────────────────────
echo "[1/8] Installing required modules..."
$DRUSH pm:install simple_oauth jsonapi_extras consumers decoupled_router pathauto token -y

# ─── 2. Configure JSON:API to allow all operations ───────────────────────────
echo "[2/8] Configuring JSON:API..."
$DRUSH config:set jsonapi.settings read_only 0 -y

# ─── 3. Enable CORS ──────────────────────────────────────────────────────────
echo "[3/8] CORS is configured via settings.local.php (see README)"

# ─── 4. Create Article content type fields ───────────────────────────────────
echo "[4/8] Creating custom Article fields..."

# field_slug
$DRUSH field:create \
  --bundle=article \
  --entity-type=node \
  --field-name=field_slug \
  --field-label="Slug" \
  --field-type=string \
  --field-widget=string_textfield \
  --is-required=0 -y 2>/dev/null || echo "  field_slug already exists, skipping."

# field_excerpt
$DRUSH field:create \
  --bundle=article \
  --entity-type=node \
  --field-name=field_excerpt \
  --field-label="Excerpt" \
  --field-type=string_long \
  --field-widget=string_textarea \
  --is-required=0 -y 2>/dev/null || echo "  field_excerpt already exists, skipping."

# field_image_url
$DRUSH field:create \
  --bundle=article \
  --entity-type=node \
  --field-name=field_image_url \
  --field-label="Image URL" \
  --field-type=string \
  --field-widget=string_textfield \
  --is-required=0 -y 2>/dev/null || echo "  field_image_url already exists, skipping."

# field_approved
$DRUSH field:create \
  --bundle=article \
  --entity-type=node \
  --field-name=field_approved \
  --field-label="Approved" \
  --field-type=boolean \
  --field-widget=boolean_checkbox \
  --is-required=0 -y 2>/dev/null || echo "  field_approved already exists, skipping."

# field_read_time
$DRUSH field:create \
  --bundle=article \
  --entity-type=node \
  --field-name=field_read_time \
  --field-label="Read Time" \
  --field-type=string \
  --field-widget=string_textfield \
  --is-required=0 -y 2>/dev/null || echo "  field_read_time already exists, skipping."

# ─── 5. Create Tags and Categories taxonomies ─────────────────────────────────
echo "[5/8] Creating tag and category taxonomies..."

# Tags vocabulary (may already exist)
$DRUSH ev "
  \$vocab = \Drupal\taxonomy\Entity\Vocabulary::load('tags');
  if (!\$vocab) {
    \$vocab = \Drupal\taxonomy\Entity\Vocabulary::create([
      'vid' => 'tags',
      'name' => 'Tags',
    ]);
    \$vocab->save();
    echo 'Tags vocabulary created.\n';
  } else {
    echo 'Tags vocabulary already exists.\n';
  }
"

# Categories vocabulary
$DRUSH ev "
  \$vocab = \Drupal\taxonomy\Entity\Vocabulary::load('categories');
  if (!\$vocab) {
    \$vocab = \Drupal\taxonomy\Entity\Vocabulary::create([
      'vid' => 'categories',
      'name' => 'Categories',
    ]);
    \$vocab->save();
    echo 'Categories vocabulary created.\n';
  } else {
    echo 'Categories vocabulary already exists.\n';
  }
"

# field_tags on Article
$DRUSH field:create \
  --bundle=article \
  --entity-type=node \
  --field-name=field_tags \
  --field-label="Tags" \
  --field-type=entity_reference \
  --field-widget=entity_reference_autocomplete_tags \
  --is-required=0 -y 2>/dev/null || echo "  field_tags already exists, skipping."

# field_category on Article
$DRUSH field:create \
  --bundle=article \
  --entity-type=node \
  --field-name=field_category \
  --field-label="Category" \
  --field-type=entity_reference \
  --field-widget=entity_reference_autocomplete \
  --is-required=0 -y 2>/dev/null || echo "  field_category already exists, skipping."

# ─── 6. Create contributor role ──────────────────────────────────────────────
echo "[6/8] Creating contributor user role..."
$DRUSH ev "
  \$role = \Drupal\user\Entity\Role::load('contributor');
  if (!\$role) {
    \$role = \Drupal\user\Entity\Role::create(['id' => 'contributor', 'label' => 'Contributor']);
    \$role->save();
    echo 'Contributor role created.\n';
  } else {
    echo 'Contributor role already exists.\n';
  }
"

# Grant contributor role: create+edit own articles
$DRUSH role:perm:add contributor \
  "create article content,edit own article content,delete own article content,access content" -y

# ─── 7. Configure OAuth 2.0 (simple_oauth) ───────────────────────────────────
echo "[7/8] Setting up OAuth 2.0..."

# Generate OAuth keys
mkdir -p private/oauth-keys
$DRUSH ev "\Drupal::service('simple_oauth.credentials_generator')->generateKeys('private/oauth-keys');" 2>/dev/null || \
  openssl genrsa -out private/oauth-keys/private.key 2048 && \
  openssl rsa -in private/oauth-keys/private.key -pubout -out private/oauth-keys/public.key

chmod 600 private/oauth-keys/private.key
chmod 644 private/oauth-keys/public.key

# Configure simple_oauth paths
$DRUSH config:set simple_oauth.settings public_key "../private/oauth-keys/public.key" -y
$DRUSH config:set simple_oauth.settings private_key "../private/oauth-keys/private.key" -y
$DRUSH config:set simple_oauth.settings access_token_expiration 3600 -y
$DRUSH config:set simple_oauth.settings refresh_token_expiration 1209600 -y

# Create the OAuth Consumer (React app client)
$DRUSH ev "
  \$clients = \Drupal::entityTypeManager()->getStorage('consumer')->loadByProperties(['client_id' => 'safepassmaker']);
  if (empty(\$clients)) {
    \$consumer = \Drupal::entityTypeManager()->getStorage('consumer')->create([
      'label' => 'SafePassWordmaker React App',
      'client_id' => 'safepassmaker',
      'secret' => 'Spm@Secret2024!',
      'confidential' => TRUE,
      'grant_types' => ['password', 'refresh_token'],
      'redirect' => 'http://localhost:3000',
    ]);
    \$consumer->save();
    echo 'OAuth consumer \"safepassmaker\" created.\n';
  } else {
    echo 'OAuth consumer \"safepassmaker\" already exists.\n';
  }
"

# ─── 8. Create Pathauto pattern for articles ─────────────────────────────────
echo "[8/8] Configuring Pathauto URL patterns..."
$DRUSH ev "
  \$pattern = \Drupal::entityTypeManager()->getStorage('pathauto_pattern')->create([
    'id' => 'article_slug',
    'label' => 'Article Slug',
    'type' => 'canonical_entities:node',
    'pattern' => '/blog/[node:field_slug]',
    'conditions' => ['node_type' => ['bundles' => ['article']]],
    'weight' => 0,
    'status' => TRUE,
  ]);
  \$pattern->save();
" 2>/dev/null || echo "  Pathauto pattern creation skipped (may need manual setup)."

# ─── Cache clear ─────────────────────────────────────────────────────────────
echo ""
echo "Clearing Drupal cache..."
$DRUSH cr

echo ""
echo "================================================="
echo "  Setup Complete!"
echo "================================================="
echo ""
echo "  Drupal admin URL: /user/login"
echo "  Admin username:   admin"
echo "  Admin password:   SafePass@2024!"
echo ""
echo "  OAuth Client ID:     safepassmaker"
echo "  OAuth Client Secret: Spm@Secret2024!"
echo ""
echo "  Add to your React .env file:"
echo "  VITE_DRUPAL_URL=http://localhost/safepassmaker-cms/web"
echo "  VITE_DRUPAL_CLIENT_ID=safepassmaker"
echo "  VITE_DRUPAL_CLIENT_SECRET=Spm@Secret2024!"
echo ""
