'use server';

import * as projectsRepo from '@/lib/repositories/projects';
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

  await projectsRepo.create(userId, name, destinationUrl);

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
  const project = await projectsRepo.verifyOwnership(projectId, userId);
  if (!project) {
    throw new Error('Unauthorized: Project not owned by user');
  }

  await projectsRepo.update(projectId, name, destinationUrl);

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
  const project = await projectsRepo.verifyOwnership(projectId, userId);
  if (!project) {
    throw new Error('Unauthorized: Project not owned by user');
  }

  await projectsRepo.remove(projectId);

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
  const project = await projectsRepo.verifyOwnership(projectId, userId);
  if (!project) {
    throw new Error('Unauthorized: Project not owned by user');
  }

  await projectsRepo.regenerateCliToken(projectId);

  revalidatePath(`/dashboard/${projectId}`);
}
