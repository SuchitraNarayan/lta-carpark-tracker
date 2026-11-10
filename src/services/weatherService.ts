import {
  SportActivityType,
  SportRecommendation,
  WeatherDataBundle,
} from '../types/weather';

export async function fetchLiveWeatherData(): Promise<WeatherDataBundle> {
  try {
    const response = await fetch('/api/weather');
    if (!response.ok) {
      throw new Error(`Weather API returned HTTP ${response.status}`);
    }
    const data: WeatherDataBundle = await response.json();
    return data;
  } catch (error) {
    console.warn('Failed to fetch from /api/weather, returning fallback baseline data', error);
    return getFallbackWeatherBundle();
  }
}

/**
 * Intelligent Outdoor & Sporting Activity Assessment Engine
 * Computes live safety, comfort, and readiness scores based on Singapore environmental data
 */
export function evaluateSportRecommendations(
  weather: WeatherDataBundle,
  selectedAreaName?: string
): SportRecommendation[] {
  const avgTemp = weather.airTemperature.average;
  const heatIndex = weather.heatIndexCelsius;
  const activeRain = weather.rainfall.activeRainStationsCount > 0;
  const maxRainMm = weather.rainfall.highestRainfallMm;
  const uv = weather.uvIndex.currentValue;
  const psiMax = Math.max(
    weather.psi.readings.north,
    weather.psi.readings.south,
    weather.psi.readings.east,
    weather.psi.readings.west,
    weather.psi.readings.central
  );
  const windKmh = weather.windSpeed.averageKmh;

  // Check if current area or island has thunderstorms
  let hasThunderstorm = false;
  if (selectedAreaName) {
    const areaForecast = weather.twoHourForecasts.find(
      (f) => f.area.toLowerCase() === selectedAreaName.toLowerCase()
    );
    if (areaForecast && areaForecast.forecast.toLowerCase().includes('thundery')) {
      hasThunderstorm = true;
    }
  } else {
    hasThunderstorm = weather.twoHourForecasts.some((f) =>
      f.forecast.toLowerCase().includes('thundery')
    );
  }

  // 1. Running & Jogging
  const running = evaluateRunning(avgTemp, heatIndex, activeRain, maxRainMm, uv, psiMax, hasThunderstorm);

  // 2. Road & Leisure Cycling
  const cycling = evaluateCycling(windKmh, activeRain, maxRainMm, heatIndex, uv, hasThunderstorm);

  // 3. Outdoor Tennis & Pickleball
  const tennis = evaluateTennis(activeRain, maxRainMm, windKmh, uv, heatIndex, hasThunderstorm);

  // 4. Water Sports / Sailing / Kayaking
  const watersports = evaluateWaterSports(windKmh, activeRain, maxRainMm, uv, hasThunderstorm);

  // 5. Nature Trail Hiking
  const hiking = evaluateHiking(activeRain, maxRainMm, heatIndex, psiMax, hasThunderstorm);

  // 6. Field Sports (Football / Rugby / Ultimate Frisbee)
  const fieldSports = evaluateFieldSports(activeRain, maxRainMm, heatIndex, psiMax, hasThunderstorm);

  return [running, cycling, tennis, watersports, hiking, fieldSports];
}

