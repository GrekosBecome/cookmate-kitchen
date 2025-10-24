import { ShoppingItem } from '@/types';
import { ShoppingItemCard } from './ShoppingItemCard';
import { categorizeShoppingItem } from '@/lib/shopping';
import { ShoppingCart } from 'lucide-react';

interface ShoppingListViewProps {
  shoppingItems: ShoppingItem[];
  onMarkBought: (id: string) => void;
  onRemove: (id: string) => void;
}

export function ShoppingListView({
  shoppingItems,
  onMarkBought,
  onRemove,
}: ShoppingListViewProps) {
  const activeItems = shoppingItems.filter((item) => !item.bought);

  if (activeItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
        <ShoppingCart className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-xl font-semibold mb-2">All stocked up! 🎉</h3>
        <p className="text-muted-foreground">
          Your pantry looks great. We'll let you know when items run low.
        </p>
      </div>
    );
  }

  // Group by category
  const grouped = activeItems.reduce((acc, item) => {
    const category = categorizeShoppingItem(item.name);
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, ShoppingItem[]>);

  // Sort categories
  const categoryOrder = ['Produce', 'Proteins', 'Dairy', 'Pantry', 'Misc'];
  const sortedCategories = Object.keys(grouped).sort(
    (a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b)
  );

  return (
    <div className="space-y-6">
      {sortedCategories.map((category) => (
        <div key={category} className="animate-fade-in">
          <h3 className="font-semibold text-lg mb-3">{category}</h3>
          <div className="space-y-2">
            {grouped[category].map((item) => (
              <ShoppingItemCard
                key={item.id}
                item={item}
                onCheck={() => onMarkBought(item.id)}
                onRemove={() => onRemove(item.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
