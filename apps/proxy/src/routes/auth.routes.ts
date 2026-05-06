import { Router } from 'express';
import prisma from '@/lib/db';
import { comparePassword, generateToken } from '@/lib/auth';
import { validate } from '@/middleware/validate';
import { loginSchema } from '@/lib/schemas';

const router = Router();

router.post('/login', validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isValid = await comparePassword(password, user.password);
    if (!isValid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken({ userId: user.id, role: user.role, email: user.email });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error: any) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

export default router;
