import { Router } from 'express';
import proxyClient from '@/lib/proxyClient';
import multer from 'multer';
import FormData from 'form-data';

const router = Router();
const upload = multer();

router.all('/', upload.any(), async (req: any, res) => {
  const targetUrl = req.headers['x-target-url'] as string;
  if (!targetUrl) return res.status(400).send('Missing x-target-url header');

  try {
    const filteredHeaders: any = {};
    const skipHeaders = ['host', 'connection', 'content-length', 'x-target-url', 'content-type'];
    
    Object.keys(req.headers).forEach(key => {
      if (!skipHeaders.includes(key.toLowerCase())) {
        filteredHeaders[key] = req.headers[key];
      }
    });

    let body = req.body;
    let headers = filteredHeaders;

    // Handle multipart/form-data
    if (req.files && req.files.length > 0) {
      const form = new FormData();
      
      // Add text fields
      Object.keys(req.body).forEach(key => {
        form.append(key, req.body[key]);
      });

      // Add files
      req.files.forEach((file: any) => {
        form.append(file.fieldname, file.buffer, {
          filename: file.originalname,
          contentType: file.mimetype,
        });
      });

      body = form;
      headers = { ...headers, ...form.getHeaders() };
    }

    const response = await proxyClient({
      method: req.method,
      url: targetUrl,
      headers: headers,
      params: req.query,
      data: body,
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
