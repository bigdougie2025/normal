import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'inspector' | 'manager' | 'admin';
}

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  signInWithMagicLink: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: true,

      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),

      signInWithMagicLink: async (email: string) => {
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) return { error: error.message };
        return { error: null };
      },

      signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null });
      },

      initialize: async () => {
        set({ loading: true });
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            // Fetch profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, role')
              .eq('id', session.user.id)
              .single();

            set({
              user: {
                id: session.user.id,
                email: session.user.email || '',
                fullName: profile?.full_name || session.user.email || 'Inspector',
                role: profile?.role || 'inspector',
              },
            });
          }
        } catch {
          // Offline or error, keep existing state
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