function evaluateRunning(
  temp: number,
  heatIndex: number,
  activeRain: boolean,
  rainMm: number,
  uv: number,
  psi: number,
  hasThunderstorm: boolean
): SportRecommendation {
  const riskFactors: string[] = [];
  const favorableFactors: string[] = [];
  let score = 88;

  if (hasThunderstorm) {
    score -= 50;
    riskFactors.push('Lightning / Thundery showers detected in vicinity');
  } else if (activeRain && rainMm > 1.0) {
    score -= 25;
    riskFactors.push(`Active rainfall (${rainMm} mm/h) - Slippery pavement`);
  } else if (activeRain && rainMm <= 1.0) {
    score -= 5;
    favorableFactors.push('Light cooling drizzle');
  } else {
    favorableFactors.push('Dry road and running track conditions');
  }

  if (heatIndex >= 37) {
    score -= 25;
    riskFactors.push(`Extreme Heat Index (${heatIndex}°C) - Risk of heat exhaustion`);
  } else if (heatIndex >= 33) {
    score -= 10;
    riskFactors.push(`Elevated thermal stress (${heatIndex}°C Feels Like)`);
  } else {
    favorableFactors.push(`Manageable temperature (${temp}°C)`);
  }

  if (uv >= 8) {
    score -= 10;
    riskFactors.push(`Very High UV (${uv}) - Apply SPF50 sunscreen`);
  }

  if (psi <= 50) {
    favorableFactors.push(`Clean air quality (PSI ${psi})`);
  } else {
    score -= 15;
    riskFactors.push(`Moderate haze particulate (PSI ${psi})`);
  }

  let readiness: SportRecommendation['readiness'] = 'optimal';
  if (score < 40 || hasThunderstorm) readiness = 'hazardous';
  else if (score < 65) readiness = 'caution';
  else if (score < 80) readiness = 'good';

  return {
    id: 'running',
    name: 'Running & Jogging',
    category: 'Endurance',
    readiness,
    score: Math.max(10, Math.min(100, score)),
    summary:
      readiness === 'optimal'
        ? 'Superb conditions for outdoor tempo runs and distance training.'
        : readiness === 'good'
        ? 'Favorable conditions; monitor hydration and sunscreen.'
        : readiness === 'caution'
        ? 'Exercise vigilance: thermal heat or light rain present.'
        : 'Outdoor running not recommended due to thunderstorm or heat danger.',
    riskFactors,
    favorableFactors,
    hydrationIntervalMinutes: heatIndex >= 34 ? 15 : 20,
    recommendedGear: ['Electrolyte flasks', 'Breathable singlet', 'UV running cap', 'Water-resistant shoes'],
    popularVenues: [
      { name: 'Marina Bay Waterfront Promenade', area: 'Central' },
      { name: 'East Coast Park PCN Track', area: 'East' },
      { name: 'MacRitchie Reservoir Loop', area: 'Central' },
      { name: 'Jurong Lake Gardens Loop', area: 'West' },
      { name: 'Punggol Waterway Park', area: 'North-East' },
    ],
  };
}

function evaluateCycling(
  windKmh: number,
  activeRain: boolean,
  rainMm: number,
  heatIndex: number,
  uv: number,
  hasThunderstorm: boolean
): SportRecommendation {
  const riskFactors: string[] = [];
  const favorableFactors: string[] = [];
  let score = 85;

  if (hasThunderstorm) {
    score -= 60;
    riskFactors.push('Lightning risk across open roads');
  } else if (activeRain) {
    score -= 30;
    riskFactors.push('Wet tarmac reduces braking traction significantly');
  } else {
    favorableFactors.push('Tarmac dry with optimal tyre grip');
  }

  if (windKmh > 25) {
    score -= 15;
    riskFactors.push(`Strong crosswinds (${windKmh} km/h) on coastal routes`);
  } else {
    favorableFactors.push(`Gentle breeze (${windKmh} km/h)`);
  }

  if (uv >= 8) {
    score -= 10;
    riskFactors.push(`Intense sun exposure (UV ${uv}) on unshaded roads`);
  }

  let readiness: SportRecommendation['readiness'] = 'optimal';
  if (score < 40 || hasThunderstorm) readiness = 'hazardous';
  else if (score < 65) readiness = 'caution';
  else if (score < 80) readiness = 'good';

  return {
    id: 'cycling',
    name: 'Road & PCN Cycling',
    category: 'Wheels',
    readiness,
    score: Math.max(10, Math.min(100, score)),
    summary:
      readiness === 'optimal'
        ? 'Clear roads, favorable wind and dry asphalt for long rides.'
        : readiness === 'good'
        ? 'Great cycling weather; pack adequate electrolytes.'
        : readiness === 'caution'
        ? 'Wet roads or headwind; reduce speed on bends.'
        : 'Dangerous riding conditions due to lightning or torrential rain.',
    riskFactors,
    favorableFactors,
    hydrationIntervalMinutes: 20,
    recommendedGear: ['Polarized cycling sunglasses', 'Clear-lens rain glasses', 'High-visibility taillight', 'Chain lube'],
    popularVenues: [
      { name: 'Tanah Merah Coast Road / Changi Airport Loop', area: 'East' },
      { name: 'Round Island Route (RIR)', area: 'Islandwide' },
      { name: 'Mandai Loop / Kranji Countryside', area: 'North' },
      { name: 'Marina Barrage to Gardens by the Bay', area: 'Central' },
    ],
  };
}

