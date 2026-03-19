import { create } from "zustand";

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
}

export interface AlertRecord {
  id: string;
  timestamp: Date;
  location: string | null;
  contactsNotified: string[];
  triggerType: "Button" | "Shake" | "Volume" | "Voice" | "Fall";
  duration: number;
  recordingPath?: string;
}

export interface Settings {
  volumeTriggerEnabled: boolean;
  shakeTriggerEnabled: boolean;
  smsEnabled: boolean;
  callEnabled: boolean;
  flashEnabled: boolean;
  vibrationEnabled: boolean;
  voiceTriggerEnabled: boolean;
  fallDetectionEnabled: boolean;
  autoRecordEnabled: boolean;
  useFrontCamera: boolean;
  testMode: boolean;
  testAlarm: boolean;
  testSMS: boolean;
  testCalls: boolean;
}

interface AppState {
  emergencyContacts: EmergencyContact[];
  isAlarmActive: boolean;
  settings: Settings;
  lastAlertTime: Date | null;
  lastLocation: string | null;
  alertHistory: AlertRecord[];
  isPro: boolean;
  subscriptionExpiry: Date | null;

  addContact: (contact: EmergencyContact) => void;
  removeContact: (id: string) => void;
  updateContact: (id: string, updates: Partial<EmergencyContact>) => void;

  setAlarmActive: (active: boolean) => void;

  updateSettings: (settings: Partial<Settings>) => void;

  addAlertToHistory: (alert: Omit<AlertRecord, "id" | "timestamp">) => void;
  clearAlertHistory: () => void;
  setLastLocation: (location: string) => void;

  setProStatus: (isPro: boolean, expiry?: Date) => void;
}

const DEFAULT_SETTINGS: Settings = {
  volumeTriggerEnabled: true,
  shakeTriggerEnabled: true,
  smsEnabled: true,
  callEnabled: true,
  flashEnabled: true,
  vibrationEnabled: true,
  voiceTriggerEnabled: false,
  fallDetectionEnabled: false,
  autoRecordEnabled: false,
  useFrontCamera: true,
  testMode: false,
  testAlarm: false,
  testSMS: false,
  testCalls: false,
};

const DEFAULT_EMERGENCY_NUMBERS = [
  { id: "1", name: "Police", phone: "8610050976" },
  { id: "2", name: "Ambulance", phone: "8610050976" },
  { id: "3", name: "National Emergency", phone: "8610050976" },
];

export const useAppStore = create<AppState>()((set) => ({
  emergencyContacts: DEFAULT_EMERGENCY_NUMBERS,
  isAlarmActive: false,
  settings: DEFAULT_SETTINGS,
  lastAlertTime: null,
  lastLocation: null,
  alertHistory: [],
  isPro: false,
  subscriptionExpiry: null,

  addContact: (contact) =>
    set((state) => {
      const maxContacts = state.isPro ? 10 : 1;
      if (state.emergencyContacts.length >= maxContacts) {
        return state;
      }
      return {
        emergencyContacts: [...state.emergencyContacts, contact],
      };
    }),

  removeContact: (id) =>
    set((state) => ({
      emergencyContacts: state.emergencyContacts.filter((c) => c.id !== id),
    })),

  updateContact: (id, updates) =>
    set((state) => ({
      emergencyContacts: state.emergencyContacts.map((c) =>
        c.id === id ? { ...c, ...updates } : c,
      ),
    })),

  setAlarmActive: (active) => set({ isAlarmActive: active }),

  updateSettings: (newSettings) =>
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    })),

  addAlertToHistory: (alert) =>
    set((state) => {
      const newAlert: AlertRecord = {
        ...alert,
        id: Date.now().toString(),
        timestamp: new Date(),
      };
      const updatedHistory = [newAlert, ...state.alertHistory].slice(0, 50);
      return {
        alertHistory: updatedHistory,
        lastAlertTime: new Date(),
      };
    }),

  clearAlertHistory: () => set({ alertHistory: [] }),

  setLastLocation: (location) => set({ lastLocation: location }),

  setProStatus: (isPro, expiry) =>
    set({
      isPro,
      subscriptionExpiry: expiry || null,
    }),
}));
