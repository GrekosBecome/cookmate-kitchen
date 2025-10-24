import { DetectedItem } from '@/types';

const INGREDIENT_POOL = [
  'milk', 'eggs', 'butter', 'cheese', 'yogurt', 'bread',
  'chicken', 'beef', 'pork', 'fish', 'shrimp',
  'tomatoes', 'lettuce', 'carrots', 'onions', 'garlic', 'potatoes',
  'apples', 'bananas', 'oranges', 'berries',
  'pasta', 'rice', 'flour', 'sugar'
];

export const mockImageDetection = (imageCount: number): DetectedItem[] => {
  // Generate 4-10 items per upload
  const itemCount = Math.floor(Math.random() * 7) + 4;
  
  // Shuffle and pick random items
  const shuffled = [...INGREDIENT_POOL].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(itemCount, INGREDIENT_POOL.length));
  
  return selected.map((name, index) => ({
    id: `detected-${Date.now()}-${index}`,
    name,
    confidence: parseFloat((Math.random() * 0.38 + 0.6).toFixed(2)), // 0.6-0.98
  }));
};
