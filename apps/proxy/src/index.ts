import express from 'express';
import axios from 'axios';
import cors from 'cors';
import http from 'http';
import { Server, Socket } from 'socket.io';
import { io as ClientIO, Socket as ClientSocket } from 'socket.io-client';
import prisma from './lib/db';
import { hashPassword, comparePassword, generateToken } from './lib/auth';
import { authenticate, requireAdmin, AuthRequest } from './middleware/auth';
import { validate } from './middleware/validate';
import { 
  loginSchema, 
  createProjectSchema, 
  updateProjectSchema, 
  deleteProjectSchema,
  createCollectionSchema,
  getCollectionsSchema,
  deleteCollectionSchema
} from './lib/schemas';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const port = 3001;

app.use(cors({
  origin: '*',
  methods: '*',
  allowedHeaders: '*',
  exposedHeaders: '*',
  credentials: true
}));

// Explicit OPTIONS handler
app.options('*', cors());

app.use(express.json({ limit: '10mb' }));

// --- WebSocket Test Bridge ---

io.on('connection', (socket: Socket) => {
  console.log('Client connected to WebSocket Bridge');
  let targetSocket: ClientSocket | null = null;

  socket.on('ws:connect', ({ url, options }: { url: string, options: any }) => {
    try {
      console.log(`Connecting to target WS: ${url}`);
      targetSocket = ClientIO(url, options);

      targetSocket.on('connect', () => {
        socket.emit('ws:connected', { id: targetSocket?.id });
      });

      targetSocket.onAny((event: string, ...args: any[]) => {
        socket.emit('ws:message', { event, data: args });
      });

      targetSocket.on('disconnect', () => {
        socket.emit('ws:disconnected');
      });

      targetSocket.on('connect_error', (err: Error) => {
        socket.emit('ws:error', { message: err.message });
      });
    } catch (error: unknown) {
      const err = error as Error;
      socket.emit('ws:error', { message: err.message });
    }
  });

  socket.on('ws:send', ({ event, data }) => {
    if (targetSocket && targetSocket.connected) {
      targetSocket.emit(event, data);
    }
  });

  socket.on('ws:disconnect', () => {
    if (targetSocket) {
      targetSocket.disconnect();
      targetSocket = null;
    }
  });

  socket.on('disconnect', () => {
    if (targetSocket) targetSocket.disconnect();
    console.log('Client disconnected from bridge');
  });
});

// --- Authentication Routes ---

app.post('/api/auth/login', validate(loginSchema), async (req, res) => {
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

// --- Project Management ---

app.get('/api/projects', async (req, res) => {
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

app.post('/api/projects', authenticate, requireAdmin, validate(createProjectSchema), async (req: AuthRequest, res) => {
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

app.put('/api/projects/:id', authenticate, requireAdmin, validate(updateProjectSchema), async (req: AuthRequest, res) => {
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

app.delete('/api/projects/:id', authenticate, requireAdmin, validate(deleteProjectSchema), async (req: AuthRequest, res) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ message: 'Project deleted' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete project' });
  }
});

// --- Collection Management ---

app.post('/api/admin/projects/:projectId/collections', authenticate, requireAdmin, validate(createCollectionSchema), async (req: AuthRequest, res) => {
  const { projectId } = req.params;
  const { name, description, type, data, fileName } = req.body;

  try {
    // Check for duplicate name in the same project
    const existing = await prisma.collection.findFirst({
      where: { projectId, name }
    });

    if (existing) {
      return res.status(409).json({ message: `Version "${name}" already exists in this project.` });
    }

    const collection = await prisma.collection.create({
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
    res.json(collection);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to upload collection', error: error.message });
  }
});

app.get('/api/projects/:projectId/collections', validate(getCollectionsSchema), async (req, res) => {
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

app.delete('/api/admin/collections/:id', authenticate, requireAdmin, validate(deleteCollectionSchema), async (req: AuthRequest, res) => {
  try {
    await prisma.collection.delete({ where: { id: req.params.id } });
    res.json({ message: 'Collection deleted' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete collection' });
  }
});

// --- Public Proxy ---

app.all('/proxy', async (req, res) => {
  const targetUrl = req.headers['x-target-url'] as string;
  if (!targetUrl) return res.status(400).send('Missing x-target-url header');

  try {
    const filteredHeaders: any = {};
    const skipHeaders = ['host', 'connection', 'content-length', 'x-target-url'];
    
    Object.keys(req.headers).forEach(key => {
      if (!skipHeaders.includes(key.toLowerCase())) {
        filteredHeaders[key] = req.headers[key];
      }
    });

    const response = await axios({
      method: req.method,
      url: targetUrl,
      headers: filteredHeaders,
      params: req.query,
      data: req.body,
      validateStatus: () => true,
      responseType: 'arraybuffer',
    });

    Object.entries(response.headers).forEach(([key, value]) => {
      if (key.toLowerCase() !== 'transfer-encoding') {
        res.setHeader(key, value as string);
      }
    });
    res.status(response.status).send(response.data);
  } catch (error: any) {
    res.status(500).send({ message: 'Proxy failed', error: error.message });
  }
});

server.listen(port, '0.0.0.0', () => console.log(`Internal API Manager running at http://localhost:${port}`));
