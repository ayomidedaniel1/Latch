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
    <header className="border-b border-latch-border bg-latch-bg/95 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image
            src="/logo.png"
            alt="Latch Logo"
            width={26}
            height={26}
            className="rounded-md transition-transform group-hover:scale-105"
          />
          <span className="font-semibold text-lg tracking-tight text-latch-primary flex items-center gap-1.5">
            Latch
            <span className="text-[10px] font-mono font-bold bg-latch-mint-bg text-latch-mint border border-latch-mint-border px-1.5 py-0.2 rounded">
              v1.0
            </span>
          </span>
        </Link>

        {/* Minimal Nav Items */}
        <nav className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/docs"
              className="text-sm text-latch-secondary hover:text-latch-primary transition-colors"
            >
              Docs
            </Link>
            <Link
              href="/changelog"
              className="text-sm text-latch-secondary hover:text-latch-primary transition-colors"
            >
              Changelog
            </Link>
            <a
              href="https://github.com/ayomidedaniel1/Latch/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-latch-secondary hover:text-latch-primary transition-colors"
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
                className="rounded-full bg-latch-card border border-latch-border hover:border-latch-border-hover px-4 py-1.5 text-xs font-semibold text-latch-primary transition-all hover:bg-latch-card-hover"
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
                className="text-xs font-medium text-latch-secondary hover:text-latch-primary transition-colors hidden sm:block"
              >
                Log In
              </Link>
              <Link
                href="/signin?callbackUrl=/dashboard"
                className="rounded-full bg-latch-mint text-latch-bg hover:bg-latch-mint-hover px-4 py-1.5 text-xs font-bold transition-all shadow-md cta-glow"
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
