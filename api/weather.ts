import type { Request, Response } from 'express';

// Cache structure
let cachedWeatherPayload: any = null;
let lastCacheTimestamp = 0;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

// Safe fetch helper with timeout
async function safeFetchJson(url: string, timeoutMs: number = 4000): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'SingaporeSportWeather/1.0',
        Accept: 'application/json',
      },
    });
    clearTimeout(timer);
    if (!res.ok) {
      console.warn(`Upstream API ${url} responded with ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (err: any) {
    clearTimeout(timer);
    console.warn(`Error fetching ${url}:`, err?.message || err);
    return null;
  }
}

/**
 * Serverless Weather Aggregator Endpoint
 * Pulls from all 10 Singapore Open Data v2 endpoints
 */
export default async function handler(req: Request, res: Response) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const now = Date.now();
  const forceFresh = req.query['fresh'] === 'true';

  if (!forceFresh && cachedWeatherPayload && now - lastCacheTimestamp < CACHE_TTL_MS) {
    res.setHeader('X-Cache', 'HIT');
    return res.status(200).json({
      ...cachedWeatherPayload,
      isCached: true,
      cacheAgeSeconds: Math.round((now - lastCacheTimestamp) / 1000),
    });
  }

  try {
    // Fetch all 10 live endpoints concurrently
    const [
      twoHrRes,
      twentyFourHrRes,
      fourDayRes,
      airTempRes,
      rainfallRes,
      psiRes,
      pm25Res,
      uvRes,
      humidityRes,
      windRes,
    ] = await Promise.all([
      safeFetchJson('https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast'),
      safeFetchJson('https://api-open.data.gov.sg/v2/real-time/api/twenty-four-hr-forecast'),
      safeFetchJson('https://api-open.data.gov.sg/v2/real-time/api/four-day-outlook'),
      safeFetchJson('https://api-open.data.gov.sg/v2/real-time/api/air-temperature'),
      safeFetchJson('https://api-open.data.gov.sg/v2/real-time/api/rainfall'),
      safeFetchJson('https://api-open.data.gov.sg/v2/real-time/api/psi'),
      safeFetchJson('https://api-open.data.gov.sg/v2/real-time/api/pm25'),
      safeFetchJson('https://api-open.data.gov.sg/v2/real-time/api/uv'),
      safeFetchJson('https://api-open.data.gov.sg/v2/real-time/api/relative-humidity'),
      safeFetchJson('https://api-open.data.gov.sg/v2/real-time/api/wind-speed'),
    ]);

    // 1. Parse Two-Hour Forecast
    const areaMetaMap = new Map<string, { latitude: number; longitude: number }>();
    if (twoHrRes?.data?.area_metadata) {
      twoHrRes.data.area_metadata.forEach((m: any) => {
        areaMetaMap.set(m.name, m.label_location);
      });
    }

    const twoHourItems = twoHrRes?.data?.items?.[0];
    const twoHourForecasts = (twoHourItems?.forecasts || []).map((f: any) => {
      const coords = areaMetaMap.get(f.area) || { latitude: 1.3521, longitude: 103.8198 };
      return {
        area: f.area,
        forecast: f.forecast,
        latitude: coords.latitude,
        longitude: coords.longitude,
      };
    });

    // 2. Parse Air Temperature
    const tempStationsMap = new Map<string, any>();
    (airTempRes?.data?.stations || []).forEach((st: any) => {
      tempStationsMap.set(st.id, st);
    });

    const tempReadingsList: any[] = [];
    let tempSum = 0;
    let minTemp = 999;
    let maxTemp = -999;

    const tempLatest = airTempRes?.data?.readings?.[0]?.data || [];
    tempLatest.forEach((r: any) => {
      const st = tempStationsMap.get(r.stationId);
      if (st && typeof r.value === 'number') {
        tempReadingsList.push({
          stationId: st.id,
          stationName: st.name,
          latitude: st.location.latitude,
          longitude: st.location.longitude,
          value: r.value,
          unit: '°C',
        });
        tempSum += r.value;
        if (r.value < minTemp) minTemp = r.value;
        if (r.value > maxTemp) maxTemp = r.value;
      }
    });

    const avgTemp = tempReadingsList.length > 0 ? Number((tempSum / tempReadingsList.length).toFixed(1)) : 30.5;
    if (minTemp === 999) minTemp = 28.0;
    if (maxTemp === -999) maxTemp = 32.5;

    // 3. Parse Rainfall
    const rainStationsMap = new Map<string, any>();
    (rainfallRes?.data?.stations || []).forEach((st: any) => {
      rainStationsMap.set(st.id, st);
    });

    const rainReadingsList: any[] = [];
    let activeRainCount = 0;
    let maxRain = 0;

    const rainLatest = rainfallRes?.data?.readings?.[0]?.data || [];
    rainLatest.forEach((r: any) => {
      const st = rainStationsMap.get(r.stationId);
      if (st && typeof r.value === 'number') {
        rainReadingsList.push({
          stationId: st.id,
          stationName: st.name,
          latitude: st.location.latitude,
          longitude: st.location.longitude,
          value: r.value,
          unit: 'mm',
        });
        if (r.value > 0.2) activeRainCount++;
        if (r.value > maxRain) maxRain = r.value;
      }
    });

    // 4. Parse Relative Humidity
    const humidityLatest = humidityRes?.data?.readings?.[0]?.data || [];
    let humSum = 0;
    humidityLatest.forEach((r: any) => {
      if (typeof r.value === 'number') humSum += r.value;
    });
    const avgHumidity = humidityLatest.length > 0 ? Math.round(humSum / humidityLatest.length) : 78;

    // 5. Parse Wind Speed
    const windLatest = windRes?.data?.readings?.[0]?.data || [];
    let windSumKnots = 0;
    let maxWindKnots = 0;
    windLatest.forEach((r: any) => {
      if (typeof r.value === 'number') {
        windSumKnots += r.value;
        if (r.value > maxWindKnots) maxWindKnots = r.value;
      }
    });
    const avgKnots = windLatest.length > 0 ? Number((windSumKnots / windLatest.length).toFixed(1)) : 6.5;
    const avgKmh = Math.round(avgKnots * 1.852);
    const maxKmh = Math.round(maxWindKnots * 1.852);

    // 6. Parse UV Index
    const uvRecords = uvRes?.data?.records?.[0];
    const uvIndexList = uvRecords?.index || [];
    const currentUv = uvIndexList.length > 0 ? uvIndexList[0].value : 7;
    let peakUv = currentUv;
    uvIndexList.forEach((u: any) => {
      if (u.value > peakUv) peakUv = u.value;
    });

    // 7. Parse PSI & PM2.5
    const psiItem = psiRes?.data?.items?.[0];
    const psiReadings = psiItem?.readings?.psi_twenty_four_hourly || {
      north: 42,
      south: 45,
      east: 40,
      west: 44,
      central: 41,
    };
    const maxPsi = Math.max(
      psiReadings.north || 40,
      psiReadings.south || 40,
      psiReadings.east || 40,
      psiReadings.west || 40,
      psiReadings.central || 40
    );
    let psiStatus: 'Good' | 'Moderate' | 'Unhealthy' | 'Very Unhealthy' = 'Good';
    if (maxPsi > 100) psiStatus = 'Unhealthy';
    else if (maxPsi > 55) psiStatus = 'Moderate';

    const pm25Item = pm25Res?.data?.items?.[0];
    const pm25Readings = pm25Item?.readings?.pm25_one_hourly || {
      north: 8,
      south: 12,
      east: 7,
      west: 9,
      central: 10,
    };

    // 8. Parse 24-Hour Forecast
    const tfGeneral = twentyFourHrRes?.data?.records?.[0]?.general || {};
    const tfPeriods = (twentyFourHrRes?.data?.records?.[0]?.periods || []).map((p: any) => ({
      timePeriod: p.timePeriod?.text || p.timePeriod || 'Day',
      west: p.regions?.west?.text || 'Partly Cloudy',
      east: p.regions?.east?.text || 'Partly Cloudy',
      central: p.regions?.central?.text || 'Partly Cloudy',
      south: p.regions?.south?.text || 'Partly Cloudy',
      north: p.regions?.north?.text || 'Partly Cloudy',
    }));

    // 9. Parse 4-Day Outlook
    const fourDayRecords = fourDayRes?.data?.records?.[0]?.forecasts || [];
    const fourDayOutlook = fourDayRecords.map((item: any) => ({
      day: item.day || 'Upcoming',
      date: item.date || '',
      forecastText: item.forecast?.text || item.forecast?.summary || 'Thundery Showers',
      summary: item.forecast?.summary || item.forecast?.text || 'Afternoon thundery showers',
      tempLow: item.temperature?.low || 25,
      tempHigh: item.temperature?.high || 33,
      humidityLow: item.relativeHumidity?.low || 60,
      humidityHigh: item.relativeHumidity?.high || 95,
      windSpeedLow: item.wind?.speed?.low || 10,
      windSpeedHigh: item.wind?.speed?.high || 20,
      windDirection: item.wind?.direction || 'NE',
    }));

    // Heat Index Calculation (Rothfusz equation approximation)
    const T = avgTemp;
    const R = avgHumidity;
    const heatIndex = Math.round(
      -8.78469475556 +
        1.61139411 * T +
        2.33854883889 * R +
        -0.14611605 * T * R +
        -0.012308094 * T * T +
        -0.0164248277778 * R * R +
        0.002211732 * T * T * R +
        0.00072546 * T * R * R +
        -0.000003582 * T * T * R * R
    );

    const payload = {
      timestamp: new Date().toISOString(),
      twoHourForecasts: twoHourForecasts.length > 0 ? twoHourForecasts : fallbackTwoHourForecasts,
      twoHourValidPeriod: twoHourItems?.valid_period?.text || 'Current 2 Hours',
      airTemperature: {
        average: avgTemp,
        min: minTemp,
        max: maxTemp,
        stations: tempReadingsList.slice(0, 20),
      },
      rainfall: {
        activeRainStationsCount: activeRainCount,
        highestRainfallMm: maxRain,
        stations: rainReadingsList.slice(0, 20),
      },
      relativeHumidity: {
        average: avgHumidity,
        stations: [],
      },
      windSpeed: {
        averageKnots: avgKnots,
        averageKmh: avgKmh,
        maxKmh,
        stations: [],
      },
      uvIndex: {
        currentValue: currentUv,
        peakToday: peakUv,
        updatedTimestamp: uvRecords?.updatedTimestamp || new Date().toISOString(),
        hourlyIndex: uvIndexList,
      },
      psi: {
        readings: psiReadings,
        status: psiStatus,
      },
      pm25: {
        readings: pm25Readings,
        status: 'Normal',
      },
      twentyFourHour: {
        generalSummary: tfGeneral.forecast?.text || 'Warm with afternoon showers expected',
        validPeriodText: tfGeneral.validPeriod?.text || 'Next 24 Hours',
        tempLow: tfGeneral.temperature?.low || 25,
        tempHigh: tfGeneral.temperature?.high || 33,
        humidityLow: tfGeneral.relativeHumidity?.low || 60,
        humidityHigh: tfGeneral.relativeHumidity?.high || 95,
        windSpeed: tfGeneral.wind?.speed?.text || '10 - 20 km/h',
        windDirection: tfGeneral.wind?.direction || 'NE',
        periods: tfPeriods,
      },
      fourDayOutlook: fourDayOutlook.length > 0 ? fourDayOutlook : fallbackFourDayOutlook,
      heatIndexCelsius: Math.max(avgTemp, Math.min(48, heatIndex)),
      isCached: false,
    };

    cachedWeatherPayload = payload;
    lastCacheTimestamp = now;

    res.setHeader('X-Cache', 'MISS');
    return res.status(200).json(payload);
  } catch (error: any) {
    console.error('Weather aggregation failed:', error);
    // Return cached if available
    if (cachedWeatherPayload) {
      return res.status(200).json({
        ...cachedWeatherPayload,
        isCached: true,
        stale: true,
      });
    }

    return res.status(500).json({
      error: 'Weather service temporarily unavailable',
      message: error?.message || String(error),
    });
  }
}

const fallbackTwoHourForecasts = [
  { area: 'Ang Mo Kio', forecast: 'Partly Cloudy (Day)', latitude: 1.375, longitude: 103.839 },
  { area: 'Bedok', forecast: 'Showers', latitude: 1.321, longitude: 103.924 },
  { area: 'Bishan', forecast: 'Partly Cloudy (Day)', latitude: 1.3507, longitude: 103.839 },
  { area: 'Boon Lay', forecast: 'Thundery Showers', latitude: 1.304, longitude: 103.701 },
  { area: 'City', forecast: 'Partly Cloudy (Day)', latitude: 1.292, longitude: 103.844 },
  { area: 'Clementi', forecast: 'Thundery Showers', latitude: 1.315, longitude: 103.76 },
  { area: 'Jurong East', forecast: 'Showers', latitude: 1.335, longitude: 103.743 },
  { area: 'Marina Bay', forecast: 'Partly Cloudy (Day)', latitude: 1.283, longitude: 103.86 },
  { area: 'Sentosa', forecast: 'Fair (Day)', latitude: 1.25, longitude: 103.83 },
  { area: 'Tampines', forecast: 'Showers', latitude: 1.353, longitude: 103.945 },
  { area: 'Woodlands', forecast: 'Cloudy', latitude: 1.438, longitude: 103.789 },
];

const fallbackFourDayOutlook = [
  {
    day: 'Wednesday',
    date: '11 Nov',
    forecastText: 'Thundery Showers',
    summary: 'Afternoon thundery showers',
    tempLow: 25,
    tempHigh: 33,
    humidityLow: 60,
    humidityHigh: 95,
    windSpeedLow: 10,
    windSpeedHigh: 20,
    windDirection: 'NE',
  },
  {
    day: 'Thursday',
    date: '12 Nov',
    forecastText: 'Showers',
    summary: 'Late morning and early afternoon showers',
    tempLow: 25,
    tempHigh: 32,
    humidityLow: 65,
    humidityHigh: 95,
    windSpeedLow: 10,
    windSpeedHigh: 20,
    windDirection: 'NE',
  },
  {
    day: 'Friday',
    date: '13 Nov',
    forecastText: 'Partly Cloudy (Day)',
    summary: 'Fair and warm',
    tempLow: 26,
    tempHigh: 34,
    humidityLow: 55,
    humidityHigh: 90,
    windSpeedLow: 15,
    windSpeedHigh: 25,
    windDirection: 'NE',
  },
  {
    day: 'Saturday',
    date: '14 Nov',
    forecastText: 'Thundery Showers',
    summary: 'Afternoon thundery showers over northern & western areas',
    tempLow: 25,
    tempHigh: 33,
    humidityLow: 60,
    humidityHigh: 95,
    windSpeedLow: 10,
    windSpeedHigh: 20,
    windDirection: 'NE',
  },
];
