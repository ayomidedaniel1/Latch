import Link from 'next/link';
import Image from 'next/image';

export function Navbar({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image
            src="/logo.png"
            alt="Latch Logo"
            width={24}
            height={24}
            className="rounded-md transition-transform group-hover:scale-105"
          />
          <span className="font-semibold text-lg tracking-tight text-white">Latch</span>
        </Link>
        <nav className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 px-4 py-1.5 text-sm font-medium text-white transition-all"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/signin?callbackUrl=/dashboard"
              className="rounded-lg bg-white text-zinc-950 hover:bg-zinc-200 px-4 py-1.5 text-sm font-medium transition-all"
            >
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
