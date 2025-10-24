import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { RECIPE_CATALOG } from '@/data/recipes';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const Chat = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const recipeId = searchParams.get('recipeId');
  const recipe = recipeId ? RECIPE_CATALOG.find(r => r.id === recipeId) : null;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

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
        '🧂 Suggest ingredient swap',
        '⚖️ Scale servings',
        '⏰ Shorten cook time',
        '💡 Show a similar recipe',
      ]
    : [
        'Use my pantry',
        'Scale to 4 servings',
        'Swap dairy',
        'Make it vegan',
      ];

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');

    setMessages(prev => [
      ...prev,
      { role: 'user', content: userMessage },
      { 
        role: 'assistant', 
        content: recipe 
          ? `Great question about ${recipe.title}! (Real LLM integration will provide personalized cooking advice here)`
          : 'This is a UI stub. Real LLM integration will be added in Lovable!' 
      },
    ]);
  };

  const handleQuickAction = (action: string) => {
    setInput(action);
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
            <Card
              key={index}
              className={message.role === 'user' ? 'ml-auto max-w-[85%] bg-primary text-primary-foreground' : 'mr-auto max-w-[85%]'}
            >
              <CardContent className="p-4">
                <p className="text-sm">{message.content}</p>
              </CardContent>
            </Card>
          ))}
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
            />
            <Button
              onClick={handleSend}
              size="icon"
              className="h-[60px] w-[60px]"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
