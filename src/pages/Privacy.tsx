import { ArrowLeft, Shield, Lock, Database, Eye, Trash2, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const Privacy = () => {
  const navigate = useNavigate();

  const sections = [
    {
      icon: Shield,
      title: "Data Protection",
      content: `At Kitchen Mate, protecting your privacy is our top priority. All your data is stored locally on your device and is never transferred to external servers.`
    },
    {
      icon: Database,
      title: "What Data We Collect",
      content: `
        • Dietary preferences (diet type, allergies, goals)
        • Pantry items and photos (stored locally)
        • Recipe history and interactions
        • Notification settings
        
        ⚡ IMPORTANT: All of this is stored ONLY on your device. We don't send anything to servers.
      `
    },
    {
      icon: Lock,
      title: "How We Use Your Data",
      content: `
        We use your data exclusively for:
        
        • Personalized recipe recommendations
        • Improving app functionality
        • Local machine learning (on your device)
        • Better user experience
        
        ❌ We DON'T track
        ❌ We DON'T sell data
        ❌ We DON'T use third-party trackers
        ❌ We DON'T send ads
      `
    },
    {
      icon: Eye,
      title: "Storage & Security",
      content: `
        • Local storage (browser localStorage)
        • No cloud backups (unless you choose)
        • Device encryption (iOS/Android native)
        • No server-side storage
        
        Your data is protected by your device's operating system and always remains under your control.
      `
    },
    {
      icon: Trash2,
      title: "Your Rights (GDPR)",
      content: `
        You have full control over your data:
        
        ✅ Right to access - View all your data in Settings
        ✅ Right to deletion - Delete data from Settings or the app
        ✅ Right to export - Export your data in JSON format
        ✅ Right to portability - Transfer your data to another device
        
        Since everything is local, you have complete control without needing to ask us.
      `
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
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Your privacy is our top priority. Learn how we protect your data.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Last updated: October 31, 2025
          </p>
        </div>

        {/* Privacy-First Banner */}
        <Card className="p-6 mb-8 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-4">
            <Lock className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-lg mb-2">🔒 Privacy-First by Design</h3>
              <p className="text-muted-foreground">
                Kitchen Mate was designed from the ground up to respect your privacy. 
                <strong className="text-foreground"> All your data is stored ONLY on your device</strong> and 
                is never transferred to external servers or third parties.
              </p>
            </div>
          </div>
        </Card>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <Card key={index} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg flex-shrink-0">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold mb-3">{section.title}</h2>
                    <div className="text-muted-foreground whitespace-pre-line leading-relaxed">
                      {section.content}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Third-Party Services */}
        <Card className="p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">Third-Party Services</h2>
          <div className="space-y-3 text-muted-foreground">
            <p>
              <strong className="text-foreground">Capacitor:</strong> Used for native features (camera, notifications). 
              Does not collect data.
            </p>
            <p>
              <strong className="text-foreground">Local Notifications:</strong> Notifications are managed locally by your device. 
              We don't send push notifications from servers.
            </p>
            <p className="font-semibold text-foreground">
              ✅ No Google Analytics
              <br />
              ✅ No Facebook Pixel
              <br />
              ✅ No advertising trackers
              <br />
              ✅ No third-party cookies
            </p>
          </div>
        </Card>

        {/* Children's Privacy */}
        <Card className="p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">Children's Privacy</h2>
          <p className="text-muted-foreground">
            The app is suitable for all ages. We do not collect personal data from children 
            or any other users, as all data remains local on the device.
          </p>
        </Card>

        {/* Changes to Policy */}
        <Card className="p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">Changes to Privacy Policy</h2>
          <p className="text-muted-foreground">
            We may update our privacy policy occasionally. We will notify you of 
            any significant changes through the app. The "Last updated" date 
            at the top of this page shows when the last modification was made.
          </p>
        </Card>

        {/* Contact */}
        <Card className="p-6 mt-8 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-4">
            <Mail className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-3">Contact</h2>
              <p className="text-muted-foreground mb-4">
                Have questions about our privacy policy? Contact us:
              </p>
              <p className="font-medium">
                📧 Email: thinkbooklab@gmail.com
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                We typically respond within 48 hours
              </p>
            </div>
          </div>
        </Card>

        {/* CTA */}
        <div className="text-center mt-12 pt-8 border-t">
          <h3 className="text-xl font-semibold mb-4">
            Ready to start with privacy in mind?
          </h3>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" onClick={() => navigate('/onboarding')}>
              Get Started
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 mt-12">
        <div className="container max-w-4xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 Kitchen Mate. Your Smart Kitchen Companion.</p>
          <p className="mt-2">All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Privacy;