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
  activeRole: initialUser?.role || 'TECHNICIAN',
  selectedMachineCode: 'TX-1250-A',
  activeScenario: 'NORMAL_OPERATION',
  isCopilotOpen: false,
  liveConnected: true,
  refreshCounter: 0,
  lastBroadcastMessage: null,
  liveTelemetry: {}, // Zero hardcoded mock sensor data; filled ONLY from WebSocket or API

  loginUser: (user, token) => {
    localStorage.setItem('maintix_token', token);
    localStorage.setItem('maintix_user', JSON.stringify(user));
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
    delete axios.defaults.headers.common['Authorization'];
    set({
      currentUser: null,
      token: null,
      activeRole: null
    });
  },

  setActiveRole: (role) => {
    set((state) => {
      if (state.currentUser && role) {
        const updatedUser = { ...state.currentUser, role };
        localStorage.setItem('maintix_user', JSON.stringify(updatedUser));
        return { activeRole: role, currentUser: updatedUser };
      }
      return { activeRole: role };
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
