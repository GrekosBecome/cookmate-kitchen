import { ArrowLeft, CheckCircle, Utensils, User, AlertTriangle, Shield, AlertCircle, Scale, RefreshCw, Mail, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const Terms = () => {
  const navigate = useNavigate();

  const sections = [
    {
      icon: CheckCircle,
      title: "Acceptance of Terms",
      content: `By accessing and using Kitchen Mate, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use the app.`
    },
    {
      icon: Utensils,
      title: "Use of Service",
      content: `Kitchen Mate provides AI-powered recipe suggestions and pantry management tools to enhance your cooking experience.

• Recipes are suggestions only and not professional nutritional or medical advice
• You are responsible for verifying ingredient safety and dietary compatibility
• Always check for allergens and consult healthcare providers for specific dietary needs
• Recipe preparation times and serving sizes are estimates`
    },
    {
      icon: User,
      title: "User Accounts",
      content: `When creating an account:

• You must provide accurate and complete information
• You are responsible for maintaining the security of your account
• You must not share your account credentials with others
• One account per person
• You must be at least 13 years old to use this service`
    },
    {
      icon: AlertTriangle,
      title: "Acceptable Use",
      content: `You agree NOT to:

• Misuse the service or use it for unlawful purposes
• Attempt to access restricted areas or reverse engineer the app
• Use the service for commercial purposes without permission
• Upload malicious content or spam
• Interfere with other users' experience
• Violate any applicable laws or regulations`
    },
    {
      icon: Shield,
      title: "Intellectual Property",
      content: `All content, features, and functionality of Kitchen Mate are owned by us and protected by copyright, trademark, and other laws.

• You may use recipes for personal, non-commercial purposes
• You may not redistribute, sell, or republish app content
• Screenshots and content sharing for personal use is permitted
• Commercial use requires written permission`
    },
    {
      icon: AlertCircle,
      title: "Disclaimers",
      content: `Kitchen Mate is provided "AS IS" without warranties of any kind.

• We do not guarantee recipe accuracy or results
• We are not responsible for allergic reactions - always verify ingredients
• Cooking involves inherent risks - use proper safety precautions
• The app may contain errors or be unavailable at times
• We do not guarantee uninterrupted or error-free service`
    },
    {
      icon: Scale,
      title: "Limitation of Liability",
      content: `To the fullest extent permitted by law:

• We are not liable for any indirect, incidental, or consequential damages
• Our total liability shall not exceed the amount you paid for the service
• We are not responsible for food allergies, injuries, or health issues
• Use of the app is at your own risk
• Some jurisdictions do not allow certain limitations, so some may not apply to you`
    },
    {
      icon: RefreshCw,
      title: "Changes to Terms",
      content: `We reserve the right to modify these terms at any time:

• Changes will be posted in the app with an updated "Last Modified" date
• Continued use of Kitchen Mate after changes constitutes acceptance
• Material changes will be notified through the app
• We encourage you to review these terms periodically`
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
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Terms of Service
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Please read these terms carefully before using Kitchen Mate
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Last updated: November 25, 2025
          </p>
        </div>

        {/* Important Notice */}
        <Card className="p-6 mb-8 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-lg mb-2">⚠️ Important Notice</h3>
              <p className="text-muted-foreground">
                By using Kitchen Mate, you agree to these terms. Kitchen Mate provides recipe suggestions 
                for informational purposes only. <strong className="text-foreground">Always verify ingredients 
                for allergens and consult healthcare providers for specific dietary needs.</strong>
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

        {/* Governing Law */}
        <Card className="p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">Governing Law</h2>
          <p className="text-muted-foreground">
            These terms shall be governed by and construed in accordance with the laws 
            of the jurisdiction in which Kitchen Mate operates, without regard to its 
            conflict of law provisions.
          </p>
        </Card>

        {/* Termination */}
        <Card className="p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">Termination</h2>
          <p className="text-muted-foreground">
            We reserve the right to terminate or suspend your account and access to 
            the service at our sole discretion, without prior notice, for conduct that 
            we believe violates these terms or is harmful to other users, us, or third parties.
          </p>
        </Card>

        {/* Contact */}
        <Card className="p-6 mt-8 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-4">
            <Mail className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-3">Contact Us</h2>
              <p className="text-muted-foreground mb-4">
                Have questions about these terms? We're here to help:
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
            Ready to start cooking?
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

export default Terms;
