import { Button } from '@/components/ui/button';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Chat() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-3xl font-bold">Chat Assistant</h1>
        </div>

        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <MessageCircle className="h-20 w-20 text-muted-foreground" />
          <h2 className="text-2xl font-semibold text-center">Chat coming soon!</h2>
          <p className="text-muted-foreground text-center max-w-md">
            Soon you'll be able to chat with our AI assistant about recipes, cooking tips, and more.
          </p>
        </div>
      </div>
    </div>
  );
}