function evaluateTennis(
  activeRain: boolean,
  rainMm: number,
  windKmh: number,
  uv: number,
  heatIndex: number,
  hasThunderstorm: boolean
): SportRecommendation {
  const riskFactors: string[] = [];
  const favorableFactors: string[] = [];
  let score = 90;

  if (hasThunderstorm || activeRain) {
    score -= 65;
    riskFactors.push('Unplayable wet court surface and lightning alarm');
  } else {
    favorableFactors.push('Hard court dry and ready for play');
  }

  if (windKmh > 18) {
    score -= 15;
    riskFactors.push(`Wind gusts (${windKmh} km/h) will deflect ball trajectory`);
  } else {
    favorableFactors.push('Minimal wind interference');
  }

  if (uv >= 9) {
    score -= 15;
    riskFactors.push(`Direct overhead glare & UV ${uv}`);
  }

  let readiness: SportRecommendation['readiness'] = 'optimal';
  if (score < 40 || hasThunderstorm || activeRain) readiness = 'hazardous';
  else if (score < 70) readiness = 'caution';
  else if (score < 85) readiness = 'good';

  return {
    id: 'tennis',
    name: 'Tennis & Pickleball',
    category: 'Racquet',
    readiness,
    score: Math.max(10, Math.min(100, score)),
    summary:
      readiness === 'optimal'
        ? 'Dry courts and stable winds; prime conditions for outdoor matches.'
        : readiness === 'good'
        ? 'Playable conditions; wear a visor against sun glare.'
        : readiness === 'caution'
        ? 'High heat or gusty wind; short set intervals advised.'
        : 'Court unplayable due to wet surface or lightning warnings.',
    riskFactors,
    favorableFactors,
    hydrationIntervalMinutes: 15,
    recommendedGear: ['Overgrip replacements', 'Court shoes with grip', 'UV visor', 'Ice towel'],
    popularVenues: [
      { name: 'Kallang Tennis Hub', area: 'Central' },
      { name: 'Burghley Tennis Centre', area: 'North-East' },
      { name: 'Yio Chu Kang Tennis Centre', area: 'North' },
      { name: 'Farrer Park Tennis Courts', area: 'Central' },
    ],
  };
}

function evaluateWaterSports(
  windKmh: number,
  activeRain: boolean,
  rainMm: number,
  uv: number,
  hasThunderstorm: boolean
): SportRecommendation {
  const riskFactors: string[] = [];
  const favorableFactors: string[] = [];
  let score = 80;

  if (hasThunderstorm) {
    score -= 70;
    riskFactors.push('Mandatory water evacuation: Cat 1 lightning alert');
  }

  if (windKmh >= 12 && windKmh <= 28) {
    score += 15;
    favorableFactors.push(`Ideal sailing & foiling wind (${windKmh} km/h)`);
  } else if (windKmh < 6) {
    score -= 10;
    riskFactors.push('Stagnant wind; paddling required for sailing dinghies');
  }

  if (uv >= 8) {
    riskFactors.push(`Water surface reflection amplifies UV (${uv})`);
  }

  let readiness: SportRecommendation['readiness'] = 'optimal';
  if (score < 40 || hasThunderstorm) readiness = 'hazardous';
  else if (score < 65) readiness = 'caution';
  else if (score < 80) readiness = 'good';

  return {
    id: 'watersports',
    name: 'Kayaking, SUP & Sailing',
    category: 'Water',
    readiness,
    score: Math.max(10, Math.min(100, score)),
    summary:
      readiness === 'optimal'
        ? 'Excellent breeze and clear waters for kayaking, paddleboarding, and dinghy sailing.'
        : readiness === 'good'
        ? 'Good watersport conditions; keep lifejacket secured.'
        : readiness === 'caution'
        ? 'Marginal winds or squall approaching; stay within reservoir visual bounds.'
        : 'Strict water ban: lightning warning active across Singapore waterways.',
    riskFactors,
    favorableFactors,
    hydrationIntervalMinutes: 25,
    recommendedGear: ['Type III PFD / Lifejacket', 'Zinc waterproof sunblock', 'Dry bag for electronics', 'Booties'],
    popularVenues: [
      { name: 'Bedok Reservoir Water Sports Centre', area: 'East' },
      { name: 'Kallang Water Sports Centre', area: 'Central' },
      { name: 'Marina Channel / Marina Barrage', area: 'Central' },
      { name: 'Ola Beach Club / Siloso Beach', area: 'Sentosa' },
      { name: 'Jurong Lake Water Sports', area: 'West' },
    ],
  };
}

