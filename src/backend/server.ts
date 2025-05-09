import express from 'express';
import cors from 'cors';
import axios from 'axios';
import type { Request, Response } from 'express';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configuration (you'll replace with your ESP32-CAM's IP)
const ESP32_CAM_IP = '192.168.99.236';

// Proxy route for camera stream
app.get('/camera-stream', async (req: Request, res: Response) => {
  try {
    const streamUrl = `http://${ESP32_CAM_IP}/stream`;
    
    // Proxy the stream
    const response = await axios({
      method: 'get',
      url: streamUrl,
      responseType: 'stream'
    });

    // Set content type for MJPEG stream
    res.setHeader('Content-Type', 'multipart/x-mixed-replace; boundary=123456789000000000000987654321');
    
    // Pipe the stream directly to the client
    response.data.pipe(res);
  } catch (error) {
    console.error('Stream error:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).send('Error accessing camera stream');
  }
});

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString() 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Attempting to stream from: http://${ESP32_CAM_IP}/stream`);
});

export default app;
