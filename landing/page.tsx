'use client';

import { Button } from '../src/components/ui/button';
import { GradientButton } from '../src/components/ui/export-button';
import Header from '../components/header';
import { Footer } from '../components/footer';
import { Hero } from '../components/hero';
import { CursorEffects } from '../components/cursor-effects';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Header />
      <Hero />
      <Footer />
      <CursorEffects />
    </div>
  );
}