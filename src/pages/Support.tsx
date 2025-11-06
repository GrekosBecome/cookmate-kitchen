import { ArrowLeft, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const Support = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur-md z-10">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Support</h1>
          <p className="text-muted-foreground text-lg">Get in touch with us</p>
        </div>

        <Card className="p-8 max-w-md mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <a 
            href="mailto:thinkbooklab@gmail.com"
            className="text-xl font-semibold text-primary hover:underline"
          >
            thinkbooklab@gmail.com
          </a>
        </Card>
      </main>
    </div>
  );
};

export default Support;
