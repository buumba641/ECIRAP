import React, { createContext, useContext, ReactNode, useCallback, useState } from 'react';

export interface ApiUser {
  user_id: number;
  name: string;
  email: string;
  role: string;
  branch_id: number | null;
}

export interface ApiBranch {
  branch_id: number;
  branch_name: string;
  location_details: string | null;
}

export interface ApiLead {
  lead_id: number;
  branch_id: number;
  creator_agent_id: number;
  phone_number: string;
  email_address: string | null;
  client_name: string;
  ai_summary_raw: string | null;
  ai_summary_edited: string | null;
  conversion_timestamp: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiDeal {
  deal_id: number;
  lead_id: number;
  branch_id: number;
  closer_agent_id: number;
  cashier_id: number | null;
  is_split_commission: boolean;
  payment_status: string;
  created_at: string;
  updated_at: string;
}

interface ApiContextType {
  currentUser: ApiUser | null;
  setCurrentUser: (user: ApiUser | null) => void;
  loading: boolean;
  error: string | null;
  
  // API Methods
  fetchCurrentUser: (userId: number) => Promise<void>;
  fetchLeads: () => Promise<ApiLead[]>;
  fetchDeals: () => Promise<ApiDeal[]>;
  createLead: (data: any) => Promise<ApiLead>;
  convertLeadToDeal: (leadId: number) => Promise<void>;
  updateDeal: (dealId: number, data: any) => Promise<void>;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

const API_BASE = '/api';

export const ApiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWithAuth = useCallback(
    async (endpoint: string, options?: RequestInit) => {
      const userId = localStorage.getItem('userId');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'x-user-id': userId || '1',
        ...(options?.headers || {}),
      };

      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return response.json();
    },
    []
  );

  const fetchCurrentUser = useCallback(
    async (userId: number) => {
      try {
        setLoading(true);
        setError(null);
        localStorage.setItem('userId', userId.toString());
        const user = await fetchWithAuth(`/users/${userId}`);
        setCurrentUser(user);
      } catch (err: any) {
        setError(err.message);
        console.error('Failed to fetch user:', err);
      } finally {
        setLoading(false);
      }
    },
    [fetchWithAuth]
  );

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const leads = await fetchWithAuth('/leads');
      return leads;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth]);

  const fetchDeals = useCallback(async () => {
    try {
      setLoading(true);
      const deals = await fetchWithAuth('/deals');
      return deals;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth]);

  const createLead = useCallback(
    async (data: any) => {
      try {
        setLoading(true);
        setError(null);
        const newLead = await fetchWithAuth('/leads', {
          method: 'POST',
          body: JSON.stringify(data),
        });
        return newLead;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchWithAuth]
  );

  const convertLeadToDeal = useCallback(
    async (leadId: number) => {
      try {
        setLoading(true);
        setError(null);
        await fetchWithAuth(`/leads/${leadId}/convert`, {
          method: 'POST',
        });
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchWithAuth]
  );

  const updateDeal = useCallback(
    async (dealId: number, data: any) => {
      try {
        setLoading(true);
        setError(null);
        await fetchWithAuth(`/deals/${dealId}`, {
          method: 'PATCH',
          body: JSON.stringify(data),
        });
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchWithAuth]
  );

  return (
    <ApiContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        loading,
        error,
        fetchCurrentUser,
        fetchLeads,
        fetchDeals,
        createLead,
        convertLeadToDeal,
        updateDeal,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within ApiProvider');
  }
  return context;
};
