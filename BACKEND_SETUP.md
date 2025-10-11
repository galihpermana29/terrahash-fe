# 🚀 TerraHash Backend Setup Guide

Welcome! This guide will help you understand and set up the backend infrastructure for TerraHash.

## 📚 What You've Built So Far

Your backend foundation includes:

### 1. **Supabase Clients** (`src/lib/supabase/`)
- **client.ts**: For browser/client-side operations (safe, limited access)
- **server.ts**: For API routes (full admin access, must stay secret)

### 2. **Type Definitions** (`src/lib/types/`)
- **database.ts**: TypeScript interfaces for all your data models
- Defines: Parcel, ParcelHistory, GovernmentOfficial, Document
- Provides type safety and autocomplete

### 3. **Utility Functions** (`src/lib/utils/`)
- **response.ts**: Helpers for consistent API responses
- **errors.ts**: Custom error classes for better error handling

### 4. **API Endpoint** (`src/app/api/`)
- **health/route.ts**: Health check endpoint to verify API is running

---

## 🎯 Next Steps: Complete Setup

### Step 1: Create Supabase Account & Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up (free tier is perfect for development)
3. Click **"New Project"**
4. Fill in:
   - **Name**: `terrahash` (or your choice)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you
5. Click **"Create new project"**
6. Wait ~2 minutes for provisioning

### Step 2: Get Your API Credentials

1. In your Supabase project, go to **Settings** (gear icon)
2. Click **API** in the sidebar
3. You'll see:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGc...` (safe for client)
   - **service_role**: `eyJhbGc...` (secret, never expose!)

### Step 3: Configure Environment Variables

1. In your project root, create `.env.local`:

```bash
cp env.example .env.local
```

2. Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

⚠️ **IMPORTANT**: Never commit `.env.local` to Git! It's already in `.gitignore`.

### Step 4: Test Your Backend

1. Start the development server:

```bash
npm run dev
```

2. Open your browser and go to:

```
http://localhost:3000/api/health
```

3. You should see:

```json
{
  "status": "healthy",
  "timestamp": "2025-10-09T14:05:00.000Z",
  "environment": "development",
  "version": "1.0.0",
  "checks": {
    "api": "operational",
    "environment": {
      "supabaseUrl": "configured",
      "supabaseKey": "configured"
    }
  }
}
```

✅ If you see `"status": "healthy"`, your backend is working!

---

## 📖 Understanding the Backend Architecture

### How It All Fits Together

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                     │
│  - Map interface                                         │
│  - Admin dashboard                                       │
│  - Wallet connection                                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              NEXT.JS API ROUTES (Backend)                │
│  /api/health      - Health check                         │
│  /api/parcels     - CRUD operations (future)             │
│  /api/officials   - Manage authorized users (future)     │
│  /api/documents   - Document metadata (future)           │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  SUPABASE (PostgreSQL)                   │
│  - parcels table                                         │
│  - parcel_history table                                  │
│  - government_officials table                            │
│  - documents table                                       │
└─────────────────────────────────────────────────────────┘
```

### Data Flow Example: Creating a Parcel

```
1. Government Official clicks "Register Parcel" in UI
   ↓
2. Frontend sends POST request to /api/parcels
   ↓
3. API route validates data (Zod schema)
   ↓
4. API checks if wallet is authorized (government_officials table)
   ↓
5. API creates parcel in Supabase
   ↓
6. API creates history entry
   ↓
7. API returns success response
   ↓
8. Frontend updates map with new parcel
```

---

## 🎓 Learning: Key Backend Concepts

### 1. **Environment Variables**

**What**: Configuration values stored outside your code
**Why**: Keep secrets safe, change config without changing code
**How**: Use `.env.local` file (never commit to Git!)

```typescript
// ✅ Good: Using environment variables
const apiKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ❌ Bad: Hardcoding secrets
const apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
```

### 2. **Client vs Server**

**Client-Side** (Browser):
- Runs in user's browser
- Can be inspected by users
- Use `NEXT_PUBLIC_*` env vars
- Limited permissions (Row Level Security)

**Server-Side** (Next.js):
- Runs on your server
- Users can't see the code
- Use regular env vars (no `NEXT_PUBLIC_`)
- Full database access

### 3. **API Routes**

**What**: Server-side functions that handle HTTP requests
**Where**: `/app/api/` directory
**How**: Export functions named after HTTP methods

```typescript
// File: /app/api/example/route.ts

export async function GET(request: Request) {
  // Handle GET requests
  return Response.json({ message: 'Hello' });
}

