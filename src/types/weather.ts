export type WeatherConditionType =
  | 'Fair (Day)'
  | 'Fair (Night)'
  | 'Fair & Warm'
  | 'Partly Cloudy (Day)'
  | 'Partly Cloudy (Night)'
  | 'Cloudy'
  | 'Hazy'
  | 'Slightly Hazy'
  | 'Windy'
  | 'Mist'
  | 'Fog'
  | 'Light Rain'
  | 'Moderate Rain'
  | 'Heavy Rain'
  | 'Passing Showers'
  | 'Light Showers'
  | 'Showers'
  | 'Heavy Showers'
  | 'Thundery Showers'
  | 'Heavy Thundery Showers'
  | string;

export interface AreaForecast {
  area: string;
  forecast: WeatherConditionType;
  latitude: number;
  longitude: number;
}

export interface WeatherStationReading {
  stationId: string;
  stationName: string;
  latitude: number;
  longitude: number;
  value: number;
  unit: string;
}

export interface RegionalValues {
  north: number;
  south: number;
  east: number;
  west: number;
  central: number;
  national?: number;
}

export interface UVData {
  currentValue: number;
  peakToday: number;
  updatedTimestamp: string;
  hourlyIndex: { hour: string; value: number }[];
}

export interface DayForecast {
  day: string;
  date: string;
  forecastText: string;
  summary: string;
  tempLow: number;
  tempHigh: number;
  humidityLow: number;
  humidityHigh: number;
  windSpeedLow: number;
  windSpeedHigh: number;
  windDirection: string;
}

export interface TwentyFourHrPeriod {
  timePeriod: string;
  west: string;
  east: string;
  central: string;
  south: string;
  north: string;
}

export interface TwentyFourHrData {
  generalSummary: string;
  validPeriodText: string;
  tempLow: number;
  tempHigh: number;
  humidityLow: number;
  humidityHigh: number;
  windSpeed: string;
  windDirection: string;
  periods: TwentyFourHrPeriod[];
}

export type SportActivityType =
  | 'running'
  | 'cycling'
  | 'tennis'
  | 'watersports'
  | 'hiking'
  | 'fieldSports';

export type ActivityReadiness = 'optimal' | 'good' | 'caution' | 'hazardous';

export interface SportRecommendation {
  id: SportActivityType;
  name: string;
  category: 'Endurance' | 'Wheels' | 'Racquet' | 'Water' | 'Trail' | 'Field';
  readiness: ActivityReadiness;
  score: number; // 0 - 100
  summary: string;
  riskFactors: string[];
  favorableFactors: string[];
  hydrationIntervalMinutes: number;
  recommendedGear: string[];
  popularVenues: { name: string; area: string }[];
}

export interface WeatherDataBundle {
  timestamp: string;
  twoHourForecasts: AreaForecast[];
  twoHourValidPeriod: string;
  airTemperature: {
    average: number;
    min: number;
    max: number;
    stations: WeatherStationReading[];
  };
  rainfall: {
    activeRainStationsCount: number;
    highestRainfallMm: number;
    stations: WeatherStationReading[];
  };
  relativeHumidity: {
    average: number;
    stations: WeatherStationReading[];
  };
  windSpeed: {
    averageKnots: number;
    averageKmh: number;
    maxKmh: number;
    stations: WeatherStationReading[];
  };
  uvIndex: UVData;
  psi: {
    readings: RegionalValues;
    status: 'Good' | 'Moderate' | 'Unhealthy' | 'Very Unhealthy';
  };
  pm25: {
    readings: RegionalValues;
    status: 'Normal' | 'Elevated' | 'High';
  };
  twentyFourHour: TwentyFourHrData;
  fourDayOutlook: DayForecast[];
  heatIndexCelsius: number;
  isCached: boolean;
  cacheAgeSeconds?: number;
}