function evaluateHiking(
  activeRain: boolean,
  rainMm: number,
  heatIndex: number,
  psi: number,
  hasThunderstorm: boolean
): SportRecommendation {
  const riskFactors: string[] = [];
  const favorableFactors: string[] = [];
  let score = 85;

  if (hasThunderstorm) {
    score -= 55;
    riskFactors.push('Lightning risk in exposed canopy & summit areas');
  } else if (activeRain && rainMm > 2.0) {
    score -= 25;
    riskFactors.push('Muddy trails and slippery root steps');
  }

  if (heatIndex < 33) {
    favorableFactors.push('Canopy provides natural shade and lower radiant heat');
  } else {
    score -= 10;
    riskFactors.push(`High humidity in forest canopy (${heatIndex}°C Feels Like)`);
  }

  let readiness: SportRecommendation['readiness'] = 'optimal';
  if (score < 40 || hasThunderstorm) readiness = 'hazardous';
  else if (score < 65) readiness = 'caution';
  else if (score < 80) readiness = 'good';

  return {
    id: 'hiking',
    name: 'Nature Trail Hiking',
    category: 'Trail',
    readiness,
    score: Math.max(10, Math.min(100, score)),
    summary:
      readiness === 'optimal'
        ? 'Pleasant canopy conditions for summit walks and nature trails.'
        : readiness === 'good'
        ? 'Trail conditions good; watch footing on mossy granite stairs.'
        : readiness === 'caution'
        ? 'Muddy ground or drizzle; trekking poles recommended.'
        : 'Do not hike: lightning threat or heavy flash flooding on trails.',
    riskFactors,
    favorableFactors,
    hydrationIntervalMinutes: 20,
    recommendedGear: ['Trail shoes with lugged traction', 'Insect repellent (DEET)', 'Trekking pole', 'Lightweight poncho'],
    popularVenues: [
      { name: 'Bukit Timah Nature Reserve Summit', area: 'Central' },
      { name: 'TreeTop Walk & MacRitchie Trails', area: 'Central' },
      { name: 'Southern Ridges Walk', area: 'South' },
      { name: 'Rail Corridor (Green Corridor)', area: 'Central / West' },
      { name: 'Chestnut Nature Park', area: 'North-West' },
    ],
  };
}

function evaluateFieldSports(
  activeRain: boolean,
  rainMm: number,
  heatIndex: number,
  psi: number,
  hasThunderstorm: boolean
): SportRecommendation {
  const riskFactors: string[] = [];
  const favorableFactors: string[] = [];
  let score = 85;

  if (hasThunderstorm) {
    score -= 60;
    riskFactors.push('Open pitch lightning danger');
  } else if (activeRain) {
    score -= 20;
    riskFactors.push('Waterlogged grass pitch; studs recommended');
  } else {
    favorableFactors.push('Pitch firm and dry');
  }

  if (heatIndex >= 36) {
    score -= 20;
    riskFactors.push('High WBGT thermal stress on open turf');
  }

  let readiness: SportRecommendation['readiness'] = 'optimal';
  if (score < 40 || hasThunderstorm) readiness = 'hazardous';
  else if (score < 65) readiness = 'caution';
  else if (score < 80) readiness = 'good';

  return {
    id: 'fieldSports',
    name: 'Football & Outdoor HIIT',
    category: 'Field',
    readiness,
    score: Math.max(10, Math.min(100, score)),
    summary:
      readiness === 'optimal'
        ? 'Pitch dry with comfortable breeze; ideal for 90-minute matches.'
        : readiness === 'good'
        ? 'Playable turf; plan water breaks between quarters.'
        : readiness === 'caution'
        ? 'Slick pitch or elevated heat stress; mandatory rest intervals.'
        : 'Cat 1 siren active; cease play immediately and head to shelter.',
    riskFactors,
    favorableFactors,
    hydrationIntervalMinutes: 15,
    recommendedGear: ['Firm ground (FG) cleats', 'Electrolyte sachets', 'Cooling spray', 'Shin guards'],
    popularVenues: [
      { name: 'The Float / Marina Bay Pitches', area: 'Central' },
      { name: 'Jalan Besar Stadium Pitch', area: 'Central' },
      { name: 'Turf City / The Grandstand Pitches', area: 'Central' },
      { name: 'Bedok ActiveSG Stadium', area: 'East' },
    ],
  };
}