export async function POST(request: Request) {
  // Handle POST requests
  const body = await request.json();
  return Response.json({ received: body });
}
```

### 4. **TypeScript Types**

**What**: Definitions of what shape data should have
**Why**: Catch errors before runtime, get autocomplete
**How**: Define interfaces and types

```typescript
// Define the shape
interface Parcel {
  id: string;
  parcel_id: string;
  status: 'UNCLAIMED' | 'OWNED' | 'LEASED';
}

// Use it
const parcel: Parcel = {
  id: '123',
  parcel_id: 'TH-001',
  status: 'OWNED', // ✅ Valid
  // status: 'RENTED' // ❌ TypeScript error!
};
```

### 5. **Error Handling**

**Pattern**: Use try/catch and custom error classes

```typescript
export async function POST(request: Request) {
  try {
    // Your code here
    const data = await createParcel();
    return successResponse(data);
  } catch (error) {
    // Handle errors gracefully
    console.error('Error:', error);
    return serverErrorResponse('Failed to create parcel');
  }
}
```

---

## 🛠️ Common Tasks

### Adding a New API Endpoint

1. Create a new directory in `/app/api/`:
```bash
mkdir -p src/app/api/my-endpoint
```

2. Create `route.ts`:
```typescript
// src/app/api/my-endpoint/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Hello from my endpoint!' });
}
```

3. Test it:
```
http://localhost:3000/api/my-endpoint
```

### Adding a New Type

1. Open `src/lib/types/database.ts`
2. Add your interface:
```typescript
export interface MyNewType {
  id: string;
  name: string;
  created_at: string;
}
```

3. Use it in your code:
```typescript
import { MyNewType } from '@/lib/types/database';

const item: MyNewType = {
  id: '123',
  name: 'Example',
  created_at: new Date().toISOString(),
};
```

---

## 🐛 Troubleshooting

### "Missing Supabase environment variables"

**Problem**: Environment variables not loaded
**Solution**: 
1. Make sure `.env.local` exists in project root
2. Restart the dev server (`npm run dev`)
3. Check variable names match exactly

### "Module not found: Can't resolve '@/lib/...'"

**Problem**: TypeScript path alias not working
**Solution**: Check `tsconfig.json` has:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Health check returns "degraded"

**Problem**: Environment variables not configured
**Solution**: 
1. Create `.env.local` file
2. Add Supabase credentials
3. Restart dev server

---

## 📝 What's Next?

Now that your backend foundation is set up, you can:

### Phase 1: Frontend Development (Your Next Step)
- Build the map interface
- Create the admin dashboard
- Implement wallet connection
- Design the UI/UX

### Phase 2: Backend Features (After Frontend)
You'll come back to implement these API endpoints:

1. **Parcels API**
   - `GET /api/parcels` - List parcels with filters
   - `POST /api/parcels` - Create new parcel
   - `GET /api/parcels/[id]` - Get parcel details
   - `PATCH /api/parcels/[id]` - Update parcel
   - `GET /api/parcels/[id]/history` - Get history

2. **Officials API**
   - `GET /api/officials` - List authorized officials
   - `POST /api/officials` - Add new official

3. **Documents API**
   - `POST /api/documents` - Upload document metadata
   - `GET /api/documents?parcel_id=xxx` - Get documents

### Phase 3: Database Setup
- Create Supabase tables
- Set up Row Level Security
- Add indexes for performance

### Phase 4: Blockchain Integration
- Connect to Hedera network
- Implement smart contract calls
- Sync blockchain ↔ database

---

## 📚 Learning Resources

### Next.js
- [Route Handlers Documentation](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript for JavaScript Programmers](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)

### Supabase
- [Supabase Documentation](https://supabase.com/docs)
- [JavaScript Client Library](https://supabase.com/docs/reference/javascript/introduction)

---

## 🎉 Congratulations!

You've successfully set up the backend foundation for TerraHash! 

**What you've learned:**
- ✅ Environment variable configuration
- ✅ Supabase client setup (client vs server)
- ✅ TypeScript type definitions
- ✅ API route creation in Next.js
- ✅ Error handling patterns
- ✅ Response standardization

**Your backend is now ready for:**
- Frontend development
- Feature implementation
- Database integration
- Blockchain connection

Happy coding! 🚀

---

## 💡 Pro Tips

1. **Always validate input**: Use Zod schemas (we'll add these per feature)
2. **Log everything important**: Use `console.log` for debugging
3. **Test as you go**: Use the health check pattern for each new endpoint
4. **Keep types in sync**: Update types when database schema changes
5. **Read error messages**: They usually tell you exactly what's wrong!

---

## 🆘 Need Help?

If you get stuck:
1. Check the error message carefully
2. Look at the example code in comments
3. Test with the health endpoint first
4. Check environment variables are set
5. Restart the dev server

Remember: Every developer gets stuck sometimes. Debugging is a skill you'll get better at with practice! 💪
