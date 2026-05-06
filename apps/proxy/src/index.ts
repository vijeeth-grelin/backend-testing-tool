import express from 'express';
import proxyClient from '@/lib/proxyClient';
import cors from 'cors';
import http from 'http';
import { Server, Socket } from 'socket.io';
import { io as ClientIO, Socket as ClientSocket } from 'socket.io-client';
import prisma from '@/lib/db';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root
dotenv.config({ path: path.join(__dirname, '../../../.env') });
import { hashPassword, comparePassword, generateToken } from '@/lib/auth';
import { authenticate, requireAdmin, AuthRequest } from '@/middleware/auth';
import { validate } from '@/middleware/validate';
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

// --- Routers ---
import authRoutes from './routes/auth.routes';
import projectRoutes from './routes/project.routes';
import collectionRoutes from './routes/collection.routes';
import proxyRoutes from './routes/proxy.routes';

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api', collectionRoutes); // Keeps the same path structure
app.use('/proxy', proxyRoutes);

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

server.listen(port, '0.0.0.0', () => console.log(`Internal API Manager running at http://localhost:${port}`));
