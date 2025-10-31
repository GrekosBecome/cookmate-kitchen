export function getIngredientEmoji(name: string): string {
  const lowerName = name.toLowerCase();

  // Dairy & Eggs
  if (/(egg|milk|cheese|yogurt|butter|cream|dairy)/i.test(lowerName)) return '🥚';
  
  // Vegetables
  if (/(tomato|lettuce|broccoli|carrot|pepper|onion|garlic|potato|cucumber|spinach|cabbage|celery|zucchini|eggplant|mushroom|avocado)/i.test(lowerName)) return '🍅';
  
  // Fruits
  if (/(apple|banana|orange|berry|grape|melon|strawberry|blueberry|lemon|lime|pear|peach|plum|mango|pineapple)/i.test(lowerName)) return '🍎';
  
  // Meat & Poultry
  if (/(chicken|beef|pork|lamb|turkey|meat|steak|bacon|ham|sausage)/i.test(lowerName)) return '🥩';
  
  // Seafood
  if (/(fish|salmon|tuna|shrimp|crab|seafood|cod|tilapia|lobster)/i.test(lowerName)) return '🐟';
  
  // Grains & Bread
  if (/(bread|pasta|rice|flour|oat|cereal|grain|noodle|spaghetti|macaroni)/i.test(lowerName)) return '🍞';
  
  // Condiments & Spices
  if (/(salt|pepper|spice|herb|sauce|oil|vinegar|mustard|ketchup|mayo|basil|oregano|thyme|cinnamon|cumin|paprika)/i.test(lowerName)) return '🧂';
  
  // Snacks & Sweets
  if (/(cookie|chip|candy|chocolate|snack|cake|brownie|muffin)/i.test(lowerName)) return '🍪';
  
  // Beverages
  if (/(water|juice|soda|coffee|tea|drink|beverage|beer|wine)/i.test(lowerName)) return '🥤';
  
  // Canned & Packaged
  if (/(can|jar|box|package|tin)/i.test(lowerName)) return '🥫';
  
  // Default
  return '🥫';
}
