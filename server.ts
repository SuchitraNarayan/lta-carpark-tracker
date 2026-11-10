import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import healthHandler from './api/health.ts';
import carparkAvailabilityHandler from './api/carparkavailability.ts';
import weatherHandler from './api/weather.ts';

// Individual serverless weather endpoints
import twoHrHandler from './api/two-hr-forecast.ts';
import twentyFourHrHandler from './api/twenty-four-hr-forecast.ts';
import fourDayHandler from './api/four-day-outlook.ts';
import airTempHandler from './api/air-temperature.ts';
import rainfallHandler from './api/rainfall.ts';
import psiHandler from './api/psi.ts';
import pm25Handler from './api/pm25.ts';
import uvHandler from './api/uv.ts';
import humidityHandler from './api/relative-humidity.ts';
import windHandler from './api/wind-speed.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // 1. Health Endpoint
  app.all('/api/health', (req, res) => healthHandler(req, res));

  // 2. Carpark Availability
  app.all('/api/carparkavailability', (req, res) => carparkAvailabilityHandler(req, res));
  app.all('/api/carparks', (req, res) => carparkAvailabilityHandler(req, res));

  // 3. Weather Aggregator
  app.all('/api/weather', (req, res) => weatherHandler(req, res));

  // 4. Individual Serverless Weather Endpoints
  app.all('/api/two-hr-forecast', (req, res) => twoHrHandler(req, res));
  app.all('/api/twenty-four-hr-forecast', (req, res) => twentyFourHrHandler(req, res));
  app.all('/api/four-day-outlook', (req, res) => fourDayHandler(req, res));
  app.all('/api/air-temperature', (req, res) => airTempHandler(req, res));
  app.all('/api/rainfall', (req, res) => rainfallHandler(req, res));
  app.all('/api/psi', (req, res) => psiHandler(req, res));
  app.all('/api/pm25', (req, res) => pm25Handler(req, res));
  app.all('/api/uv', (req, res) => uvHandler(req, res));
  app.all('/api/relative-humidity', (req, res) => humidityHandler(req, res));
  app.all('/api/wind-speed', (req, res) => windHandler(req, res));

  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Health endpoint: http://localhost:${PORT}/api/health`);
    console.log(`Weather aggregator: http://localhost:${PORT}/api/weather`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
