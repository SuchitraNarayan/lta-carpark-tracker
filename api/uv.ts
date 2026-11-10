import type { Request, Response } from 'express';
import { proxyWeatherEndpoint } from './_weatherProxy.ts';

export default async function handler(req: Request, res: Response) {
  return proxyWeatherEndpoint(
    'uv',
    'https://api-open.data.gov.sg/v2/real-time/api/uv',
    req,
    res
  );
}
