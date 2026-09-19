import { create } from 'zustand';
import { RoleType, Machine, Telemetry } from '../types/index.js';
import axios from 'axios';

export interface User {
  id: string;
  name: string;
  email: string;
  role: RoleType;
  department?: string;
  avatar?: string;
}

interface AppState {
  currentUser: User | null;
  token: string | null;
  activeRole: RoleType | null;
  selectedMachineCode: string;
  activeScenario: string;
  isCopilotOpen: boolean;
  isAiDrawerOpen?: boolean;
  liveConnected: boolean;
  liveTelemetry: Record<string, Telemetry>;

  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;

  loginUser: (user: User, token: string) => void;
  logoutUser: () => void;
  setActiveRole: (role: RoleType | null) => void;
  setSelectedMachineCode: (code: string) => void;
  setActiveScenario: (scenario: string) => void;
  setCopilotOpen: (open: boolean) => void;
  setAiDrawerOpen: (open: boolean) => void;
  setLiveConnected: (connected: boolean) => void;
  refreshCounter: number;
  triggerRefresh: () => void;
  lastBroadcastMessage: any;
  setLastBroadcastMessage: (msg: any) => void;
  updateLiveTelemetry: (telemetry: Telemetry) => void;
}

// Initial state from localStorage if available
const storedToken = localStorage.getItem('maintix_token');
const storedUser = localStorage.getItem('maintix_user');
const storedRole = localStorage.getItem('maintix_active_role') as RoleType | null;
const storedTheme = 'light';
localStorage.setItem('maintix_theme', 'light');

let initialUser: User | null = null;
if (storedUser) {
  try {
    initialUser = JSON.parse(storedUser);
  } catch (e) {
    // ignore
  }
}

if (storedToken) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
}

export const useAppStore = create<AppState>((set) => ({
  currentUser: initialUser,
  token: storedToken,
  activeRole: storedRole || initialUser?.role || null,
  selectedMachineCode: 'TX-1250-A',
  activeScenario: 'NORMAL_OPERATION',
  isCopilotOpen: false,
  liveConnected: true,
  refreshCounter: 0,
  lastBroadcastMessage: null,
  liveTelemetry: {},
  theme: 'light',

  toggleTheme: () =>
    set(() => {
      localStorage.setItem('maintix_theme', 'light');
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      return { theme: 'light' };
    }),

  setTheme: () => {
    localStorage.setItem('maintix_theme', 'light');
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    set({ theme: 'light' });
  },

  loginUser: (user, token) => {
    localStorage.setItem('maintix_token', token);
    localStorage.setItem('maintix_user', JSON.stringify(user));
    localStorage.setItem('maintix_active_role', user.role);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    set({
      currentUser: user,
      token,
      activeRole: user.role
    });
  },

  logoutUser: () => {
    localStorage.removeItem('maintix_token');
    localStorage.removeItem('maintix_user');
    localStorage.removeItem('maintix_active_role');
    delete axios.defaults.headers.common['Authorization'];
    set({
      currentUser: null,
      token: null,
      activeRole: null
    });
  },

  setActiveRole: (role) => {
    set((state) => {
      if (role) {
        localStorage.setItem('maintix_active_role', role);
        const updatedUser: User = state.currentUser
          ? { ...state.currentUser, role }
          : {
              id: `user-${role.toLowerCase()}`,
              name:
                role === 'INDUSTRIAL_DIRECTOR'
                  ? 'Dr. Yassine Benzarti'
                  : role === 'MAINTENANCE_MANAGER'
                  ? 'Sonia Trabelsi'
                  : role === 'PRODUCTION_MANAGER'
                  ? 'Tarek Mansour'
                  : role === 'ADMIN'
                  ? 'Administrateur Système'
                  : 'Karim Ben Salem',
              email: `${role.toLowerCase()}@maintix.com`,
              role,
              department:
                role === 'INDUSTRIAL_DIRECTOR'
                  ? 'Direction Industrielle'
                  : role === 'MAINTENANCE_MANAGER'
                  ? 'Département Maintenance'
                  : role === 'PRODUCTION_MANAGER'
                  ? 'Lignes de Production'
                  : role === 'ADMIN'
                  ? 'Administration IT/OT'
                  : 'Équipe Terrain'
            };
        localStorage.setItem('maintix_user', JSON.stringify(updatedUser));
        return { activeRole: role, currentUser: updatedUser };
      } else {
        localStorage.removeItem('maintix_active_role');
        localStorage.removeItem('maintix_user');
        localStorage.removeItem('maintix_token');
        return { activeRole: null, currentUser: null, token: null };
      }
    });
  },

  setSelectedMachineCode: (code) => set({ selectedMachineCode: code }),
  setActiveScenario: (scenario) => set({ activeScenario: scenario }),
  setCopilotOpen: (open) => set({ isCopilotOpen: open, isAiDrawerOpen: open }),
  setAiDrawerOpen: (open) => set({ isCopilotOpen: open, isAiDrawerOpen: open }),
  setLiveConnected: (connected) => set({ liveConnected: connected }),
  triggerRefresh: () => set((state) => ({ refreshCounter: state.refreshCounter + 1 })),
  setLastBroadcastMessage: (msg) => set({ lastBroadcastMessage: msg }),
  updateLiveTelemetry: (telemetry) =>
    set((state) => ({
      liveTelemetry: {
        ...state.liveTelemetry,
        [telemetry.machineCode || 'TX-1250-A']: telemetry
      }
    }))
}));
