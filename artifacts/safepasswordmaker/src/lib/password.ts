// Wordlist for memorable passwords
const WORDS = [
  "apple", "brave", "crane", "dance", "eagle", "flame", "grape", "heart", "image", "juice",
  "knife", "lemon", "magic", "night", "ocean", "peach", "queen", "river", "snake", "train",
  "union", "voice", "water", "xenon", "yacht", "zebra", "cloud", "dream", "earth", "frost",
  "ghost", "house", "island", "jewel", "kitty", "light", "mouse", "ninja", "orbit", "panda",
  "quirk", "robot", "storm", "tiger", "ultra", "vivid", "whale", "x-ray", "youth", "zesty",
  "breeze", "comet", "daisy", "ember", "flare", "glory", "haven", "index", "jumbo", "karma",
  "lotus", "mango", "nexus", "oasis", "pulse", "quest", "raven", "spark", "token", "unity"
];

export interface GeneratorOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeSimilar: boolean;
  mode: 'random' | 'memorable' | 'passphrase';
  separator?: string; // For passphrase
}

const CHARS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+~`|}{[]:;?><,./-=",
  similar: "iIl1L0oO"
};

export function generatePassword(options: GeneratorOptions): string {
  if (options.mode === 'memorable') {
    return generateMemorable(options);
  }
  if (options.mode === 'passphrase') {
    return generatePassphrase(options);
  }

  let charset = "";
  if (options.uppercase) charset += CHARS.uppercase;
  if (options.lowercase) charset += CHARS.lowercase;
  if (options.numbers) charset += CHARS.numbers;
  if (options.symbols) charset += CHARS.symbols;

  if (charset === "") charset = CHARS.lowercase; // Fallback

  if (options.excludeSimilar) {
    charset = charset.split('').filter(c => !CHARS.similar.includes(c)).join('');
  }

  let password = "";
  const randomValues = new Uint32Array(options.length);
  crypto.getRandomValues(randomValues);

  for (let i = 0; i < options.length; i++) {
    password += charset[randomValues[i] % charset.length];
  }

  // Ensure at least one of each required type is present
  if (options.length >= 4 && !options.excludeSimilar) {
    let pArray = password.split('');
    let index = 0;
    if (options.uppercase) pArray[index++] = CHARS.uppercase[Math.floor(Math.random() * CHARS.uppercase.length)];
    if (options.lowercase) pArray[index++] = CHARS.lowercase[Math.floor(Math.random() * CHARS.lowercase.length)];
    if (options.numbers) pArray[index++] = CHARS.numbers[Math.floor(Math.random() * CHARS.numbers.length)];
    if (options.symbols) pArray[index++] = CHARS.symbols[Math.floor(Math.random() * CHARS.symbols.length)];
    
    // Shuffle
    for (let i = pArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pArray[i], pArray[j]] = [pArray[j], pArray[i]];
    }
    password = pArray.join('');
  }

  return password;
}

function generateMemorable(options: GeneratorOptions): string {
  const word = WORDS[Math.floor(Math.random() * WORDS.length)];
  let numStr = "";
  if (options.numbers) {
    numStr = Math.floor(100 + Math.random() * 900).toString(); // 3 digits
  }
  let symStr = "";
  if (options.symbols) {
    symStr = CHARS.symbols[Math.floor(Math.random() * CHARS.symbols.length)];
  }
  
  let pwd = word;
  if (options.uppercase) {
    pwd = pwd.charAt(0).toUpperCase() + pwd.slice(1);
  }
  
  // Pad with extra random chars if length isn't met (though memorable usually ignores strict length)
  let result = pwd + numStr + symStr;
  while (result.length < options.length) {
     result += (options.numbers ? Math.floor(Math.random()*10).toString() : 'x');
  }
  if (result.length > options.length && options.length > 0) {
    result = result.substring(0, options.length);
  }
  
  return result;
}

function generatePassphrase(options: GeneratorOptions): string {
  const wordCount = Math.max(3, Math.floor(options.length / 5)); // Roughly 5 chars per word
  const sep = options.separator || '-';
  
  let phrase = [];
  for (let i = 0; i < wordCount; i++) {
    let w = WORDS[Math.floor(Math.random() * WORDS.length)];
    if (options.uppercase) w = w.charAt(0).toUpperCase() + w.slice(1);
    phrase.push(w);
  }
  
  let result = phrase.join(sep);
  if (options.symbols) result += CHARS.symbols[Math.floor(Math.random() * CHARS.symbols.length)];
  if (options.numbers) result += Math.floor(Math.random() * 10).toString();
  
  return result;
}

export function generatePin(length: number): string {
  let pin = "";
  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);
  for (let i = 0; i < length; i++) {
    pin += (randomValues[i] % 10).toString();
  }
  return pin;
}

export interface PasswordAnalysis {
  entropy: number;
  crackTimeSeconds: number;
  crackTimeDisplay: string;
  score: number; // 0-100
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong';
  color: string;
  hasLower: boolean;
  hasUpper: boolean;
  hasNumber: boolean;
  hasSymbol: boolean;
}

export function analyzePassword(password: string): PasswordAnalysis {
  let charsetSize = 0;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);

  if (hasLower) charsetSize += 26;
  if (hasUpper) charsetSize += 26;
  if (hasNumber) charsetSize += 10;
  if (hasSymbol) charsetSize += 32;

  if (charsetSize === 0) charsetSize = 1; // Prevent log(0)

  const entropy = password.length * Math.log2(charsetSize);
  
  // Assume offline fast cracking speed: 100 billion guesses per second
  const combinations = Math.pow(charsetSize, password.length);
  const guessesPerSecond = 100e9; 
  const crackTimeSeconds = combinations / guessesPerSecond;

  let score = Math.min(100, Math.max(0, (entropy / 100) * 100));
  if (password.length < 8) score = Math.min(score, 20); // Penalize short passwords heavily
  
  let label: PasswordAnalysis['label'] = 'Very Weak';
  let color = 'bg-red-500';
  
  if (score > 80) { label = 'Very Strong'; color = 'bg-primary'; }
  else if (score > 60) { label = 'Strong'; color = 'bg-green-400'; }
  else if (score > 40) { label = 'Fair'; color = 'bg-yellow-400'; }
  else if (score > 20) { label = 'Weak'; color = 'bg-orange-500'; }

  return {
    entropy,
    crackTimeSeconds,
    crackTimeDisplay: formatCrackTime(crackTimeSeconds),
    score,
    label,
    color,
    hasLower,
    hasUpper,
    hasNumber,
    hasSymbol
  };
}

function formatCrackTime(seconds: number): string {
  if (seconds < 1) return 'Instantly';
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
  if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
  
  const years = seconds / 31536000;
  if (years > 1e9) return '1 Billion+ Years';
  if (years > 1e6) return `${Math.round(years / 1e6)} Million Years`;
  if (years > 1000) return `${Math.round(years / 1000)} Thousand Years`;
  return `${Math.round(years)} Years`;
}
