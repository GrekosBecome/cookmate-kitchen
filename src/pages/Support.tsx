import { ArrowLeft, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const Support = () => {
  const navigate = useNavigate();

  return (
    <div 
      className="min-h-screen bg-background pb-20"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 80px)',
      }}
    >
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

      <main className="container max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Support</h1>
          <p className="text-muted-foreground text-base md:text-lg">Get in touch with us</p>
        </div>

        <Card className="p-6 md:p-8 max-w-md mx-auto text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-primary/10 rounded-full mb-4 md:mb-6">
            <Mail className="w-6 h-6 md:w-8 md:h-8 text-primary" />
          </div>
          <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">Contact Us</h2>
          <a 
            href="mailto:thinkbooklab@gmail.com"
            className="text-lg md:text-xl font-semibold text-primary hover:underline break-all"
          >
            thinkbooklab@gmail.com
          </a>
        </Card>
      </main>

      <footer className="border-t py-6 md:py-8 mt-8 md:mt-12">
        <div className="container max-w-4xl mx-auto px-4 text-center text-xs md:text-sm text-muted-foreground">
          <p>© 2025 Kitchen Mate. Your Smart Kitchen Companion.</p>
          <p className="mt-2">All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Support;
