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
    process.env.LTA_DATAMALL_ACCOUNT_KEY ||
    process.env.LTA_ACCOUNT_KEY ||
    process.env.DATAMALL_ACCOUNT_KEY;

  return res.status(200).json({
    status: 'healthy',
    service: 'lta-carpark-tracker-api',
    timestamp: new Date().toISOString(),
    hasLtaAccountKeyConfigured: Boolean(accountKey && accountKey.trim().length > 0),
    ltaDataMallEndpoint: 'https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2',
    endpoints: {
      health: '/api/health',
      carParkAvailability: '/api/carparkavailability',
    },
  });
}
