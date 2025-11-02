// Comprehensive emoji mapping for specific food items
const ITEM_EMOJI_MAP: Record<string, string> = {
  // Dairy & Eggs
  'milk': '🥛',
  'cheese': '🧀',
  'egg': '🥚',
  'eggs': '🥚',
  'yogurt': '🍶',
  'butter': '🧈',
  'cream': '🍦',
  
  // Vegetables
  'tomato': '🍅',
  'tomatoes': '🍅',
  'lettuce': '🥬',
  'broccoli': '🥦',
  'carrot': '🥕',
  'carrots': '🥕',
  'pepper': '🌶️',
  'peppers': '🌶️',
  'bell pepper': '🫑',
  'onion': '🧅',
  'onions': '🧅',
  'garlic': '🧄',
  'potato': '🥔',
  'potatoes': '🥔',
  'cucumber': '🥒',
  'mushroom': '🍄',
  'mushrooms': '🍄',
  'corn': '🌽',
  'spinach': '🥬',
  'cabbage': '🥬',
  
  // Fruits
  'apple': '🍎',
  'apples': '🍎',
  'banana': '🍌',
  'bananas': '🍌',
  'orange': '🍊',
  'oranges': '🍊',
  'lemon': '🍋',
  'lemons': '🍋',
  'strawberry': '🍓',
  'strawberries': '🍓',
  'blueberry': '🫐',
  'blueberries': '🫐',
  'grapes': '🍇',
  'watermelon': '🍉',
  'kiwi': '🥝',
  'pineapple': '🍍',
  'avocado': '🥑',
  'lime': '🍋',
  'pear': '🍐',
  'peach': '🍑',
  'mango': '🥭',
  
  // Meat & Poultry
  'chicken': '🍗',
  'beef': '🥩',
  'pork': '🍖',
  'lamb': '🍖',
  'turkey': '🦃',
  'sausage': '🌭',
  'ham': '🍖',
  'bacon': '🥓',
  'meatballs': '🍢',
  'steak': '🥩',
  'meat': '🥩',
  
  // Seafood
  'fish': '🐟',
  'salmon': '🍣',
  'tuna': '🐠',
  'shrimp': '🍤',
  'crab': '🦀',
  'lobster': '🦞',
  'octopus': '🐙',
  'mussels': '🦪',
  'cod': '🐟',
  'tilapia': '🐟',
  
  // Grains & Bread
  'bread': '🍞',
  'pasta': '🍝',
  'rice': '🍚',
  'flour': '🌾',
  'oats': '🥣',
  'cereal': '🥣',
  'croissant': '🥐',
  'pancakes': '🥞',
  'waffles': '🧇',
  'noodle': '🍜',
  'noodles': '🍜',
  'spaghetti': '🍝',
  'macaroni': '🍝',
  
  // Canned & Packaged
  'beans': '🥫',
  'soup': '🍲',
  'pickles': '🥒',
  'canned': '🥫',
  
  // Condiments & Spices
  'salt': '🧂',
  'herbs': '🌿',
  'basil': '🌿',
  'oregano': '🌿',
  'thyme': '🌿',
  'oil': '🫒',
  'olive oil': '🫒',
  'vinegar': '🍶',
  'sauce': '🍯',
  'ketchup': '🍅',
  'mustard': '🌭',
  'mayonnaise': '🍶',
  'mayo': '🍶',
  'soy sauce': '🥢',
  
  // Snacks & Sweets
  'cookie': '🍪',
  'cookies': '🍪',
  'chips': '🍟',
  'candy': '🍬',
  'chocolate': '🍫',
  'ice cream': '🍨',
  'cake': '🍰',
  'donut': '🍩',
  'donuts': '🍩',
  'muffin': '🧁',
  'popcorn': '🍿',
  
  // Beverages
  'water': '💧',
  'coffee': '☕️',
  'tea': '🍵',
  'juice': '🧃',
  'soda': '🥤',
  'wine': '🍷',
  'beer': '🍺',
  'cocktail': '🍸',
  'smoothie': '🥤',
  
  // Greek translations
  'γάλα': '🥛',
  'τυρί': '🧀',
  'αυγό': '🥚',
  'αυγά': '🥚',
  'ψωμί': '🍞',
  'ντομάτα': '🍅',
  'κρεμμύδι': '🧅',
  'σκόρδο': '🧄',
  'πατάτα': '🥔',
  'κοτόπουλο': '🍗',
  'ψάρι': '🐟',
};

export function getIngredientEmoji(name: string): string {
  const lowerName = name.toLowerCase().trim();
  
  // First tier: Check for exact matches
  if (ITEM_EMOJI_MAP[lowerName]) {
    return ITEM_EMOJI_MAP[lowerName];
  }
  
  // Second tier: Check if any key is contained in the name
  for (const [key, emoji] of Object.entries(ITEM_EMOJI_MAP)) {
    if (lowerName.includes(key)) {
      return emoji;
    }
  }
  
  // Third tier: Fallback to category matching
  if (/dairy/i.test(lowerName)) return '🥚';
  if (/vegetable|veggie|celery|zucchini|eggplant/i.test(lowerName)) return '🥬';
  if (/fruit|berry|melon|plum/i.test(lowerName)) return '🍎';
  if (/seafood/i.test(lowerName)) return '🐟';
  if (/grain/i.test(lowerName)) return '🍞';
  if (/spice|herb|cinnamon|cumin|paprika/i.test(lowerName)) return '🌿';
  if (/snack|brownie/i.test(lowerName)) return '🍪';
  if (/drink|beverage/i.test(lowerName)) return '🥤';
  if (/(can|jar|box|package|tin)/i.test(lowerName)) return '🥫';
  
  // Default fallback
  return '🥫';
}
