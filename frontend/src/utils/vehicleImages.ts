/**
 * Vehicle Category Image Resolver & Directory Mapping
 *
 * Provides centralized resolution for real vehicle photographs,
 * transparent cutouts, and user-uploaded custom vehicle assets.
 */

export interface VehicleImageResult {
  src: string;
  isRealPhoto: boolean;
  isCutout: boolean;
  alt: string;
}

export interface VehicleImageOptions {
  preferCutout?: boolean;
}

export const VEHICLE_IMAGE_CATALOG = {
  // Heavy Commercial Vehicles (Goods Lorry / Truck / Tipper / Tanker)
  heavyGoods: {
    photo: '/images/hero-lorry.webp',
    cutout: '/images/hero-lorry-cutout.webp',
    alt: 'Commercial Heavy Goods Carrier Lorry',
  },
  // Passenger Bus & Coach
  coachBus: {
    photo: '/images/Intercity-Coach.webp',
    cutout: '/images/Intercity-Coach-cutout.webp',
    alt: 'Commercial Luxury Intercity Passenger Coach Bus',
  },
  // Force Tempo Traveller / Maxi Cab / Van
  tempoTraveller: {
    photo: '/images/tempo-traveller.webp',
    cutout: '/images/tempo-traveller-cutout.webp',
    alt: 'Force Motors Commercial Tempo Traveller Maxi Cab',
  },
  // Commercial Tourist Taxi / Sedan / Innova Cab
  commercialTaxi: {
    photo: '/images/taxi-cab.webp',
    cutout: '/images/taxi-cab-cutout.webp',
    alt: 'Commercial Tourist Taxi Sedan Cab',
  },
  // Commercial Auto-Rickshaw / Three-Wheeler
  autoRickshaw: {
    photo: '/images/auto-rickshaw.webp',
    cutout: '/images/auto-rickshaw-cutout.webp',
    alt: 'Commercial Bajaj Auto-Rickshaw Three-Wheeler',
  },
  // Highway / Fleet Background Scene
  highwayScene: {
    photo: '/images/fleet-highway.webp',
    cutout: '/images/fleet-highway.webp',
    alt: 'Commercial Fleet Highway Telemetry Background',
  },
} as const;

/**
 * Resolves the appropriate vehicle photograph or category representative image.
 *
 * @param category Raw vehicle category string from backend or specs
 * @param userPhotoUrl Optional custom photo URL uploaded by fleet operator
 * @param options Configuration options (e.g. preferCutout)
 */
export function getVehicleImage(
  category?: string | null,
  userPhotoUrl?: string | null,
  options: VehicleImageOptions = { preferCutout: true }
): VehicleImageResult {
  // 1. If operator has uploaded a custom photograph, prioritize it
  if (userPhotoUrl && userPhotoUrl.trim() !== '') {
    return {
      src: userPhotoUrl.trim(),
      isRealPhoto: true,
      isCutout: false,
      alt: 'Operator Verified Vehicle Photograph',
    };
  }

  const cat = (category || '').toLowerCase().trim();
  const useCutout = options.preferCutout !== false;

  // 2. Intercity Bus / Coach
  if (
    cat.includes('bus') ||
    cat.includes('coach') ||
    cat.includes('omni') ||
    cat === 'bus'
  ) {
    return {
      src: useCutout
        ? VEHICLE_IMAGE_CATALOG.coachBus.cutout
        : VEHICLE_IMAGE_CATALOG.coachBus.photo,
      isRealPhoto: true,
      isCutout: useCutout,
      alt: VEHICLE_IMAGE_CATALOG.coachBus.alt,
    };
  }

  // 3. Force Tempo Traveller / Maxi Cab
  if (
    cat.includes('tempo') ||
    cat.includes('traveller') ||
    cat.includes('traveler') ||
    cat.includes('maxi') ||
    cat.includes('van') ||
    cat === 'tempo_traveller'
  ) {
    return {
      src: useCutout
        ? VEHICLE_IMAGE_CATALOG.tempoTraveller.cutout
        : VEHICLE_IMAGE_CATALOG.tempoTraveller.photo,
      isRealPhoto: true,
      isCutout: useCutout,
      alt: VEHICLE_IMAGE_CATALOG.tempoTraveller.alt,
    };
  }

  // 4. Commercial Tourist Taxi Cab / Sedan / SUV
  if (
    cat.includes('taxi') ||
    cat.includes('cab') ||
    cat.includes('sedan') ||
    cat.includes('suv') ||
    cat.includes('tourist') ||
    cat === 'sedan_taxi'
  ) {
    return {
      src: useCutout
        ? VEHICLE_IMAGE_CATALOG.commercialTaxi.cutout
        : VEHICLE_IMAGE_CATALOG.commercialTaxi.photo,
      isRealPhoto: true,
      isCutout: useCutout,
      alt: VEHICLE_IMAGE_CATALOG.commercialTaxi.alt,
    };
  }

  // 5. Commercial Auto-Rickshaw / Three-Wheeler
  if (
    cat.includes('auto') ||
    cat.includes('rickshaw') ||
    cat.includes('three') ||
    cat === 'auto_rickshaw'
  ) {
    return {
      src: useCutout
        ? VEHICLE_IMAGE_CATALOG.autoRickshaw.cutout
        : VEHICLE_IMAGE_CATALOG.autoRickshaw.photo,
      isRealPhoto: true,
      isCutout: useCutout,
      alt: VEHICLE_IMAGE_CATALOG.autoRickshaw.alt,
    };
  }

  // 6. Heavy Goods Lorry / Truck / Tanker / Container / Trailer / Default
  return {
    src: useCutout
      ? VEHICLE_IMAGE_CATALOG.heavyGoods.cutout
      : VEHICLE_IMAGE_CATALOG.heavyGoods.photo,
    isRealPhoto: true,
    isCutout: useCutout,
    alt: VEHICLE_IMAGE_CATALOG.heavyGoods.alt,
  };
}
