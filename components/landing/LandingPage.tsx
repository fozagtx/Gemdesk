'use client';

import { Button } from '@/components/ui/button';
import { GradientButton } from '@/components/ui/export-button';
import Header from '../header/Header';
import { Footer } from '../footer/Footer';
import { Hero } from '../hero/Hero';
import { CursorEffects } from '../cursor-effects/CursorEffects';
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