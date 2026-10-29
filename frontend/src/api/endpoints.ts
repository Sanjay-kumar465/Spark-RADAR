import { apiRequest } from './client';
import type {
  User,
  Workspace,
  Vehicle,
  Driver,
  RenewalTask,
  FASTagRecord,
  MaintenanceRecord,
  DashboardSummary
} from '../types';

export const api = {
  // Auth
  register: (data: any) => apiRequest<{ access_token: string; user: User; workspace: Workspace }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  login: (data: { email: string; password: string }) => apiRequest<{ access_token: string; user: User; workspace?: Workspace }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  googleLogin: (data: { credential: string; workspace_name?: string; business_type?: string; state_jurisdiction?: string }) =>
    apiRequest<{ access_token: string; user: User; workspace?: Workspace }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getMe: () => apiRequest<User>('/auth/me'),
  forgotPassword: (email: string) => apiRequest<{ message: string; reset_token?: string }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),
  resetPassword: (token: string, new_password: string) => apiRequest<{ message: string }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, new_password }),
  }),

  // Workspaces
  getCurrentWorkspace: () => apiRequest<Workspace>('/workspaces/current'),
  getMyWorkspaces: () => apiRequest<Workspace[]>('/workspaces/my-workspaces'),
  createWorkspace: (data: Partial<Workspace>) => apiRequest<Workspace>('/workspaces', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateWorkspace: (data: Partial<Workspace>) => apiRequest<Workspace>('/workspaces/current', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  getWorkspaceMembers: () => apiRequest<any[]>('/workspaces/members'),
  inviteMember: (data: { email: string; role: string; full_name?: string; temporary_password?: string }) =>
    apiRequest<any>('/workspaces/members', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateMemberRole: (memberId: string, role: string) =>
    apiRequest<any>(`/workspaces/members/${memberId}`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    }),
  removeMember: (memberId: string) =>
    apiRequest<{ message: string }>(`/workspaces/members/${memberId}`, {
      method: 'DELETE',
    }),

  // Vehicles
  getVehicles: (params?: { search?: string; category?: string; status_filter?: string; sort_by?: string; include_archived?: boolean }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.category) q.set('category', params.category);
    if (params?.status_filter) q.set('status_filter', params.status_filter);
    if (params?.sort_by) q.set('sort_by', params.sort_by);
    if (params?.include_archived) q.set('include_archived', 'true');
    return apiRequest<Vehicle[]>(`/vehicles?${q.toString()}`);
  },
  getVehicleDetail: (id: string) => apiRequest<Vehicle>(`/vehicles/${id}`),
  createVehicle: (data: any) => apiRequest<Vehicle>('/vehicles', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateVehicle: (id: string, data: any) => apiRequest<Vehicle>(`/vehicles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  archiveVehicle: (id: string) => apiRequest<{ message: string }>(`/vehicles/${id}`, {
    method: 'DELETE',
  }),
  unarchiveVehicle: (id: string) => apiRequest<Vehicle>(`/vehicles/${id}/unarchive`, {
    method: 'POST',
  }),
  assignDriverToVehicle: (vehicleId: string, driverId: string) =>
    apiRequest<Vehicle>(`/vehicles/${vehicleId}/assign-driver?driver_id=${driverId}`, {
      method: 'POST',
    }),
  unassignDriverFromVehicle: (vehicleId: string) =>
    apiRequest<Vehicle>(`/vehicles/${vehicleId}/unassign-driver`, {
      method: 'POST',
    }),

  // Documents
  uploadDocument: (formData: FormData) => apiRequest<any>('/documents/upload', {
    method: 'POST',
    body: formData,
  }),
  deleteDocument: (id: string) => apiRequest<{ message: string }>(`/documents/${id}`, {
    method: 'DELETE',
  }),
  getDocumentDownloadUrl: (id: string) => {
    return `http://127.0.0.1:8000/api/v1/documents/${id}/download`;
  },

  // Renewals & Tasks
  getRenewalTasks: (params?: { status?: string; priority?: string; vehicle_id?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.priority) q.set('priority', params.priority);
    if (params?.vehicle_id) q.set('vehicle_id', params.vehicle_id);
    return apiRequest<RenewalTask[]>(`/renewals?${q.toString()}`);
  },
  createRenewalTask: (data: any) => apiRequest<RenewalTask>('/renewals', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateRenewalTask: (id: string, data: any) => apiRequest<RenewalTask>(`/renewals/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // Drivers
  getDrivers: (params?: { search?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.status) q.set('status', params.status);
    return apiRequest<Driver[]>(`/drivers?${q.toString()}`);
  },
  getDriverDetail: (id: string) => apiRequest<Driver>(`/drivers/${id}`),
  createDriver: (data: any) => apiRequest<Driver>('/drivers', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateDriver: (id: string, data: any) => apiRequest<Driver>(`/drivers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  assignDriver: (vehicleId: string, driverId: string, isPrimary = true) => 
    apiRequest<{ message: string }>(`/drivers/assign?vehicle_id=${vehicleId}&driver_id=${driverId}&is_primary=${isPrimary}`, {
      method: 'POST',
    }),

  // Operations: FASTag & Maintenance
  getFASTags: (vehicleId: string) => apiRequest<FASTagRecord[]>(`/operations/fastag/${vehicleId}`),
  createFASTag: (data: any) => apiRequest<FASTagRecord>('/operations/fastag', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getMaintenance: (vehicleId: string) => apiRequest<MaintenanceRecord[]>(`/operations/maintenance/${vehicleId}`),
  createMaintenance: (data: any) => apiRequest<MaintenanceRecord>('/operations/maintenance', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Dashboard
  getDashboardSummary: () => apiRequest<DashboardSummary>('/dashboard/summary'),

  // Reference Data
  getReferenceData: () => apiRequest<any>('/reference-data'),
};
