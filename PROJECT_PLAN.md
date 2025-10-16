# TerraHash - Complete Project Plan

## Project Overview
Land registry and marketplace platform for Africa with wallet-based authentication, parcel submission workflow, and government moderation.

## Tech Stack
- **Frontend**: Next.js 15, React, TypeScript, TailwindCSS, Ant Design, @gal-ui/components
- **Map**: Leaflet with drawing tools
- **Wallet**: RainbowKit + wagmi
- **Backend**: Next.js API Routes (Route Handlers)
- **Database**: Supabase (PostgreSQL with PostGIS)
- **File Storage**: Cloudinary (max 2MB per file)
- **Blockchain**: Off-chain for now, with optional txHash fields for future

## Core Domain Model
- **User**: `type: 'PUBLIC' | 'GOV'`, wallet-based auth only
- **Parcel**: `status: 'UNCLAIMED' | 'OWNED'`, has `owner_id`
- **Submission**: Public user proposals, reviewed by government
- **Evidence**: Documents attached to submissions
- **Listing**: `type: 'SALE' | 'LEASE'`, marketplace intent

## Features Overview
1. ✅ Landing Page (responsive, completed)
2. ✅ Map Page (filters, cards, completed)
3. ✅ Navbar (wallet dropdown, completed)
4. 🔲 Authentication & User Management
5. 🔲 Public User Dashboard
6. 🔲 Parcel Submission Flow
7. 🔲 Government Admin Dashboard
8. 🔲 Root Admin Dashboard (Whitelist Management)
9. 🔲 Listing Management (Sale/Lease)
10. 🔲 Parcel Details Page

---

## Detailed Feature Checklists

See individual feature files:
- [01-authentication.md](./docs/plan/01-authentication.md)
- [02-public-dashboard.md](./docs/plan/02-public-dashboard.md)
- [03-submission-flow.md](./docs/plan/03-submission-flow.md)
- [04-government-dashboard.md](./docs/plan/04-government-dashboard.md)
- [05-root-admin.md](./docs/plan/05-root-admin.md)
- [06-listing-management.md](./docs/plan/06-listing-management.md)
- [07-parcel-details.md](./docs/plan/07-parcel-details.md)
- [08-map-enhancements.md](./docs/plan/08-map-enhancements.md)
- [09-clarifications.md](./docs/plan/09-clarifications.md) - **Important: Read this first!**

---

## Progress Summary
- ✅ Completed: 3 features + Database schema
- 🔲 Pending: 8 features
- Total Tasks: ~120+ individual tasks

## Recent Updates (Oct 15, 2025)
- ✅ Created comprehensive database schema (`supabase/migrations/001_initial_schema.sql`)
- ✅ Clarified ambiguous flows in [09-clarifications.md](./docs/plan/09-clarifications.md)
- ✅ Added PostGIS spatial validation for submission geometries
- ✅ Defined ownership transfer workflow (Web2 → Web3)
- ✅ Configured root admin via environment variables

Last Updated: Oct 15, 2025
