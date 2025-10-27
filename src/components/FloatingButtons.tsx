import { useNavigate, useLocation } from 'react-router-dom';
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
import chefIcon from '@/assets/chef-icon.png';

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
        className="fixed bottom-20 right-4 pointer-events-none z-40"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {/* Chef Shortcut - Right */}
        {!isOnChatPage && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                onClick={handleChefClick}
                className={cn(
                  "h-14 w-14 rounded-full shadow-lg pointer-events-auto overflow-hidden p-0",
                  "hover:scale-110 active:scale-95 transition-all duration-200",
                  "animate-fade-in animate-breathe"
                )}
                aria-label="Ask the Chef"
              >
                <img 
                  src={chefIcon} 
                  alt="Chef" 
                  className="w-full h-full object-cover"
                />
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
