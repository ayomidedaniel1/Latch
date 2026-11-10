'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
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
  const pathname = usePathname();

  const isDashboard = pathname.startsWith('/dashboard');
  const isDocs = pathname.startsWith('/docs');
  const isChangelog = pathname.startsWith('/changelog');

  return (
    <header className="border-b border-[#27272a] bg-[#000000]/90 backdrop-blur-md sticky top-0 z-50 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Brand Logo & Title (matching favicon) */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <Image
            src="/logo.png"
            alt="Latch Logo"
            width={24}
            height={24}
            className="rounded transition-transform group-hover:scale-105"
            priority
          />
          <span className="font-bold text-base sm:text-lg tracking-tight text-white group-hover:text-[#10b981] transition-colors">
            Latch
          </span>
        </Link>

        {/* Clean, Non-Redundant Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2 text-xs font-medium">
          {isAuthenticated && (
            <Link
              href="/dashboard"
              className={`px-3 py-1.5 rounded transition-colors ${
                isDashboard
                  ? 'text-[#10b981] font-semibold bg-[#10b981]/10 border border-[#10b981]/25'
                  : 'text-[#9ca3af] hover:text-[#e5e1e4] hover:bg-[#131315]'
              }`}
            >
              Dashboard
            </Link>
          )}

          <Link
            href="/docs"
            className={`px-3 py-1.5 rounded transition-colors ${
              isDocs
                ? 'text-[#10b981] font-semibold bg-[#10b981]/10 border border-[#10b981]/25'
                : 'text-[#9ca3af] hover:text-[#e5e1e4] hover:bg-[#131315]'
            }`}
          >
            Docs
          </Link>

          <Link
            href="/changelog"
            className={`px-3 py-1.5 rounded transition-colors ${
              isChangelog
                ? 'text-[#10b981] font-semibold bg-[#10b981]/10 border border-[#10b981]/25'
                : 'text-[#9ca3af] hover:text-[#e5e1e4] hover:bg-[#131315]'
            }`}
          >
            Changelog
          </Link>

          <a
            href="https://github.com/ayomidedaniel1/Latch/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 text-[#9ca3af] hover:text-[#e5e1e4] hover:bg-[#131315] rounded transition-colors hidden sm:block"
          >
            Support
          </a>
        </nav>

        {/* Right: Star Badge & Authentication */}
        <div className="flex items-center gap-3">
          <GitHubStarButton />

          {isAuthenticated ? (
            <ProfileDropdown
              user={user}
              signOutAction={async () => {
                await signOut({ callbackUrl: '/' });
              }}
            />
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/signin"
                className="text-xs font-medium text-[#9ca3af] hover:text-[#e5e1e4] px-2.5 py-1.5 transition-colors hidden sm:block"
              >
                Sign In
              </Link>
              <Link
                href="/signin"
                className="bg-[#10b981] hover:bg-[#059669] text-[#000000] font-semibold px-3.5 py-1.5 rounded text-xs transition-colors glow-emerald"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
