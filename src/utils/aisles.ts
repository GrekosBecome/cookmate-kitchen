export type Aisle = 'Produce' | 'Proteins' | 'Pantry' | 'Dairy' | 'Bakery' | 'Frozen' | 'Misc';

export function categorizeByAisle(itemName: string): Aisle {
  const n = itemName.toLowerCase();
  
  // Produce
  if (/(tomato|lettuce|apple|spinach|carrot|broccoli|onion|garlic|potato|pepper|cucumber|celery|cabbage|kale|zucchini|eggplant|mushroom|avocado|lemon|lime|orange|banana|berry|melon|grape|peach|pear|plum)/i.test(n)) {
    return 'Produce';
  }
  
  // Proteins
  if (/(chicken|beef|fish|pork|meat|salmon|shrimp|tuna|turkey|lamb|bacon|sausage|ham|steak|fillet)/i.test(n)) {
    return 'Proteins';
  }
  
  // Dairy
  if (/(milk|cheese|yogurt|butter|cream|egg|cheddar|mozzarella|parmesan|feta|goat cheese|sour cream)/i.test(n)) {
    return 'Dairy';
  }
  
  // Bakery
  if (/(bread|baguette|tortilla|bagel|croissant|roll|bun|pita|naan|muffin|donut)/i.test(n)) {
    return 'Bakery';
  }
  
  // Frozen
  if (/(frozen|ice cream|popsicle|pizza)/i.test(n)) {
    return 'Frozen';
  }
  
  // Pantry (default for staples)
  if (/(oil|salt|pepper|sugar|flour|rice|pasta|noodle|spice|herb|sauce|vinegar|honey|syrup|cereal|oat|quinoa|lentil|bean|can|jar)/i.test(n)) {
    return 'Pantry';
  }
  
  return 'Misc';
}

export function groupByAisle(items: Array<{ name: string; [key: string]: any }>) {
  const grouped: Record<Aisle, typeof items> = {
    Produce: [],
    Proteins: [],
    Pantry: [],
    Dairy: [],
    Bakery: [],
    Frozen: [],
    Misc: [],
  };
  
  items.forEach(item => {
    const aisle = categorizeByAisle(item.name);
    grouped[aisle].push(item);
  });
  
  return grouped;
}
