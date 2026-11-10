# Project Prompts Log

This document records the sequence of prompts used to build the **SG Carpark Live Tracker** application and its LTA DataMall serverless backend integration.

---

## Prompt 1: Initial Frontend Application Request

```text
build a singapore carpark tracker application that tracks real time car park availabilities. build just the front end for now. i will integrate the back end later.
```

### Scope Delivered:
- Interactive Singapore Carpark Tracker built with React, TypeScript, Tailwind CSS, and Leaflet.
- CartoDB Positron interactive map with color-coded live lot occupancy pins.
- 34 authentic Singapore carparks covering HDB, URA, and Commercial Malls across Central, East, West, North, and North-East regions.
- Real-time vehicle entry/exit drift simulation and manual refresh sync.
- Category breakdown for Cars (`C`), Motorcycles (`Y`), and Heavy Vehicles (`H`).
- Parking rates estimator and tariff comparison against standard HDB rates.
- Filter toolbar for regions, agencies, vehicle types, EV charging, and free parking schemes.
- Backend Integration Bridge modal with JSON contract viewer.

---

## Prompt 2: GitHub Repository Push

```text
git push https://<GITHUB_PAT_TOKEN>@<https://github.com/SuchitraNarayan/lta-carpark-tracker.git>
```

### Scope Delivered:
- Initialized git repository with `main` branch.
- Configured user credentials and staged all 22 initial project files.
- Pushed commit `5490bc1` to [https://github.com/SuchitraNarayan/lta-carpark-tracker](https://github.com/SuchitraNarayan/lta-carpark-tracker).

---

## Prompt 3: LTA DataMall Serverless Connection

```text
1. add a serverless connection that pulls live data from LTA'a datamall using the following endpoints:# Live carpark lots (HDB + LTA + URA):
https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2
# All requests need the header:  AccountKey: 

2. store this in /api folder (at project root level)
3. include a /health.ts and /carparkavailability.ts                               4. do not hardcode any keys , i will include them later
```

### Scope Delivered:
- Created serverless `/api/health.ts` for monitoring service status and verifying `AccountKey` presence.
- Created serverless `/api/carparkavailability.ts` pulling live carpark data from LTA DataMall's `CarParkAvailabilityv2` endpoint with automated `AccountKey` header injection.
- Added in-memory caching (30s TTL) to prevent rate limits, batch pagination support (`$skip` & `?all=true`), and coordinate/lot normalization.
- Zero hardcoded secrets: reads from `process.env.LTA_DATAMALL_ACCOUNT_KEY` or `AccountKey` request header.
- Added full-stack Express server (`server.ts`) mounting the serverless endpoints and Vite middleware.
- Pushed commit `0cbee5f` to GitHub repository.

---

## Prompt 4: Collating Prompts

```text
collate all prompts to filename prompts.md
```

### Scope Delivered:
- Created `prompts.md` documenting the chronological prompts and features developed throughout the session.

---

## Prompt 5: Outdoor & Sporting Activity Weather Tracker

```text
build a weather tracker application that tracks real time weather updates for outdoor and sporting activity. I have the following end points that can be used for the same 1. # Weather & environment (v2 host, wrapped responses) - all keyless, all live:
https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast
https://api-open.data.gov.sg/v2/real-time/api/twenty-four-hr-forecast
https://api-open.data.gov.sg/v2/real-time/api/four-day-outlook
https://api-open.data.gov.sg/v2/real-time/api/air-temperature
https://api-open.data.gov.sg/v2/real-time/api/rainfall
https://api-open.data.gov.sg/v2/real-time/api/psi
https://api-open.data.gov.sg/v2/real-time/api/pm25
https://api-open.data.gov.sg/v2/real-time/api/uv
https://api-open.data.gov.sg/v2/real-time/api/relative-humidity
https://api-open.data.gov.sg/v2/real-time/api/wind-speed
```

### Scope Delivered:
- Serverless `/api/weather.ts` aggregator endpoint connecting concurrently to all 10 keyless Data.gov.sg v2 endpoints with 60s in-memory caching and resilient fallbacks against 429 rate limits.
- Outdoor Activity Assessment Engine calculating real-time safety, hydration intervals, and readiness scores (Optimal, Good, Caution, Hazardous) for 6 major sports: Running, Road Cycling, Tennis/Pickleball, Watersports/Sailing, Nature Trail Hiking, and Field Sports.
- Interactive Leaflet map displaying 47 Singapore town nowcasts, temperature stations, and rainfall radar.
- Real-time environmental telemetry grid with tabular figures for Air Temp, Rain, UV Index, Relative Humidity, Wind Speed, PSI, and PM2.5.
- 24-Hour Synoptic island forecast and 4-Day Extended Outlook.
- Sports Activity detail modal with thermal stress advisories, hydration schedules, and recommended venues in Singapore.
- Seamless switcher between the Weather Tracker and Carpark Live Tracker.
