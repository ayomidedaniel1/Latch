import Link from 'next/link';
import Image from 'next/image';
import { signOut } from '@/auth';
import { ProfileDropdown } from './ProfileDropdown';

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
    <header className="border-b border-latch-border bg-latch-bg/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image
            src="/logo.png"
            alt="Latch Logo"
            width={24}
            height={24}
            className="rounded-md transition-transform group-hover:scale-105"
          />
          <span className="font-semibold text-lg tracking-tight text-latch-primary">Latch</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/docs"
            className="text-sm text-latch-secondary hover:text-latch-primary transition-colors"
          >
            Docs
          </Link>
          <a
            href="https://github.com/ayomidedaniel1/Latch"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-latch-secondary hover:text-latch-primary transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            Star
          </a>
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="rounded-lg bg-latch-card border border-latch-border hover:border-latch-border-hover px-4 py-1.5 text-sm font-medium text-latch-primary transition-all"
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
            <Link
              href="/signin?callbackUrl=/dashboard"
              className="rounded-lg bg-latch-mint text-latch-bg hover:bg-latch-mint-hover px-4 py-1.5 text-sm font-semibold transition-all"
            >
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

