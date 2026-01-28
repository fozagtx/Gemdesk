'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '../../src/lib/supabase/client';
import { GradientButton } from '../../src/components/ui/export-button';
import { Button } from '../../src/components/ui/button';
import { GitBranch, Menu, X, Settings, Users, Activity } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="w-full bg-gradient-to-br from-gray-50 to-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <img
                src="/gem.png"
                alt="Gemdesk"
                className="w-8 h-8 object-contain"
              />
              <span className="text-xl font-bold text-gray-900">Gemdesk</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/documentation" className="text-gray-600 hover:text-gray-900 font-medium">
              Documentation
            </Link>
            <Link href="/analytics" className="text-gray-600 hover:text-gray-900 font-medium">
              Analytics
            </Link>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  Sign Out
                </Button>
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </Link>
              </div>
            ) : (
              <Link href="/auth/login">
                <GradientButton className="px-6 py-3">
                  <span className="text-base font-semibold">Sign In</span>
                </GradientButton>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-gradient-to-br from-gray-50 to-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                href="/documentation"
                className="block px-3 py-2 text-gray-600 hover:text-gray-900 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <Settings className="h-4 w-4 mr-3" />
                  Documentation
                </div>
              </Link>
              <Link
                href="/analytics"
                className="block px-3 py-2 text-gray-600 hover:text-gray-900 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-3" />
                  Analytics
                </div>
              </Link>

              {/* Mobile CTA */}
              <div className="px-3 py-2 space-y-2">
                {user ? (
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" onClick={handleSignOut} className="w-full">
                      Sign Out
                    </Button>
                    <Link href="/dashboard">
                      <Button variant="outline" size="sm" className="w-full">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <Link href="/auth/login" className="block">
                    <GradientButton className="w-full py-3">
                      <span className="text-base font-semibold">Sign In</span>
                    </GradientButton>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}