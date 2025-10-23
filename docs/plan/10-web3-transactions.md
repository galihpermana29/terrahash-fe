# Web3 Transaction System Plan

## Overview
Implementation of Web3 cryptocurrency payment system for land purchases with immediate ownership transfer.

## Scope
- ✅ **Purchase transactions only** (lease feature postponed)
- ✅ **Web3 crypto payments** via user wallets
- ✅ **Immediate ownership transfer** on successful payment
- ✅ **Buyer pays all fees**
- ✅ **Simple transaction tracking**

## Database Schema

### Transactions Table
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Core transaction data
  listing_id UUID REFERENCES listings(id) NOT NULL,
  buyer_id UUID REFERENCES users(id) NOT NULL,
  seller_id UUID REFERENCES users(id) NOT NULL,
  parcel_id VARCHAR REFERENCES parcels(parcel_id) NOT NULL,
  
  -- Transaction details
  type VARCHAR DEFAULT 'PURCHASE' CHECK (type IN ('PURCHASE')),
  status VARCHAR NOT NULL CHECK (status IN ('INITIATED', 'COMPLETED', 'FAILED')),
  amount_kes DECIMAL(15,2) NOT NULL,
  
  -- Web3 essentials
  transaction_hash VARCHAR, -- Blockchain transaction hash
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_transactions_buyer_id ON transactions(buyer_id);
CREATE INDEX idx_transactions_parcel_id ON transactions(parcel_id);
CREATE INDEX idx_transactions_tx_hash ON transactions(transaction_hash);
CREATE INDEX idx_transactions_status ON transactions(status);
```

### Transaction Status States
- **INITIATED**: Transaction record created, awaiting Web3 payment
- **COMPLETED**: Blockchain transaction confirmed, ownership transferred
- **FAILED**: Transaction failed (blockchain rejection, insufficient funds, etc.)

## API Endpoints

### Transaction Management
```typescript
// Initiate purchase transaction
POST /api/transactions/initiate
Body: {
  listing_id: string;
}
Response: {
  success: boolean;
  data: {
    transaction_id: string;
    listing: ListingWithParcel;
    seller_wallet: string;
    amount_kes: number;
  };
}

// Complete transaction with blockchain hash
PUT /api/transactions/:id/complete
Body: {
  transaction_hash: string;
}
Response: {
  success: boolean;
  data: {
    transaction: Transaction;
    parcel: Parcel;
  };
}

// Mark transaction as failed
PUT /api/transactions/:id/fail
Body: {
  reason?: string;
}

// Get user transactions
GET /api/transactions
Response: {
  success: boolean;
  data: {
    transactions: TransactionWithDetails[];
    count: number;
  };
}

// Get specific transaction
GET /api/transactions/:id
Response: {
  success: boolean;
  data: {
    transaction: TransactionWithDetails;
  };
}

// Government: Get all transactions
GET /api/transactions/gov
```

### Data Types
```typescript
interface Transaction {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  parcel_id: string;
  type: 'PURCHASE';
  status: 'INITIATED' | 'COMPLETED' | 'FAILED';
  amount_kes: number;
  transaction_hash?: string;
  created_at: string;
  updated_at: string;
}

interface TransactionWithDetails extends Transaction {
  listing: ListingWithParcel;
  buyer: {
    id: string;
    full_name: string;
    wallet_address: string;
  };
  seller: {
    id: string;
    full_name: string;
    wallet_address: string;
  };
  parcel: {
    parcel_id: string;
    area_m2: number;
    admin_region: AdminRegion;
  };
}
```

## Frontend Implementation

### Web3 Integration
```typescript
// Wallet connection
- MetaMask
- WalletConnect  
- Coinbase Wallet
- Trust Wallet

// Supported networks (TBD)
- Ethereum Mainnet
- Polygon
- Other networks as needed

// Payment tokens (TBD)
- ETH, USDC, USDT, etc.
```

### React Components
```typescript
// Transaction flow
<BuyLandModal 
  listing={listing}
  onTransactionComplete={handleComplete}
/>

<Web3TransactionFlow
  transaction={transaction}
  onComplete={handleComplete}
  onFail={handleFail}
/>

// Wallet integration
<WalletConnector />
<NetworkSelector />
<TransactionProgress />

// Management
<TransactionHistory />
<TransactionDetails />
<TransactionStatus />
```

### React Hooks
```typescript
// Web3 wallet management
useWallet() // Connect/disconnect wallet
useWeb3Transaction() // Handle transaction flow
useTransactions() // Fetch user transactions
useTransactionMutations() // Create/update transactions
```

## Transaction Flow

### Purchase Flow
```mermaid
graph TD
    A[User clicks "Buy Now"] --> B[POST /api/transactions/initiate]
    B --> C[Transaction created: INITIATED]
    C --> D[Show Web3 payment modal]
    D --> E[User connects wallet]
    E --> F[User signs & sends transaction]
    F --> G{Blockchain Success?}
    G -->|Yes| H[PUT /api/transactions/:id/complete]
    G -->|No| I[PUT /api/transactions/:id/fail]
    H --> J[Update parcel ownership]
    J --> K[Deactivate listing]
    K --> L[Transaction: COMPLETED]
    I --> M[Transaction: FAILED]
