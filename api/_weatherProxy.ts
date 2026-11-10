import type { Request, Response } from 'express';

/**
 * Reusable serverless proxy handler for Singapore Weather & Environment endpoints.
 * Automatically forwards AccountKey header from environment or request headers.
 */
export async function proxyWeatherEndpoint(
  endpointName: string,
  upstreamUrl: string,
  req: Request,
  res: Response
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, AccountKey, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Resolve AccountKey without hardcoding any keys
  const accountKey =
    (req.headers['accountkey'] as string) ||
    process.env.ACCOUNT_KEY ||
    process.env.LTA_DATAMALL_ACCOUNT_KEY ||
    process.env.LTA_ACCOUNT_KEY ||
    process.env.DATAMALL_ACCOUNT_KEY ||
    '';

  const headers: Record<string, string> = {
    'User-Agent': 'SingaporeWeatherTracker/1.0',
    Accept: 'application/json',
  };

  // Add AccountKey header to all outgoing requests as required
  if (accountKey && accountKey.trim().length > 0) {
    headers['AccountKey'] = accountKey.trim();
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const upstreamRes = await fetch(upstreamUrl, {
      method: 'GET',
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!upstreamRes.ok) {
      const errText = await upstreamRes.text();
      return res.status(upstreamRes.status).json({
        error: `Upstream error from ${endpointName}`,
        status: upstreamRes.status,
        details: errText,
        endpoint: upstreamUrl,
      });
    }

    const data = await upstreamRes.json();
    return res.status(200).json(data);
  } catch (err: any) {
    return res.status(502).json({
      error: `Failed to fetch from ${endpointName}`,
      message: err?.message || String(err),
      endpoint: upstreamUrl,
    });
  }
}
