import { z } from 'zod';
import { showToast } from '@/utils/toast';

export const handleZodError = (error: unknown, defaultMessage: string = 'Operation failed') => {
  if (error instanceof z.ZodError) {
    const message = error.issues?.[0]?.message || 'Validation failed';
    showToast.error('Validation Error', message);
    return true;
  }
  showToast.error(defaultMessage);
  return false;
};

export const projectSchema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters').max(50),
  description: z.string().max(200).optional(),
  baseUrl: z.string().url('Invalid Base URL format (must start with http/https)').or(z.literal('')),
});

export const requestSchema = z.object({
  name: z.string().min(1, 'Request name is required'),
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']),
  url: z.string().min(1, 'URL is required'),
});

export const collectionSchema = z.object({
  name: z.string().min(2, 'Version name must be at least 2 characters'),
  requests: z.array(requestSchema).min(1, 'At least one request is required'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const nameSchema = z.string().min(1, 'Name is required').max(30, 'Name is too long');