```

### Ownership Transfer Logic
```typescript
// On transaction completion:
1. Update parcel.owner_id = buyer_id
2. Update parcel.status = 'OWNED'
3. Update listing.active = false
4. Update transaction.status = 'COMPLETED'
5. Send notifications to buyer/seller
```

## File Structure

### Database
```
supabase/migrations/
├── 20251024000000_create_transactions.sql
```

### Backend API
```
src/app/api/transactions/
├── route.ts                    # GET, POST /api/transactions
├── [transaction_id]/
│   ├── route.ts               # GET, PUT /api/transactions/:id
│   ├── complete/route.ts      # PUT /api/transactions/:id/complete
│   └── fail/route.ts          # PUT /api/transactions/:id/fail
├── initiate/route.ts          # POST /api/transactions/initiate
└── gov/route.ts               # GET /api/transactions/gov
```

### Frontend
```
src/
├── components/transaction/
│   ├── BuyLandModal.tsx
│   ├── Web3TransactionFlow.tsx
│   ├── WalletConnector.tsx
│   ├── TransactionProgress.tsx
│   ├── TransactionHistory.tsx
│   └── TransactionDetails.tsx
├── hooks/
│   ├── useWallet.ts
│   ├── useWeb3Transaction.ts
│   ├── useTransactions.ts
│   └── useTransactionMutations.ts
├── client-action/
│   └── transaction.ts
├── lib/types/
│   └── transaction.ts
└── app/
    ├── transactions/
    │   ├── page.tsx           # Transaction history
    │   └── [id]/page.tsx      # Transaction details
    └── gov/transactions/
        └── page.tsx           # Gov transaction management
```

## Implementation Phases

### Phase 1: Database & Core API ✅ COMPLETED
- [x] Create transaction table migration
- [x] Build transaction API endpoints
- [x] Add transaction validation logic
- [x] Create transaction types/interfaces
- [x] Create database functions for atomic operations

### Phase 2: Web3 Integration
- [ ] Add Web3 wallet connection
- [ ] Implement transaction signing flow
- [ ] Add blockchain transaction verification
- [ ] Handle transaction success/failure

### Phase 3: Frontend Components
- [ ] Build transaction modal components
- [ ] Add wallet connection UI
- [ ] Create transaction progress tracking
- [ ] Implement transaction history

### Phase 4: Ownership Transfer
- [ ] Implement immediate ownership update
- [ ] Update parcel status on completion
- [ ] Deactivate listing automatically
- [ ] Add transaction notifications

### Phase 5: Management & Monitoring
- [ ] Add transaction history pages
- [ ] Create government transaction oversight
- [ ] Add transaction analytics
- [ ] Implement error handling & recovery

## Security Considerations

### Validation
- Verify listing is active and available
- Ensure buyer has sufficient wallet balance
- Validate transaction hash on blockchain
- Prevent double-spending attacks

### Authorization
- Only buyer can complete their transaction
- Only transaction participants can view details
- Government users can view all transactions
- Secure API endpoints with proper auth

### Data Integrity
- Atomic ownership transfer operations
- Transaction state consistency
- Proper error handling and rollback
- Audit trail via created_at/updated_at

## Testing Strategy

### Unit Tests
- Transaction API endpoints
- Ownership transfer logic
- Validation functions
- Error handling

### Integration Tests
- End-to-end transaction flow
- Web3 wallet integration
- Database transaction consistency
- API error scenarios

### Manual Testing
- Different wallet providers
- Various transaction scenarios
- Network failure handling
- User experience flow

## Future Enhancements

### Phase 2 Features (Post-MVP)
- [ ] Lease payment system
- [ ] Recurring payment automation
- [ ] Multi-token support
- [ ] Transaction fees configuration

### Advanced Features
- [ ] Escrow system
- [ ] Dispute resolution
- [ ] Legal document generation
- [ ] Government approval workflow

## Questions for Implementation

### Technical Decisions Needed
1. **Which blockchain networks to support?**
2. **Which cryptocurrencies/tokens to accept?**
3. **Should we use smart contracts or direct transfers?**
4. **How to handle network fees and gas estimation?**

### Business Logic
1. **Transaction timeout handling?**
2. **Partial payment support?**
3. **Refund policy for failed transactions?**
4. **Multi-signature wallet support?**

---

**Status**: Phase 1 Complete ✅  
**Next Step**: Begin Phase 2 - Web3 Integration  
**Estimated Timeline**: 1-2 weeks remaining for Phases 2-4
