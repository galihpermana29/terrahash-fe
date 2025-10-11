export type SubmissionStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED";

export interface Submission {
  id: string; // PK
  submitter_id?: string | null; // User/account ID or wallet address
  // Geometry as GeoJSON string or a separate spatial type in DB; transport as string here
  geometry_geojson: string;
  proposed_parcel_id: string; // Suggested parcel_id (may be normalized)
  admin_region?: { country: string; state?: string; city?: string } | null;
  notes?: string | null;
  status: SubmissionStatus; // SUBMITTED/UNDER_REVIEW/APPROVED/REJECTED
  created_at: string;
  updated_at: string;
}

export interface Evidence {
  id: string; // PK
  submission_id: string; // FK -> Submission.id
  url: string; // Proof document URL (any format representing ownership)
  name?: string | null; // Optional display name
  mime?: string | null; // Optional MIME type for previews
  created_at: string;
}
