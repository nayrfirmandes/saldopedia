interface IPGeoData {
  ip: string;
  country: string;
  countryCode: string;
  region: string;
  regionName: string;
  city: string;
  lat: number;
  lon: number;
  timezone: string;
  isp: string;
  org: string;
  as: string;
  proxy: boolean;
  hosting: boolean;
}

interface GeoCheckResult {
  success: boolean;
  data?: IPGeoData;
  error?: string;
}

interface TravelCheckResult {
  isPossible: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  distanceKm: number;
  timeDiffHours: number;
  requiredSpeedKmh: number;
  message?: string;
}

const EARTH_RADIUS_KM = 6371;

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

export async function getIPGeolocation(ip: string): Promise<GeoCheckResult> {
  if (ip === 'unknown' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return { 
      success: false, 
      error: 'Private or unknown IP address' 
    };
  }

  try {
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,lat,lon,timezone,isp,org,as,proxy,hosting`, {
      next: { revalidate: 3600 }
    });

    const data = await response.json();

    if (data.status === 'fail') {
      return { 
        success: false, 
        error: data.message || 'Geolocation lookup failed' 
      };
    }

    return {
      success: true,
      data: {
        ip,
        country: data.country || 'Unknown',
        countryCode: data.countryCode || 'XX',
        region: data.region || '',
        regionName: data.regionName || '',
        city: data.city || 'Unknown',
        lat: data.lat || 0,
        lon: data.lon || 0,
        timezone: data.timezone || 'Unknown',
        isp: data.isp || '',
        org: data.org || '',
        as: data.as || '',
        proxy: data.proxy || false,
        hosting: data.hosting || false,
      }
    };
  } catch (error) {
    console.error('Geolocation lookup error:', error);
    return { 
      success: false, 
      error: 'Network error during geolocation lookup' 
    };
  }
}

export function checkImpossibleTravel(
  prevLat: number,
  prevLon: number,
  prevTime: Date,
  currLat: number,
  currLon: number,
  currTime: Date
): TravelCheckResult {
  const distanceKm = haversineDistance(prevLat, prevLon, currLat, currLon);
  const timeDiffMs = currTime.getTime() - prevTime.getTime();
  const timeDiffHours = timeDiffMs / (1000 * 60 * 60);

  if (timeDiffHours <= 0) {
    return {
      isPossible: false,
      riskLevel: 'critical',
      distanceKm,
      timeDiffHours: 0,
      requiredSpeedKmh: Infinity,
      message: 'Transaksi terjadi pada waktu yang sama dari lokasi berbeda'
    };
  }

  const requiredSpeedKmh = distanceKm / timeDiffHours;

  if (distanceKm < 50) {
    return {
      isPossible: true,
      riskLevel: 'low',
      distanceKm,
      timeDiffHours,
      requiredSpeedKmh
    };
  }

  if (requiredSpeedKmh > 1000) {
    return {
      isPossible: false,
      riskLevel: 'critical',
      distanceKm,
      timeDiffHours,
      requiredSpeedKmh,
      message: `Perpindahan ${Math.round(distanceKm)} km dalam ${timeDiffHours.toFixed(1)} jam tidak mungkin (butuh kecepatan ${Math.round(requiredSpeedKmh)} km/jam)`
    };
  }

  if (requiredSpeedKmh > 500) {
    return {
      isPossible: false,
      riskLevel: 'high',
      distanceKm,
      timeDiffHours,
      requiredSpeedKmh,
      message: `Perpindahan mencurigakan: ${Math.round(distanceKm)} km dalam ${timeDiffHours.toFixed(1)} jam`
    };
  }

  if (requiredSpeedKmh > 200) {
    return {
      isPossible: true,
      riskLevel: 'medium',
      distanceKm,
      timeDiffHours,
      requiredSpeedKmh,
      message: 'Perpindahan cepat terdeteksi, mungkin penerbangan'
    };
  }

  return {
    isPossible: true,
    riskLevel: 'low',
    distanceKm,
    timeDiffHours,
    requiredSpeedKmh
  };
}

export function isVPNOrProxy(geoData: IPGeoData): boolean {
  return geoData.proxy || geoData.hosting;
}

export function formatLocationString(geoData: IPGeoData): string {
  const parts = [geoData.city, geoData.regionName, geoData.country].filter(Boolean);
  return parts.join(', ') || 'Unknown Location';
}
