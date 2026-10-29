import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Workspace } from '../types';
import { api } from '../api/endpoints';

interface AuthContextType {
  user: User | null;
  workspace: Workspace | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: (credential: string, workspaceName?: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  setWorkspace: (ws: Workspace) => void;
  refreshWorkspace: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [workspace, setWorkspaceState] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const initAuth = async () => {
    const token = localStorage.getItem('spark_radar_token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const me = await api.getMe();
      setUser(me);
      try {
        const ws = await api.getCurrentWorkspace();
        setWorkspaceState(ws);
        localStorage.setItem('spark_radar_workspace_id', ws.id);
      } catch (wsErr) {
        console.warn('No active workspace found:', wsErr);
      }
    } catch (err) {
      console.error('Failed to restore session:', err);
      localStorage.removeItem('spark_radar_token');
      localStorage.removeItem('spark_radar_workspace_id');
      setUser(null);
      setWorkspaceState(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.login({ email, password: pass });
    localStorage.setItem('spark_radar_token', res.access_token);
    setUser(res.user);
    if (res.workspace) {
      setWorkspaceState(res.workspace);
      localStorage.setItem('spark_radar_workspace_id', res.workspace.id);
    }
  };

  const loginWithGoogle = async (credential: string, workspaceName?: string) => {
    const res = await api.googleLogin({ credential, workspace_name: workspaceName });
    localStorage.setItem('spark_radar_token', res.access_token);
    setUser(res.user);
    if (res.workspace) {
      setWorkspaceState(res.workspace);
      localStorage.setItem('spark_radar_workspace_id', res.workspace.id);
    }
  };

  const register = async (data: any) => {
    const res = await api.register(data);
    localStorage.setItem('spark_radar_token', res.access_token);
    setUser(res.user);
    setWorkspaceState(res.workspace);
    localStorage.setItem('spark_radar_workspace_id', res.workspace.id);
  };

  const logout = () => {
    localStorage.removeItem('spark_radar_token');
    localStorage.removeItem('spark_radar_workspace_id');
    setUser(null);
    setWorkspaceState(null);
    window.location.href = '/login';
  };

  const setWorkspace = (ws: Workspace) => {
    setWorkspaceState(ws);
    localStorage.setItem('spark_radar_workspace_id', ws.id);
  };

  const refreshWorkspace = async () => {
    try {
      const ws = await api.getCurrentWorkspace();
      setWorkspaceState(ws);
      localStorage.setItem('spark_radar_workspace_id', ws.id);
    } catch (err) {
      console.error('Failed to refresh workspace:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        workspace,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithGoogle,
        register,
        logout,
        setWorkspace,
        refreshWorkspace,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
