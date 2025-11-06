import { ArrowLeft, Mail, MessageCircle, FileQuestion, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const Support = () => {
  const navigate = useNavigate();

  const supportOptions = [
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us an email for detailed support inquiries",
      email: "thinkbooklab@gmail.com",
      responseTime: "We typically respond within 24-48 hours"
    },
    {
      icon: MessageCircle,
      title: "In-App Chat",
      description: "Use the Chef Chat feature to get instant cooking help",
      action: () => navigate('/chat')
    },
    {
      icon: FileQuestion,
      title: "FAQs",
      description: "Find answers to commonly asked questions",
      items: [
        {
          q: "How do I add items to my pantry?",
          a: "Go to Pantry tab, tap the + button, and choose to scan with camera or add manually."
        },
        {
          q: "Can I use the app offline?",
          a: "Yes! Most features work offline as data is stored locally on your device."
        },
        {
          q: "How do I change my dietary preferences?",
          a: "Go to Settings and update your dietary preferences, allergies, and goals."
        },
        {
          q: "Is my data private?",
          a: "Absolutely! All data is stored locally on your device and never sent to external servers."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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

      {/* Content */}
      <main className="container max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <MessageCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Support Center
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            We're here to help! Get assistance with any questions or issues you may have.
          </p>
        </div>

        {/* Email Support - Primary Card */}
        <Card className="p-8 mb-8 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-6">
            <div className="bg-primary/10 p-4 rounded-lg flex-shrink-0">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold mb-3">Contact Us</h2>
              <p className="text-muted-foreground mb-6">
                Have a question, feedback, or need assistance? We'd love to hear from you.
              </p>
              <div className="bg-background/50 rounded-lg p-4 mb-4">
                <p className="text-sm text-muted-foreground mb-2">Email us at:</p>
                <a 
                  href="mailto:thinkbooklab@gmail.com"
                  className="text-xl font-semibold text-primary hover:underline flex items-center gap-2"
                >
                  thinkbooklab@gmail.com
                  <Send className="w-5 h-5" />
                </a>
              </div>
              <p className="text-sm text-muted-foreground">
                ⏱️ We typically respond within 24-48 hours
              </p>
            </div>
          </div>
        </Card>

        {/* In-App Chat */}
        <Card className="p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-3 rounded-lg flex-shrink-0">
              <MessageCircle className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2">In-App Chef Chat</h2>
              <p className="text-muted-foreground mb-4">
                Get instant cooking help, recipe suggestions, and tips from our AI Chef.
              </p>
              <Button onClick={() => navigate('/chat')} variant="outline">
                Open Chef Chat
              </Button>
            </div>
          </div>
        </Card>

        {/* FAQs */}
        <Card className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-primary/10 p-3 rounded-lg flex-shrink-0">
              <FileQuestion className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Frequently Asked Questions</h2>
              <p className="text-muted-foreground">
                Quick answers to common questions
              </p>
            </div>
          </div>
          
          <div className="space-y-6 mt-6">
            {supportOptions[2].items?.map((faq, index) => (
              <div key={index} className="border-l-2 border-primary/20 pl-4">
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Additional Help */}
        <Card className="p-6 mt-8 text-center">
          <h3 className="text-xl font-semibold mb-3">Still need help?</h3>
          <p className="text-muted-foreground mb-6">
            Our support team is always happy to assist you with any questions or concerns.
          </p>
          <Button size="lg" asChild>
            <a href="mailto:thinkbooklab@gmail.com">
              <Mail className="w-5 h-5 mr-2" />
              Send us an Email
            </a>
          </Button>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 mt-12">
        <div className="container max-w-4xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 CookMate. Your Smart Kitchen Companion.</p>
          <p className="mt-2">All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Support;