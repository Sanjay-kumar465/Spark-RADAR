export type VehicleCategory = 
  | 'sedan_taxi'
  | 'suv_commercial'
  | 'tempo_traveller' 
  | 'bus' 
  | 'mini_truck' 
  | 'goods_truck' 
  | 'multi_axle_trailer'
  | 'tanker'
  | 'tipper'
  | 'container'
  | 'taxi' 
  | 'lorry';

export type AttentionStatus = 'CRITICAL' | 'ATTENTION' | 'INCOMPLETE' | 'COMPLIANT';

export type DocumentUrgency = 'critical' | 'warning' | 'normal' | 'none';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  is_active: boolean;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  business_type: string;
  state_jurisdiction: string;
  contact_email?: string;
  contact_phone?: string;
  warning_threshold_days?: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
}

export interface NextObligation {
  category_code: string;
  category_name: string;
  date: string;
  days_remaining: number;
  document_id?: string;
}

export interface VehicleDocumentSummary {
  category_code: string;
  category_name: string;
  is_mandatory: boolean;
  status: 'ACTIVE' | 'DUE_SOON' | 'EXPIRED' | 'MISSING' | 'NO_EXPIRY';
  label: string;
  days_remaining: number | null;
  urgency: DocumentUrgency;
  document?: {
    id: string;
    document_number?: string;
    issuing_authority?: string;
    issue_date?: string;
    expiry_date?: string;
    file_path?: string;
    file_name?: string;
    verification_status: VerificationStatus;
  } | null;
}

export interface Vehicle {
  id: string;
  workspace_id: string;
  registration_number: string;
  normalized_registration_number: string;
  vehicle_category: VehicleCategory;
  vehicle_use: string;
  make: string;
  model: string;
  manufacturing_year?: number;
  fuel_type?: string;
  ownership_type?: string;
  chassis_number?: string;
  engine_number?: string;
  seating_capacity?: number;
  gross_vehicle_weight_kg?: number;
  permit_type?: string;
  notes?: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  assigned_driver_name?: string;
  assigned_driver_id?: string;
  attention_status: AttentionStatus;
  status_label: string;
  expired_count: number;
  due_soon_count: number;
  missing_count: number;
  valid_count: number;
  next_obligation?: NextObligation;
  document_summaries?: VehicleDocumentSummary[];
  documents?: any[];
  tasks?: any[];
  fastag_records?: any[];
  maintenance_records?: any[];
  driver_assignments?: any[];
}

export interface Driver {
  id: string;
  workspace_id: string;
  full_name: string;
  phone: string;
  email?: string;
  licence_number: string;
  licence_category: string;
  licence_expiry_date?: string;
  badge_number?: string;
  status: 'active' | 'inactive' | 'suspended';
  notes?: string;
  created_at: string;
  updated_at: string;
  assigned_vehicles_count: number;
  assigned_vehicle_reg?: string;
  licence_status: string;
  licence_status_label: string;
  days_to_expiry?: number;
  documents?: any[];
  assignments?: any[];
}

export interface RenewalTask {
  id: string;
  workspace_id: string;
  vehicle_id?: string;
  driver_id?: string;
  document_id?: string;
  title: string;
  description?: string;
  due_date: string;
  assigned_to_user_id?: string;
  assigned_user_name?: string;
  priority: TaskPriority;
  status: TaskStatus;
  completion_notes?: string;
  completion_evidence_path?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  vehicle_registration?: string;
  driver_name?: string;
  is_overdue: boolean;
  days_until_due?: number;
}

export interface FASTagRecord {
  id: string;
  workspace_id: string;
  vehicle_id: string;
  tag_id: string;
  issuer_bank: string;
  recorded_status: 'active' | 'low_balance' | 'blacklisted' | 'inactive';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceRecord {
  id: string;
  workspace_id: string;
  vehicle_id: string;
  service_date: string;
  service_type: string;
  description: string;
  odometer_km?: number;
  service_provider?: string;
  cost?: number;
  created_at: string;
}

export interface UrgentActionItem {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  due_date?: string;
  days_remaining?: number;
  urgency: 'critical' | 'warning';
  vehicle_id?: string;
  vehicle_registration?: string;
  document_id?: string;
  task_id?: string;
}

export interface DashboardSummary {
  total_vehicles: number;
  vehicles_needing_attention: number;
  upcoming_renewals: number;
  overdue_documents: number;
  pending_tasks: number;
  attention_breakdown: {
    CRITICAL: number;
    ATTENTION: number;
    INCOMPLETE: number;
    COMPLIANT: number;
  };
  urgent_actions: UrgentActionItem[];
  recently_updated_vehicles: any[];
}
