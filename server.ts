import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import healthHandler from './api/health.ts';
import carparkAvailabilityHandler from './api/carparkavailability.ts';
import weatherHandler from './api/weather.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // Serverless API Routes
  app.all('/api/health', (req, res) => {
    return healthHandler(req, res);
  });

  app.all('/api/carparkavailability', (req, res) => {
    return carparkAvailabilityHandler(req, res);
  });

  app.all('/api/weather', (req, res) => {
    return weatherHandler(req, res);
  });

  // Alias for convenience / backward-compatibility with frontend
  app.all('/api/carparks', (req, res) => {
    return carparkAvailabilityHandler(req, res);
  });

  if (!isProduction) {
    // Mount Vite dev server middleware
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production serve dist build
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Health endpoint: http://localhost:${PORT}/api/health`);
    console.log(`Carpark availability: http://localhost:${PORT}/api/carparkavailability`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
