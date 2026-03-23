import React, { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { Card } from '@/components/ui/Card';
import { ArrowRight, Calendar, Tag, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

// ─── Static AUTHORS (for static posts) ──────────────────────────────────────
export const AUTHORS = {
  alex: {
    name: "Alex Mercer", role: "Security Researcher",
    bio: "A cryptography researcher and security engineer exploring the intersection of privacy, human behavior, and digital defense. With over 12 years in information security.",
    avatar: "https://i.pravatar.cc/150?img=12",
    twitter: "https://twitter.com", linkedin: "https://linkedin.com", github: "https://github.com",
  },
  sarah: {
    name: "Sarah Chen", role: "Cybersecurity Analyst",
    bio: "A threat intelligence analyst and privacy advocate focused on making enterprise-grade security accessible to everyday users. Former CISA consultant.",
    avatar: "https://i.pravatar.cc/150?img=47",
    twitter: "https://twitter.com", linkedin: "https://linkedin.com", github: "https://github.com",
  },
  marcus: {
    name: "Marcus Webb", role: "Infrastructure Engineer",
    bio: "A systems engineer specializing in hash functions, PKI, and zero-trust architectures. Currently building open-source cryptographic tooling for developers.",
    avatar: "https://i.pravatar.cc/150?img=68",
    twitter: "https://twitter.com", linkedin: "https://linkedin.com", github: "https://github.com",
  },
};

// ─── Static posts (kept for BlogPost routing backward compat) ──────────────
export const POSTS = [
  {
    slug: 'what-makes-a-strong-password', title: "What Makes a Strong Password in 2024?",
    category: "Security", excerpt: "An in-depth look at entropy, passphrases, and why length beats complexity every time.",
    date: "Oct 12, 2024", readTime: "5 min read", image: "1526374965328-7f61d4dc18c5", author: AUTHORS.alex,
    content: `A strong password is your first line of defense. But what does "strong" actually mean from a mathematical perspective?

## The Math of Entropy

Password strength is measured in bits of entropy. Every bit doubles the search space an attacker must explore. A password with 60 bits of entropy has 2^60 possible combinations — over 1 quintillion guesses required to guarantee a crack.

The formula is straightforward:
**Entropy = log₂(charset_size ^ length)**

For example:
- 8-char lowercase only: log₂(26^8) ≈ 37.6 bits — cracked in seconds by modern GPUs
- 16-char with all types: log₂(95^16) ≈ 105 bits — billions of years at current hardware

## Length Over Complexity

Research consistently shows that **length is the dominant factor**, not complexity. "correct-horse-battery-staple" (28 chars, all lowercase) has more entropy than "P@s$w0rd1!" (10 chars).

## The Character Set Multiplier

Adding a new character *type* multiplies your charset. Going from lowercase only (26) to lowercase + uppercase (52) adds only 1 bit of entropy per character. But adding a character to your password's *length* always adds the full log₂(charset) bits.

## Avoiding Predictable Patterns

Attackers don't just try random combinations. They use word lists, common substitutions (@ for a, 3 for e), and Markov chain models trained on billions of leaked passwords.

Avoid:
- Dictionary words without modification
- Keyboard walks (qwerty, 123456)
- Common substitutions (P@ssw0rd)
- Personal information (names, birthdays)

## The Case for Passphrases

A 4-word random passphrase from a 2,048-word list gives 44 bits of entropy, is easy to type, and vastly harder to crack than most people's "complex" passwords.

Use our Password Generator to create cryptographically random passwords you can trust.`
  },
  {
    slug: 'understanding-sha-256', title: "Understanding SHA-256 Encryption",
    category: "Tech", excerpt: "How hashing algorithms secure the modern internet and cryptocurrency.",
    date: "Nov 05, 2024", readTime: "6 min read", image: "1550751827438-b11fac37e290", author: AUTHORS.marcus,
    content: `SHA-256 (Secure Hash Algorithm 256-bit) is one of the most important cryptographic tools in existence today. It underpins Bitcoin, TLS certificates, software signing, and much more.

## What is a Hash Function?

A cryptographic hash function takes an input of any size and produces a fixed-size output (called a digest). For SHA-256, this output is always 256 bits (64 hexadecimal characters).

Key properties:
- **Deterministic:** Same input → same output, always
- **One-way:** You cannot reverse a hash back to the input
- **Avalanche effect:** Changing one character in input completely changes the output
- **Collision-resistant:** Computationally infeasible to find two inputs with the same hash

## SHA-256 in Practice

**Bitcoin Mining:** Each Bitcoin block contains the SHA-256 hash of the previous block, chaining them together. Mining is the process of finding a nonce such that the block's hash starts with enough leading zeros.

**Password Storage:** Websites should never store plaintext passwords. They store the SHA-256 (or better, bcrypt/Argon2) hash.

**File Integrity:** Software distributors publish SHA-256 checksums of downloads. You hash the file yourself and compare — a mismatch means tampering or corruption.

## Why Not MD5 or SHA-1?

Both MD5 and SHA-1 have documented collision vulnerabilities. Google's SHAttered attack (2017) produced the first real-world SHA-1 collision. MD5 collisions can now be produced in seconds.

**SHA-256 remains collision-free** as of today.

Use our Hash Generator to compute SHA-256 hashes instantly in your browser.`
  },
  {
    slug: 'why-password-managers-matter', title: "Why Password Managers Matter",
    category: "Tools", excerpt: "Stop memorizing 50 different weak passwords. Do this instead.",
    date: "Dec 01, 2024", readTime: "4 min read", image: "1614064641983-42e128189c4e", author: AUTHORS.sarah,
    content: `The average person has 100+ online accounts. The math is brutal: you simply cannot create and remember a unique, strong password for every service.

## The Reuse Epidemic

A 2023 study found that 65% of people reuse passwords across multiple sites. The risk is **credential stuffing** — when attackers take stolen credentials from one breach and automatically test them on every major service.

## What Password Managers Actually Do

A password manager stores all your credentials in an encrypted vault. The vault is locked with one master password — the only password you need to memorize. The encryption is typically AES-256 with PBKDF2 or Argon2 key derivation.

Benefits:
- **Generate truly random passwords** — 24+ random characters, unique per site
- **Auto-fill** — no need to type or remember credentials
- **Breach monitoring** — alerts when your stored credentials appear in leaked databases

## Self-Hosted vs Cloud

**Cloud-based** (Bitwarden, 1Password, Dashlane): Your encrypted vault syncs to their servers. The encryption happens client-side.

**Self-hosted** (Vaultwarden, KeePass): You control the server or the file. Maximum control, zero vendor trust required.

## The Master Password Question

Your master password must be genuinely strong — this is the one password worth memorizing. A 5-word passphrase is ideal: memorable, 60+ bits of entropy, impossible to brute-force.`
  },
  {
    slug: 'danger-of-password-reuse', title: "The Danger of Password Reuse",
    category: "Privacy", excerpt: "How one breached website can compromise your entire digital life.",
    date: "Jan 15, 2025", readTime: "5 min read", image: "1510511459019-5efa7ae22baa", author: AUTHORS.sarah,
    content: `In 2024 alone, over 17 billion records were exposed in data breaches. Your email and password are almost certainly in at least one leaked database.

## The Anatomy of a Credential Stuffing Attack

1. Attackers purchase or download a leaked credential database
2. They run automated tools against major services
3. Tools test 50,000-100,000 combinations per second across thousands of targets
4. Successful logins are captured and sold or used immediately
5. From email access, attackers reset other accounts: banking, social media, everything

## Have I Been Pwned?

Troy Hunt's HaveIBeenPwned (HIBP) has catalogued over 12 billion accounts from 700+ breaches. Check if your email has appeared in known breaches at haveibeenpwned.com.

## The Fix is Simple but Requires Discipline

Three rules eliminate credential stuffing risk entirely:

1. **Unique password for every site** — a breach of one service compromises nothing else
2. **Strong passwords** — at minimum 12 random characters, ideally 20+
3. **Enable 2FA everywhere** — even if credentials are stolen, attackers can't log in without the second factor`
  },
  {
    slug: 'how-to-create-a-passphrase', title: "How to Create a Secure Passphrase",
    category: "Guides", excerpt: "Correct horse battery staple: The math behind memorable security.",
    date: "Feb 20, 2025", readTime: "4 min read", image: "1555949963-ff9fe0c870eb", author: AUTHORS.alex,
    content: `The famous XKCD comic showed us something counterintuitive: four random common words strung together can be both easier to remember and harder to crack than a "complex" 8-character password.

## The Diceware Method

The original passphrase technique uses physical dice and a word list. You roll five dice, look up the result in a standardized word list of 7,776 words (6^5), and record the word. Repeat for each word in your passphrase.

Why dice? True randomness. The words you "randomly" think of are not random — humans are terrible at randomness.

A 6-word Diceware passphrase gives: **log₂(7776^6) ≈ 77.5 bits of entropy**

## Why Random Word Selection Matters

"correct horse battery staple" has good entropy because the words were chosen **at random**. If you deliberately choose words that "seem random," you introduce human bias.

## When to Use Passphrases vs Random Passwords

**Passphrases** are ideal when you need to **type** or **memorize** the credential:
- Your device's login password
- Your password manager's master password
- Disk encryption passphrases

**Random passwords** (24+ characters) are better for everything stored in your password manager.`
  },
  {
    slug: 'md5-vs-sha-comparison', title: "MD5 vs SHA: Which is More Secure?",
    category: "Tech", excerpt: "A historical look at hashing collisions and deprecations.",
    date: "Mar 10, 2025", readTime: "6 min read", image: "1504639725590-34d0984388bd", author: AUTHORS.marcus,
    content: `MD5, SHA-1, and the SHA-2 family have played different roles in securing the internet. Understanding why some algorithms were deprecated and others remain trusted requires understanding what "broken" means in cryptography.

## MD5: Compromised Since 1996

MD5 (Message Digest 5) was designed by Ron Rivest and published in 1992. By 2004, Chinese researchers demonstrated full collisions. By 2008, a team used MD5 collisions to create a rogue SSL certificate trusted by all major browsers.

**Never use MD5 for:** passwords, digital signatures, or any security-critical purpose.

## SHA-1: Retired by Major Browsers in 2017

Google's SHAttered attack in 2017 was the first practical collision, requiring roughly $110,000 in cloud computing.

## SHA-256: The Current Standard

SHA-256 has no known practical attacks. It is used by all modern TLS certificates, Bitcoin's proof-of-work, and is required by NIST for government applications.

## Practical Recommendations

| Use Case | Recommended |
|---|---|
| Password storage | bcrypt, Argon2, scrypt |
| File integrity | SHA-256 |
| Digital signatures | SHA-256 or SHA-512 |

Use our Hash Generator to compute any of these algorithms instantly in your browser.`
  }
];

// ─── DB Post type ────────────────────────────────────────────────────────────
interface DBPost {
  id: number; title: string; slug: string; excerpt?: string; image?: string;
  status: string; approved: boolean; createdAt: string;
  category?: { id: number; name: string } | null;
  author?: { id: number; username: string; firstName?: string; lastName?: string; profilePicture?: string } | null;
}

// ─── Unified display type ────────────────────────────────────────────────────
interface DisplayPost {
  slug: string; title: string; category: string; excerpt: string;
  date: string; readTime: string; image: string; isDb: boolean;
  authorName: string;
}

function makeDisplay(p: DBPost): DisplayPost {
  const authorName = p.author?.firstName && p.author?.lastName
    ? `${p.author.firstName} ${p.author.lastName}`
    : p.author?.username || "Anonymous";
  return {
    slug: p.slug, title: p.title, category: p.category?.name || "General",
    excerpt: p.excerpt || "", date: new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    readTime: "5 min read", image: p.image || "", isDb: true, authorName,
  };
}

function makeStaticDisplay(p: typeof POSTS[0]): DisplayPost {
  return {
    slug: p.slug, title: p.title, category: p.category, excerpt: p.excerpt,
    date: p.date, readTime: p.readTime,
    image: `https://images.unsplash.com/photo-${p.image}?w=600&h=400&fit=crop&q=80`,
    isDb: false, authorName: p.author.name,
  };
}

const STATIC_SLUGS = new Set(POSTS.map(p => p.slug));

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [dbPosts, setDbPosts] = useState<DBPost[]>([]);
  const [loadingDb, setLoadingDb] = useState(true);

  useEffect(() => {
    api.get<DBPost[]>("/posts")
      .then(posts => setDbPosts(posts.filter(p => p.status === "published" && p.approved)))
      .catch(() => {})
      .finally(() => setLoadingDb(false));
  }, []);

  // Combine: DB posts first, then static posts not already in DB by slug
  const dbSlugs = new Set(dbPosts.map(p => p.slug));
  const allPosts: DisplayPost[] = [
    ...dbPosts.map(makeDisplay),
    ...POSTS.filter(p => !dbSlugs.has(p.slug)).map(makeStaticDisplay),
  ];

  const categories = ['All', ...Array.from(new Set(allPosts.map(p => p.category))).sort()];

  const filtered = allPosts.filter(post => {
    const matchCat = activeCategory === 'All' || post.category === activeCategory;
    const matchSearch = !search ||
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
        <input type="search" placeholder="Search articles..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full px-5 py-3 rounded-full border border-border bg-card/60 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition" />
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 justify-center mb-12 flex-wrap">
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium border transition-all",
              activeCategory === cat ? "bg-primary text-primary-foreground border-primary" : "bg-transparent text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
            )}>
            {cat}
          </button>
        ))}
      </div>

      {loadingDb && (
        <div className="flex justify-center py-4 mb-6">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {filtered.length === 0 && !loadingDb ? (
        <div className="text-center py-24 text-muted-foreground">
          <p className="text-xl mb-2">No articles found.</p>
          <button onClick={() => { setActiveCategory('All'); setSearch(''); }} className="text-primary hover:underline text-sm">Clear filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map(post => (
            <article key={post.slug} className="flex flex-col">
              <div className="overflow-hidden flex flex-col bg-card/50 hover:bg-card border border-border hover:border-primary/50 transition-all group h-full rounded-xl">
                <Link href={`/blog/${post.slug}`} className="block">
                  <div className="h-48 w-full bg-muted overflow-hidden relative">
                    {post.image ? (
                      <img src={post.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={post.title}
                        onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-background flex items-center justify-center">
                        <span className="text-primary/40 text-4xl font-display font-bold">{post.category[0]}</span>
                      </div>
                    )}
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
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xs text-muted-foreground">by {post.authorName}</span>
                    <Link href={`/blog/${post.slug}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 transition-all">
                      Read <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
