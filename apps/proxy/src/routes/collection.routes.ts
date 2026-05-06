import { Router } from 'express';
import prisma from '@/lib/db';
import { authenticate, requireAdmin, AuthRequest } from '@/middleware/auth';
import { validate } from '@/middleware/validate';
import { createCollectionSchema, getCollectionsSchema, deleteCollectionSchema } from '@/lib/schemas';

const router = Router();

// Admin: Create/Publish collection
router.post('/admin/projects/:projectId/collections', authenticate, requireAdmin, validate(createCollectionSchema), async (req: AuthRequest, res) => {
  const { projectId } = req.params;
  const { name, description, type, data, fileName } = req.body;

  try {
    // Check if a collection with this name already exists in the project
    const existing = await prisma.collection.findFirst({
      where: { projectId, name }
    });

    let collection;

    if (existing) {
      // Update existing version
      collection = await prisma.collection.update({
        where: { id: existing.id },
        data: {
          data: typeof data === 'string' ? data : JSON.stringify(data),
          fileName,
        },
      });
    } else {
      // Create new version
      collection = await prisma.collection.create({
        data: {
          name,
          description,
          type, 
          data: typeof data === 'string' ? data : JSON.stringify(data),
          fileName,
          projectId,
          uploadedBy: req.user!.userId,
        },
      });
    }
    res.json(collection);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to upload collection', error: error.message });
  }
});

// Public: Get collections for a project
router.get('/projects/:projectId/collections', validate(getCollectionsSchema), async (req, res) => {
  try {
    const collections = await prisma.collection.findMany({
      where: { projectId: req.params.projectId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(collections.map(c => ({
      ...c,
      data: JSON.parse(c.data)
    })));
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch collections' });
  }
});

// Admin: Delete collection
router.delete('/admin/collections/:id', authenticate, requireAdmin, validate(deleteCollectionSchema), async (req: AuthRequest, res) => {
  try {
    await prisma.collection.delete({ where: { id: req.params.id } });
    res.json({ message: 'Collection deleted' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete collection' });
  }
});

export default router;
