export interface Preferences {
  diet: DietType;
  allergies: string[];
  dislikes: string[];
  notificationTime: string;
  notificationDays: string[];
  servings: number;
}

export type DietType = 'Regular' | 'Vegetarian' | 'Vegan' | 'Pescatarian' | 'Keto' | 'Gluten-free';

export interface PantryItem {
  id: string;
  name: string;
  quantity?: number;
  unit?: string;
  addedAt: Date;
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
