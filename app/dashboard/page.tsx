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
      <h1 className="text-xl font-semibold mb-8">Your projects</h1>

      <form action={createProject} className="mb-10 flex gap-2">
        <input
          name="name"
          placeholder="Project name"
          required
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
        <input
          name="destinationUrl"
          placeholder="Destination URL (optional)"
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
        <button
          type="submit"
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          Add project
        </button>
      </form>

      {projects.length === 0 ? (
        <p className="text-sm text-gray-500">
          No projects yet. Add one above to get a webhook URL you can point
          any service at.
        </p>
      ) : (
        <ul className="space-y-2">
          {projects.map((project) => (
            <li
              key={project.id}
              className="rounded-lg border border-gray-200 p-4 hover:border-gray-300"
            >
              <Link href={`/dashboard/${project.id}`} className="font-medium text-sm">
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
