import { db } from '@/lib/db';
import Link from 'next/link';
import { createProject } from './actions';
import { IngestUrl } from '@/components/IngestUrl';
import { auth } from '@/auth';

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const projects = await db`
    SELECT id, name, destination_url, created_at
    FROM projects
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `;

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-xl font-semibold mb-8 text-zinc-100">Your projects</h1>

      <form action={createProject} className="mb-10 flex gap-2">
        <input
          name="name"
          placeholder="Project name"
          required
          className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50"
        />
        <input
          name="destinationUrl"
          placeholder="Destination URL (optional)"
          className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50"
        />
        <button
          type="submit"
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-emerald-400 transition-colors"
        >
          Add project
        </button>
      </form>

      {projects.length === 0 ? (
        <p className="text-sm text-zinc-500">
          No projects yet. Add one above to get a webhook URL you can point
          any service at.
        </p>
      ) : (
        <ul className="space-y-2">
          {projects.map((project) => (
            <li
              key={project.id}
              className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 hover:border-zinc-700 transition-colors"
            >
              <Link href={`/dashboard/${project.id}`} className="font-medium text-sm text-zinc-100 hover:text-emerald-400 transition-colors">
                {project.name}
              </Link>
              <div className="mt-1">
                <IngestUrl projectId={project.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
