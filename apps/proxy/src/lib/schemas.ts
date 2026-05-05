import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Project name must be at least 3 characters'),
    description: z.string().optional(),
    baseUrl: z.string().url('Invalid Base URL format').or(z.literal('')).optional(),
  }),
});

export const updateProjectSchema = z.object({
  params: z.object({
    id: z.uuid('Invalid project ID'),
  }),
  body: z.object({
    name: z.string().min(3).optional(),
    description: z.string().optional(),
    baseUrl: z.string().url().or(z.literal('')).optional(),
  }),
});

export const deleteProjectSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid project ID'),
  }),
});

export const createCollectionSchema = z.object({
  params: z.object({
    projectId: z.string().uuid('Invalid project ID'),
  }),
  body: z.object({
    name: z.string().min(2, 'Version name is too short'),
    description: z.string().optional(),
    type: z.string().optional(),
    data: z.any(),
    fileName: z.string().optional(),
  }),
});

export const getCollectionsSchema = z.object({
  params: z.object({
    projectId: z.string().uuid('Invalid project ID'),
  }),
});

export const deleteCollectionSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid collection ID'),
  }),
});
