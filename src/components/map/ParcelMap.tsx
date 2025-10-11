"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ParcelFC, ParcelFeature } from "@/lib/types/parcel";
import { PARCEL_COLORS } from "@/constants/colors";
import ParcelPopup from "./ParcelPopup";

type Props = {
  data: ParcelFC;
  filterStatuses: Array<keyof typeof PARCEL_COLORS>;
  query?: string;
};

export default function ParcelMap({ data, filterStatuses, query }: Props) {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !containerRef.current) return;

    console.log('🗺️ ParcelMap: Initializing map with data:', {
      totalFeatures: data.features.length,
      filterStatuses,
      query,
      features: data.features.map(f => ({ id: f.properties.parcel_id, status: f.properties.status }))
    });

    // Clean up existing map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Clear the container
    containerRef.current.innerHTML = '';

    // Dynamically import and create map
    const initMap = async () => {
      try {
        const L = await import('leaflet');

        // Fix default marker icons
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        // Create map
        const map = L.map(containerRef.current!, {
          center: [-1.286389, 36.817223],
          zoom: 13,
        });

        console.log('🗺️ Map created successfully');

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        console.log('🗺️ Tile layer added');

        // Filter data by status
        let filteredFeatures = data.features.filter((f) =>
          filterStatuses.includes(f.properties.status as any)
        );

        console.log('🗺️ After status filter:', filteredFeatures.length, 'features');

        // Filter by query if provided
        if (query && query.trim()) {
          const searchQuery = query.trim().toLowerCase();
          filteredFeatures = filteredFeatures.filter((f) =>
            f.properties.parcel_id.toLowerCase().includes(searchQuery)
          );
          console.log('🗺️ After search filter:', filteredFeatures.length, 'features for query:', query);
        }

        if (filteredFeatures.length === 0) {
          console.log('⚠️ No features to display after filtering');
          mapInstanceRef.current = map;
          return;
        }

        // Add GeoJSON layer
        const geoJsonLayer = L.geoJSON(filteredFeatures as any, {
          style: (feature: any) => {
            const status = feature?.properties?.status as keyof typeof PARCEL_COLORS;
            const color = PARCEL_COLORS[status] ?? "#666";
            console.log('🎨 Styling feature:', feature.properties.parcel_id, 'with color:', color);
            return {
              color,
              weight: 3,
              fillOpacity: 0.4,
              fillColor: color
            };
          },
          onEachFeature: (feature: any, layer: any) => {
            const p = feature.properties;
            if (!p) return;

            const popupContent = `
              <div style="font-weight:600;margin-bottom:4px">Parcel ${p.parcel_id}</div>
              <div style="font-size:12px">Status: ${p.status}</div>
              ${p.area_m2 ? `<div style="font-size:12px">Area: ${Math.round(p.area_m2)} m²</div>` : ""}
              <div style="font-size:12px">Updated: ${new Date(p.updated_at).toLocaleDateString()}</div>
            `;
            layer.bindPopup(popupContent);

            // Add click handler
            layer.on('click', () => {
              console.log('🖱️ Clicked parcel:', p.parcel_id);
            });
          }
        }).addTo(map);

        console.log('🗺️ GeoJSON layer added with', filteredFeatures.length, 'features');

        // If there's a search query and only one result, fly to it
        if (query && query.trim() && filteredFeatures.length === 1) {
          const bounds = geoJsonLayer.getBounds();
          if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [20, 20] });
            console.log('🎯 Flying to search result:', filteredFeatures[0].properties.parcel_id);
          }
        } else if (filteredFeatures.length > 0) {
          // Fit map to show all features
          const bounds = geoJsonLayer.getBounds();
          if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50] });
            console.log('🗺️ Fitted bounds to show all features');
          }
        }

        mapInstanceRef.current = map;

      } catch (error) {
        console.error('❌ Error initializing map:', error);
      }
    };

    initMap();

    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mounted, data, filterStatuses, query]);

  return (
    <div
      ref={containerRef}
      style={{ height: "calc(100vh - 160px)", width: "100%" }}
    />
  );
}
