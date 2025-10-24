import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Preferences, PantryItem } from '@/types';

interface AppState {
  preferences: Preferences | null;
  pantryItems: PantryItem[];
  hasCompletedOnboarding: boolean;
  setPreferences: (preferences: Preferences) => void;
  updatePreferences: (preferences: Partial<Preferences>) => void;
  addPantryItem: (item: PantryItem) => void;
  removePantryItem: (id: string) => void;
  setHasCompletedOnboarding: (value: boolean) => void;
  reset: () => void;
}

const defaultPreferences: Preferences = {
  diet: 'Regular',
  allergies: [],
  dislikes: [],
  notificationTime: '08:00',
  notificationDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  servings: 2,
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      preferences: null,
      pantryItems: [],
      hasCompletedOnboarding: false,
      setPreferences: (preferences) => set({ preferences, hasCompletedOnboarding: true }),
      updatePreferences: (newPreferences) =>
        set((state) => ({
          preferences: state.preferences
            ? { ...state.preferences, ...newPreferences }
            : { ...defaultPreferences, ...newPreferences },
        })),
      addPantryItem: (item) =>
        set((state) => ({ pantryItems: [...state.pantryItems, item] })),
      removePantryItem: (id) =>
        set((state) => ({
          pantryItems: state.pantryItems.filter((item) => item.id !== id),
        })),
      setHasCompletedOnboarding: (value) => set({ hasCompletedOnboarding: value }),
      reset: () =>
        set({
          preferences: null,
          pantryItems: [],
          hasCompletedOnboarding: false,
        }),
    }),
    {
      name: 'cookmate-storage',
    }
  )
);

export { defaultPreferences };
