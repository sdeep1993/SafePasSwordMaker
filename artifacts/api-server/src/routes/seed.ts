import { Router } from "express";
import { db } from "@workspace/db";
import { postsTable, categoriesTable, tagsTable, postTagsTable, usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth.js";

const router = Router();

const STATIC_POSTS = [
  {
    slug: "what-makes-a-strong-password",
    title: "What Makes a Strong Password in 2024?",
    category: "Security",
    excerpt: "An in-depth look at entropy, passphrases, and why length beats complexity every time.",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=400&fit=crop",
    content: `A strong password is your first line of defense. But what does "strong" actually mean from a mathematical perspective?

## The Math of Entropy

Password strength is measured in bits of entropy. Every bit doubles the search space an attacker must explore. A password with 60 bits of entropy has 2^60 possible combinations — about 1.15 quintillion possibilities.

Length Over Complexity

A 16-character lowercase password has more entropy than an 8-character "complex" one. Here's why:
- 16 lowercase letters: 26^16 ≈ 4.4 × 10^22 combinations
- 8 mixed characters: 94^8 ≈ 6.1 × 10^15 combinations

## The Character Set Multiplier

Adding character types expands your search space:
- Lowercase only: 26 characters
- + Uppercase: 52 characters
- + Numbers: 62 characters
- + Symbols: ~94 characters

## Avoiding Predictable Patterns

Humans are terrible at generating randomness. We naturally use:
- Dictionary words with leet speak substitutions (p@ssw0rd)
- Names + birth years (john1990)
- Keyboard patterns (qwerty123)

## The Case for Passphrases

Four random common words (correct-horse-battery-staple) can provide 44 bits of entropy while remaining memorable. Use our Password Generator to create truly random combinations.`,
  },
  {
    slug: "two-factor-authentication-guide",
    title: "Two-Factor Authentication: A Complete Guide",
    category: "Security",
    excerpt: "Why SMS 2FA is no longer safe and what to use instead.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop",
    content: `Two-factor authentication (2FA) adds a critical second layer to your security. But not all 2FA methods are equal.

## Why SMS 2FA Is Vulnerable

SIM swapping attacks have become increasingly common. An attacker calls your carrier, convinces them to transfer your number to a new SIM, and then receives all your verification codes.

Notable SIM swap victims include cryptocurrency investors losing millions and even Twitter CEO Jack Dorsey whose account was hijacked.

## TOTP: Time-Based One-Time Passwords

TOTP apps like Google Authenticator and Authy generate codes locally using:
- A shared secret key (set up during enrollment)
- The current Unix timestamp (changes every 30 seconds)
- HMAC-SHA1 cryptographic function

## Hardware Security Keys

FIDO2/WebAuthn keys (YubiKey, Google Titan) provide the strongest protection:
- Phishing-resistant by design
- The key verifies the domain before signing
- Even if you're on a fake site, your credentials can't be stolen

## Backup Codes

Always save your backup codes somewhere secure — a password manager or encrypted document. Losing 2FA access without backups can permanently lock you out.`,
  },
  {
    slug: "password-manager-guide",
    title: "Why You Need a Password Manager",
    category: "Tools",
    excerpt: "Stop reusing passwords. Here's how to use a password manager effectively.",
    image: "https://images.unsplash.com/photo-1633265486064-086b219458ec?w=800&h=400&fit=crop",
    content: `The average person has 100+ online accounts. Remembering unique, strong passwords for each is impossible without help.

## The Password Reuse Problem

When a service gets breached, attackers try those credentials everywhere — a technique called credential stuffing. In 2023, over 8 billion unique credentials were available in public breach databases.

## How Password Managers Work

A password manager stores your credentials in an encrypted vault. The encryption key is derived from your master password using key derivation functions like PBKDF2 or Argon2.

**Zero-knowledge architecture:** The service never sees your passwords. Even if their servers are breached, your data remains encrypted.

## Choosing a Password Manager

- **Bitwarden** — Open source, free tier, self-hostable
- **1Password** — Excellent UX, Travel Mode feature
- **Dashlane** — Built-in VPN, dark web monitoring
- **KeePassXC** — Fully offline, no cloud sync

## Getting Started

1. Choose a password manager
2. Create a strong master password (this one you must memorize)
3. Install browser extensions
4. Import existing passwords
5. Start replacing weak/reused passwords with generated ones`,
  },
  {
    slug: "understanding-data-breaches",
    title: "Understanding Data Breaches",
    category: "Privacy",
    excerpt: "How breaches happen, what data is stolen, and how to protect yourself.",
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=400&fit=crop",
    content: `Data breaches expose millions of records every year. Understanding how they happen helps you protect yourself.

## Common Attack Vectors

**SQL Injection:** Attackers insert malicious code into database queries. A poorly secured login form can expose an entire user database.

**Credential Stuffing:** Using leaked username/password combos from previous breaches to access other accounts.

**Phishing:** Fake emails or websites trick users into entering credentials on attacker-controlled sites.

## What Happens to Stolen Data

1. Internal testing and verification
2. Sale on dark web marketplaces (credentials: $1–$20 per account)
3. Credential stuffing attacks
4. Targeted spear-phishing

## Protecting Yourself

- Use unique passwords for every account
- Enable 2FA everywhere possible
- Monitor Have I Been Pwned
- Freeze your credit at all three bureaus
- Use masked email addresses for signups`,
  },
  {
    slug: "how-to-create-a-passphrase",
    title: "How to Create a Secure Passphrase",
    category: "Guides",
    excerpt: "Correct horse battery staple: The math behind memorable security.",
    image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&h=400&fit=crop",
    content: `The famous XKCD comic showed us something counterintuitive: four random common words strung together can be both easier to remember and harder to crack than a "complex" 8-character password.

## The Diceware Method

Diceware uses physical dice and a word list to generate truly random passphrases:
1. Roll five dice
2. Use the result as an index in the Diceware word list
3. Repeat 4–6 times
4. String the words together

## Why Random Word Selection Matters

The key word is **random**. Humans don't pick words randomly. We gravitate toward common nouns, our interests, and nearby objects. True randomness requires a mechanical process.

## Passphrase Best Practices

- Use at least 4 words (preferably 5–6 for high-security accounts)
- Don't use phrases from books, songs, or movies
- Separate words with spaces, hyphens, or numbers
- Consider adding a symbol between some words

## When Passphrases Beat Passwords

Passphrases excel when you need to type the credential regularly (like a device PIN or password manager master password) because they're easier to type without errors while remaining cryptographically strong.`,
  },
  {
    slug: "md5-vs-sha-comparison",
    title: "MD5 vs SHA: Which is More Secure?",
    category: "Tech",
    excerpt: "A historical look at hashing collisions and deprecations.",
    image: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&h=400&fit=crop",
    content: `MD5, SHA-1, and the SHA-2 family have played different roles in securing the internet. Understanding why some algorithms were deprecated and others remain trusted requires understanding what "broken" means in cryptography.

## MD5: Compromised Since 1996

MD5 (Message Digest 5) was designed by Ron Rivest and published in 1992. By 1996, researchers had found weaknesses. By 2004, Chinese researchers demonstrated full collisions.

**What "broken" means:** Two different inputs that produce the same MD5 hash can now be found in seconds using consumer hardware.

**Never use MD5 for:** passwords, digital signatures, or any security-critical purpose.

## SHA-1: Retired by Major Browsers in 2017

SHA-1 was the industry standard for TLS certificates until Google's SHAttered attack in 2017 demonstrated the first real-world collision — two different PDF files with identical SHA-1 hashes.

## SHA-256 and SHA-512: Still Secure

The SHA-2 family remains secure. SHA-256 is used in:
- Bitcoin's proof-of-work algorithm
- TLS 1.3 certificates
- Code signing

## The Right Algorithm for the Job

| Use Case | Recommended |
|---|---|
| Password storage | bcrypt, Argon2, scrypt |
| File integrity | SHA-256 |
| Digital signatures | SHA-256 or SHA-512 |
| Checksums only | SHA-256 (not MD5) |`,
  },
];

// POST /api/admin/seed-posts — seed static blog posts under admin account
router.post("/admin/seed-posts", requireAdmin, async (req, res) => {
  const authUser = (req as any).user;
  try {
    let seeded = 0;
    let skipped = 0;

    for (const p of STATIC_POSTS) {
      // Check if slug already exists
      const existing = await db.select({ id: postsTable.id }).from(postsTable)
        .where(eq(postsTable.slug, p.slug)).limit(1);
      if (existing.length > 0) { skipped++; continue; }

      // Get or create category
      let categoryId: number | null = null;
      if (p.category) {
        const slug = p.category.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const existing = await db.select().from(categoriesTable).where(eq(categoriesTable.slug, slug)).limit(1);
        if (existing.length > 0) {
          categoryId = existing[0].id;
        } else {
          const [cat] = await db.insert(categoriesTable).values({ name: p.category, slug }).returning();
          categoryId = cat.id;
        }
      }

      await db.insert(postsTable).values({
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        content: p.content,
        image: p.image || null,
        status: "published",
        approved: true,
        categoryId,
        authorId: authUser.id,
        updatedAt: new Date(),
      });
      seeded++;
    }

    res.json({ seeded, skipped, total: STATIC_POSTS.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Seeding failed" });
  }
});

export default router;
