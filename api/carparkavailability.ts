import type { Request, Response } from 'express';

export interface LTARawCarpark {
  CarParkID: string;
  Area: string;
  Development: string;
  Location: string; // "lat lng", e.g. "1.2934 103.8572"
  AvailableLots: number;
  LotType: 'C' | 'Y' | 'H'; // C: Car, Y: Motorcycle, H: Heavy Vehicle
  Agency: 'HDB' | 'URA' | 'LTA' | string;
}

export interface LTAResponse {
  'odata.metadata'?: string;
  value: LTARawCarpark[];
}

// In-memory cache to prevent hitting LTA DataMall rate limits
interface CacheEntry {
  data: any;
  timestamp: number;
}
let memoryCache: { [key: string]: CacheEntry } = {};
const CACHE_TTL_MS = 30 * 1000; // 30 seconds TTL

const LTA_CARPARK_API_URL = 'https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2';

/**
 * Serverless Carpark Availability Endpoint
 * Path: /api/carparkavailability
 * Pulls live data from LTA's DataMall CarParkAvailabilityv2
 */
export default async function handler(req: Request, res: Response) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, AccountKey, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // 1. Resolve AccountKey from environment or request headers
  const accountKey =
    (req.headers['accountkey'] as string) ||
    process.env.LTA_DATAMALL_ACCOUNT_KEY ||
    process.env.LTA_ACCOUNT_KEY ||
    process.env.DATAMALL_ACCOUNT_KEY;

  if (!accountKey || accountKey.trim().length === 0) {
    return res.status(401).json({
      error: 'Missing AccountKey',
      message:
        'LTA DataMall AccountKey is not configured. Please set LTA_DATAMALL_ACCOUNT_KEY in your server environment variables or pass the AccountKey request header.',
      documentation: 'https://datamall.lta.gov.sg/content/datamall/en/request-api.html',
      endpoint: LTA_CARPARK_API_URL,
      mockAvailable: true,
    });
  }

  const querySkip = req.query['$skip'] || req.query['skip'] || '0';
  const fetchAll = req.query['all'] === 'true' || req.query['all'] === '1';
  const cacheKey = `lta_carparks_${querySkip}_${fetchAll}`;

  // 2. Check cache
  const cached = memoryCache[cacheKey];
  const now = Date.now();
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    res.setHeader('X-Cache', 'HIT');
    return res.status(200).json(cached.data);
  }

  try {
    let allRecords: LTARawCarpark[] = [];

    if (fetchAll) {
      // LTA DataMall returns up to 500 records per page. Fetch in batches up to 2500 records.
      let skip = 0;
      let hasMore = true;
      let iterations = 0;

      while (hasMore && iterations < 5) {
        iterations++;
        const targetUrl = `${LTA_CARPARK_API_URL}?$skip=${skip}`;
        const ltaRes = await fetch(targetUrl, {
          method: 'GET',
          headers: {
            AccountKey: accountKey.trim(),
            accept: 'application/json',
          },
        });

        if (!ltaRes.ok) {
          const errText = await ltaRes.text();
          throw new Error(`LTA DataMall API responded with HTTP ${ltaRes.status}: ${errText}`);
        }

        const pageData = (await ltaRes.json()) as LTAResponse;
        const records = pageData.value || [];
        allRecords.push(...records);

        if (records.length < 500) {
          hasMore = false;
        } else {
          skip += 500;
        }
      }
    } else {
      // Single page fetch
      const targetUrl = `${LTA_CARPARK_API_URL}?$skip=${querySkip}`;
      const ltaRes = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          AccountKey: accountKey.trim(),
          accept: 'application/json',
        },
      });

      if (!ltaRes.ok) {
        const errText = await ltaRes.text();
        throw new Error(`LTA DataMall API responded with HTTP ${ltaRes.status}: ${errText}`);
      }

      const rawData = (await ltaRes.json()) as LTAResponse;
      allRecords = rawData.value || [];
    }

    // 3. Normalize records into frontend-ready Carpark objects
    const carparksMap: { [id: string]: any } = {};

    allRecords.forEach((item) => {
      const id = item.CarParkID;
      if (!carparksMap[id]) {
        let lat = 1.3521;
        let lng = 103.8198;
        if (item.Location) {
          const parts = item.Location.trim().split(/[\s,]+/);
          if (parts.length >= 2) {
            const p0 = parseFloat(parts[0]);
            const p1 = parseFloat(parts[1]);
            if (!isNaN(p0) && !isNaN(p1) && p0 > 1.15 && p0 < 1.5 && p1 > 103.5 && p1 < 104.1) {
              lat = p0;
              lng = p1;
            }
          }
        }

        carparksMap[id] = {
          id: item.CarParkID,
          name: item.Development || `Carpark ${item.CarParkID}`,
          address: item.Development || `${item.Area || 'Singapore'} - ${item.CarParkID}`,
          town: item.Area || 'Singapore',
          region: resolveRegion(item.Area, lat, lng),
          agency: item.Agency || 'LTA',
          carparkType: 'Multi-Storey',
          coordinates: { lat, lng },
          lots: {
            car: { total: Math.max(item.AvailableLots, 100), available: 0 },
            motorcycle: { total: 50, available: 0 },
            heavyVehicle: { total: 0, available: 0 },
          },
          parkingSystem: 'Electronic Parking System (EPS)',
          shortTermParking: 'WHOLE DAY',
          freeParking: item.Agency === 'HDB' ? 'SUN & PH 7:00 AM - 10:30 PM' : 'None',
          nightParking: true,
          gantryHeight: 2.15,
          hasEVCharging: false,
          rates: {
            weekdayDay: item.Agency === 'HDB' ? '$0.60 per 30 mins' : '$1.20 per 30 mins',
            weekdayNight: '$0.60 per 30 mins (capped $5.00)',
            weekendDay: item.Agency === 'HDB' ? '$0.60 per 30 mins (Free Sun)' : '$1.20 per 30 mins',
            weekendNight: '$0.60 per 30 mins',
            ratePerHalfHour: item.Agency === 'HDB' ? 0.6 : 1.2,
            centralAreaMultiplier: 1.0,
            gracePeriodMinutes: 15,
          },
          lastUpdated: new Date().toISOString(),
          trend: 'stable',
        };
      }

      // Assign lot availability based on LotType (C, Y, H)
      if (item.LotType === 'C') {
        carparksMap[id].lots.car.available = item.AvailableLots;
        carparksMap[id].lots.car.total = Math.max(item.AvailableLots, carparksMap[id].lots.car.total);
      } else if (item.LotType === 'Y') {
        carparksMap[id].lots.motorcycle.available = item.AvailableLots;
        carparksMap[id].lots.motorcycle.total = Math.max(
          item.AvailableLots,
          carparksMap[id].lots.motorcycle.total
        );
      } else if (item.LotType === 'H') {
        carparksMap[id].lots.heavyVehicle.available = item.AvailableLots;
        carparksMap[id].lots.heavyVehicle.total = Math.max(
          item.AvailableLots,
          carparksMap[id].lots.heavyVehicle.total
        );
      }
    });

    const normalizedCarparks = Object.values(carparksMap);

    const payload = {
      'odata.metadata': `${LTA_CARPARK_API_URL}/$metadata`,
      totalRawRecords: allRecords.length,
      totalCarparks: normalizedCarparks.length,
      timestamp: new Date().toISOString(),
      value: allRecords, // Raw LTA format
      carparks: normalizedCarparks, // Normalized format for frontend
    };

    // Store in memory cache
    memoryCache[cacheKey] = {
      data: payload,
      timestamp: now,
    };

    res.setHeader('X-Cache', 'MISS');
    return res.status(200).json(payload);
  } catch (error: any) {
    return res.status(502).json({
      error: 'Failed to fetch from LTA DataMall',
      details: error?.message || String(error),
      endpoint: LTA_CARPARK_API_URL,
      suggestion: 'Verify that your AccountKey is valid and active on LTA DataMall portal.',
    });
  }
}

function resolveRegion(area: string, lat: number, lng: number): string {
  const lower = (area || '').toLowerCase();
  if (lower.includes('marina') || lower.includes('orchard') || lower.includes('cbd') || lower.includes('central')) {
    return 'Central';
  }
  if (lower.includes('tampines') || lower.includes('bedok') || lower.includes('changi') || lower.includes('pasir ris')) {
    return 'East';
  }
  if (lower.includes('jurong') || lower.includes('clementi') || lower.includes('tuas') || lower.includes('bukit batok')) {
    return 'West';
  }
  if (lower.includes('woodlands') || lower.includes('yishun') || lower.includes('sembawang')) {
    return 'North';
  }
  if (lower.includes('punggol') || lower.includes('sengkang') || lower.includes('serangoon') || lower.includes('ang mo kio')) {
    return 'North-East';
  }
  // Coordinate fallback
  if (lat > 1.41) return 'North';
  if (lng > 103.88) return lat > 1.37 ? 'North-East' : 'East';
  if (lng < 103.77) return 'West';
  return 'Central';
}
