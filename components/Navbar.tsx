import Link from 'next/link';
import Image from 'next/image';
import { signOut } from '@/auth';
import { ProfileDropdown } from './ProfileDropdown';
import { GitHubStarButton } from './GitHubStarButton';

type UserSession = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export function Navbar({
  isAuthenticated,
  user,
}: {
  isAuthenticated: boolean;
  user?: UserSession;
}) {
  return (
    <header className="border-b border-outline-variant bg-surface-container-lowest/80 backdrop-blur-xl sticky top-0 z-50 transition-all">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image
            src="/logo.png"
            alt="Latch Logo"
            width={28}
            height={28}
            className="rounded-lg transition-transform group-hover:scale-105 shadow-sm shadow-primary-container/20"
          />
          <span className="font-bold text-lg tracking-tight text-on-surface group-hover:text-primary transition-colors">
            Latch
          </span>
        </Link>

        {/* Minimal Nav Items */}
        <nav className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/docs"
              className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors"
            >
              Docs
            </Link>
            <Link
              href="/changelog"
              className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors"
            >
              Changelog
            </Link>
            <a
              href="https://github.com/ayomidedaniel1/Latch/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors"
            >
              Report an issue
            </a>
          </div>

          {/* Fixed-width Non-twitching GitHub Star Badge */}
          <GitHubStarButton />

          {/* User Actions */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="rounded-lg bg-surface-container border border-outline-variant hover:border-primary px-3.5 py-1.5 text-xs font-semibold text-on-surface hover:text-primary transition-all shadow-sm"
              >
                Dashboard
              </Link>
              <ProfileDropdown
                user={user}
                signOutAction={async () => {
                  'use server';
                  await signOut({ redirectTo: '/' });
                }}
              />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/signin?callbackUrl=/dashboard"
                className="text-xs font-medium text-on-surface-variant hover:text-on-surface transition-colors hidden sm:block"
              >
                Log In
              </Link>
              <Link
                href="/signin?callbackUrl=/dashboard"
                className="rounded-lg bg-primary-container text-on-primary-container hover:bg-primary-fixed px-4 py-1.5 text-xs font-bold transition-all shadow-md cta-glow flex items-center gap-1.5"
              >
                Get Started
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
