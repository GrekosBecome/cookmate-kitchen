import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Send, ArrowLeft, AlertCircle, Loader2, MessageSquareText } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { RECIPE_CATALOG } from '@/data/recipes';
import { useStore } from '@/store/useStore';
import { getLLMResponse, ChatMessage as LLMChatMessage } from '@/utils/llmAdapter';
import { Signal, ChatMessage } from '@/types';
import { track } from '@/lib/analytics';
import { saveChef, loadChef, clearChef } from '@/lib/sessionChat';
import chefAvatar from '@/assets/chef-avatar-new.png';
import ChatHistorySheet from '@/components/recipe/ChatHistorySheet';

interface Message extends LLMChatMessage {
  allergenWarning?: string;
  timestamp?: string;
}
const Chat = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const recipeId = searchParams.get('recipeId');
  const recipe = recipeId ? RECIPE_CATALOG.find(r => r.id === recipeId) : null;
  const continueChat = searchParams.get('continueChat');
  
  const {
    pantryItems,
    preferences,
    signals,
    shoppingState,
    memory,
    updateMemory,
    addRecentAction,
    saveChatConversation,
    updateChatConversation,
    chatHistory
  } = useStore();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [restoredFromCache, setRestoredFromCache] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [historySheetOpen, setHistorySheetOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle back navigation to recipes page
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      navigate('/recipes', {
        replace: true
      });
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigate]);
  useEffect(() => {
    let isActive = true; // Flag to prevent duplicate calls
    
    track('opened_screen', {
      screen: 'chat',
      recipeId
    });

    // Check if we're continuing an existing chat
    if (continueChat) {
      const conversation = chatHistory.find(c => c.id === continueChat);
      if (conversation) {
        const messagesWithTimestamp = conversation.messages.map(m => ({
          ...m,
          timestamp: m.timestamp || new Date().toISOString()
        }));
        setMessages(messagesWithTimestamp);
        setCurrentChatId(conversation.id);
        setRestoredFromCache(true);
        return;
      }
    }

    // Try to restore from session cache first, but only if recipe context hasn't changed
    const cached = loadChef();
    const currentRecipeTitle = searchParams.get('recipeTitle');
    const cachedRecipeTitle = cached?.ctx?.recipeTitle;
    
    if (cached && cached.messages.length > 0 && currentRecipeTitle === cachedRecipeTitle) {
      const messagesWithTimestamp = cached.messages.map(m => ({
        ...m,
        timestamp: m.timestamp || new Date().toISOString()
      }));
      setMessages(messagesWithTimestamp);
      setInput(cached.draft || '');
      setRestoredFromCache(true);
      return;
    }

    // Check if we have detailed recipe context from "Let's cook"
    const haveParam = searchParams.get('have');
    const needParam = searchParams.get('need');
    const recipeTitle = searchParams.get('recipeTitle');
    if (recipeTitle && (haveParam !== null || needParam !== null)) {
      // Pre-seeded from "Let's cook" button
      const have = haveParam ? haveParam.split(',').filter(Boolean) : [];
      const need = needParam ? needParam.split(',').filter(Boolean) : [];
      const servings = preferences?.servings || 2;
      const initialMsg = `Give me the complete recipe for **${recipeTitle}** with step-by-step instructions for ${servings} servings.

I have: ${have.length > 0 ? have.join(', ') : 'nothing yet'}.
I need: ${need.length > 0 ? need.join(', ') : 'all ingredients'}.`;

      // Initialize with both assistant welcome and user message
      const initialMessages: Message[] = [{
        role: "assistant",
        content: "👨‍🍳 Welcome! I'm your personal cooking assistant. I can help you with recipes, substitutions, scaling, and cooking tips.",
        timestamp: new Date().toISOString()
      }, {
        role: "user",
        content: initialMsg,
        timestamp: new Date().toISOString()
      }];
      setMessages(initialMessages);

      // Auto-fetch Chef's response without adding user message again
      setIsLoading(true);
      setTimeout(async () => {
        if (!isActive) return; // Prevent execution if component unmounted
        
        try {
          const response = await getLLMResponse({
            messages: initialMessages,
            pantryItems,
            preferences,
            recipe: recipe || undefined,
            signals: signals.filter((s): s is Required<Signal> => !!s.recipeId).map(s => ({
              type: s.type,
              recipeId: s.recipeId
            })),
            shoppingState
          });
          if (response.content && isActive) {
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: response.content!,
              allergenWarning: response.allergenWarning,
              timestamp: new Date().toISOString()
            }]);
          }
        } catch (error) {
          console.error('Error getting response:', error);
          if (isActive) {
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: 'Sorry, I had trouble processing that. Could you try again? 🤔'
            }]);
          }
        } finally {
          if (isActive) {
            setIsLoading(false);
          }
        }
      }, 100);
    } else if (recipe) {
      // Default recipe context
      let greeting = `Hello! I'm your Kitchen Mate Chef 👨‍🍳. You're now talking about: **${recipe.title}**`;
      if (memory.lastRecipeName && memory.lastRecipeName !== recipe.title) {
        greeting = `Hey, remember ${memory.lastRecipeName}? Here's something new: **${recipe.title}** 👨‍🍳`;
      }
      setMessages([{
        role: 'assistant',
        content: greeting,
        timestamp: new Date().toISOString()
      }, {
        role: 'assistant',
        content: `I can help you adjust this recipe or replace ingredients you don't have. This recipe takes ${recipe.timeMin} minutes and includes ingredients like ${recipe.needs.slice(0, 3).join(', ')}. What would you like to know?`,
        timestamp: new Date().toISOString()
      }]);
    } else {
      // No recipe context
      let greeting = "Hello! I'm your Kitchen Mate Chef 👨‍🍳. Want to talk about today's recipe or substitutions?";
      if (memory.lastChatDate) {
        const daysSinceChat = Math.floor((Date.now() - new Date(memory.lastChatDate).getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceChat < 2) {
          greeting = "Back already? Let's cook something fresh 🥗";
        }
      }
      setMessages([{
        role: 'assistant',
        content: greeting,
        timestamp: new Date().toISOString()
      }]);
    }

    // Update memory
    updateMemory({
      lastChatDate: new Date().toISOString()
    });
    
    return () => {
      isActive = false; // Cleanup to prevent duplicate calls
    };
  }, [recipeId, continueChat]);

  // Save to permanent storage whenever messages change (if meaningful conversation)
  useEffect(() => {
    // Only save if we have at least 3 messages (greeting + user + assistant response)
    if (messages.length < 3) return;

    const recipeTitle = searchParams.get('recipeTitle');
    const chatMessages: ChatMessage[] = messages.map(m => ({
      role: m.role,
      content: m.content,
      allergenWarning: m.allergenWarning,
      timestamp: m.timestamp || new Date().toISOString()
    }));

    if (!currentChatId && !continueChat) {
      // Create new conversation
      const id = saveChatConversation({
        recipeId: recipeId || undefined,
        recipeTitle: recipeTitle || undefined,
        messages: chatMessages
      });
      setCurrentChatId(id);
      console.log('💾 Created new chat conversation:', id);
    } else if (currentChatId) {
      // Update existing conversation
      updateChatConversation(currentChatId, chatMessages);
      console.log('💾 Updated chat conversation:', currentChatId);
    }
  }, [messages]);

  // Backup: Save on page unload/visibility change
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (messages.length >= 3 && currentChatId) {
        const chatMessages: ChatMessage[] = messages.map(m => ({
          role: m.role,
          content: m.content,
          allergenWarning: m.allergenWarning,
          timestamp: m.timestamp || new Date().toISOString()
        }));
        updateChatConversation(currentChatId, chatMessages);
        console.log('💾 Saved on beforeunload');
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && messages.length >= 3 && currentChatId) {
        const chatMessages: ChatMessage[] = messages.map(m => ({
          role: m.role,
          content: m.content,
          allergenWarning: m.allergenWarning,
          timestamp: m.timestamp || new Date().toISOString()
        }));
        updateChatConversation(currentChatId, chatMessages);
        console.log('💾 Saved on visibility change');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [messages, currentChatId]);

  // Auto-save session on changes
  useEffect(() => {
    if (messages.length > 0) {
      const ctx = {
        recipeId: recipeId || undefined,
        recipeTitle: searchParams.get('recipeTitle') || undefined,
        have: searchParams.get('have') || undefined,
        need: searchParams.get('need') || undefined
      };
      saveChef({
        messages,
        draft: input,
        ctx
      });
    }
  }, [messages, input, recipeId, searchParams]);

  // Persist on visibility change / beforeunload
  useEffect(() => {
    const persist = () => {
      if (messages.length > 0) {
        const ctx = {
          recipeId: recipeId || undefined,
          recipeTitle: searchParams.get('recipeTitle') || undefined,
          have: searchParams.get('have') || undefined,
          need: searchParams.get('need') || undefined
        };
        saveChef({
          messages,
          draft: input,
          ctx
        });
      }
    };
    window.addEventListener('visibilitychange', persist);
    window.addEventListener('beforeunload', persist);
    return () => {
      window.removeEventListener('visibilitychange', persist);
      window.removeEventListener('beforeunload', persist);
    };
  }, [messages, input, recipeId, searchParams]);
  const hasShoppingItems = shoppingState.queue.filter(i => !i.bought).length > 0;
  const hasPantryItems = pantryItems.length > 0;
  const quickActions = recipe 
    ? ['Suggest ingredient swap', `Scale to ${preferences.servings === 4 ? 2 : 4} servings`, 'Shorten cook time', 'Show a similar recipe'] 
    : [
        ...(hasPantryItems ? ['What can I cook with my pantry?'] : []),
        'Quick meal ideas',
        'Suggest swaps',
        ...(hasShoppingItems ? ['What should I buy?'] : [])
      ];
  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;
    track('chat_message_sent', {
      recipeId
    });
    addRecentAction('chat', {
      recipeId
    });
    if (!messageText) setInput('');
    setIsLoading(true);

    // Add user message
    setMessages(prev => [...prev, {
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString()
    }]);
    try {
      const response = await getLLMResponse({
        messages: [...messages, {
          role: 'user',
          content: textToSend
        }],
        pantryItems,
        preferences,
        recipe: recipe || undefined,
        signals: signals.filter((s): s is Required<Signal> => !!s.recipeId).map(s => ({
          type: s.type,
          recipeId: s.recipeId
        })),
        shoppingState
      });

      // Add response (tools are now handled server-side)
      if (response.content) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response.content!,
          allergenWarning: response.allergenWarning,
          timestamp: new Date().toISOString()
        }]);
      }
    } catch (error) {
      console.error('Error getting response:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I had trouble processing that. Could you try again? 🤔',
        timestamp: new Date().toISOString()
      }]);
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
    <>
      <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur-sm">
        <div className="container max-w-2xl mx-auto px-4 py-2 flex items-center gap-3" style={{
        paddingTop: 'calc(env(safe-area-inset-top) + 8px)'
      }}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/suggestion')}
            className="h-8 w-8 flex-shrink-0"
            aria-label="Back to recipes"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <img src={chefAvatar} alt="Chef" className="w-7 h-7 rounded-full object-cover" />
          <div className="flex-1 min-w-0">
            <h1 className="text-sm sm:text-base font-bold truncate">Chef Chat</h1>
            {recipe ? <p className="text-xs text-muted-foreground italic truncate">Talking about: {recipe.title}</p> : <p className="text-xs text-muted-foreground italic">Your cooking companion</p>}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setHistorySheetOpen(true)}
            className="h-9 w-9 flex-shrink-0 border-primary/20 hover:bg-primary/10 hover:border-primary/40"
            aria-label="Chat history"
          >
            <MessageSquareText className="h-5 w-5 text-primary" />
          </Button>
        </div>
        
        {/* Recipe Context Chip */}
        {showRecipeContext && <div className="container max-w-2xl mx-auto px-4 pb-2">
            <button onClick={() => navigate(`/recipe/${recipeId}`)} className="w-full flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg text-xs hover:bg-muted transition-colors">
              <span className="flex-1 text-left">
                <span className="font-medium">Cooking: {recipeTitle}</span>
                <span className="text-muted-foreground"> • Have: {haveCount} • Need: {needCount}</span>
              </span>
              <span className="text-xs text-muted-foreground">Change</span>
            </button>
          </div>}
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-2 pb-44">
        <div className="container max-w-2xl mx-auto space-y-4">
          {restoredFromCache && <div className="text-center animate-fade-in">
              <p className="text-xs text-muted-foreground">Restored your chat from a few minutes ago ⏳</p>
            </div>}
          
          {messages.map((message, index) => <div key={index} className="animate-fade-in">
              {message.allergenWarning && <Alert className="mb-2 border-destructive/50 bg-destructive/5">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <AlertDescription className="text-destructive">{message.allergenWarning}</AlertDescription>
                </Alert>}
              
              <Card className={message.role === 'user' ? 'ml-auto max-w-[85%] bg-primary text-primary-foreground' : 'mr-auto max-w-[85%] bg-accent/30'}>
                <CardContent className="p-4">
                  <p className="text-base whitespace-pre-wrap leading-loose">{message.content}</p>
                </CardContent>
              </Card>
            </div>)}
          {isLoading && <Card className="mr-auto max-w-[85%] bg-accent/30 animate-fade-in">
              <CardContent className="p-4 flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-steam" style={{
                animationDelay: '0ms'
              }}></div>
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-steam" style={{
                animationDelay: '200ms'
              }}></div>
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-steam" style={{
                animationDelay: '400ms'
              }}></div>
                </div>
                <p className="text-sm text-muted-foreground italic">Chef is thinking...</p>
              </CardContent>
            </Card>}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Sticky input bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur-sm z-50 py-3" style={{
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)'
      }}>
        <div className="container max-w-2xl mx-auto px-4 space-y-3">
          <div className="relative animate-fade-in">
            {/* Fade gradients for scroll hint */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
            
            {/* Horizontal scrollable container */}
            <div className="flex overflow-x-auto gap-2 px-2 py-1 scrollbar-hide scroll-smooth snap-x snap-mandatory">
              {quickActions.map((action, idx) => <button key={action} onClick={() => handleQuickAction(action)} disabled={isLoading} className="flex-shrink-0 whitespace-nowrap rounded-full border border-border bg-background px-4 py-2 text-xs font-medium hover:bg-accent hover:text-accent-foreground active:scale-95 transition-all duration-100 disabled:opacity-50 disabled:pointer-events-none snap-start animate-fade-in" style={{
              animationDelay: `${idx * 50}ms`
            }} aria-label={action} tabIndex={0}>
                  {action}
                </button>)}
            </div>
          </div>

          <div className="flex gap-2">
            <Textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }} placeholder="Ask the Chef anything..." className="min-h-[56px] sm:min-h-[60px] resize-none text-sm" disabled={isLoading} />
            <Button onClick={() => handleSend()} size="icon" className="h-14 w-14 min-h-[44px] min-w-[44px] flex-shrink-0" disabled={isLoading || !input.trim()} aria-label={isLoading ? 'Sending message' : 'Send message'}>
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>
      </div>
      
      <ChatHistorySheet 
        open={historySheetOpen}
        onOpenChange={setHistorySheetOpen}
      />
    </>
  );
};

export default Chat;