import { auth } from '@/auth';
import * as projectsRepo from '@/lib/repositories/projects';

interface AuthResult {
  authorized: boolean;
  isCliRequest: boolean;
  userId: string | null;
}

/**
 * Unified authorization check for project access.
 * Supports two auth paths:
 *   1. NextAuth session (browser dashboard)
 *   2. CLI token via Bearer header or query param (CLI / tunnel)
 *
 * Consolidates the duplicate dual-auth pattern from stream, detail, and search routes.
 */
export async function authorizeProjectAccess(
  req: Request,
  projectId: string,
): Promise<AuthResult> {
  // NextAuth session
  const session = await auth();
  if (session?.user?.id) {
    const project = await projectsRepo.verifyOwnership(projectId, session.user.id);
    if (project) {
      return { authorized: true, isCliRequest: false, userId: session.user.id };
    }
  }

  // CLI token (Bearer header or query param)
  const url = new URL(req.url);
  const authHeader = req.headers.get('authorization');
  let token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7).trim() : null;

  if (!token) {
    token = url.searchParams.get('token');
  }

  if (token) {
    const project = await projectsRepo.findByCliToken(projectId, token);
    if (project) {
      return { authorized: true, isCliRequest: true, userId: project.user_id };
    }
  }

  return { authorized: false, isCliRequest: false, userId: null };
}

/**
 * Simple session-only authorization (for routes that don't support CLI tokens).
 */
export async function requireSession(): Promise<{ userId: string; } | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return { userId: session.user.id };
}
