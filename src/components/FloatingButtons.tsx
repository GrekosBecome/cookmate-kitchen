import { useNavigate, useLocation } from 'react-router-dom';
import { ChefHat, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';

interface FloatingButtonsProps {
  recipeId?: string;
}

export const FloatingButtons = ({ recipeId }: FloatingButtonsProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { shoppingState } = useStore();

  const pendingShoppingItems = shoppingState.queue.filter(i => !i.bought).length;
  const isOnChatPage = location.pathname === '/chat';
  const isOnPantryPage = location.pathname === '/pantry';

  const handleChefClick = () => {
    if (recipeId) {
      navigate(`/chat?recipeId=${recipeId}`);
    } else {
      navigate('/chat');
    }
  };

  const handlePantryClick = () => {
    if (pendingShoppingItems > 0) {
      navigate('/pantry?tab=shopping');
    } else {
      navigate('/pantry');
    }
  };

  return (
    <TooltipProvider>
      <div 
        className="fixed bottom-20 left-0 right-0 flex justify-between px-4 pointer-events-none z-40"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {/* Pantry Shortcut - Left */}
        {!isOnPantryPage && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="secondary"
                onClick={handlePantryClick}
                className={cn(
                  "relative h-14 w-14 rounded-full shadow-lg pointer-events-auto",
                  "hover:scale-110 active:scale-95 transition-all duration-200",
                  "animate-fade-in",
                  pendingShoppingItems > 0 && "animate-pulse"
                )}
                aria-label={pendingShoppingItems > 0 ? `Shopping list (${pendingShoppingItems} items)` : 'Open pantry'}
              >
                <ShoppingCart className="h-6 w-6" />
                {pendingShoppingItems > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-[10px] flex items-center justify-center"
                    variant="destructive"
                  >
                    {pendingShoppingItems > 9 ? '9+' : pendingShoppingItems}
                  </Badge>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{pendingShoppingItems > 0 ? `Shopping list (${pendingShoppingItems})` : 'Open pantry'}</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Chef Shortcut - Right */}
        {!isOnChatPage && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                onClick={handleChefClick}
                className={cn(
                  "h-14 w-14 rounded-full shadow-lg pointer-events-auto ml-auto",
                  "hover:scale-110 active:scale-95 transition-all duration-200",
                  "animate-fade-in animate-breathe"
                )}
                aria-label="Ask the Chef"
              >
                <ChefHat className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Ask the Chef</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
};
