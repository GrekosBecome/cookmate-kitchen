import { useLocation, useNavigate } from 'react-router-dom';
import { Home, ChefHat, MessageCircle, Settings, ShoppingCart } from 'lucide-react';
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
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const isActive = (path: string) => {
    if (path === '/suggestion') return location.pathname === '/' || location.pathname === '/suggestion';
    return location.pathname.startsWith(path);
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-background border-t z-50 safe-bottom"
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
                'relative flex flex-col items-center justify-center gap-1 min-w-[60px] h-full rounded-lg transition-all duration-200',
                'active:scale-95 active:bg-muted/50',
                active ? 'text-primary' : 'text-muted-foreground'
              )}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
            >
              <div className="relative">
                <Icon 
                  className={cn(
                    'h-5 w-5 transition-all duration-200',
                    active && 'scale-110'
                  )} 
                />
                {badge > 0 && (
                  <Badge 
                    className="absolute -top-2 -right-2 h-4 min-w-4 px-1 text-[10px] flex items-center justify-center animate-pulse"
                    variant="destructive"
                  >
                    {badge > 9 ? '9+' : badge}
                  </Badge>
                )}
              </div>
              <span 
                className={cn(
                  'text-[10px] font-medium transition-all duration-200',
                  active && 'font-semibold'
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
