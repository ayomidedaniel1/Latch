'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export async function createProject(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const name = formData.get('name')?.toString().trim();
  const destinationUrl = formData.get('destinationUrl')?.toString().trim() || null;

  if (!name) {
    throw new Error('Project name is required');
  }

  await db`
    INSERT INTO projects (user_id, name, destination_url)
    VALUES (${userId}, ${name}, ${destinationUrl})
  `;

  revalidatePath('/dashboard');
}

export async function updateProject(projectId: string, formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const name = formData.get('name')?.toString().trim();
  const destinationUrl = formData.get('destinationUrl')?.toString().trim() || null;

  if (!name) {
    throw new Error('Project name is required');
  }

  // Verify ownership before updating
  const projectRows = await db`
    SELECT id FROM projects WHERE id = ${projectId} AND user_id = ${userId} LIMIT 1
  `;
  if (projectRows.length === 0) {
    throw new Error('Unauthorized: Project not owned by user');
  }

  await db`
    UPDATE projects
    SET name = ${name}, destination_url = ${destinationUrl}
    WHERE id = ${projectId}
  `;

  revalidatePath(`/dashboard/${projectId}`);
  revalidatePath('/dashboard');
}

export async function deleteProject(projectId: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error('Unauthorized');
  }

  // Verify ownership before deleting
  const projectRows = await db`
    SELECT id FROM projects WHERE id = ${projectId} AND user_id = ${userId} LIMIT 1
  `;
  if (projectRows.length === 0) {
    throw new Error('Unauthorized: Project not owned by user');
  }

  await db`
    DELETE FROM projects
    WHERE id = ${projectId}
  `;

  revalidatePath('/dashboard');
  redirect('/dashboard');
}

export async function regenerateCliToken(projectId: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error('Unauthorized');
  }

  // Verify ownership before updating
  const projectRows = await db`
    SELECT id FROM projects WHERE id = ${projectId} AND user_id = ${userId} LIMIT 1
  `;
  if (projectRows.length === 0) {
    throw new Error('Unauthorized: Project not owned by user');
  }

  await db`
    UPDATE projects
    SET cli_token = gen_random_uuid()
    WHERE id = ${projectId}
  `;

  revalidatePath(`/dashboard/${projectId}`);
}

