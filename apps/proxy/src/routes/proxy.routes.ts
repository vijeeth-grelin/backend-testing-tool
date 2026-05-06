import { Router } from 'express';
import proxyClient from '@/lib/proxyClient';

const router = Router();

router.all('/', async (req, res) => {
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

    const response = await proxyClient({
      method: req.method,
      url: targetUrl,
      headers: filteredHeaders,
      params: req.query,
      data: req.body,
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

export default router;
