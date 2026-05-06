import { Router } from 'express';
import prisma from '@/lib/db';
import { authenticate, requireAdmin, AuthRequest } from '@/middleware/auth';
import { validate } from '@/middleware/validate';
import { createProjectSchema, updateProjectSchema, deleteProjectSchema } from '@/lib/schemas';

const router = Router();

// Public: Get all projects
router.get('/', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: { _count: { select: { collections: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(projects);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
});

// Admin: Create project
router.post('/', authenticate, requireAdmin, validate(createProjectSchema), async (req: AuthRequest, res) => {
  const { name, description, baseUrl } = req.body;
  try {
    const existing = await prisma.project.findFirst({ where: { name } });
    if (existing) {
      return res.status(409).json({ message: `Project "${name}" already exists.` });
    }
    const project = await prisma.project.create({ data: { name, description, baseUrl } });
    res.json(project);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to create project' });
  }
});

// Admin: Update project
router.put('/:id', authenticate, requireAdmin, validate(updateProjectSchema), async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { name, description, baseUrl } = req.body;
  try {
    const project = await prisma.project.update({
      where: { id },
      data: { name, description, baseUrl }
    });
    res.json(project);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update project' });
  }
});

// Admin: Delete project
router.delete('/:id', authenticate, requireAdmin, validate(deleteProjectSchema), async (req: AuthRequest, res) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ message: 'Project deleted' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete project' });
  }
});

export default router;
