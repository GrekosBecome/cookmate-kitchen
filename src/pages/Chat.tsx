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

interface Message extends ChatMessage {
  allergenWarning?: string;
}

const Chat = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const recipeId = searchParams.get('recipeId');
  const recipe = recipeId ? RECIPE_CATALOG.find(r => r.id === recipeId) : null;
  
  const { pantryItems, preferences, signals } = useStore();
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
    // Initialize messages based on recipe context
    if (recipe) {
      setMessages([
        {
          role: 'assistant',
          content: `Hello! I'm your CookMate Chef 👨‍🍳. You're now talking about: **${recipe.title}**`,
        },
        {
          role: 'assistant',
          content: `I can help you adjust this recipe or replace ingredients you don't have. This recipe takes ${recipe.timeMin} minutes and includes ingredients like ${recipe.needs.slice(0, 3).join(', ')}. What would you like to know?`,
        },
      ]);
    } else {
      setMessages([
        {
          role: 'assistant',
          content: "Hello! I'm your CookMate Chef 👨‍🍳. Want to talk about today's recipe or substitutions?",
        },
      ]);
    }
  }, [recipe]);

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
        'Quick meal ideas',
      ];

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

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
        signals,
      });

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: response.content,
          allergenWarning: response.allergenWarning,
        },
      ]);
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b p-4 bg-background">
        <div className="container max-w-2xl mx-auto flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Chef Chat 👨‍🍳</h1>
            {recipe ? (
              <p className="text-sm text-muted-foreground">About: {recipe.title}</p>
            ) : (
              <p className="text-sm text-muted-foreground">Your cooking assistant</p>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="container max-w-2xl mx-auto space-y-4">
          {messages.map((message, index) => (
            <div key={index}>
              {message.allergenWarning && (
                <Alert className="mb-2 border-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{message.allergenWarning}</AlertDescription>
                </Alert>
              )}
              <Card
                className={message.role === 'user' ? 'ml-auto max-w-[85%] bg-primary text-primary-foreground' : 'mr-auto max-w-[85%]'}
              >
                <CardContent className="p-4">
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </CardContent>
              </Card>
            </div>
          ))}
          {isLoading && (
            <Card className="mr-auto max-w-[85%]">
              <CardContent className="p-4 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <p className="text-sm text-muted-foreground">Chef is thinking...</p>
              </CardContent>
            </Card>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t p-4 bg-background">
        <div className="container max-w-2xl mx-auto space-y-3">
          <div className="flex gap-2 flex-wrap">
            {quickActions.map((action) => (
              <Button
                key={action}
                variant="outline"
                size="sm"
                className="text-xs hover:bg-accent transition-colors"
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
              className="min-h-[60px] resize-none"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              size="icon"
              className="h-[60px] w-[60px]"
              disabled={isLoading || !input.trim()}
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
