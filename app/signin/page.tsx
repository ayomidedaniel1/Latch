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
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-zinc-100 relative overflow-hidden">
      {/* Background gradients for premium glassmorphic feel */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md px-6 z-10">
        {/* Brand/Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2.5 mb-3 group">
            <Image
              src="/logo.png"
              alt="Latch Logo"
              width={40}
              height={40}
              className="rounded-xl transition-all group-hover:scale-105 group-hover:rotate-3 shadow-lg shadow-emerald-500/25"
            />
            <span className="font-semibold text-2xl tracking-tight text-white">Latch</span>
          </Link>
          <p className="text-sm text-zinc-400 text-center">
            Sign in to access your webhook ledger
          </p>
        </div>

        {/* Sign In Card */}
        <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 backdrop-blur-md p-8 shadow-2xl relative overflow-hidden">
          {/* Card subtle border light overlay */}
          <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-emerald-500/20 to-transparent" />

          {error && (
            <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
              <p className="font-semibold mb-1">Authentication Error</p>
              <p className="text-zinc-300">
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
                className="w-full flex items-center justify-center gap-3 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 py-3.5 px-4 font-semibold text-sm transition-all duration-200 cursor-pointer shadow-lg shadow-white/5 active:scale-[0.98]"
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
                Continue with GitHub
              </button>
            </form>

            <div className="relative flex py-2 items-center">
              <div className="grow border-t border-zinc-900"></div>
              <span className="shrink mx-4 text-xs text-zinc-500 uppercase tracking-widest">Developer Console</span>
              <div className="grow border-t border-zinc-900"></div>
            </div>

            <p className="text-xs text-center text-zinc-500 leading-relaxed">
              By signing in, you connect your GitHub account. Latch only requests public profile and email access.
            </p>
          </div>
        </div>

        {/* Back link */}
        <div className="text-center mt-6">
          <Link href="/" className="text-xs text-zinc-400 hover:text-emerald-400 transition-colors">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
