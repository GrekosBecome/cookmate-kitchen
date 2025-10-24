export type PantryUnit = 'pcs' | 'g' | 'kg' | 'ml' | 'l' | 'tbsp' | 'tsp' | 'cup';

export interface PantryItem {
  id: string;
  name: string;
  qty?: number;
  unit?: PantryUnit;
  source: 'photo' | 'manual';
  confidence?: number;
  lastSeenAt: string;
  used?: boolean;
}

export interface DetectedItem {
  id: string;
  name: string;
  confidence: number;
}

export interface Preferences {
  diet: 'Regular' | 'Vegetarian' | 'Vegan' | 'Pescatarian' | 'Keto' | 'Gluten-free';
  allergies: string[];
  dislikes: string[];
  notificationTime: string;
  notificationDays: string[];
  servings: number;
  privacyNoStoreImages?: boolean;
}

export interface Ingredient {
  name: string;
  qty?: number;
  unit?: string;
  optional?: boolean;
  pantryName?: string;
}

export interface Step {
  order: number;
  text: string;
  minutes?: number;
}

export interface Recipe {
  id: string;
  title: string;
  timeMin: number;
  kcal?: number;
  tags: string[];
  allergens?: string[];
  needs: string[];
  optional?: string[];
  ingredients: Ingredient[];
  steps: Step[];
  substitutions?: Record<string, string>;
  healthNote?: string;
}

export interface SuggestionPick {
  date: string;
  recipeIds: string[];
  indexShown: number;
}

export interface Signal {
  type: 'viewed' | 'accepted' | 'another' | 'skip';
  recipeId: string;
  timestamp: string;
}
