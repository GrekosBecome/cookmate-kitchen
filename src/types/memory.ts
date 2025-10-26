export interface UserMemory {
  lastRecipe?: string;
  lastRecipeName?: string;
  lastChatDate?: string;
  lastCookDate?: string;
  favoriteIngredients: string[];
  dislikedIngredients: string[];
  recentActions: Array<{ type: string; ts: string; data?: any }>;
  memoryLearningEnabled: boolean;
}

export const defaultMemory: UserMemory = {
  favoriteIngredients: [],
  dislikedIngredients: [],
  recentActions: [],
  memoryLearningEnabled: true,
};

export interface AnalyticsEvent {
  event: string;
  data?: Record<string, any>;
  ts: string;
}
