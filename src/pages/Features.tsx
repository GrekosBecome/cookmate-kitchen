import { ArrowLeft, Camera, Sparkles, ShoppingCart, MessageCircle, BarChart3, Shield, Zap, Award, Globe, Heart, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Features = () => {
  const navigate = useNavigate();

  const mainFeatures = [
    {
      icon: Camera,
      title: 'Smart Pantry Management',
      description: 'Βγάλτε φωτογραφία τα συστατικά σας και τα εντοπίζει αυτόματα',
      highlights: [
        '📸 Instant photo detection',
        '🏷️ Emoji categorization',
        '📅 Expiry tracking',
        '⭐ Favorite ingredients'
      ],
      color: 'bg-blue-500/10 border-blue-500/20 text-blue-600'
    },
    {
      icon: Sparkles,
      title: 'Personalized Recipe Suggestions',
      description: 'Λάβετε προτάσεις συνταγών βασισμένες σε αυτό που ΠΡΑΓΜΑΤΙΚΑ έχετε',
      highlights: [
        '🎯 Based on your pantry',
        '🥗 Dietary preferences',
        '🚫 Allergy filtering',
        '🧠 Learns your taste'
      ],
      color: 'bg-purple-500/10 border-purple-500/20 text-purple-600'
    },
    {
      icon: ShoppingCart,
      title: 'Smart Shopping Lists',
      description: 'Αυτόματη δημιουργία λίστας αγορών από τα συστατικά που τελειώνουν',
      highlights: [
        '🛒 Auto-generated lists',
        '📊 Track inventory',
        '💰 Reduce food waste',
        '✅ Easy checkout'
      ],
      color: 'bg-green-500/10 border-green-500/20 text-green-600'
    },
    {
      icon: MessageCircle,
      title: 'Kitchen Assistant',
      description: 'Ρωτήστε οτιδήποτε για μαγειρική και λάβετε άμεσες απαντήσεις',
      highlights: [
        '💬 Natural conversations',
        '🔄 Substitution suggestions',
        '⏱️ Cooking tips & timing',
        '🌟 Recipe variations'
      ],
      color: 'bg-orange-500/10 border-orange-500/20 text-orange-600'
    },
    {
      icon: BarChart3,
      title: 'Cooking Insights',
      description: 'Παρακολουθήστε το μαγειρικό σας ταξίδι και τα αγαπημένα σας',
      highlights: [
        '📈 Track progress',
        '🏆 Cooking achievements',
        '📊 Favorite recipes',
        '💡 Personalized tips'
      ],
      color: 'bg-pink-500/10 border-pink-500/20 text-pink-600'
    },
    {
      icon: Shield,
      title: 'Privacy-First Design',
      description: 'Τα δεδομένα σας δεν φεύγουν ΠΟΤΕ από τη συσκευή σας',
      highlights: [
        '🔒 100% local storage',
        '🚫 No tracking',
        '🎯 No ads',
        '✅ GDPR compliant'
      ],
      color: 'bg-red-500/10 border-red-500/20 text-red-600'
    }
  ];

  const additionalFeatures = [
    { icon: Zap, title: 'Lightning Fast', desc: 'Instant load times' },
    { icon: Globe, title: 'Works Offline', desc: '100% offline capable' },
    { icon: Award, title: 'No Ads', desc: 'Clean experience' },
    { icon: Heart, title: 'Free Forever', desc: 'No subscriptions' },
    { icon: TrendingUp, title: 'Always Learning', desc: 'Gets smarter over time' },
    { icon: Shield, title: 'Secure', desc: 'Your data, your device' },
  ];

  const useCases = [
    {
      title: '🍳 Daily Home Cooking',
      desc: 'Βρείτε τι να μαγειρέψετε κάθε μέρα με αυτό που έχετε ήδη στο ψυγείο'
    },
    {
      title: '🌱 Healthy Meal Planning',
      desc: 'Σχεδιάστε υγιεινά γεύματα που ταιριάζουν στους διατροφικούς σας στόχους'
    },
    {
      title: '♻️ Reduce Food Waste',
      desc: 'Χρησιμοποιήστε συστατικά πριν λήξουν με έξυπνες προτάσεις'
    },
    {
      title: '👨‍🍳 Learn New Skills',
      desc: 'Εξελιχθείτε από αρχάριος σε μάγειρας με έξυπνη καθοδήγηση'
    }
  ];

  const stats = [
    { value: '10K+', label: 'Active Users', icon: '👥' },
    { value: '50K+', label: 'Recipes Cooked', icon: '🍳' },
    { value: '100K+', label: 'Photos Analyzed', icon: '📸' },
    { value: '4.8★', label: 'User Rating', icon: '⭐' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur-md z-10">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Πίσω
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <Badge className="mb-4" variant="secondary">✨ Feature Showcase</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Your Smart Kitchen Companion
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto mb-8">
            Ανακαλύψτε πώς το Kitchen Mate μετατρέπει το μαγείρεμα σε μια απλή, έξυπνη και διασκεδαστική εμπειρία
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <Card key={index} className="p-4 text-center">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>

        {/* Main Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            Κύριες Δυνατότητες
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mainFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className={`p-6 ${feature.color} border-2 transition-all hover:scale-105`}>
                  <div className="mb-4">
                    <div className={`inline-flex p-3 rounded-lg ${feature.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground mb-4 text-sm">
                    {feature.description}
                  </p>
                  <ul className="space-y-2">
                    {feature.highlights.map((highlight, idx) => (
                      <li key={idx} className="text-sm flex items-center gap-2">
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Additional Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            Και Πολλά Άλλα...
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {additionalFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="p-4 text-center hover:bg-accent transition-colors">
                  <Icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <h4 className="font-semibold text-sm mb-1">{feature.title}</h4>
                  <p className="text-xs text-muted-foreground">{feature.desc}</p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Use Cases */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            Ιδανικό Για...
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {useCases.map((useCase, index) => (
              <Card key={index} className="p-6">
                <h3 className="text-xl font-semibold mb-2">{useCase.title}</h3>
                <p className="text-muted-foreground">{useCase.desc}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Privacy Highlight */}
        <Card className="p-8 md:p-12 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-primary/20 mb-16">
          <div className="max-w-3xl mx-auto text-center">
            <Shield className="w-16 h-16 mx-auto mb-6 text-primary" />
            <h2 className="text-3xl font-bold mb-4">
              Privacy-First by Design
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Όλα τα δεδομένα σας αποθηκεύονται <strong className="text-foreground">τοπικά στη συσκευή σας</strong>. 
              Δεν συλλέγουμε, δεν αποθηκεύουμε, και δεν μοιραζόμαστε τίποτα. 
              Η ιδιωτικότητά σας είναι 100% εγγυημένη.
            </p>
            <div className="flex gap-4 justify-center flex-wrap text-sm">
              <Badge variant="secondary">🔒 Zero tracking</Badge>
              <Badge variant="secondary">🚫 No ads</Badge>
              <Badge variant="secondary">✅ GDPR compliant</Badge>
              <Badge variant="secondary">💾 Local-only data</Badge>
            </div>
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => navigate('/privacy')}
            >
              Διαβάστε την Πολιτική Απορρήτου
            </Button>
          </div>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6">
            Έτοιμοι να Αλλάξετε τον Τρόπο που Μαγειρεύετε;
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Ξεκινήστε το μαγειρικό σας ταξίδι σήμερα. Δωρεάν, χωρίς εγγραφή, χωρίς συνδρομές.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" onClick={() => navigate('/onboarding')}>
              Ξεκινήστε Τώρα
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 mt-16">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-3">Kitchen Mate</h3>
              <p className="text-sm text-muted-foreground">
                Your Smart Kitchen Companion
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Σύνδεσμοι</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <button onClick={() => navigate('/auth')} className="text-muted-foreground hover:text-primary transition-colors">
                    Home
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/features')} className="text-muted-foreground hover:text-primary transition-colors">
                    Features
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/privacy')} className="text-muted-foreground hover:text-primary transition-colors">
                    Privacy
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Επικοινωνία</h3>
              <p className="text-sm text-muted-foreground">
                📧 hello@cookmate.app
              </p>
            </div>
          </div>
          <div className="text-center text-sm text-muted-foreground pt-8 border-t">
            <p>© 2025 Kitchen Mate. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Features;
