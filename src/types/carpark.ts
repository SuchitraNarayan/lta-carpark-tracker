export type VehicleType = 'car' | 'motorcycle' | 'heavyVehicle';

export type CarparkAgency = 'HDB' | 'URA' | 'Commercial' | 'LTA';

export type CarparkRegion = 'Central' | 'East' | 'West' | 'North' | 'North-East';

export interface LotAvailability {
  total: number;
  available: number;
}

export interface HourlyOccupancy {
  hour: string; // e.g. "08:00", "12:00"
  occupancyPct: number; // 0 to 100
}

export interface ParkingRates {
  weekdayDay: string;
  weekdayNight: string;
  weekendDay: string;
  weekendNight: string;
  ratePerHalfHour: number; // baseline numeric in SGD
  centralAreaMultiplier: number;
  gracePeriodMinutes: number;
}

export interface Carpark {
  id: string; // Carpark code, e.g. "ACB", "TP24", "MBS01"
  name: string;
  address: string;
  town: string;
  region: CarparkRegion;
  agency: CarparkAgency;
  carparkType: 'Multi-Storey' | 'Basement' | 'Surface' | 'Mechanised';
  coordinates: {
    lat: number;
    lng: number;
  };
  lots: {
    car: LotAvailability;
    motorcycle: LotAvailability;
    heavyVehicle: LotAvailability;
  };
  parkingSystem: 'Electronic Parking System (EPS)' | 'Coupons / Manual';
  shortTermParking: 'WHOLE DAY' | '7:00 AM - 10:30 PM' | 'NO' | '24 HOURS';
  freeParking: string; // e.g. "SUN & PH 7:00 AM - 10:30 PM" or "None"
  nightParking: boolean;
  gantryHeight: number; // in meters, e.g. 2.15
  hasEVCharging: boolean;
  evChargersCount?: number;
  rates: ParkingRates;
  lastUpdated: string; // ISO string
  trend: 'increasing' | 'decreasing' | 'stable';
  hourlyPattern: HourlyOccupancy[];
}

export interface CarparkFilterState {
  searchQuery: string;
  agency: CarparkAgency | 'All';
  region: CarparkRegion | 'All';
  vehicleType: VehicleType;
  minAvailableLots: number;
  onlyEV: boolean;
  onlyFreeParking: boolean;
  onlyNightParking: boolean;
  minHeightClearance: number; // 0 for all
  sortBy: 'availability' | 'occupancyRate' | 'name' | 'rateAsc';
  viewMode: 'split' | 'map' | 'list';
  showFavoritesOnly: boolean;
}

export interface BackendConfig {
  mode: 'mock' | 'custom';
  customEndpointUrl: string;
  pollIntervalSec: number;
  isSimulatingLiveDrift: boolean;
}
