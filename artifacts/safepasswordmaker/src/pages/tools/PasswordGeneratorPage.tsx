import React from 'react';
import { PasswordGenerator } from '@/components/PasswordGenerator';

export default function PasswordGeneratorPage() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-display font-bold mb-4">Password Generator</h1>
        <p className="text-xl text-muted-foreground">Create secure, complex passwords instantly.</p>
      </div>
      
      <PasswordGenerator />
      
      <div className="mt-20 prose prose-invert max-w-4xl mx-auto text-muted-foreground">
        <h3 className="text-foreground">Why use a Password Generator?</h3>
        <p>Human beings are notoriously bad at creating random sequences. We tend to use patterns, names, dictionary words, and memorable dates. Attackers use automated tools containing millions of these common patterns to crack accounts in seconds.</p>
        <p>A good password generator uses cryptographically secure pseudorandom number generators (CSPRNG) to create combinations that lack any predictable pattern, making brute-force attacks mathematically infeasible.</p>
      </div>
    </div>
  );
}
