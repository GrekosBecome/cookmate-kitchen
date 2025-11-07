import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useStore } from "@/store/useStore";
import { ChatConversation } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Trash2, Clock, ChefHat } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ChatHistorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ChatHistorySheet = ({ open, onOpenChange }: ChatHistorySheetProps) => {
  const { chatHistory, deleteChatConversation } = useStore();
  const navigate = useNavigate();

  const handleContinue = (conversation: ChatConversation) => {
    onOpenChange(false);
    
    const params = new URLSearchParams({
      continueChat: conversation.id,
    });
    
    if (conversation.recipeId) {
      params.append('recipeId', conversation.recipeId);
    }
    if (conversation.recipeTitle) {
      params.append('recipeTitle', conversation.recipeTitle);
    }
    
    navigate(`/chat?${params.toString()}`);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteChatConversation(id);
  };

  const getConversationPreview = (conv: ChatConversation): string => {
    const lastUserMessage = [...conv.messages]
      .reverse()
      .find(m => m.role === 'user');
    
    if (lastUserMessage) {
      return lastUserMessage.content.slice(0, 80) + 
        (lastUserMessage.content.length > 80 ? '...' : '');
    }
    
    return 'New conversation';
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Chat History
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-6 px-6 mt-4">
          {chatHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <MessageSquare className="h-16 w-16 mb-4 opacity-20" />
              <p>No saved conversations</p>
            </div>
          ) : (
            <div className="space-y-3 pb-6">
              {chatHistory.map((conv) => (
                <div
                  key={conv.id}
                  className="border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => handleContinue(conv)}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      {conv.recipeTitle && (
                        <div className="flex items-center gap-2 mb-1">
                          <ChefHat className="h-4 w-4 text-primary flex-shrink-0" />
                          <span className="font-medium text-sm truncate">
                            {conv.recipeTitle}
                          </span>
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {getConversationPreview(conv)}
                      </p>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex-shrink-0"
                      onClick={(e) => handleDelete(conv.id, e)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(conv.updatedAt), {
                        addSuffix: true,
                      })}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {conv.messages.length} {conv.messages.length === 1 ? 'message' : 'messages'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default ChatHistorySheet;
