// Production API Base URL: Supports VITE_API_BASE_URL and VITE_API_URL
const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    let clean = envUrl.trim().replace(/\/+$/, '');
    // Ensure /api/v1 suffix is present for backend route matching
    if (!clean.endsWith('/api/v1')) {
      clean = `${clean}/api/v1`;
    }
    return clean;
  }

  // If in production on Vercel without backend URL set, log clear warning
  if (import.meta.env.PROD) {
    console.warn(
      '[Spark Radar] Missing VITE_API_BASE_URL environment variable. Set VITE_API_BASE_URL in your Vercel project settings to your deployed FastAPI backend (e.g. https://spark-radar-api.onrender.com).'
    );
  }

  return 'http://127.0.0.1:8000/api/v1';
};

const API_BASE_URL = getApiBaseUrl();

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('spark_radar_token');
  const workspaceId = localStorage.getItem('spark_radar_workspace_id');

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (workspaceId) {
    headers['X-Workspace-Id'] = workspaceId;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (netErr: any) {
    if (import.meta.env.PROD && !(import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL)) {
      throw new Error(
        'Backend API URL not configured. Set VITE_API_BASE_URL in Vercel project environment variables to connect to your deployed FastAPI backend.'
      );
    }
    throw new Error(
      netErr?.message || 'Unable to connect to Spark Radar API server. Please check your network connection.'
    );
  }

  if (!response.ok) {
    let errorDetail = 'An unexpected error occurred.';
    try {
      const errorJson = await response.json();
      if (typeof errorJson.detail === 'string') {
        errorDetail = errorJson.detail;
      } else if (Array.isArray(errorJson.detail)) {
        errorDetail = errorJson.detail.map((e: any) => e.msg || e.message).join(', ');
      }
    } catch {
      errorDetail = response.statusText || errorDetail;
    }

    throw new Error(errorDetail);
  }

  return response.json();
}
