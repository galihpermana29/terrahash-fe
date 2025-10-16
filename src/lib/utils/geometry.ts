/**
 * Geometry Validation Utilities
 *
 * Utilities for validating GeoJSON geometries, checking overlaps,
 * and calculating areas for land parcels.
 */

import type { Feature, Polygon, GeoJsonProperties } from 'geojson';

/**
 * Validates if a GeoJSON string is well-formed
 */
export function isValidGeoJSON(geojsonString: string): boolean {
  try {
    const parsed = JSON.parse(geojsonString);

    // Check if it has required properties
    if (!parsed.type) return false;

    // For Polygon geometry
    if (parsed.type === 'Polygon') {
      if (!Array.isArray(parsed.coordinates)) return false;
      if (parsed.coordinates.length === 0) return false;

      // Check if first ring (exterior) has at least 4 points (3 unique + closing point)
      const exteriorRing = parsed.coordinates[0];
      if (!Array.isArray(exteriorRing) || exteriorRing.length < 4) return false;

      // Check if first and last points are the same (closed ring)
      const first = exteriorRing[0];
      const last = exteriorRing[exteriorRing.length - 1];
      if (first[0] !== last[0] || first[1] !== last[1]) return false;

      return true;
    }

    // For Feature with Polygon geometry
    if (parsed.type === 'Feature') {
      return parsed.geometry && isValidGeoJSON(JSON.stringify(parsed.geometry));
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Calculates area in square meters from GeoJSON Polygon
 * Uses Haversine formula for geographic coordinates
 */
export function calculateAreaM2(geojsonString: string): number {
  try {
    const parsed = JSON.parse(geojsonString);
    let coordinates: number[][][];

    if (parsed.type === 'Polygon') {
      coordinates = parsed.coordinates;
    } else if (parsed.type === 'Feature' && parsed.geometry?.type === 'Polygon') {
      coordinates = parsed.geometry.coordinates;
    } else {
      throw new Error('Invalid GeoJSON: must be Polygon or Feature with Polygon geometry');
    }

    // Get exterior ring (first ring)
    const ring = coordinates[0];

    // Calculate area using shoelace formula for geographic coordinates
    // Note: This is an approximation. For production, use PostGIS on backend.
    let area = 0;
    for (let i = 0; i < ring.length - 1; i++) {
      const [x1, y1] = ring[i];
      const [x2, y2] = ring[i + 1];
      area += x1 * y2 - x2 * y1;
    }
    area = Math.abs(area / 2);

    // Convert from degrees² to m² (approximate, assumes near equator)
    // 1 degree latitude ≈ 111,320 meters
    // 1 degree longitude ≈ 111,320 * cos(latitude) meters
    // For simplicity, using average conversion factor
    const conversionFactor = 111320 * 111320; // m² per degree²

    return area * conversionFactor;
  } catch (error) {
    console.error('Error calculating area:', error);
    return 0;
  }
}

/**
 * Converts square meters to acres
 */
export function m2ToAcres(m2: number): number {
  return m2 / 4046.8564224;
}

/**
 * Formats area for display
 */
export function formatArea(m2: number): string {
  const acres = m2ToAcres(m2);
  return `${acres.toFixed(2)} acres (${m2.toLocaleString()} m²)`;
}

/**
 * Extracts coordinates from GeoJSON for display
 * Returns centroid of the polygon
 */
export function getCentroid(geojsonString: string): { lat: number; lng: number } | null {
  try {
    const parsed = JSON.parse(geojsonString);
    let coordinates: number[][][];

    if (parsed.type === 'Polygon') {
      coordinates = parsed.coordinates;
    } else if (parsed.type === 'Feature' && parsed.geometry?.type === 'Polygon') {
      coordinates = parsed.geometry.coordinates;
    } else {
      return null;
    }

    // Get exterior ring
    const ring = coordinates[0];

    // Calculate centroid
    let latSum = 0;
    let lngSum = 0;
    const pointCount = ring.length - 1; // Exclude closing point

    for (let i = 0; i < pointCount; i++) {
      lngSum += ring[i][0];
      latSum += ring[i][1];
    }

    return {
      lat: latSum / pointCount,
      lng: lngSum / pointCount,
    };
  } catch {
    return null;
  }
}

/**
 * Checks if a point is inside a polygon (for simple overlap detection)
 * Uses ray casting algorithm
 */
export function pointInPolygon(point: [number, number], polygon: number[][]): boolean {
  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];

    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Simple client-side overlap detection
 * Note: This is a basic check. For production, use PostGIS ST_Intersects on backend.
 */
export function checkSimpleOverlap(
  geojson1: string,
  geojson2: string
): boolean {
  try {
    const parsed1 = JSON.parse(geojson1);
    const parsed2 = JSON.parse(geojson2);

    let coords1: number[][][];
    let coords2: number[][][];

    if (parsed1.type === 'Polygon') {
      coords1 = parsed1.coordinates;
    } else if (parsed1.type === 'Feature') {
      coords1 = parsed1.geometry.coordinates;
    } else {
      return false;
    }

    if (parsed2.type === 'Polygon') {
      coords2 = parsed2.coordinates;
    } else if (parsed2.type === 'Feature') {
      coords2 = parsed2.geometry.coordinates;
    } else {
      return false;
    }

    const ring1 = coords1[0];
    const ring2 = coords2[0];

    // Check if any point of polygon1 is inside polygon2
    for (const point of ring1.slice(0, -1)) {
      if (pointInPolygon([point[0], point[1]], ring2)) {
        return true;
      }
    }

    // Check if any point of polygon2 is inside polygon1
    for (const point of ring2.slice(0, -1)) {
      if (pointInPolygon([point[0], point[1]], ring1)) {
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Type for overlap validation response
 */
export interface OverlapCheck {
  hasOverlap: boolean;
  overlaps: Array<{
    id: string;
    type: 'parcel' | 'submission';
    parcel_id?: string;
  }>;
}

/**
 * API call to check geometry overlap (backend validation with PostGIS)
 * This should be called before submitting a new parcel proposal
 */
export async function checkGeometryOverlap(
  geojsonString: string,
  excludeSubmissionId?: string
): Promise<OverlapCheck> {
  try {
    const response = await fetch('/api/submissions/validate-geometry', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        geometry_geojson: geojsonString,
        exclude_submission_id: excludeSubmissionId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to validate geometry');
    }

    return await response.json();
  } catch (error) {
    console.error('Error validating geometry:', error);
    return {
      hasOverlap: false,
      overlaps: [],
    };
  }
}

/**
 * Validates parcel ID format (e.g., TH-0001, KE-1234)
 */
export function isValidParcelId(parcelId: string): boolean {
  // Format: 2-3 uppercase letters, hyphen, 4-6 digits
  const regex = /^[A-Z]{2,3}-\d{4,6}$/;
  return regex.test(parcelId);
}

/**
 * Generates a suggested parcel ID based on country code
 */
export function generateParcelId(countryCode: string = 'TH'): string {
  // Generate random 4-digit number
  const number = Math.floor(1000 + Math.random() * 9000);
  return `${countryCode.toUpperCase()}-${number}`;
}
