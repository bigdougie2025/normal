import { create } from 'zustand';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface UiState {
  isOnline: boolean;
  saveStatus: 'saved' | 'saving' | 'offline';
  toasts: Toast[];
  setOnline: (online: boolean) => void;
  setSaveStatus: (status: UiState['saveStatus']) => void;
  addToast: (message: string, type: Toast['type']) => void;
  removeToast: (id: string) => void;
  initOnlineListener: () => () => void;
}

export const useUiStore = create<UiState>((set) => ({
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  saveStatus: 'saved',
  toasts: [],

  setOnline: (online) => set({ isOnline: online }),
  setSaveStatus: (saveStatus) => set({ saveStatus }),

  addToast: (message, type) => {
    const id = Date.now().toString();
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },

  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  initOnlineListener: () => {
    const onOnline = () => set({ isOnline: true, saveStatus: 'saved' });
    const onOffline = () => set({ isOnline: false, saveStatus: 'offline' });
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  },
}));
