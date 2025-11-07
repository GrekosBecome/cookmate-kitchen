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
  ViewedRecipe,
  Recipe,
} from '@/types';
import { UserMemory, defaultMemory } from '@/types/memory';
import { recordSignal as recordSignalLib, recomputeLearning as recomputeLearningLib } from '@/lib/learning';
import { updateConfidenceAfterCooking, applyTimeDecay, recalculateShoppingQueue } from '@/lib/shopping';
import { notificationService } from '@/lib/notifications';

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
  memory: UserMemory;
  operations: Array<{ id: string; type: string; timestamp: string; data: any }>;
  aiGeneratedRecipes: any[];
  lastAIGeneration?: string;
  viewedRecipes: ViewedRecipe[];
  setPreferences: (preferences: Preferences) => void;
  updatePreferences: (preferences: Partial<Preferences>) => void;
  updateMemory: (memory: Partial<UserMemory>) => void;
  addRecentAction: (type: string, data?: any) => void;
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
  consumePantryForRecipe: (ingredients: Ingredient[]) => number;
  recordUsageEvent: (event: UsageEvent) => void;
  applyConfidenceDecay: () => void;
  regenerateShoppingQueue: () => void;
  addShoppingItem: (item: Omit<ShoppingItem, 'id' | 'addedAt'>) => void;
  markShoppingItemBought: (id: string) => void;
  removeShoppingItem: (id: string) => void;
  updatePantryConfidenceAfterRecipe: (recipeId: string, recipeName: string, ingredients: Ingredient[]) => void;
  undoLastUsageEvent: () => void;
  togglePantryItemFavorite: (id: string) => void;
  recordOperation: (type: string, data: any) => void;
  undoLastOperation: () => { success: boolean; message: string };
  setAIGeneratedRecipes: (recipes: any[]) => void;
  clearAIGeneratedRecipes: () => void;
  addViewedRecipe: (recipe: Recipe, mode: 'classic' | 'ai' | 'improvised') => void;
  removeViewedRecipe: (id: string) => void;
  clearViewedRecipes: () => void;
  toggleViewedRecipeFavorite: (id: string) => void;
  reset: () => void;
}

export const defaultPreferences: Preferences = {
  diet: 'Regular',
  goals: [],
  mealPreferences: [],
  allergies: [],
  dislikes: [],
  notificationTime: '08:00',
  notificationDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  servings: 2,
  cookingGoals: [],
  privacyNoStoreImages: true,
};

// Helper to normalize ingredient names for better matching
const normalizeIngredientName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/\b(fresh|organic|chopped|diced|sliced|minced|grated|raw|cooked)\b/g, '')
    .replace(/s\b/g, '') // Simple singularization
    .replace(/\s+/g, ' ')
    .trim();
};

