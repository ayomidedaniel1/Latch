import { signIn } from '@/auth';
import Link from 'next/link';
import Image from 'next/image';

interface SearchParams {
  callbackUrl?: string;
  error?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function SignInPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const callbackUrl = resolvedParams.callbackUrl || '/dashboard';
  const error = resolvedParams.error;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface-container-lowest text-on-background relative overflow-hidden px-6 selection:bg-primary-container/30 selection:text-primary">
      <div className="w-full max-w-md z-10">
        {/* Brand/Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-3 mb-3 group">
            <Image
              src="/logo.png"
              alt="Latch Logo"
              width={44}
              height={44}
              className="rounded-2xl transition-all group-hover:scale-105 group-hover:rotate-3 shadow-lg shadow-primary-container/25"
            />
            <span className="font-bold text-2xl tracking-tight text-on-surface">Latch</span>
          </Link>
          <p className="text-sm text-on-surface-variant text-center">
            Sign in to access your webhook ledger
          </p>
        </div>

        {/* Sign In Card */}
        <div className="glass-card rounded-2xl p-8 shadow-2xl relative overflow-hidden glow-hover">
          {error && (
            <div className="mb-6 rounded-xl border border-error/30 bg-error-container/20 p-4 text-xs text-error">
              <p className="font-semibold mb-1">Authentication Error</p>
              <p className="text-on-surface-variant">
                {error === 'OAuthSignin' || error === 'OAuthCallback'
                  ? 'Failed to connect via GitHub. Please try again.'
                  : 'An error occurred during authentication. Please try again.'}
              </p>
            </div>
          )}

          <div className="space-y-6">
            <form
              action={async () => {
                'use server';
                await signIn('github', { redirectTo: callbackUrl });
              }}
            >
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-3 rounded-xl bg-on-surface text-surface hover:bg-white py-3.5 px-4 font-bold text-sm transition-all duration-200 cursor-pointer shadow-lg shadow-white/5 active:scale-[0.98]"
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
                <span>Continue with GitHub</span>
              </button>
            </form>

            <div className="relative flex py-2 items-center">
              <div className="grow border-t border-outline-variant"></div>
              <span className="shrink mx-4 text-xs font-mono text-on-surface-variant uppercase tracking-widest">Developer Console</span>
              <div className="grow border-t border-outline-variant"></div>
            </div>

            <p className="text-xs text-center text-on-surface-variant leading-relaxed">
              By signing in, you connect your GitHub account. Latch only requests public profile and email access.
            </p>
          </div>
        </div>

        {/* Back link */}
        <div className="text-center mt-6">
          <Link href="/" className="text-xs text-on-surface-variant hover:text-primary transition-colors">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
