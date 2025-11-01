import { useLocation, useNavigate } from 'react-router-dom';
import { Home, ChefHat, MessageCircle, User, ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';

export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { shoppingState } = useStore();

  const pendingShoppingItems = shoppingState.queue.filter(i => !i.bought).length;

  const tabs = [
    { icon: ShoppingCart, label: 'Pantry', path: '/pantry', badge: pendingShoppingItems },
    { icon: Home, label: 'Recipes', path: '/suggestion' },
    { icon: MessageCircle, label: 'Chef', path: '/chat' },
    { icon: User, label: 'You', path: '/settings' },
  ];

  const isActive = (path: string) => {
    if (path === '/suggestion') return location.pathname === '/' || location.pathname === '/suggestion';
    return location.pathname.startsWith(path);
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 frosted border-t border-border z-50 safe-bottom"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex items-center justify-around h-16 max-w-2xl mx-auto px-2">
        {tabs.map(({ icon: Icon, label, path, badge }) => {
          const active = isActive(path);
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn(
                'relative flex flex-col items-center justify-center gap-1 min-w-[60px] h-full rounded-2xl transition-all duration-300',
                'active:scale-95',
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
            >
              <div className="relative">
                <Icon 
                  className={cn(
                    'h-5 w-5 transition-all duration-300',
                    active && 'scale-110'
                  )} 
                />
                {badge > 0 && (
                  <Badge 
                    className="absolute -top-2 -right-2 h-4 min-w-4 px-1 text-[10px] flex items-center justify-center pulse-glow font-light"
                    variant="destructive"
                  >
                    {badge > 9 ? '9+' : badge}
                  </Badge>
                )}
              </div>
              <span 
                className={cn(
                  'text-[10px] font-light transition-all duration-300',
                  active && 'font-normal'
                )}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
