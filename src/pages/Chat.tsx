import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const Chat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your cooking assistant. I can help you with recipes, substitutions, and cooking tips. (LLM integration coming soon!)",
    },
  ]);
  const [input, setInput] = useState('');

  const quickActions = [
    'Use my pantry',
    'Scale to 4 servings',
    'Swap dairy',
    'Make it vegan',
  ];

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages(prev => [
      ...prev,
      { role: 'user', content: input },
      { 
        role: 'assistant', 
        content: 'This is a UI stub. Real LLM integration will be added in Lovable!' 
      },
    ]);
    setInput('');
  };

  const handleQuickAction = (action: string) => {
    setInput(action);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b p-4">
        <div className="container max-w-2xl mx-auto flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/suggestion')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Cooking Assistant</h1>
            <p className="text-sm text-muted-foreground">Ask me anything!</p>
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
              <Badge
                key={action}
                variant="outline"
                className="cursor-pointer hover:bg-accent"
                onClick={() => handleQuickAction(action)}
              >
                {action}
              </Badge>
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
              placeholder="Type your message..."
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
