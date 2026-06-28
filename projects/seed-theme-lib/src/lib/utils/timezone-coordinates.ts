export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

const TIMEZONE_COORDINATES: Record<string, GeoCoordinates> = {
  'Europe/Budapest': { latitude: 47.5, longitude: 19.0 },
  'Europe/Berlin': { latitude: 52.5, longitude: 13.4 },
  'Europe/London': { latitude: 51.5, longitude: -0.1 },
  'Europe/Paris': { latitude: 48.9, longitude: 2.3 },
  'Europe/Vienna': { latitude: 48.2, longitude: 16.4 },
  'Europe/Warsaw': { latitude: 52.2, longitude: 21.0 },
  'Europe/Prague': { latitude: 50.1, longitude: 14.4 },
  'Europe/Rome': { latitude: 41.9, longitude: 12.5 },
  'Europe/Madrid': { latitude: 40.4, longitude: -3.7 },
  'Europe/Amsterdam': { latitude: 52.4, longitude: 4.9 },
  'Europe/Stockholm': { latitude: 59.3, longitude: 18.1 },
  'Europe/Helsinki': { latitude: 60.2, longitude: 24.9 },
  'Europe/Athens': { latitude: 37.98, longitude: 23.7 },
  'Europe/Istanbul': { latitude: 41.0, longitude: 29.0 },
  'Europe/Moscow': { latitude: 55.75, longitude: 37.6 },
  'America/New_York': { latitude: 40.7, longitude: -74.0 },
  'America/Chicago': { latitude: 41.9, longitude: -87.6 },
  'America/Denver': { latitude: 39.7, longitude: -104.9 },
  'America/Los_Angeles': { latitude: 34.0, longitude: -118.2 },
  'America/Toronto': { latitude: 43.7, longitude: -79.4 },
  'America/Vancouver': { latitude: 49.3, longitude: -123.1 },
  'America/Mexico_City': { latitude: 19.4, longitude: -99.1 },
  'America/Sao_Paulo': { latitude: -23.5, longitude: -46.6 },
  'America/Buenos_Aires': { latitude: -34.6, longitude: -58.4 },
  'Asia/Tokyo': { latitude: 35.7, longitude: 139.7 },
  'Asia/Shanghai': { latitude: 31.2, longitude: 121.5 },
  'Asia/Hong_Kong': { latitude: 22.3, longitude: 114.2 },
  'Asia/Singapore': { latitude: 1.3, longitude: 103.8 },
  'Asia/Seoul': { latitude: 37.6, longitude: 127.0 },
  'Asia/Kolkata': { latitude: 28.6, longitude: 77.2 },
  'Asia/Dubai': { latitude: 25.2, longitude: 55.3 },
  'Australia/Sydney': { latitude: -33.9, longitude: 151.2 },
  'Australia/Melbourne': { latitude: -37.8, longitude: 145.0 },
  'Pacific/Auckland': { latitude: -36.8, longitude: 174.8 },
  'Africa/Cairo': { latitude: 30.0, longitude: 31.2 },
  'Africa/Johannesburg': { latitude: -26.2, longitude: 28.0 },
  UTC: { latitude: 51.5, longitude: 0 },
  'Etc/UTC': { latitude: 51.5, longitude: 0 },
};

export function resolveCoordinatesForTimezone(
  timeZone: string,
): GeoCoordinates | undefined {
  return TIMEZONE_COORDINATES[timeZone];
}
