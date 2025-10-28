export interface Objection {
  id: string;
  parcel_id: string;
  user_id: string;
  message: string;
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED';
  created_at: string;
  updated_at: string;
}

export interface ObjectionWithDetails extends Objection {
  parcel: {
    parcel_id: string;
    area_m2: number;
    admin_region: {
      country: string;
      state: string;
      city: string;
    };
    status: string;
  };
  user: {
    id: string;
    full_name: string;
    email?: string;
    phone?: string;
    wallet_address: string;
  };
}

export interface CreateObjectionPayload {
  parcel_id: string;
  message: string;
}

export interface UpdateObjectionStatusPayload {
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED';
}
