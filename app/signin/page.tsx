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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#000000] bg-dot-grid text-[#e5e1e4] p-4 relative select-none">
      <div className="w-full max-w-[420px] flex flex-col items-center">
        {/* Brand Icon & Heading */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="h-12 w-12 rounded-lg bg-[#131315] border border-[#27272a] flex items-center justify-center p-2 mb-3 shadow-lg glow-emerald">
            <Image
              src="/logo.png"
              alt="Latch Emblem"
              width={32}
              height={32}
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans">Latch</h1>
          <p className="text-xs text-[#71717a] mt-1 font-mono">
            Webhook Ledger &amp; Replay Engine
          </p>
        </div>

        {/* Card */}
        <div className="w-full glass-panel rounded-lg p-7 shadow-2xl border border-[#27272a]">
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold text-white">Welcome Back</h2>
            <p className="text-xs text-[#9ca3af] mt-1">Sign in to access your ledger.</p>
          </div>

          {error && (
            <div className="mb-5 rounded border border-[#ef4444]/30 bg-[#ef4444]/10 p-3 text-xs text-[#ffb4ab] font-mono">
              <span className="font-semibold block mb-0.5">Authentication Error</span>
              {error === 'OAuthSignin' || error === 'OAuthCallback'
                ? 'Failed to connect via GitHub. Please verify credentials.'
                : 'An unexpected authentication error occurred.'}
            </div>
          )}

          <div className="space-y-5">
            <form
              action={async () => {
                'use server';
                await signIn('github', { redirectTo: callbackUrl });
              }}
            >
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2.5 rounded bg-[#1c1b1d] hover:bg-[#201f22] border border-[#27272a] hover:border-[#3f3f46] text-white py-2.5 px-4 font-medium text-xs tracking-wide transition-all cursor-pointer shadow-sm active:scale-[0.99]"
              >
                <svg className="h-4 w-4 fill-current shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
                <span>Sign in with GitHub</span>
              </button>
            </form>

            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-[#27272a]" />
              <span className="absolute bg-[#131315] px-2.5 text-[10px] font-mono text-[#71717a] uppercase tracking-wider">
                SECURE
              </span>
            </div>

            <div className="rounded border border-[#10b981]/25 bg-[#10b981]/5 p-3 flex items-start gap-2.5">
              <svg className="w-4 h-4 text-[#10b981] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p className="text-[11px] font-mono text-[#10b981] leading-relaxed">
                Developer-focused security: No passwords stored. GitHub OAuth only.
              </p>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-6">
          <Link
            href="/docs"
            className="text-xs font-mono text-[#71717a] hover:text-[#10b981] transition-colors flex items-center gap-1.5"
          >
            <span>&lt;&gt;</span>
            <span>Return to Documentation</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
