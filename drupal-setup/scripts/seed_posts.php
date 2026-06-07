<?php
/**
 * SafePassWordmaker — Drupal seed script
 * Run with: drush php:script seed_posts.php
 *
 * Creates the 6 static blog posts as Drupal article nodes under the admin user.
 */

use Drupal\node\Entity\Node;
use Drupal\taxonomy\Entity\Term;
use Drupal\user\Entity\User;

$admin = User::load(1); // admin user

$posts = [
  [
    'title' => 'What Makes a Strong Password in 2024?',
    'slug'  => 'what-makes-a-strong-password',
    'category' => 'Security',
    'excerpt' => 'An in-depth look at entropy, passphrases, and why length beats complexity every time.',
    'body' => '<h2>The Math of Entropy</h2>
<p>Password strength is measured in bits of entropy. Every bit doubles the search space an attacker must explore. A password with 60 bits of entropy has 2^60 possible combinations — about 1.15 quintillion possibilities.</p>
<h2>Length Over Complexity</h2>
<p>A 16-character lowercase password has more entropy than an 8-character "complex" one.</p>
<ul>
<li>16 lowercase letters: 26^16 ≈ 4.4 × 10^22 combinations</li>
<li>8 mixed characters: 94^8 ≈ 6.1 × 10^15 combinations</li>
</ul>
<h2>The Case for Passphrases</h2>
<p>Four random common words (correct-horse-battery-staple) can provide 44 bits of entropy while remaining memorable.</p>',
  ],
  [
    'title' => 'Two-Factor Authentication: A Complete Guide',
    'slug'  => 'two-factor-authentication-guide',
    'category' => 'Security',
    'excerpt' => 'Why SMS 2FA is no longer safe and what to use instead.',
    'body' => '<h2>Why SMS 2FA Is Vulnerable</h2>
<p>SIM swapping attacks have become increasingly common. An attacker calls your carrier, convinces them to transfer your number to a new SIM, and then receives all your verification codes.</p>
<h2>TOTP: Time-Based One-Time Passwords</h2>
<p>TOTP apps like Google Authenticator and Authy generate codes locally using a shared secret key and the current Unix timestamp.</p>
<h2>Hardware Security Keys</h2>
<p>FIDO2/WebAuthn keys (YubiKey, Google Titan) provide the strongest protection and are phishing-resistant by design.</p>',
  ],
  [
    'title' => 'Why You Need a Password Manager',
    'slug'  => 'password-manager-guide',
    'category' => 'Tools',
    'excerpt' => 'Stop reusing passwords. Here\'s how to use a password manager effectively.',
    'body' => '<h2>The Password Reuse Problem</h2>
<p>When a service gets breached, attackers try those credentials everywhere — a technique called credential stuffing. In 2023, over 8 billion unique credentials were available in public breach databases.</p>
<h2>How Password Managers Work</h2>
<p>A password manager stores your credentials in an encrypted vault. The encryption key is derived from your master password using key derivation functions like PBKDF2 or Argon2.</p>
<h2>Choosing a Password Manager</h2>
<ul>
<li><strong>Bitwarden</strong> — Open source, free tier, self-hostable</li>
<li><strong>1Password</strong> — Excellent UX, Travel Mode feature</li>
<li><strong>KeePassXC</strong> — Fully offline, no cloud sync</li>
</ul>',
  ],
  [
    'title' => 'Understanding Data Breaches',
    'slug'  => 'understanding-data-breaches',
    'category' => 'Privacy',
    'excerpt' => 'How breaches happen, what data is stolen, and how to protect yourself.',
    'body' => '<h2>Common Attack Vectors</h2>
<p><strong>SQL Injection:</strong> Attackers insert malicious code into database queries.</p>
<p><strong>Credential Stuffing:</strong> Using leaked username/password combos from previous breaches.</p>
<p><strong>Phishing:</strong> Fake emails or websites trick users into entering credentials.</p>
<h2>Protecting Yourself</h2>
<ul>
<li>Use unique passwords for every account</li>
<li>Enable 2FA everywhere possible</li>
<li>Monitor Have I Been Pwned</li>
<li>Freeze your credit at all three bureaus</li>
</ul>',
  ],
  [
    'title' => 'How to Create a Secure Passphrase',
    'slug'  => 'how-to-create-a-passphrase',
    'category' => 'Guides',
    'excerpt' => 'Correct horse battery staple: The math behind memorable security.',
    'body' => '<h2>The Diceware Method</h2>
<p>Diceware uses physical dice and a word list to generate truly random passphrases. Roll five dice, use the result as an index in the Diceware word list, and repeat 4–6 times.</p>
<h2>Why Random Word Selection Matters</h2>
<p>The key word is <strong>random</strong>. Humans do not pick words randomly. True randomness requires a mechanical process.</p>
<h2>Passphrase Best Practices</h2>
<ul>
<li>Use at least 4 words (preferably 5–6 for high-security accounts)</li>
<li>Do not use phrases from books, songs, or movies</li>
<li>Separate words with spaces, hyphens, or numbers</li>
</ul>',
  ],
  [
    'title' => 'MD5 vs SHA: Which is More Secure?',
    'slug'  => 'md5-vs-sha-comparison',
    'category' => 'Tech',
    'excerpt' => 'A historical look at hashing collisions and deprecations.',
    'body' => '<h2>MD5: Compromised Since 1996</h2>
<p>MD5 was designed by Ron Rivest and published in 1992. By 2004, Chinese researchers demonstrated full collisions. <strong>Never use MD5 for security-critical purposes.</strong></p>
<h2>SHA-1: Retired by Major Browsers in 2017</h2>
<p>Google\'s SHAttered attack in 2017 demonstrated the first real-world collision.</p>
<h2>SHA-256 and SHA-512: Still Secure</h2>
<p>The SHA-2 family remains secure and is used in Bitcoin, TLS 1.3 certificates, and code signing.</p>
<table>
<tr><th>Use Case</th><th>Recommended</th></tr>
<tr><td>Password storage</td><td>bcrypt, Argon2, scrypt</td></tr>
<tr><td>File integrity</td><td>SHA-256</td></tr>
<tr><td>Digital signatures</td><td>SHA-256 or SHA-512</td></tr>
</table>',
  ],
];