function getFallbackWeatherBundle(): WeatherDataBundle {
  return {
    timestamp: new Date().toISOString(),
    twoHourForecasts: [
      { area: 'Ang Mo Kio', forecast: 'Partly Cloudy (Day)', latitude: 1.375, longitude: 103.839 },
      { area: 'Bedok', forecast: 'Showers', latitude: 1.321, longitude: 103.924 },
      { area: 'Bishan', forecast: 'Partly Cloudy (Day)', latitude: 1.3507, longitude: 103.839 },
      { area: 'Boon Lay', forecast: 'Thundery Showers', latitude: 1.304, longitude: 103.701 },
      { area: 'City', forecast: 'Partly Cloudy (Day)', latitude: 1.292, longitude: 103.844 },
      { area: 'Clementi', forecast: 'Thundery Showers', latitude: 1.315, longitude: 103.76 },
      { area: 'Jurong East', forecast: 'Showers', latitude: 1.335, longitude: 103.743 },
      { area: 'Marina Bay', forecast: 'Fair (Day)', latitude: 1.283, longitude: 103.86 },
      { area: 'Sentosa', forecast: 'Fair (Day)', latitude: 1.25, longitude: 103.83 },
      { area: 'Tampines', forecast: 'Showers', latitude: 1.353, longitude: 103.945 },
      { area: 'Woodlands', forecast: 'Cloudy', latitude: 1.438, longitude: 103.789 },
    ],
    twoHourValidPeriod: '2.00 pm to 4.00 pm',
    airTemperature: {
      average: 30.8,
      min: 27.5,
      max: 32.8,
      stations: [
        { stationId: 'S109', stationName: 'Ang Mo Kio', latitude: 1.379, longitude: 103.85, value: 31.2, unit: '°C' },
        { stationId: 'S106', stationName: 'Pulau Ubin', latitude: 1.416, longitude: 103.967, value: 31.8, unit: '°C' },
        { stationId: 'S104', stationName: 'Woodlands', latitude: 1.443, longitude: 103.785, value: 29.5, unit: '°C' },
        { stationId: 'S24', stationName: 'Marina Barrage', latitude: 1.281, longitude: 103.869, value: 30.4, unit: '°C' },
      ],
    },
    rainfall: {
      activeRainStationsCount: 3,
      highestRainfallMm: 2.4,
      stations: [],
    },
    relativeHumidity: {
      average: 78,
      stations: [],
    },
    windSpeed: {
      averageKnots: 7.2,
      averageKmh: 13,
      maxKmh: 24,
      stations: [],
    },
    uvIndex: {
      currentValue: 7,
      peakToday: 9,
      updatedTimestamp: new Date().toISOString(),
      hourlyIndex: [
        { hour: '14:00', value: 7 },
        { hour: '13:00', value: 9 },
        { hour: '12:00', value: 8 },
        { hour: '11:00', value: 6 },
      ],
    },
    psi: {
      readings: { north: 38, south: 44, east: 39, west: 42, central: 40 },
      status: 'Good',
    },
    pm25: {
      readings: { north: 7, south: 11, east: 6, west: 9, central: 8 },
      status: 'Normal',
    },
    twentyFourHour: {
      generalSummary: 'Passing showers in the late afternoon; warm throughout the day.',
      validPeriodText: '12 PM to 12 PM Tomorrow',
      tempLow: 25,
      tempHigh: 33,
      humidityLow: 60,
      humidityHigh: 95,
      windSpeed: '10 - 20 km/h',
      windDirection: 'NE',
      periods: [],
    },
    fourDayOutlook: [
      {
        day: 'Wednesday',
        date: '11 Nov',
        forecastText: 'Thundery Showers',
        summary: 'Afternoon thundery showers over central and west',
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
        forecastText: 'Partly Cloudy',
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
        summary: 'Afternoon thundery showers',
        tempLow: 25,
        tempHigh: 33,
        humidityLow: 60,
        humidityHigh: 95,
        windSpeedLow: 10,
        windSpeedHigh: 20,
        windDirection: 'NE',
      },
    ],
    heatIndexCelsius: 34,
    isCached: false,
  };
}
