export type UserRole = 'citizen' | 'barangay' | 'lgu_admin';

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  barangay_id?: string; // null for LGU admin
  created_at: string;
}

export interface Barangay {
  id: string;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  population?: number;
  risk_level?: 'low' | 'moderate' | 'high' | 'critical';
}

export type HazardType = 
  | 'Flood'
  | 'Typhoon / Strong Winds'
  | 'Storm Surge'
  | 'Fire'
  | 'Landslide'
  | 'Downed Powerline'
  | 'Road Obstruction'
  | 'Medical Emergency'
  | 'Emergency SOS';

export type IncidentStatus = 'unverified' | 'verified' | 'dispatched' | 'resolved';

export type UrgencyLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface IncidentReport {
  id: string;
  reporter_id: string;
  reporter_name: string;
  barangay_id: string;
  hazard_type: HazardType;
  description: string;
  photo_url?: string;
  latitude: number;
  longitude: number;
  status: IncidentStatus;
  urgency?: string;
  source?: string;
  corroboration_count: number;
  created_at: string;
  updated_at: string;
  assigned_team?: string;
  dispatch_notes?: string;
  resolution_notes?: string;
  resolved_at?: string;
  is_offline_synced?: boolean;
}

export interface Corroboration {
  id: string;
  report_id: string;
  user_id: string;
  user_name: string;
  created_at: string;
  comment?: string;
}

export type AdvisoryType = 'emergency_alert' | 'preparedness';
export type AdvisorySeverity = 'low' | 'medium' | 'high' | 'critical';

export interface Advisory {
  id: string;
  author_id: string;
  author_name: string;
  title: string;
  content: string;
  type: AdvisoryType;
  severity: AdvisorySeverity;
  target_barangay_id?: string | null; // null represents city-wide
  created_at: string;
}

export type EvacuationStatus = 'open' | 'full' | 'closed';

export interface EvacuationCenter {
  id: string;
  hash_id?: string;
  barangay_id: string;
  name: string;
  address: string;
  capacity: number;
  current_occupancy: number;
  status: EvacuationStatus;
  facilities: string[];
  contact_person: string;
  contact_number: string;
  latitude: number;
  longitude: number;
  notes?: string;
}

export type HotlineScope = 
  | 'Municipal' 
  | 'Barangay' 
  | 'Police' 
  | 'Fire' 
  | 'Hospital' 
  | 'Red Cross' 
  | 'Coast Guard';

export interface EmergencyHotline {
  id: string;
  barangay_id?: string | null;
  agency_name: string;
  contact_number: string;
  alt_number?: string;
  scope: HotlineScope | string;
  tag?: string;
  description: string;
  priority: number;
  available_hours: string;
}

export interface SystemAuditLog {
  id: string;
  timestamp: string;
  event_type: 'crowd_corroboration_auto_verify' | 'status_dispatch' | 'status_resolve' | 'emergency_broadcast' | 'offline_sync' | 'resource_allocated';
  description: string;
  actor_name: string;
  target_id: string;
}
