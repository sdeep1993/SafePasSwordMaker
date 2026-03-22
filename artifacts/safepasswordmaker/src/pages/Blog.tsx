import React, { useState } from 'react';
import { Link } from 'wouter';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Calendar, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

export const POSTS = [
  {
    slug: 'what-makes-a-strong-password',
    title: "What Makes a Strong Password in 2024?",
    category: "Security",
    excerpt: "An in-depth look at entropy, passphrases, and why length beats complexity every time.",
    date: "Oct 12, 2024",
    readTime: "5 min read",
    image: "1526374965328-7f61d4dc18c5",
    content: `
A strong password is your first line of defense. But what does "strong" actually mean from a mathematical perspective?

## The Math of Entropy

Password strength is measured in bits of entropy. Every bit doubles the search space an attacker must explore. A password with 60 bits of entropy has 2^60 possible combinations — over 1 quintillion guesses required to guarantee a crack.

The formula is straightforward:
**Entropy = log₂(charset_size ^ length)**

For example:
- 8-char lowercase only: log₂(26^8) ≈ 37.6 bits — cracked in seconds by modern GPUs
- 16-char with all types: log₂(95^16) ≈ 105 bits — billions of years at current hardware

## Length Over Complexity

Research consistently shows that **length is the dominant factor**, not complexity. "correct-horse-battery-staple" (28 chars, all lowercase) has more entropy than "P@s$w0rd1!" (10 chars).

Password cracking rigs today can test 10–100 billion guesses per second against offline hashes. An 8-character password, regardless of character types, falls in minutes.

## The Character Set Multiplier

Adding a new character *type* multiplies your charset. Going from lowercase only (26) to lowercase + uppercase (52) adds only 1 bit of entropy per character. But adding a character to your password's *length* with the same charset — always adds the full log₂(charset) bits.

**Practical rule:** Every extra character you add is worth more than switching from one character type to adding another.

## Avoiding Predictable Patterns

Attackers don't just try random combinations. They use word lists, common substitutions (@ for a, 3 for e), and Markov chain models trained on billions of leaked passwords.

Avoid:
- Dictionary words without modification
- Keyboard walks (qwerty, 123456)
- Common substitutions (P@ssw0rd)
- Personal information (names, birthdays)
- Appending numbers or ! to dictionary words

## The Case for Passphrases

A 4-word random passphrase from a 2,048-word list gives 44 bits of entropy, is easy to type, and vastly harder to crack than most people's "complex" passwords.

Use our Password Generator to create cryptographically random passwords or passphrases you can trust.
    `
  },
  {
    slug: 'understanding-sha-256',
    title: "Understanding SHA-256 Encryption",
    category: "Tech",
    excerpt: "How hashing algorithms secure the modern internet and cryptocurrency.",
    date: "Nov 05, 2024",
    readTime: "6 min read",
    image: "1550751827438-b11fac37e290",
    content: `
SHA-256 (Secure Hash Algorithm 256-bit) is one of the most important cryptographic tools in existence today. It underpins Bitcoin, TLS certificates, software signing, and much more.

## What is a Hash Function?

A cryptographic hash function takes an input of any size and produces a fixed-size output (called a digest). For SHA-256, this output is always 256 bits (64 hexadecimal characters).

Key properties:
- **Deterministic:** Same input → same output, always
- **One-way:** You cannot reverse a hash back to the input
- **Avalanche effect:** Changing one character in input completely changes the output
- **Collision-resistant:** Computationally infeasible to find two inputs with the same hash

## SHA-256 in Practice

**Bitcoin Mining:** Each Bitcoin block contains the SHA-256 hash of the previous block, chaining them together. Mining is the process of finding a nonce such that the block's hash starts with enough leading zeros — a computationally intensive brute-force search.

**Password Storage:** Websites should never store plaintext passwords. They store the SHA-256 (or better, bcrypt/Argon2) hash. When you log in, your input is hashed and compared to the stored hash.

**File Integrity:** Software distributors publish SHA-256 checksums of downloads. You hash the file yourself and compare — a mismatch means tampering or corruption.

**Digital Signatures:** SSL/TLS certificates use SHA-256 to create a digest of the certificate data, which is then signed with the CA's private key.

## Why Not MD5 or SHA-1?

Both MD5 and SHA-1 have documented collision vulnerabilities — meaning researchers have found methods to produce two different inputs with the same hash output. This completely breaks the core security property.

Google's SHAttered attack (2017) produced the first real-world SHA-1 collision using ~9.2 quintillion SHA-1 computations. MD5 collisions can now be produced in seconds.

**SHA-256 remains collision-free** as of today. No practical attack exists, and its 256-bit output space makes brute-force collision searching 2^128 times harder than SHA-1.

## SHA-256 vs SHA-512

SHA-512 uses a 512-bit digest. It is not more secure in practice for most use cases — SHA-256's 128-bit collision resistance is already far beyond computational reach. SHA-512 may be faster on 64-bit architectures due to internal optimizations.

Use our Hash Generator to compute SHA-256 hashes instantly in your browser.
    `
  },
  {
    slug: 'why-password-managers-matter',
    title: "Why Password Managers Matter",
    category: "Tools",
    excerpt: "Stop memorizing 50 different weak passwords. Do this instead.",
    date: "Dec 01, 2024",
    readTime: "4 min read",
    image: "1614064641983-42e128189c4e",
    content: `
The average person has 100+ online accounts. The math is brutal: you simply cannot create and remember a unique, strong password for every service. Something has to give — and usually it's security.

## The Reuse Epidemic

A 2023 study found that 65% of people reuse passwords across multiple sites. The risk isn't that one site gets hacked. The risk is **credential stuffing** — when attackers take stolen credentials from one breach and automatically test them on every major service: Gmail, your bank, Amazon, Netflix.

This is completely automated. Bots can test millions of credential pairs per hour against major platforms. If you reuse passwords, a breach of an obscure forum can compromise your email account.

## What Password Managers Actually Do

A password manager stores all your credentials in an encrypted vault. The vault is locked with one master password — the only password you need to memorize. The encryption is typically AES-256 with PBKDF2 or Argon2 key derivation.

Benefits:
- **Generate truly random passwords** — 24+ random characters, unique per site
- **Auto-fill** — no need to type or remember credentials
- **Breach monitoring** — alerts when your stored credentials appear in leaked databases
- **Secure sharing** — share credentials without sending them in plaintext

## Self-Hosted vs Cloud

**Cloud-based** (Bitwarden, 1Password, Dashlane): Your encrypted vault syncs to their servers. You can access it anywhere. The encryption happens client-side, so even if the provider is breached, attackers only get encrypted data. Bitwarden is open-source and independently audited.

**Self-hosted** (Vaultwarden, KeePass): You control the server or the file. Maximum control, zero vendor trust required. Requires more technical setup and personal responsibility for backups.

## The Master Password Question

Your master password must be genuinely strong — this is the one password worth memorizing. A 5-word passphrase is ideal: memorable, 60+ bits of entropy, impossible to brute-force.

Don't use a password manager? Our Password Generator creates strong, unique passwords for any site — the next best thing.
    `
  },
  {
    slug: 'danger-of-password-reuse',
    title: "The Danger of Password Reuse",
    category: "Privacy",
    excerpt: "How one breached website can compromise your entire digital life.",
    date: "Jan 15, 2025",
    readTime: "5 min read",
    image: "1510511459019-5efa7ae22baa",
    content: `
In 2024 alone, over 17 billion records were exposed in data breaches. Your email and password are almost certainly in at least one leaked database. The only question is: how far does the damage spread?

## The Anatomy of a Credential Stuffing Attack

1. Attackers purchase or download a leaked credential database (email:password pairs)
2. They run automated tools like Snipr or Hydra against major services
3. Tools test 50,000-100,000 combinations per second across thousands of targets
4. Successful logins are captured and sold or used immediately
5. From email access, attackers reset other accounts: banking, social media, everything

The entire process from breach to account takeover can take minutes. Human involvement is minimal — it's fully automated.

## Have I Been Pwned?

Troy Hunt's HaveIBeenPwned (HIBP) has catalogued over 12 billion accounts from 700+ breaches. You can check if your email has appeared in known breaches at haveibeenpwned.com.

The realistic answer for anyone who's been online more than 5 years: **yes, you're in there somewhere**. Multiple times, likely.

## Why "I Have Nothing to Hide" Doesn't Apply

Account takeover isn't about privacy — it's about access. A compromised email account enables:
- **Banking theft:** password reset links sent to email
- **Identity theft:** access to documents, verification services
- **Blackmail:** access to private messages and photos
- **Crypto theft:** exchange account takeovers are immediate and irreversible
- **Business email compromise:** impersonating you to colleagues or clients

## The Fix is Simple but Requires Discipline

Three rules eliminate credential stuffing risk entirely:

1. **Unique password for every site** — a breach of one service compromises nothing else
2. **Strong passwords** — at minimum 12 random characters, ideally 20+
3. **Enable 2FA everywhere** — even if credentials are stolen, attackers can't log in without the second factor

Use our Password Generator right now to generate a unique, strong password for any service you use.
    `
  },
  {
    slug: 'how-to-create-a-passphrase',
    title: "How to Create a Secure Passphrase",
    category: "Guides",
    excerpt: "Correct horse battery staple: The math behind memorable security.",
    date: "Feb 20, 2025",
    readTime: "4 min read",
    image: "1555949963-ff9fe0c870eb",
    content: `
The famous XKCD comic showed us something counterintuitive: four random common words strung together can be both easier to remember and harder to crack than a "complex" 8-character password.

## The Diceware Method

The original passphrase technique uses physical dice and a word list. You roll five dice, look up the result in a standardized word list of 7,776 words (6^5), and record the word. Repeat for each word in your passphrase.

Why dice? True randomness. The words you "randomly" think of are not random — humans are terrible at randomness and unconsciously favor certain words.

A 6-word Diceware passphrase gives:
**log₂(7776^6) ≈ 77.5 bits of entropy**

At 100 billion guesses per second, exhausting this space would take 47 million years.

## Why Random Word Selection Matters

"correct horse battery staple" has good entropy because the words were chosen **at random**. If you deliberately choose words that "seem random," you introduce human bias — you're less likely to pick very short words, unusual words, or words that seem "too simple."

**An automated random picker eliminates this bias entirely.** Our generator uses the Web Crypto API to select words with cryptographically uniform randomness.

## Entropy Per Word

| Word list size | Bits per word | 4-word passphrase | 6-word passphrase |
|---|---|---|---|
| 1,000 words | ~10 bits | 40 bits | 60 bits |
| 7,776 (Diceware) | ~12.9 bits | 51.6 bits | 77.5 bits |
| 65,536 words | 16 bits | 64 bits | 96 bits |

Even a 4-word passphrase from a large word list achieves 64 bits — resistant to offline attacks.

## When to Use Passphrases vs Random Passwords

**Passphrases** are ideal when you need to **type** or **memorize** the credential:
- Your device's login password
- Your password manager's master password
- Disk encryption passphrases

**Random passwords** (24+ characters) are better for everything stored in your password manager — you never need to type or remember them.

Switch to Passphrase mode in our Password Generator to create a memorable, high-entropy passphrase in seconds.
    `
  },
  {
    slug: 'md5-vs-sha-comparison',
    title: "MD5 vs SHA: Which is More Secure?",
    category: "Tech",
    excerpt: "A historical look at hashing collisions and deprecations.",
    date: "Mar 10, 2025",
    readTime: "6 min read",
    image: "1504639725590-34d0984388bd",
    content: `
MD5, SHA-1, and the SHA-2 family have played different roles in securing the internet. Understanding why some algorithms were deprecated and others remain trusted requires understanding what "broken" means in cryptography.

## MD5: Compromised Since 1996

MD5 (Message Digest 5) was designed by Ron Rivest and published in 1992. By 1996, researchers had found weaknesses. By 2004, Chinese researchers demonstrated full collisions. By 2008, a team used MD5 collisions to create a rogue SSL certificate trusted by all major browsers.

**What "broken" means:** Two different inputs that produce the same MD5 hash can now be found in seconds using consumer hardware. This completely undermines digital signature verification and any use case requiring collision resistance.

Despite this, MD5 is still widely used for:
- **File integrity checks** where collision resistance isn't critical
- **Non-security purposes** like data deduplication or hash tables
- **Legacy systems** that haven't been updated

**Never use MD5 for:** passwords, digital signatures, or any security-critical purpose.

## SHA-1: Retired by Major Browsers in 2017

SHA-1 held out longer than MD5. Google's SHAttered attack in 2017 was the first practical collision, requiring roughly $110,000 in cloud computing — within reach of nation-states and well-funded criminals.

Chrome, Firefox, and most browsers now reject SHA-1 certificates entirely. GitHub stopped supporting SHA-1 git objects in 2020. Microsoft's Windows Update stopped accepting SHA-1 signed content.

## SHA-256: The Current Standard

SHA-256 (part of the SHA-2 family, published 2001) has no known practical attacks. It is:
- Used by all modern TLS certificates (HTTPS)
- The basis of Bitcoin's proof-of-work
- Required by NIST for government applications
- The recommended minimum for password hashing contexts (though Argon2/bcrypt are preferred for passwords specifically)

**Collision resistance:** A collision would require ~2^128 operations — approximately 10^38 attempts. At 10^17 guesses per second, that's 10^21 years.

## SHA-3: The Future (Present?)

SHA-3 (Keccak), standardized in 2015, uses a completely different construction (sponge function) than SHA-2. It was selected as a backup in case SHA-2 was compromised. Both are currently secure; SHA-3 provides algorithm diversity.

## Practical Recommendations

| Use Case | Recommended | Acceptable | Avoid |
|---|---|---|---|
| Password storage | Argon2, bcrypt | SHA-512 + salt | MD5, SHA-1, bare SHA-256 |
| File integrity | SHA-256 | SHA-512 | MD5, SHA-1 |
| Digital signatures | SHA-256, SHA-3 | SHA-512 | MD5, SHA-1 |
| Checksums only | MD5 | SHA-1 | — |

Use our Hash Generator to compute any of these algorithms instantly in your browser, entirely client-side.
    `
  }
];

