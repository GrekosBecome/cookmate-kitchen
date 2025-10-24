import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Preferences, PantryItem, SuggestionPick, Signal, LearningState } from '@/types';
import { recordSignal as recordSignalLib, recomputeLearning as recomputeLearningLib } from '@/lib/learning';

interface AppState {
  preferences: Preferences | null;
  pantryItems: PantryItem[];
  lastSyncAt?: string;
  hasCompletedOnboarding: boolean;
  todaysPick: SuggestionPick | null;
  signals: Signal[];
  learning?: LearningState;
  setPreferences: (preferences: Preferences) => void;
  updatePreferences: (preferences: Partial<Preferences>) => void;
  addPantryItem: (item: PantryItem) => void;
  addPantryItems: (items: PantryItem[]) => void;
  updatePantryItem: (id: string, updates: Partial<PantryItem>) => void;
  removePantryItem: (id: string) => void;
  togglePantryItemUsed: (id: string) => void;
  setHasCompletedOnboarding: (value: boolean) => void;
  setTodaysPick: (pick: SuggestionPick) => void;
  addSignal: (signal: Signal) => void;
  recomputeLearning: () => void;
  resetLearning: () => void;
  consumePantryForRecipe: (ingredientNames: string[]) => number;
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

const mergePantryItems = (existing: PantryItem[], newItems: PantryItem[]): PantryItem[] => {
  const itemMap = new Map<string, PantryItem>();
  
  // Add existing items
  existing.forEach(item => {
    itemMap.set(item.name.toLowerCase(), item);
  });
  
  // Merge new items
  newItems.forEach(newItem => {
    const normalizedName = newItem.name.toLowerCase();
    const existingItem = itemMap.get(normalizedName);
    
    if (existingItem) {
      // Merge: increase quantity and update lastSeenAt
      itemMap.set(normalizedName, {
        ...existingItem,
        qty: (existingItem.qty || 1) + (newItem.qty || 1),
        lastSeenAt: new Date().toISOString(),
        confidence: newItem.confidence || existingItem.confidence,
      });
    } else {
      itemMap.set(normalizedName, newItem);
    }
  });
  
  return Array.from(itemMap.values());
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      preferences: null,
      pantryItems: [],
      lastSyncAt: undefined,
      hasCompletedOnboarding: false,
      todaysPick: null,
      signals: [],
      learning: undefined,
      setPreferences: (preferences) => set({ preferences, hasCompletedOnboarding: true }),
      updatePreferences: (newPreferences) =>
        set((state) => ({
          preferences: state.preferences
            ? { ...state.preferences, ...newPreferences }
            : { ...defaultPreferences, ...newPreferences },
        })),
      addPantryItem: (item) =>
        set((state) => ({
          pantryItems: mergePantryItems(state.pantryItems, [item]),
          lastSyncAt: new Date().toISOString(),
        })),
      addPantryItems: (items) =>
        set((state) => ({
          pantryItems: mergePantryItems(state.pantryItems, items),
          lastSyncAt: new Date().toISOString(),
        })),
      updatePantryItem: (id, updates) =>
        set((state) => ({
          pantryItems: state.pantryItems.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        })),
      removePantryItem: (id) =>
        set((state) => ({
          pantryItems: state.pantryItems.filter((item) => item.id !== id),
        })),
      togglePantryItemUsed: (id) =>
        set((state) => ({
          pantryItems: state.pantryItems.map((item) =>
            item.id === id ? { ...item, used: !item.used } : item
          ),
        })),
      setHasCompletedOnboarding: (value) => set({ hasCompletedOnboarding: value }),
      setTodaysPick: (pick) => set({ todaysPick: pick }),
      addSignal: (signal) =>
        set((state) => {
          const newSignals = recordSignalLib(signal, state.signals);
          return { signals: newSignals };
        }),
      recomputeLearning: () =>
        set((state) => {
          const newLearning = recomputeLearningLib(state.signals, state.learning);
          return { learning: newLearning };
        }),
      resetLearning: () =>
        set({
          learning: undefined,
          signals: [],
        }),
      consumePantryForRecipe: (ingredientNames: string[]) => {
        let consumedCount = 0;
        set((state) => {
          const updatedItems = state.pantryItems.map((item) => {
            const matchesIngredient = ingredientNames.some(name =>
              item.name.toLowerCase().includes(name.toLowerCase()) ||
              name.toLowerCase().includes(item.name.toLowerCase())
            );
            
            if (matchesIngredient && !item.used) {
              consumedCount++;
              return { ...item, used: true };
            }
            return item;
          });
          
          return { pantryItems: updatedItems };
        });
        return consumedCount;
      },
      reset: () =>
        set({
          preferences: null,
          pantryItems: [],
          lastSyncAt: undefined,
          hasCompletedOnboarding: false,
          todaysPick: null,
          signals: [],
          learning: undefined,
        }),
    }),
    {
      name: 'cookmate-storage',
    }
  )
);

export { defaultPreferences };
