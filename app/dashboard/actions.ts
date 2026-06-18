'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { DEV_USER_ID } from '@/lib/constants';

export async function createProject(formData: FormData) {
  const name = formData.get('name')?.toString().trim();
  const destinationUrl = formData.get('destinationUrl')?.toString().trim() || null;

  if (!name) {
    throw new Error('Project name is required');
  }

  await db`
    INSERT INTO projects (user_id, name, destination_url)
    VALUES (${DEV_USER_ID}, ${name}, ${destinationUrl})
  `;

  revalidatePath('/dashboard');
}
