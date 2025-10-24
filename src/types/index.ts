export interface Preferences {
  diet: DietType;
  allergies: string[];
  dislikes: string[];
  notificationTime: string;
  notificationDays: string[];
  servings: number;
}

export type DietType = 'Regular' | 'Vegetarian' | 'Vegan' | 'Pescatarian' | 'Keto' | 'Gluten-free';

export type PantryUnit = "pcs" | "g" | "kg" | "ml" | "l" | "tbsp" | "tsp" | "cup";

export interface PantryItem {
  id: string;
  name: string;
  qty?: number;
  unit?: PantryUnit;
  source: "photo" | "manual";
  confidence?: number;
  lastSeenAt: string;
  used?: boolean;
}

export interface DetectedItem {
  id: string;
  name: string;
  confidence: number;
}

export interface PantryState {
  items: PantryItem[];
  lastSyncAt?: string;
}

export interface SuggestionPick {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  cookTime: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface Signal {
  type: 'preference' | 'pantry' | 'feedback';
  data: any;
  timestamp: Date;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  cookTime: number;
  prepTime: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  imageUrl?: string;
}
