# Feature 08: Map Enhancements

## Overview
Improvements to the existing map page for better UX and functionality.

---

## Frontend Tasks

### Map Interactions
- [ ] **Clustering** for dense areas
  - [ ] Use Leaflet.markercluster
  - [ ] Group nearby parcels into clusters
  - [ ] Show count badge on cluster
  - [ ] Expand on click
  
- [ ] **Improved Popups**
  - [ ] Show parcel thumbnail image (if available)
  - [ ] Display key info: ID, status, owner, listing
  - [ ] Quick actions: View Details, Contact Owner
  - [ ] Close button
  
- [ ] **Tooltip on Hover**
  - [ ] Show parcel ID on marker hover
  - [ ] Show listing type badge
  
- [ ] **Highlight Selected Parcel**
  - [ ] If URL has ?q=parcel_id, highlight that parcel
  - [ ] Zoom to parcel boundary
  - [ ] Open popup automatically
  - [ ] Different color/style for highlighted parcel

### Search Enhancements
- [ ] **Autocomplete Search**
  - [ ] As user types, suggest parcel IDs
  - [ ] Show recent searches
  - [ ] Clear search button
  
- [ ] **Location Search**
  - [ ] Search by city/region name
  - [ ] Geocoding API integration (Mapbox/Google)
  - [ ] Zoom to searched location
  
- [ ] **Advanced Filters Panel**
  - [ ] Toggle panel (slide-in from left)
  - [ ] Filters:
    - [ ] Status (All/Unclaimed/Owned)
    - [ ] Listing Type (All/Sale/Lease/None)
    - [ ] Price Range (slider)
    - [ ] Area Range (slider)
    - [ ] Location (country, state, city dropdowns)
  - [ ] Apply/Reset buttons
  - [ ] Show active filter count badge

### Map Controls
- [ ] **Layer Switcher**
  - [ ] Toggle between map styles (Street/Satellite/Terrain)
  - [ ] Use Leaflet layer control
  
- [ ] **Geolocation Button**
  - [ ] "Find My Location" button
  - [ ] Request user location permission
  - [ ] Center map on user's location
  
- [ ] **Fullscreen Toggle**
  - [ ] Button to enter/exit fullscreen mode
  - [ ] Use Leaflet.fullscreen plugin
  
- [ ] **Measure Tool** (optional)
  - [ ] Allow users to measure distances
  - [ ] Draw line to measure
  - [ ] Show distance in km/miles

### Performance
- [ ] **Lazy Load Parcels**
  - [ ] Only load parcels in current viewport
  - [ ] Load more as user pans/zooms
  - [ ] Use viewport bounds in API query
  
- [ ] **Debounce Search**
  - [ ] Delay search API call until user stops typing
  - [ ] Show loading indicator
  
- [ ] **Cache Map Tiles**
  - [ ] Use service worker to cache tiles
  - [ ] Improve offline experience

### Mobile Optimizations
- [ ] **Touch Gestures**
  - [ ] Pinch to zoom
  - [ ] Two-finger pan
  - [ ] Tap to select parcel
  
- [ ] **Mobile Filter Panel**
  - [ ] Bottom sheet instead of sidebar
  - [ ] Swipe up to open, swipe down to close
  
- [ ] **Compact Card View**
  - [ ] Smaller cards on mobile
  - [ ] Horizontal scroll for results
  - [ ] "View All" button to expand

---

## Backend Tasks

### API Enhancements

- [ ] **GET /api/parcels (viewport query)**
  - [ ] Query params: bounds (north, south, east, west)
  - [ ] Return only parcels within bounds
  - [ ] Use PostGIS spatial query
  - [ ] Optimize with spatial index
  
- [ ] **GET /api/parcels/search**
  - [ ] Query param: q (search term)
  - [ ] Search by parcel_id (fuzzy match)
  - [ ] Search by location (admin_region)
  - [ ] Return matching parcels (limit 10)
  - [ ] Use for autocomplete
  
- [ ] **GET /api/parcels/nearby**
  - [ ] Query params: lat, lng, radius_km
  - [ ] Return parcels within radius
  - [ ] Use PostGIS ST_DWithin
  - [ ] Used for "Related Parcels" feature

### Database Optimizations
- [ ] Add spatial index on parcels.geometry
  ```sql
  CREATE INDEX idx_parcels_geometry ON parcels USING GIST(ST_GeomFromGeoJSON(geometry_geojson));
  ```
  
- [ ] Add full-text search index on parcel_id and admin_region
  ```sql
  CREATE INDEX idx_parcels_search ON parcels USING GIN(to_tsvector('english', parcel_id || ' ' || admin_region::text));
  ```

---

## Testing Checklist
- [ ] Clustering works on dense areas
- [ ] Popups display correct info
- [ ] Tooltip shows on hover
- [ ] Highlighted parcel zooms correctly
- [ ] Autocomplete suggests parcel IDs
- [ ] Location search finds places
- [ ] Advanced filters apply correctly
- [ ] Layer switcher changes map style
- [ ] Geolocation centers on user
- [ ] Fullscreen mode works
- [ ] Viewport query loads only visible parcels
- [ ] Search is debounced
- [ ] Mobile gestures work
- [ ] Mobile filter panel opens/closes
- [ ] Performance is smooth with 1000+ parcels

---

## Dependencies
- Leaflet.markercluster (clustering)
- Leaflet.fullscreen (fullscreen)
- Leaflet layer control (built-in)
- Geocoding API (Mapbox/Google)
- PostGIS (spatial queries)

## Status
🔲 Not Started