const CATEGORIES = ['All', 'Security', 'Tech', 'Tools', 'Privacy', 'Guides'];

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = POSTS.filter(post => {
    const matchCat = activeCategory === 'All' || post.category === activeCategory;
    const matchSearch = search === '' ||
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Security Blog</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Latest guides, research, and insights to keep you secure online.</p>
      </div>

      {/* Search */}
      <div className="max-w-xl mx-auto mb-8">
        <input
          type="search"
          placeholder="Search articles..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-5 py-3 rounded-full border border-border bg-card/60 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
        />
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 justify-center mb-12 flex-wrap">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium border transition-all",
              activeCategory === cat
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-transparent text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          <p className="text-xl mb-2">No articles found.</p>
          <button onClick={() => { setActiveCategory('All'); setSearch(''); }} className="text-primary hover:underline text-sm">Clear filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((post) => (
            <article key={post.slug} className="flex flex-col">
              <Card className="overflow-hidden flex flex-col bg-card/50 hover:bg-card hover:border-primary/50 transition-all group h-full">
                <Link href={`/blog/${post.slug}`} className="block">
                  <div className="h-48 w-full bg-muted overflow-hidden relative">
                    <img
                      src={`https://images.unsplash.com/photo-${post.image}?w=600&h=400&fit=crop&q=80`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      alt={post.title}
                    />
                    <div className="absolute top-4 left-4 bg-background/90 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-primary flex items-center gap-1">
                      <Tag className="w-3 h-3" /> {post.category}
                    </div>
                  </div>
                </Link>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {post.date}</span>
                    <span>·</span>
                    <span>{post.readTime}</span>
                  </div>
                  <Link href={`/blog/${post.slug}`} className="block mb-3 flex-grow">
                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors leading-snug">{post.title}</h3>
                  </Link>
                  <p className="text-muted-foreground text-sm mb-6">{post.excerpt}</p>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all"
                  >
                    Read Article <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </Card>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
