'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

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
