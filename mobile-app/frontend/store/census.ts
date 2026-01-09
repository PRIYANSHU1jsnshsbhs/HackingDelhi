import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';

export interface CitizenData {
  id: string;
  name: string;
  age: string;
  guardian: string;
  caste: string;
  income: string;
  voiceNote?: string;
  photoBase64?: string;
  aiVerification: {
    incomeStatus: string;
    confidence: number;
    conflictDetected: boolean;
  };
  blockchainReceipt: {
    transactionHash: string;
    timestamp: string;
    status: 'Anchored' | 'Pending';
  };
  synced: boolean;
  createdAt: string;
}

export interface EnumeratorInfo {
  id: string;
  name: string;
  assignedArea: string;
  assignedWard: string;
}

interface CensusStore {
  enumerator: EnumeratorInfo | null;
  surveys: CitizenData[];
  isOnline: boolean;
  setEnumerator: (info: EnumeratorInfo) => void;
  addSurvey: (survey: CitizenData) => void;
  updateSurvey: (id: string, data: Partial<CitizenData>) => void;
  markAsSynced: (id: string) => void;
  setOnlineStatus: (status: boolean) => void;
  getPendingSurveys: () => CitizenData[];
  getSyncedSurveys: () => CitizenData[];
  logout: () => void;
}

export const useCensusStore = create<CensusStore>()(persist(
  (set, get) => ({
    enumerator: null,
    surveys: [],
    isOnline: true,

    setEnumerator: (info) => set({ enumerator: info }),

    addSurvey: (survey) => set((state) => ({
      surveys: [...state.surveys, survey]
    })),

    updateSurvey: (id, data) => set((state) => ({
      surveys: state.surveys.map(s => s.id === id ? { ...s, ...data } : s)
    })),

    markAsSynced: (id) => set((state) => ({
      surveys: state.surveys.map(s => s.id === id ? { ...s, synced: true } : s)
    })),

    setOnlineStatus: (status) => set({ isOnline: status }),

    getPendingSurveys: () => {
      const state = get();
      return state.surveys.filter(s => !s.synced);
    },

    getSyncedSurveys: () => {
      const state = get();
      return state.surveys.filter(s => s.synced);
    },

    logout: () => set({ enumerator: null, surveys: [] })
  }),
  {
    name: 'census-storage',
    storage: createJSONStorage(() => AsyncStorage)
  }
));