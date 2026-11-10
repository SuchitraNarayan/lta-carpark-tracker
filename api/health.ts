import type { Request, Response } from 'express';

/**
 * Serverless Health Check Endpoint
 * Path: /api/health
 */
export default async function handler(req: Request, res: Response) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, AccountKey, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const accountKey =
    process.env.ACCOUNT_KEY ||
    process.env.LTA_DATAMALL_ACCOUNT_KEY ||
    process.env.LTA_ACCOUNT_KEY ||
    process.env.DATAMALL_ACCOUNT_KEY ||
    (req.headers['accountkey'] as string);

  return res.status(200).json({
    status: 'healthy',
    service: 'singapore-live-telemetry-api',
    timestamp: new Date().toISOString(),
    hasAccountKeyConfigured: Boolean(accountKey && accountKey.trim().length > 0),
    endpoints: {
      health: '/api/health',
      weatherAggregate: '/api/weather',
      carparkAvailability: '/api/carparkavailability',
      weatherSensors: [
        '/api/two-hr-forecast',
        '/api/twenty-four-hr-forecast',
        '/api/four-day-outlook',
        '/api/air-temperature',
        '/api/rainfall',
        '/api/psi',
        '/api/pm25',
        '/api/uv',
        '/api/relative-humidity',
        '/api/wind-speed',
      ],
    },
  });
}
