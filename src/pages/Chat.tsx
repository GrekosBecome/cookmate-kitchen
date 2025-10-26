import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Send, ArrowLeft, AlertCircle, Loader2, Undo2, CheckCircle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { RECIPE_CATALOG } from '@/data/recipes';
import { useStore } from '@/store/useStore';
import { getLLMResponse, ChatMessage } from '@/utils/llmAdapter';
import { Signal } from '@/types';
import { track } from '@/lib/analytics';
import { executeToolCalls, ToolExecutionContext } from '@/utils/toolExecutor';
import { useToast } from '@/hooks/use-toast';

interface Message extends ChatMessage {
  allergenWarning?: string;
  toolConfirmation?: {
    action: string;
    details: string;
    canUndo: boolean;
  };
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
    addShoppingItem,
    removeShoppingItem,
    recordOperation,
    undoLastOperation,
  } = useStore();
  const { toast } = useToast();
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
    
    // Initialize messages based on recipe context
    if (recipe) {
      let greeting = `Hello! I'm your CookMate Chef 👨‍🍳. You're now talking about: **${recipe.title}**`;
      
      // Add memory context if available
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
  }, [recipe]);

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

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    track('chat_message_sent', { recipeId });
    addRecentAction('chat', { recipeId });

    const userMessage = input;
    setInput('');
    setIsLoading(true);

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const response = await getLLMResponse({
        messages: [...messages, { role: 'user', content: userMessage }],
        pantryItems,
        preferences,
        recipe: recipe || undefined,
        signals: signals.filter((s): s is Required<Signal> => !!s.recipeId).map(s => ({ type: s.type, recipeId: s.recipeId })),
        shoppingState,
      });

      // Check if we got tool calls
      if (response.toolCalls) {
        console.log('Processing tool calls:', response.toolCalls);
        
        // Execute tools
        const toolContext: ToolExecutionContext = {
          pantry: pantryItems,
          cart: shoppingState.queue,
          addShoppingItem,
          removeShoppingItem,
          recordOperation,
          undoLastOperation,
        };
        
        const toolResults = executeToolCalls(response.toolCalls, toolContext);
        console.log('Tool results:', toolResults);
        
        // Format confirmation message
        let confirmationMsg = '';
        let actionSummary = '';
        
        toolResults.forEach((result, idx) => {
          const toolCall = response.toolCalls![idx];
          const res = result.result;
          
          switch (toolCall.name) {
            case 'addToCart':
              if (res.added) {
                actionSummary = 'Added to cart';
                confirmationMsg += `✅ Added **${res.item.name}** (${res.item.qty}${res.item.unit ? ' ' + res.item.unit : ''}) to your cart.\n`;
              } else {
                confirmationMsg += `ℹ️ ${res.message}\n`;
              }
              break;
              
            case 'removeFromCart':
              if (res.removed) {
                actionSummary = 'Removed from cart';
                confirmationMsg += `🗑️ Removed **${res.item.name}** from your cart.\n`;
              } else {
                confirmationMsg += `ℹ️ ${res.message}\n`;
              }
              break;
              
            case 'updateCartItem':
              if (res.updated) {
                actionSummary = 'Updated cart';
                confirmationMsg += `🔄 Updated **${res.item.name}** to ${res.item.qty}${res.item.unit ? ' ' + res.item.unit : ''}.\n`;
              } else {
                confirmationMsg += `ℹ️ ${res.message}\n`;
              }
              break;
              
            case 'summarizeCart':
              actionSummary = 'Cart summary';
              confirmationMsg += `**Shopping Cart Summary** (${res.totalItems} items)\n\n`;
              Object.entries(res.byAisle).forEach(([aisle, items]: [string, any[]]) => {
                if (items.length > 0) {
                  confirmationMsg += `**${aisle}:**\n`;
                  items.forEach(item => {
                    confirmationMsg += `- ${item.name} (${item.qty}${item.unit ? ' ' + item.unit : ''})\n`;
                  });
                  confirmationMsg += `\n`;
                }
              });
              break;
              
            case 'suggestSubstitutes':
              actionSummary = 'Substitutes';
              confirmationMsg += `**Substitutes for ${res.missing}:**\n`;
              res.alternatives.forEach((alt: string) => {
                confirmationMsg += `- ${alt}\n`;
              });
              if (res.inPantry.length > 0) {
                confirmationMsg += `\n**In your pantry:** ${res.inPantry.join(', ')}\n`;
              }
              break;
              
            case 'undoLastChange':
              if (res.undone) {
                actionSummary = 'Undone';
                confirmationMsg += `↩️ ${res.message}\n`;
                toast({
                  title: 'Undone',
                  description: res.message,
                });
              } else {
                confirmationMsg += `ℹ️ ${res.message}\n`;
              }
              break;
              
            case 'getPantry':
            case 'getCart':
              // These are read-only, no confirmation needed
              break;
          }
        });
        
        // Add confirmation message
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: confirmationMsg || 'Done! ✅',
            toolConfirmation: actionSummary ? {
              action: actionSummary,
              details: confirmationMsg,
              canUndo: ['addToCart', 'removeFromCart', 'updateCartItem'].includes(response.toolCalls![0]?.name),
            } : undefined,
          },
        ]);
      } else if (response.content) {
        // Regular text response
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
    // Auto-send after a short delay to give user a chance to modify
    setTimeout(() => {
      if (action === input) {
        handleSend();
      }
    }, 100);
  };

  const handleUndo = () => {
    const result = undoLastOperation();
    if (result.success) {
      toast({
        title: 'Undone',
        description: result.message,
      });
      // Add system message
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `↩️ ${result.message}`,
        },
      ]);
    } else {
      toast({
        title: 'Cannot undo',
        description: result.message,
        variant: 'destructive',
      });
    }
  };

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
              
              {message.toolConfirmation && (
                <Card className="mr-auto max-w-[85%] mb-2 border-primary/30 bg-primary/5">
                  <CardContent className="p-3 flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-primary mb-1">{message.toolConfirmation.action}</p>
                      <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                        {message.toolConfirmation.details}
                      </p>
                    </div>
                    {message.toolConfirmation.canUndo && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleUndo}
                        className="flex-shrink-0 h-7 px-2 text-xs"
                      >
                        <Undo2 className="h-3 w-3 mr-1" />
                        Undo
                      </Button>
                    )}
                  </CardContent>
                </Card>
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
              onClick={handleSend}
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
