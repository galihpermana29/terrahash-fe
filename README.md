<div align="center">

# TerraHash - Decentralized Land Registry Platform
## Track - Onchain Finance & Real-World Assets (RWA)

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript&logoColor=white)
![Hedera](https://img.shields.io/badge/Hedera-Hashgraph-purple?style=for-the-badge&logo=hedera&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=for-the-badge&logo=supabase&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

![Web3](https://img.shields.io/badge/Web3-Enabled-orange?style=flat-square&logo=web3.js&logoColor=white)
![PostGIS](https://img.shields.io/badge/PostGIS-Spatial-blue?style=flat-square&logo=postgresql&logoColor=white)
![Network](https://img.shields.io/badge/Hedera-Testnet-purple)
![IPFS](https://img.shields.io/badge/IPFS-Pinata-65C2CB?style=flat-square&logo=ipfs&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Storage-3448C5?style=flat-square&logo=cloudinary&logoColor=white)
![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)

**A Web3-based land registry system for transparent and secure land ownership management in Africa using Hedera Hashgraph**

### [Certificate Hashgraph Developer](https://certs.hashgraphdev.com/bec02a95-b027-43ed-9660-91382d5260e8.pdf) • [Pitch Deck](https://www.canva.com/design/DAG1eRd16cM/wpStiA9qHY1pCEfi8oWeXA/edit?utm_content=DAG1eRd16cM&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton) • [Dorahacks BUIDL](https://dorahacks.io/buidl/34906)

</div>

---
# Website : [terrahash.xyz](https://terrahash.xyz)

---
## Overview

TerraHash is a comprehensive land registry and marketplace platform that enables:
- **Transparent Land Ownership** - Hashgraph-verified land parcels with clear boundaries
- **Government Administration** - Streamlined parcel management for government officials
- **Public Marketplace** - Buy, sell, and lease land with HBAR cryptocurrency
- **Land Objections** - Community-driven dispute resolution system
- **Geospatial Mapping** - Interactive maps with precise GPS coordinates

## Features

### For Public Users
![Interactive Map](https://pouch.jumpshare.com/preview/17ZRnmF71zKsoXp4R3bw3sGnwKUQ2ykTZpYZmR721Ti5IlmFdiLKg4au3iO2YbospnFtxFOH8HIud0dD7XBisgVnR_-zbA2SV83W8CXHay0)
- **Wallet-Based Authentication** - Connect with MetaMask **Hedera Wallet Snaps**
- **Interactive Map** - Browse available land parcels with filters
- **My Land Dashboard** - Manage owned parcels and listings
- **Marketplace** - Create SALE or LEASE listings with flexible pricing
- **Land Objections** - Submit concerns about parcels for government review
- **Hedera Support Wallet Payments** - Purchase land with HBAR cryptocurrency

![Account Hedera ID](https://s12.gifyu.com/images/b3iwA.png)


### For Government Officials
- **Parcel Management** - Create, edit, and manage land parcels
- **Marketplace Oversight** - Monitor all active listings
- **Objection Management** - Review and resolve public objections
- **Transaction History** - Audit trail of all land transfers
- **Whitelist Control** - Managed access via root admin

### For Root Administrators
- **Whitelist Management** - Add/remove government officials
- **System Configuration** - Platform-wide settings control
### More at https://www.terrahash.xyz
----
## Architecture Diagram - Tech Stack
![Tech Stack](https://s12.gifyu.com/images/b3i3Z.png)
### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS + Ant Design + @gal-ui/components
- **Maps**: Leaflet with drawing tools
- **State Management**: Zustand + TanStack Query

### Backend
- **API**: Next.js Route Handlers
- **Database**: Supabase (PostgreSQL + PostGIS)
- **File Storage**: Cloudinary
- **Authentication**: Wallet-based (custom session management)

### Hedera
- **Network**: Hedera Hashgraph (Testnet)
- **Wallet**: Wagmi + Metamask + Hedera Wallet Snaps
- **NFTs (HTS)**: HIP-412 @2.0.0 metadata compliant land certificates
- **Topics (HCS)**: Hedera Consensus Service for lease/objection records

**Note**: Users must have HBAR in their Hedera account. Get testnet HBAR from [Hedera Portal](https://portal.hedera.com).

## Flowchart - Workflow Steps

### Current All Flow :
![Architecture Diagram](https://s12.gifyu.com/images/b3iqb.png)

**Objective: Configure a wallet to have government-level permissions for testing purposes.**

**Steps:**

1. Navigate to the testing-only admin URL: [www.terrahash.xyz/root-admin](www.terrahash.xyz/root-admin) (Note: This is a mock URL for the test plan).
2. Login using this testing admin account: ROOT_ADMIN_WALLETS (set in .env (provided in BUIDL submission)
3. Enter the wallet address into the "Register Government Wallet" field and submit.
4. **Expected Result:** The system should now recognize this wallet as an authorized government agent, granting it access to the land registration features.

**General steps**

1. Navigate to the TerraHash Website : [www.terrahash.xyz](www.terrahash.xyz)
2. Connect your authorized Government Wallet.


#### Goverment :
![Goverement](https://s12.gifyu.com/images/b3iqK.png)

**Government - Land Registration**

1. Click on the "Register New Land/Add Parcel" form.
2. Accurately draw the geospatial polygon on the interactive map for the property.
3. Fill in the location details (Country, Province, etc.).
4. Click "Submit for Verification & Mint NFT".
5. Verification: Navigate to the public homepage and confirm the new property "Unclaimed" is visible in the "Public Verification" section with a 30-day countdown.
6. Final Transfer: Go back to the Government Portal dashboard. You should see a notification that the title is "Verified & Ready for Transfer".

#### Land Owner :
![Land Owner](https://s12.gifyu.com/images/b3iqH.png)

**Land Owner - List Property for lease/Sell**

1. Go to the "Profile" dashboard.
2. Select the property you wish to list.
3. Click the **"Create Listing"** button.
4. On the Owner Listing Form, select **"Offer the Property for Lease"** / **"Sell Property"** button 

For Sale :

5. Enter price for the sell land value

For Leasing :

6. Select a **Lease Duration** from the available options (e.g., 5 Years).
7. Enter the **"Price per Year"** for the lease.
8. Click **"Create Listing"** and approve the transaction in your wallet.

#### Investor :
![Investor](https://s12.gifyu.com/images/b3iqx.png)

**Investor - Buy / Offer Lease property**

1. Navigate to the TerraHash marketplace.
2. Find and select the property listed for lease.
3. On the property page,

For Buy :

4. click **"Buy"** and it will trigger your wallet for payment and transfer NFT.

For Leasing :

5. click **"Lease"** this property.
6. You will be taken to the Investor Lease Offer Form. The price will be pre-filled and non-editable.
7. Select a **Lease Duration** from the options the owner has set.
8. Fill in the mandatory **"Project Plan & Community Benefit"** sections.
9. Click **"Submit Lease Offer"**.
10. Your offer will appear on your profile page, tab **Lease Request**
11. When your offer is accepted by land owner, click button “**Pay**”
12. Your wallet will prompt you to approve the transaction, which will create the lease smart contract and transfer the initial funds.

**Land Owner - See Leasing Offer**

1. Open profile page
2. go to tab “**Review Lease Offer**”
3. Click “See Detail” to see lease offer detail

## Key Concepts

### User Types
- **PUBLIC**: Regular users who can buy/sell/lease land
- **GOV**: Government officials who manage parcels
- **ROOT**: System administrators (configured via env var)

### Parcel Status
- **UNCLAIMED**: Available land without ownership
- **OWNED**: Land with verified owner

### Listing Types
- **SALE**: One-time purchase - Transfer NFT Ownership
- **LEASE**: Recurring monthly/6-month/yearly payments

### Transaction Flow
1. Owner creates listing (SALE/LEASE)
2. Buyer initiates purchase from listing
3. Payment processed via Hedera (HBAR)
4. NFT ownership transferred
5. Parcel ownership updated in database
6. Transaction recorded on-chain and off-chain

### Authentication

TerraHash uses wallet-based authentication:
1. User connects Web3 wallet (MetaMask - Hedera Wallet Snaps)
2. EVM address converted to Hedera Account ID (e.g 0x000 -> 0.0.xxxx)
3. System checks if user exists in database
4. New users register with wallet + name
5. Session stored in httpOnly cookie

## Hedera Integration Summary

### Hedera Token Service (HTS) for NFT Land Certificates

TerraHash uses the Hedera Token Service (HTS) to tokenize verified land parcels as HIP-412 compliant NFTs, embedding metadata such as geospatial coordinates, ownership data, and certification imagery. We chose HTS for its low, predictable fees and native support for NFT metadata, allowing governments to issue and manage land titles on-chain at minimal operational cost. This creates digitally verifiable certificates of ownership that can be transferred securely using HBAR, without relying on legacy paper systems.

#### Deployed Hedera NFT ID: 0.0.7158288 

#### NFT Land Certificates (HIP412 @2.0.0)
Each parcel is minted as an NFT with metadata:
- Parcel ID, location, area, boundaries
- Images and certificate URL
- Stored on IPFS via Pinata

##### **Example NFT :**
<img src="https://s12.gifyu.com/images/b3iTU.png" alt="Example TerraHash NFT" width="700" />

##### **Example Metadata :**

```json
{
  "format": "HIP412@2.0.0",
  "creator": "Gov.terrahash",
  "description": "Located within The Wilds Estateone of Pretoria Easts most prestigious residential developmentsyoull enjoy 24-hour manned security, beautifully landscaped gardens, and lifestyle amenities including a private clubhouse, swimming pool, tennis and squash courts, and walking trails that wind through the estates indigenous greenery. ",
  "image": "https://res.cloudinary.com/doicwhv8l/image/upload/v1761766585/hedera-parcels/kxjp4lydkkznzyngimda.png",
  "type": "image/png",
  "files": [
    {
      "uri": "https://res.cloudinary.com/doicwhv8l/image/upload/v1761766601/hedera-parcels/hhi3wfnpksse3xksfwgv.jpg",
      "type": "image/jpeg",
      "is_default_file": true
    },
    {
      "uri": "https://res.cloudinary.com/doicwhv8l/image/upload/v1761766601/hedera-parcels/dd0l0v9xd0noxt5llhmq.jpg",
      "type": "image/jpeg",
      "is_default_file": false
    }
  ],
  "attributes": [
    {
      "trait_type": "Country",
      "value": "South Africa"
    },
    {
      "trait_type": "State",
      "value": "Gauteng"
    },
    {
      "trait_type": "City",
      "value": "Pretoria"
    },
    {
      "trait_type": "Area (m²)",
      "value": 2437.88
    },
    {
      "trait_type": "GeoPoint Type",
      "value": "Feature"
    },
    {
      "trait_type": "GeoPoint Coordinates",
      "value": [
        [
          28.334482,
          -25.819155
        ],
        [
          28.334798,
          -25.819153
        ],
        [
          28.334828,
          -25.819662
        ],
        [
          28.334782,
          -25.819718
        ],
        [
          28.334404,
          -25.819723
        ],
        [
          28.334399,
          -25.819501
        ],
        [
          28.334482,
          -25.819155
        ]
      ]
    }
  ]
}
```

### Hedera Consensus Service (HCS) for Immutable Public Records
#### Deployed Hedera HCS ID: EVERY PARCEL ADDED
Each land lease and community objection is logged to a dedicated Hedera Consensus Service (HCS) topic, producing a tamper-evident, timestamped record of all governance actions. We use HCS to ensure transparent, immutable logging of critical public events a vital feature for dispute resolution and citizen trust. Its predictable $0.0008 per-message fee makes continuous, large-scale event tracking financially sustainable even for developing regions.

### Hedera Mirror Nodes for Public Verifiability

TerraHash reads live on-chain data, including NFT ownership, lease status, and objection records from Hedera Mirror Nodes. This ensures that on-chain truth remains synchronized with TerraHash’s off-chain systems in Supabase. Mirror Nodes were chosen for their open, scalable data access that allows both auditors and the public to verify land transactions independently, strengthening accountability without needing centralized servers.

### Hedera Wallet Snaps (MetaMask) for Seamless Web3 Access

Through Hedera Wallet Snaps integrated in MetaMask, users can connect familiar EVM wallets and seamlessly interact with Hedera accounts (0.0.x). This lowers the onboarding barrier for non-technical users while maintaining secure, signature-based authentication. Wallet-based login ensures every parcel registration or transaction is cryptographically linked to its verified wallet owner, eliminating the need for traditional username-password systems.

### HBAR Payments for Borderless, Transparent Transactions

All financial operations from land purchases to lease payments, from land purchases to lease payments are executed using HBAR, Hedera’s native cryptocurrency. Payments settle atomically with NFT transfers, ensuring instant and trustless ownership change. HBAR’s low, stable transaction cost makes it ideal for real estate markets in emerging economies, where accessibility, affordability, and speed are essential for broad adoption.


### Transaction Types

- `mintNFT()` or `TokenMintTransaction()` : Create NFT land certificate
- `TransferToken()` or `TransferTransaction()`: Transfer NFT ownership
-  `ApproveNftAllowanceParams`: Give allowance NFT token to TerraHash 
- `updateNFTMetadata()` or `TokenUpdateNftsTransaction()`: Update NFT certificate data
- `createTopicWithMemo()` or `TopicCreateTransaction()`: Initialize topic
- `submitMessageToTopic()` or `TopicMessageSubmitTransaction()`: Record events lease or objection

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Supabase account ([supabase.com](https://supabase.com))
- Cloudinary account ([cloudinary.com](https://cloudinary.com))
- Pinata account ([pinata.cloud](https://pinata.cloud)) for IPFS
- MetaMask, Hashpack or compatible Web3 wallet
- Hedera testnet account with HBAR ([portal.hedera.com](https://portal.hedera.com))

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/galihpermana29/terrahash-fe.git
cd terrahash
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set Up Supabase Database

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** in your Supabase dashboard
3. Run all migrations in order from `supabase/migrations/` directory
   - Start with `001_initial_schema.sql`
   - Run subsequent migrations in chronological order
4. Verify tables were created successfully in **Table Editor**

### 4. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Hedera Hashgraph
NEXT_PUBLIC_HEDERA_NETWORK=testnet
NEXT_PUBLIC_HEDERA_OPERATOR_ID=0.0.xxxxx
NEXT_PUBLIC_HEDERA_OPERATOR_KEY=your_private_key
NEXT_PUBLIC_HEDERA_METADATA_KEY=your_metadata_key
NEXT_PUBLIC_HEDERA_TREASURY_ID=0.0.xxxxx
NEXT_PUBLIC_HEDERA_NFT_ID=0.0.xxxxx

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_KEY=your_api_key
CLOUDINARY_SECRET=your_api_secret

# Pinata (IPFS)
NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt
NEXT_PUBLIC_GATEWAY_URL=your_gateway_url

# Root Admin
ROOT_ADMIN_WALLETS=0.0.xxxxx

```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
terrahash-fe/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (public)/          # Public routes (map, home)
│   │   ├── api/               # API endpoints
│   │   ├── gov/               # Government dashboard
│   │   ├── user/              # User dashboard
│   │   └── root-admin/        # Root admin panel
│   ├── components/            # React components
│   ├── contexts/              # React contexts (Auth)
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utilities and types
│   │   ├── hedera/           # Hedera Hashgraph integration
│   │   ├── supabase/         # Database clients
│   │   ├── types/            # TypeScript types
│   │   └── utils/            # Helper functions
│   └── client-action/         # API client functions
├── supabase/
│   └── migrations/            # Database migrations
├── public/                    # Static assets
└── docs/                      # Documentation
```



## Database Schema

Key tables:
- `users` - All platform users
- `gov_whitelist` - Authorized government officials
- `parcels` - Land parcels with PostGIS geometry
- `listings` - Marketplace SALE/LEASE listings
- `transactions` - Purchase/lease records
- `objections` - Public land objections

See `supabase/migrations/` for complete schema.

## API Documentation

### Public Endpoints
- `GET /api/health` - System health check
- `GET /api/parcels` - List all parcels
- `GET /api/parcels/[id]` - Get parcel details
- `GET /api/public-lists` - Public parcel listings

### Authenticated Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Government Endpoints (GOV only)
- `POST /api/parcels` - Create parcel
- `PATCH /api/parcels/[id]` - Update parcel
- `DELETE /api/parcels/[id]` - Delete parcel
- `GET /api/listings/gov` - View all listings
- `GET /api/objections/gov` - View all objections

### Root Admin Endpoints (ROOT only)
- `GET /api/wallet/whitelists` - List whitelisted officials
- `POST /api/wallet/whitelists` - Add official
- `PATCH /api/wallet/whitelists` - Toggle official status

## Testing

1. **Health Check**
   ```bash
   curl http://localhost:3000/api/health
   ```

2. **Test User Registration**
   - Connect wallet at `/`
   - Complete registration form
   - Check Supabase `users` table

3. **Test Parcel Creation** (GOV only)
   - Login as government user
   - Navigate to `/gov/parcel-management`
   - Click "Add Parcel" and draw boundary

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Environment Variables Checklist
- ✅ All Supabase credentials
- ✅ Hedera operator keys
- ✅ HTS - NFT ID and metadata Key
- ✅ Pinata JWT and gateway
- ✅ Cloudinary credentials
- ✅ Root admin wallet address


## Troubleshooting

### "Hedera account not found"
- Ensure wallet has HBAR in Hedera testnet
- Get testnet HBAR from [Hedera Portal](https://portal.hedera.com)

### "Parcel ID already exists"
- Parcel IDs are auto-generated: `PARCEL-{tokenId}-{serialNumber}`
- Check database for duplicates

### "Invalid geometry"
- Ensure polygon is closed (first point = last point)
- Use Leaflet drawing tool to ensure valid GeoJSON

### Map not displaying
- Check browser console for errors
- Verify Leaflet CSS is loaded
- Ensure parcels have valid `geometry_geojson`

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Hedera Hashgraph](https://hedera.com) for Web3 infrastructure
- [Supabase](https://supabase.com) for database and authentication
- [Next.js](https://nextjs.org) for the framework
- [Wagmi](https://wagmi.sh) for wallet connectivity
- [Hedera Wallet Snaps](https://snaps.metamask.io/snap/npm/hashgraph/hedera-wallet-snap/) for request signature
- [Leaflet](https://leafletjs.com) for mapping

## Support

- **Documentation**: See `BACKEND_SETUP.md` and `PROJECT_PLAN.md`
- **Issues**: [GitHub Issues](https://github.com/galihpermana29/terrahash/issues)
- **Email**: support@terrahash.xyz


---
<div align="center">
<h2> Who's Behind </h2>
<table align="center">
  <tr>
    <td align="center" width="33%">
      <img src="https://github.com/youvandra.png" width="120px" style="border-radius: 50%;" alt="Youvandra"/><br />
      <sub><b>Youvandra</b></sub><br />
      <sub>Web3 Engineer</sub><br /><br />
      <a href="https://github.com/youvandra">
        <img src="https://img.shields.io/badge/GitHub-100000?style=flat&logo=github&logoColor=white" alt="GitHub"/>
      </a>
    </td>
    <td align="center" width="33%">
      <img src="https://github.com/galihpermana29.png" width="120px" style="border-radius: 50%;" alt="Teammate 1"/><br />
      <sub><b>Teammate Name</b></sub><br />
      <sub>Full-stack Developer</sub><br /><br />
      <a href="https://github.com/galihpermana29">
        <img src="https://img.shields.io/badge/GitHub-100000?style=flat&logo=github&logoColor=white" alt="GitHub"/>
      </a>
    </td>
  </tr>
</table>


Building the Operating System for Prosperity
</div>