// Get or create category terms
$categoryCache = [];
function getOrCreateCategory(string $name): int {
  global $categoryCache;
  if (isset($categoryCache[$name])) return $categoryCache[$name];

  $terms = \Drupal::entityTypeManager()
    ->getStorage('taxonomy_term')
    ->loadByProperties(['name' => $name, 'vid' => 'categories']);

  if ($terms) {
    $term = reset($terms);
  } else {
    $term = Term::create([
      'name' => $name,
      'vid'  => 'categories',
      'field_slug' => strtolower(preg_replace('/[^a-z0-9]+/i', '-', $name)),
    ]);
    $term->save();
  }

  $categoryCache[$name] = $term->id();
  return $term->id();
}

$created = 0;
$skipped = 0;

foreach ($posts as $post) {
  // Check if slug already exists
  $existing = \Drupal::entityTypeManager()
    ->getStorage('node')
    ->loadByProperties(['field_slug' => $post['slug'], 'type' => 'article']);

  if ($existing) {
    echo "SKIP: '{$post['title']}' already exists\n";
    $skipped++;
    continue;
  }

  $catId = getOrCreateCategory($post['category']);

  $node = Node::create([
    'type'           => 'article',
    'title'          => $post['title'],
    'uid'            => $admin->id(),
    'status'         => 1,
    'field_slug'     => $post['slug'],
    'field_excerpt'  => $post['excerpt'],
    'field_approved' => 1,
    'field_read_time' => '5 min read',
    'body'           => [
      'value'  => $post['body'],
      'format' => 'full_html',
    ],
    'field_category' => [['target_id' => $catId]],
  ]);

  $node->save();
  echo "CREATED: '{$post['title']}'\n";
  $created++;
}

echo "\nDone. Created: {$created}, Skipped: {$skipped}\n";