// Helper to match pantry item with recipe ingredient
const matchIngredient = (pantryItemName: string, recipeIngredientName: string): boolean => {
  const pantryNorm = normalizeIngredientName(pantryItemName);
  const recipeNorm = normalizeIngredientName(recipeIngredientName);
  
  // Exact match
  if (pantryNorm === recipeNorm) return true;
  
  // Check if one contains the other (with word boundary safety)
  const pantryWords = pantryNorm.split(' ');
  const recipeWords = recipeNorm.split(' ');
  
  // If all recipe words are in pantry name, it's a match
  if (recipeWords.every(word => pantryNorm.includes(word))) return true;
  
  // If all pantry words are in recipe name, it's a match
  if (pantryWords.every(word => recipeNorm.includes(word))) return true;
  
  return false;
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
      const newQty = (existingItem.qty || 1) + (newItem.qty || 1);
      const originalQty = existingItem.originalQty || existingItem.qty || 1;
      
      // Merge: increase quantity and update lastSeenAt
      itemMap.set(normalizedName, {
        ...existingItem,
        qty: newQty,
        originalQty: originalQty,
        lastSeenAt: new Date().toISOString(),
        confidence: newItem.confidence || existingItem.confidence,
      });
    } else {
      // New item: set originalQty = qty
      const qty = newItem.qty || 1;
      itemMap.set(normalizedName, {
        ...newItem,
        originalQty: qty,
      });
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
      memory: defaultMemory,
      operations: [],
      aiGeneratedRecipes: [],
      lastAIGeneration: undefined,
      viewedRecipes: [],
      setPreferences: (preferences) => set({ preferences, hasCompletedOnboarding: true }),
      updatePreferences: (newPreferences) =>
        set((state) => ({
          preferences: state.preferences
            ? { ...state.preferences, ...newPreferences }
            : { ...defaultPreferences, ...newPreferences },
        })),
      updateMemory: (partial) => set((state) => ({ memory: { ...state.memory, ...partial } })),
      addRecentAction: (type, data) => set((state) => ({
        memory: {
          ...state.memory,
          recentActions: [
            ...state.memory.recentActions.slice(-19),
            { type, ts: new Date().toISOString(), data }
          ]
        }
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
      consumePantryForRecipe: (ingredients: Ingredient[]) => {
        let consumedCount = 0;
        const now = new Date().toISOString();
        
        set((state) => {
          const itemsToAdd: ShoppingItem[] = [];
          
          const updatedItems = state.pantryItems
            .map((item) => {
              // Find matching ingredient from recipe
              const matchingIngredient = ingredients.find(ing => {
                const pantryName = ing.pantryName || ing.name;
                return matchIngredient(item.name, pantryName);
              });
              
              if (!matchingIngredient || item.used) {
                return item;
              }
              
              consumedCount++;
              
              // Initialize originalQty if not set (migration for old data)
              const originalQty = item.originalQty || item.qty || 100;
              
              // Calculate quantity reduction
              const recipeQty = matchingIngredient.qty || 0;
              const recipeUnit = matchingIngredient.unit?.toLowerCase();
              const pantryQty = item.qty || 0;
              const pantryUnit = item.unit?.toLowerCase();
              
              let newQty = pantryQty;
              
              // If we have quantity info for both and units match, reduce proportionally
              if (recipeQty > 0 && pantryQty > 0 && recipeUnit === pantryUnit) {
                newQty = Math.max(0, pantryQty - recipeQty);
              } else if (recipeQty > 0 && pantryQty > 0) {
                // Units don't match, reduce by a percentage (conservative estimate)
                newQty = Math.max(0, pantryQty * 0.7);
              } else {
                // No quantity info, reduce by 50% as estimate
                newQty = pantryQty * 0.5;
              }
              
              // Calculate confidence based on remaining percentage
              const newConfidence = originalQty > 0 ? (newQty / originalQty) * 100 : 0;
              
              // Decision tree based on confidence threshold
              if (newConfidence <= 0) {
                // Item completely used up - remove from pantry, add to shopping list
                itemsToAdd.push({
                  id: `shop-${Date.now()}-${Math.random()}`,
                  name: item.name,
                  reason: 'used_up',
                  suggestedQty: originalQty,
                  unit: item.unit,
                  autoGenerated: true,
                  addedAt: now,
                  bought: false,
                });
                return null; // Will be filtered out
              } else if (newConfidence < 20) {
                // Low stock - add to shopping list and remove from pantry
                itemsToAdd.push({
                  id: `shop-${Date.now()}-${Math.random()}`,
                  name: item.name,
                  reason: 'low_stock',
                  suggestedQty: originalQty,
                  unit: item.unit,
                  autoGenerated: true,
                  addedAt: now,
                  bought: false,
                });
                return null; // Will be filtered out
              } else {
                // Still have enough - update quantity and confidence
                const updatedItem = {
                  ...item,
                  qty: newQty,
                  originalQty: originalQty,
                  confidence: Math.round(newConfidence),
                  lastUsed: now,
                };
                
                // Send notification if confidence drops below 25% (early warning)
                if (newConfidence < 25 && (item.confidence || 100) >= 25) {
                  notificationService.sendLowStockAlert(item.name, newConfidence).catch(err => {
                    console.error('Failed to send low stock notification:', err);
                  });
                }
                
                return updatedItem;
              }
            })
            .filter((item): item is PantryItem => item !== null);
          
          // Add new shopping items
          const updatedQueue = [...state.shoppingState.queue];
          const queueNames = new Set(updatedQueue.map(i => i.name.toLowerCase()));
          
          itemsToAdd.forEach(newItem => {
            // Only add if not already in queue
            if (!queueNames.has(newItem.name.toLowerCase())) {
              updatedQueue.push(newItem);
            }
          });
          
          return {
            pantryItems: updatedItems,
            shoppingState: {
              ...state.shoppingState,
              queue: updatedQueue,
            },
          };
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
        set((state) => {
          const item = state.shoppingState.queue.find((i) => i.id === id);
          if (!item) return state;

          // Restock pantry: increase confidence to 80 or set if not exists
          const pantryName = item.name.toLowerCase();
          const existingPantryItem = state.pantryItems.find(
            (p) => p.name.toLowerCase() === pantryName
          );

          const updatedPantryItems = existingPantryItem
            ? state.pantryItems.map((p) =>
                p.name.toLowerCase() === pantryName
                  ? { ...p, confidence: 80, lastSeenAt: new Date().toISOString() }
                  : p
              )
            : [
                ...state.pantryItems,
                {
                  id: `pantry-${Date.now()}-${Math.random()}`,
                  name: item.name,
                  qty: item.suggestedQty || 1,
                  unit: item.unit,
                  source: 'manual' as const,
                  confidence: 80,
                  lastSeenAt: new Date().toISOString(),
                },
              ];

          return {
            pantryItems: updatedPantryItems,
            shoppingState: {
              ...state.shoppingState,
              queue: state.shoppingState.queue.filter((i) => i.id !== id),
            },
          };
        });
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
        // This function is now a no-op for backwards compatibility
        // All logic has been moved to consumePantryForRecipe
        // We still call regenerateShoppingQueue for any edge cases
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
      recordOperation: (type: string, data: any) => {
        set((state) => ({
          operations: [
            ...state.operations.slice(-20), // Keep last 20
            {
              id: `op-${Date.now()}`,
              type,
              timestamp: new Date().toISOString(),
              data,
            },
          ],
        }));
      },
      undoLastOperation: () => {
        const state = get();
        if (state.operations.length === 0) {
          return { success: false, message: 'Nothing to undo' };
        }

        const lastOp = state.operations[state.operations.length - 1];
        
        try {
          switch (lastOp.type) {
            case 'addToCart':
              // Remove the item that was added
              set((s) => ({
                shoppingState: {
                  ...s.shoppingState,
                  queue: s.shoppingState.queue.filter(item => item.id !== lastOp.data.id),
                },
                operations: s.operations.slice(0, -1),
              }));
              return { success: true, message: `Removed ${lastOp.data.name} from shopping list` };
              
            case 'removeFromCart':
              // Re-add the item that was removed
              set((s) => ({
                shoppingState: {
                  ...s.shoppingState,
                  queue: [...s.shoppingState.queue, lastOp.data.item],
                },
                operations: s.operations.slice(0, -1),
              }));
              return { success: true, message: `Restored ${lastOp.data.item.name} to shopping list` };
              
            case 'updateCartItem':
              // Restore previous values
              const itemId = lastOp.data.id;
              set((s) => ({
                shoppingState: {
                  ...s.shoppingState,
                  queue: s.shoppingState.queue.map(item =>
                    item.id === itemId ? lastOp.data.previous : item
                  ),
                },
                operations: s.operations.slice(0, -1),
              }));
              return { success: true, message: `Restored ${lastOp.data.previous.name}` };
              
            default:
              set((s) => ({ operations: s.operations.slice(0, -1) }));
              return { success: true, message: 'Operation undone' };
          }
        } catch (error) {
          return { success: false, message: 'Failed to undo operation' };
        }
      },
      setAIGeneratedRecipes: (recipes: any[]) => 
        set({ 
          aiGeneratedRecipes: recipes,
          lastAIGeneration: new Date().toISOString()
        }),
      clearAIGeneratedRecipes: () => 
        set({ 
          aiGeneratedRecipes: [],
          lastAIGeneration: undefined
        }),
      addViewedRecipe: (recipe, mode) => 
        set((state) => {
          const viewed: ViewedRecipe = {
            id: `${recipe.id}-${Date.now()}`,
            recipe,
            viewedAt: new Date().toISOString(),
            mode
          };
          
          // Keep only last 50 recipes for performance
          const updated = [viewed, ...state.viewedRecipes].slice(0, 50);
          
          return { viewedRecipes: updated };
        }),
      removeViewedRecipe: (id) => 
        set((state) => ({
          viewedRecipes: state.viewedRecipes.filter(v => v.id !== id)
        })),
      clearViewedRecipes: () => set({ viewedRecipes: [] }),
      toggleViewedRecipeFavorite: (id) =>
        set((state) => ({
          viewedRecipes: state.viewedRecipes.map(v =>
            v.id === id ? { ...v, isFavorite: !v.isFavorite } : v
          )
        })),
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
          memory: defaultMemory,
          operations: [],
          aiGeneratedRecipes: [],
          lastAIGeneration: undefined,
          viewedRecipes: [],
        }),
    }),
    {
      name: 'cookmate-storage',
    }
  )
);
