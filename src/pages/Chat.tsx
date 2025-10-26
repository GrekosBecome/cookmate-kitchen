import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Send, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { RECIPE_CATALOG } from '@/data/recipes';
import { useStore } from '@/store/useStore';
import { getLLMResponse, ChatMessage } from '@/utils/llmAdapter';
import { Signal } from '@/types';
import { track } from '@/lib/analytics';

interface Message extends ChatMessage {
  allergenWarning?: string;
}

const Chat = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const recipeId = searchParams.get('recipeId');
  const recipe = recipeId ? RECIPE_CATALOG.find(r => r.id === recipeId) : null;
  
  const { 
    pantryItems, 
    preferences, 
    signals, 
    shoppingState, 
    memory, 
    updateMemory, 
    addRecentAction,
  } = useStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    track('opened_screen', { screen: 'chat', recipeId });
    
    // Check if we have detailed recipe context from "Let's cook"
    const haveParam = searchParams.get('have');
    const needParam = searchParams.get('need');
    const recipeTitle = searchParams.get('recipeTitle');
    
    if (recipeTitle && (haveParam !== null || needParam !== null)) {
      // Pre-seeded from "Let's cook" button
      const have = haveParam ? haveParam.split(',').filter(Boolean) : [];
      const need = needParam ? needParam.split(',').filter(Boolean) : [];
      const servings = preferences.servings || 2;
      
      const initialMsg = `I'm about to cook **${recipeTitle}** for ${servings} servings.

I already have: ${have.length > 0 ? have.join(', ') : '—'}.
I'm missing: ${need.length > 0 ? need.join(', ') : '—'}.

Please:
1) Confirm the steps with exact quantities for my servings,
2) Suggest up to 2 substitutions for each missing item,
3) Call out any allergen risks from my preferences,
4) Offer a time-saving tip.`;

      setMessages([
        {
          role: "assistant",
          content: "👨‍🍳 Welcome! I'm your personal cooking assistant. I can help you with recipes, substitutions, scaling, and cooking tips.",
        },
      ]);
      
      // Auto-send the message to get Chef's response
      setIsLoading(true);
      setTimeout(() => {
        handleSend(initialMsg);
      }, 100);
    } else if (recipe) {
      // Default recipe context
      let greeting = `Hello! I'm your CookMate Chef 👨‍🍳. You're now talking about: **${recipe.title}**`;
      
      if (memory.lastRecipeName && memory.lastRecipeName !== recipe.title) {
        greeting = `Hey, remember ${memory.lastRecipeName}? Here's something new: **${recipe.title}** 👨‍🍳`;
      }
      
      setMessages([
        {
          role: 'assistant',
          content: greeting,
        },
        {
          role: 'assistant',
          content: `I can help you adjust this recipe or replace ingredients you don't have. This recipe takes ${recipe.timeMin} minutes and includes ingredients like ${recipe.needs.slice(0, 3).join(', ')}. What would you like to know?`,
        },
      ]);
    } else {
      // No recipe context
      let greeting = "Hello! I'm your CookMate Chef 👨‍🍳. Want to talk about today's recipe or substitutions?";
      
      if (memory.lastChatDate) {
        const daysSinceChat = Math.floor(
          (Date.now() - new Date(memory.lastChatDate).getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (daysSinceChat < 2) {
          greeting = "Back already? Let's cook something fresh 🥗";
        }
      }
      
      setMessages([
        {
          role: 'assistant',
          content: greeting,
        },
      ]);
    }
    
    // Update memory
    updateMemory({ lastChatDate: new Date().toISOString() });
  }, [recipeId]);

  const hasShoppingItems = shoppingState.queue.filter(i => !i.bought).length > 0;

  const quickActions = recipe 
    ? [
        'Suggest ingredient swap',
        `Scale to ${preferences.servings === 4 ? 2 : 4} servings`,
        'Shorten cook time',
        'Show a similar recipe',
      ]
    : [
        'Use my pantry',
        'Scale to 4 servings',
        'Suggest swaps',
        ...(hasShoppingItems ? ['What should I buy?'] : []),
        'Quick meal ideas',
      ];

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    track('chat_message_sent', { recipeId });
    addRecentAction('chat', { recipeId });

    if (!messageText) setInput('');
    setIsLoading(true);

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: textToSend }]);

    try {
      const response = await getLLMResponse({
        messages: [...messages, { role: 'user', content: textToSend }],
        pantryItems,
        preferences,
        recipe: recipe || undefined,
        signals: signals.filter((s): s is Required<Signal> => !!s.recipeId).map(s => ({ type: s.type, recipeId: s.recipeId })),
        shoppingState,
      });

      // Add response (tools are now handled server-side)
      if (response.content) {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: response.content!,
            allergenWarning: response.allergenWarning,
          },
        ]);
      }
    } catch (error) {
      console.error('Error getting response:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I had trouble processing that. Could you try again? 🤔',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    if (isLoading) return;
    setInput(action);
    setTimeout(() => handleSend(action), 50);
  };

  // Recipe context chip
  const recipeTitle = searchParams.get('recipeTitle');
  const haveParam = searchParams.get('have');
  const needParam = searchParams.get('need');
  const showRecipeContext = recipeTitle && (haveParam !== null || needParam !== null);
  const haveCount = haveParam ? haveParam.split(',').filter(Boolean).length : 0;
  const needCount = needParam ? needParam.split(',').filter(Boolean).length : 0;

  return (
    <div 
      className="min-h-screen bg-background flex flex-col"
      style={{
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 64px)',
      }}
    >
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur-sm">
        <div 
          className="container max-w-2xl mx-auto px-4 py-3 flex items-center gap-3"
          style={{
            paddingTop: 'calc(env(safe-area-inset-top) + 12px)',
          }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="h-11 w-11 min-h-[44px] min-w-[44px] p-0"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-lg font-bold truncate">Chef Chat 👨‍🍳</h1>
            {recipe ? (
              <p className="text-xs sm:text-sm text-muted-foreground italic truncate">Talking about: {recipe.title}</p>
            ) : (
              <p className="text-xs sm:text-sm text-muted-foreground italic">Your cooking companion</p>
            )}
          </div>
        </div>
        
        {/* Recipe Context Chip */}
        {showRecipeContext && (
          <div className="container max-w-2xl mx-auto px-4 pb-3">
            <button
              onClick={() => navigate(`/recipe/${recipeId}`)}
              className="w-full flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg text-sm hover:bg-muted transition-colors"
            >
              <span className="flex-1 text-left">
                <span className="font-medium">Cooking: {recipeTitle}</span>
                <span className="text-muted-foreground"> • Have: {haveCount} • Need: {needCount}</span>
              </span>
              <span className="text-xs text-muted-foreground">Change</span>
            </button>
          </div>
        )}
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="container max-w-2xl mx-auto space-y-4">
          {messages.map((message, index) => (
            <div key={index} className="animate-fade-in">
              {message.allergenWarning && (
                <Alert className="mb-2 border-destructive/50 bg-destructive/5">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <AlertDescription className="text-destructive">{message.allergenWarning}</AlertDescription>
                </Alert>
              )}
              
              <Card
                className={
                  message.role === 'user' 
                    ? 'ml-auto max-w-[85%] bg-primary text-primary-foreground' 
                    : 'mr-auto max-w-[85%] bg-accent/30'
                }
              >
                <CardContent className="p-4">
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                </CardContent>
              </Card>
            </div>
          ))}
          {isLoading && (
            <Card className="mr-auto max-w-[85%] bg-accent/30 animate-fade-in">
              <CardContent className="p-4 flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-steam" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-steam" style={{ animationDelay: '200ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-steam" style={{ animationDelay: '400ms' }}></div>
                </div>
                <p className="text-sm text-muted-foreground italic">Chef is thinking...</p>
              </CardContent>
            </Card>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Sticky input bar */}
      <div 
        className="sticky bottom-0 border-t bg-background/95 backdrop-blur-sm z-30"
        style={{
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 64px)',
        }}
      >
        <div className="container max-w-2xl mx-auto px-4 py-3 space-y-3">
          <div className="flex gap-2 flex-wrap">
            {quickActions.map((action, idx) => (
              <Button
                key={action}
                variant="outline"
                size="sm"
                className="text-[11px] sm:text-xs h-8 sm:h-9 hover:bg-accent/50 transition-all duration-100 animate-fade-in"
                style={{ animationDelay: `${idx * 50}ms` }}
                onClick={() => handleQuickAction(action)}
                disabled={isLoading}
              >
                {action}
              </Button>
            ))}
          </div>

          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask the Chef anything..."
              className="min-h-[56px] sm:min-h-[60px] resize-none text-sm"
              disabled={isLoading}
            />
            <Button
              onClick={() => handleSend()}
              size="icon"
              className="h-14 w-14 min-h-[44px] min-w-[44px] flex-shrink-0"
              disabled={isLoading || !input.trim()}
              aria-label={isLoading ? 'Sending message' : 'Send message'}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
