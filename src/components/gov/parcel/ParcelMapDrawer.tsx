"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";
import * as turf from "@turf/turf";
import { App } from "antd";

interface ParcelMapDrawerProps {
  value?: GeoJSON.Feature<GeoJSON.Polygon> | null;
  onChange?: (geometry: GeoJSON.Feature<GeoJSON.Polygon> | null, area: number) => void;
  mode?: "create" | "edit";
}

export default function ParcelMapDrawer({
  value,
  onChange,
  mode = "create",
}: ParcelMapDrawerProps) {
  const mapRef = useRef<L.Map | null>(null);
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);
  const [currentArea, setCurrentArea] = useState<number>(0);
  const { message } = App.useApp();

  useEffect(() => {
    // Initialize map only once
    if (!mapRef.current) {
      // Center on Africa: Lagos, Nigeria
      const map = L.map("parcel-map").setView([9.082, 8.6753], 6);

      // Add OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Create feature group for drawn items
      const drawnItems = new L.FeatureGroup();
      map.addLayer(drawnItems);
      drawnItemsRef.current = drawnItems;

      // Add drawing controls
      const drawControl = new (L.Control as any).Draw({
        edit: {
          featureGroup: drawnItems,
          edit: true,
          remove: true,
        },
        draw: {
          polygon: {
            allowIntersection: false,
            showArea: true,
            metric: true,
          },
          polyline: false,
          circle: false,
          circlemarker: false,
          marker: false,
          rectangle: true,
        },
      });
      map.addControl(drawControl);

      // Handle drawing created
      map.on((L as any).Draw.Event.CREATED, (event: any) => {
        const layer = event.layer;
        
        // Clear existing layers (single polygon only)
        drawnItems.clearLayers();
        drawnItems.addLayer(layer);

        // Get GeoJSON
        const geoJson = layer.toGeoJSON();
        const area = calculateArea(geoJson);

        // Validate area
        if (area < 10) {
          message.error("Area too small. Minimum area is 10 m²");
          drawnItems.clearLayers();
          return;
        }
        if (area > 100000) {
          message.error("Area too large. Maximum area is 100,000 m²");
          drawnItems.clearLayers();
          return;
        }

        setCurrentArea(area);
        onChange?.(geoJson, area);
      });

      // Handle drawing edited
      map.on((L as any).Draw.Event.EDITED, (event: any) => {
        const layers = event.layers;
        layers.eachLayer((layer: any) => {
          const geoJson = layer.toGeoJSON();
          const area = calculateArea(geoJson);

          if (area < 10 || area > 100000) {
            message.error("Invalid area after edit. Must be between 10 m² and 100,000 m²");
            return;
          }

          setCurrentArea(area);
          onChange?.(geoJson, area);
        });
      });

      // Handle drawing deleted
      map.on((L as any).Draw.Event.DELETED, () => {
        setCurrentArea(0);
        onChange?.(null, 0);
      });

      mapRef.current = map;
    }

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Load existing geometry when value changes (for edit mode)
  useEffect(() => {
    if (value && drawnItemsRef.current && mapRef.current) {
      // Clear existing layers
      drawnItemsRef.current.clearLayers();
      
      // Add the geometry as a GeoJSON layer
      const layer = L.geoJSON(value, {
        style: {
          color: '#3388ff',
          weight: 3,
          opacity: 0.8,
          fillOpacity: 0.3,
        },
      });
      
      layer.eachLayer((l) => {
        drawnItemsRef.current?.addLayer(l);
      });
      
      // Calculate and set area
      const area = calculateArea(value);
      setCurrentArea(area);

      // Fit map to bounds
      mapRef.current.fitBounds(layer.getBounds());
    }
  }, [value]);

  const calculateArea = (geoJson: GeoJSON.Feature<GeoJSON.Polygon>): number => {
    try {
      const area = turf.area(geoJson);
      return Math.round(area * 100) / 100; // Round to 2 decimals
    } catch (error) {
      console.error("Error calculating area:", error);
      return 0;
    }
  };

  const formatArea = (area: number): string => {
    if (area === 0) return "0 m²";
    const acres = area * 0.000247105;
    return `${area.toLocaleString()} m² (${acres.toFixed(2)} acres)`;
  };

  return (
    <div className="space-y-2">
      <div
        id="parcel-map"
        className="w-full h-[500px] rounded-lg border border-gray-300"
      />
      {currentArea > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">📏 Area:</span>
          <span className="text-gray-700">{formatArea(currentArea)}</span>
        </div>
      )}
    </div>
  );
}
