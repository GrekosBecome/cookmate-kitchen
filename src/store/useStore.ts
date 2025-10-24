import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Preferences,
  PantryItem,
  SuggestionPick,
  Signal,
  LearningState,
  UsageEvent,
  ShoppingState,
  ShoppingItem,
  Ingredient,
} from '@/types';
import { recordSignal as recordSignalLib, recomputeLearning as recomputeLearningLib } from '@/lib/learning';
import { updateConfidenceAfterCooking, applyTimeDecay, recalculateShoppingQueue } from '@/lib/shopping';

interface AppState {
  preferences: Preferences | null;
  pantryItems: PantryItem[];
  lastSyncAt?: string;
  hasCompletedOnboarding: boolean;
  todaysPick: SuggestionPick | null;
  signals: Signal[];
  learning?: LearningState;
  usageEvents: UsageEvent[];
  shoppingState: ShoppingState;
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
  recordUsageEvent: (event: UsageEvent) => void;
  applyConfidenceDecay: () => void;
  regenerateShoppingQueue: () => void;
  addShoppingItem: (item: Omit<ShoppingItem, 'id' | 'addedAt'>) => void;
  markShoppingItemBought: (id: string) => void;
  removeShoppingItem: (id: string) => void;
  updatePantryConfidenceAfterRecipe: (recipeId: string, recipeName: string, ingredients: Ingredient[]) => void;
  undoLastUsageEvent: () => void;
  togglePantryItemFavorite: (id: string) => void;
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
    (set, get) => ({
      preferences: null,
      pantryItems: [],
      lastSyncAt: undefined,
      hasCompletedOnboarding: false,
      todaysPick: null,
      signals: [],
      learning: undefined,
      usageEvents: [],
      shoppingState: { queue: [], lastGenerated: undefined },
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
      recordUsageEvent: (event: UsageEvent) => {
        set((state) => {
          const updated = [...state.usageEvents, event];
          return {
            usageEvents: updated.slice(-500),
          };
        });
      },
      applyConfidenceDecay: () => {
        set((state) => {
          const now = new Date();
          const decayedItems = state.pantryItems.map((item) => ({
            ...item,
            confidence: applyTimeDecay(item, now),
          }));
          return { pantryItems: decayedItems };
        });
        get().regenerateShoppingQueue();
      },
      regenerateShoppingQueue: () => {
        set((state) => {
          const newQueue = recalculateShoppingQueue(
            state.pantryItems,
            state.shoppingState.queue
          );
          return {
            shoppingState: {
              queue: newQueue,
              lastGenerated: new Date().toISOString(),
            },
          };
        });
      },
      addShoppingItem: (item) => {
        set((state) => ({
          shoppingState: {
            ...state.shoppingState,
            queue: [
              ...state.shoppingState.queue,
              {
                ...item,
                id: `shop-${Date.now()}-${Math.random()}`,
                addedAt: new Date().toISOString(),
              },
            ],
          },
        }));
      },
      markShoppingItemBought: (id: string) => {
        set((state) => ({
          shoppingState: {
            ...state.shoppingState,
            queue: state.shoppingState.queue.map((item) =>
              item.id === id ? { ...item, bought: true } : item
            ),
          },
        }));
      },
      removeShoppingItem: (id: string) => {
        set((state) => ({
          shoppingState: {
            ...state.shoppingState,
            queue: state.shoppingState.queue.filter((item) => item.id !== id),
          },
        }));
      },
      updatePantryConfidenceAfterRecipe: (recipeId: string, recipeName: string, ingredients: Ingredient[]) => {
        set((state) => {
          const now = new Date().toISOString();
          const updatedItems = state.pantryItems.map((item) => {
            const usedIngredient = ingredients.find(
              (ing) =>
                !ing.optional &&
                (ing.pantryName || ing.name).toLowerCase() === item.name.toLowerCase()
            );

            if (usedIngredient) {
              return {
                ...item,
                confidence: updateConfidenceAfterCooking(
                  item,
                  true,
                  usedIngredient.qty
                ),
                lastUsed: now,
              };
            }
            return item;
          });

          return { pantryItems: updatedItems };
        });
        get().regenerateShoppingQueue();
      },
      undoLastUsageEvent: () => {
        set((state) => {
          if (state.usageEvents.length === 0) return state;

          const lastEvent = state.usageEvents[state.usageEvents.length - 1];

          const revertedItems = state.pantryItems.map((item) => {
            const wasUsed = lastEvent.ingredients.some(
              (ing) => ing.name.toLowerCase() === item.name.toLowerCase()
            );

            if (wasUsed && item.lastUsed === lastEvent.ts) {
              return {
                ...item,
                confidence: Math.min(100, (item.confidence ?? 0) + 25),
                lastUsed: undefined,
              };
            }
            return item;
          });

          const eventTime = new Date(lastEvent.ts).getTime();
          const filteredQueue = state.shoppingState.queue.filter(
            (shopItem) =>
              new Date(shopItem.addedAt).getTime() < eventTime ||
              !shopItem.autoGenerated
          );

          return {
            pantryItems: revertedItems,
            usageEvents: state.usageEvents.slice(0, -1),
            shoppingState: {
              ...state.shoppingState,
              queue: filteredQueue,
            },
          };
        });
      },
      togglePantryItemFavorite: (id: string) => {
        set((state) => ({
          pantryItems: state.pantryItems.map((item) =>
            item.id === id ? { ...item, favorite: !item.favorite } : item
          ),
        }));
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
          usageEvents: [],
          shoppingState: { queue: [], lastGenerated: undefined },
        }),
    }),
    {
      name: 'cookmate-storage',
    }
  )
);

export { defaultPreferences };
