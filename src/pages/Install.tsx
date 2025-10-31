import { useState, useEffect } from 'react';
import { ArrowLeft, Smartphone, Monitor, Download, CheckCircle2, AlertCircle, Apple, Chrome } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const Install = () => {
  const navigate = useNavigate();
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop'>('desktop');
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setPlatform('ios');
    } else if (/android/.test(userAgent)) {
      setPlatform('android');
    } else {
      setPlatform('desktop');
    }

    // Check if app is installable
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsInstallable(!isStandalone);
  }, []);

  const benefits = [
    { icon: '🚀', title: 'Lightning Fast', desc: 'Ανοίγει άμεσα, σαν native εφαρμογή' },
    { icon: '📴', title: 'Works Offline', desc: '100% λειτουργικό χωρίς σύνδεση' },
    { icon: '🔔', title: 'Notifications', desc: 'Λάβετε ειδοποιήσεις για συνταγές' },
    { icon: '💾', title: 'Local Storage', desc: 'Όλα τα δεδομένα στη συσκευή σας' },
    { icon: '🎨', title: 'Native Feel', desc: 'Εμπειρία σαν native app' },
    { icon: '🔒', title: 'Privacy First', desc: 'Χωρίς tracking, χωρίς ads' },
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
            Πίσω
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Download className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Εγκαταστήστε το CookMate
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Εγκαταστήστε την εφαρμογή στη συσκευή σας για την καλύτερη εμπειρία
          </p>
          <div className="flex gap-2 justify-center flex-wrap mt-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              Χωρίς εγγραφή
            </span>
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              Δωρεάν για πάντα
            </span>
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              ~5MB μόνο
            </span>
          </div>
        </div>

        {/* Installation Instructions */}
        <Card className="p-6 mb-8">
          <Tabs value={platform} onValueChange={(v) => setPlatform(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="ios" className="gap-2">
                <Apple className="w-4 h-4" />
                iOS
              </TabsTrigger>
              <TabsTrigger value="android" className="gap-2">
                <Smartphone className="w-4 h-4" />
                Android
              </TabsTrigger>
              <TabsTrigger value="desktop" className="gap-2">
                <Monitor className="w-4 h-4" />
                Desktop
              </TabsTrigger>
            </TabsList>

            {/* iOS Instructions */}
            <TabsContent value="ios" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Apple className="w-5 h-5" />
                  Εγκατάσταση σε iPhone/iPad
                </h3>
                <p className="text-muted-foreground">
                  Χρησιμοποιήστε το Safari για την καλύτερη εμπειρία
                </p>
                
                <div className="space-y-4 mt-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center font-semibold text-primary">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Ανοίξτε το Safari</h4>
                      <p className="text-muted-foreground text-sm">
                        Βεβαιωθείτε ότι χρησιμοποιείτε το Safari browser (όχι Chrome ή άλλο)
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center font-semibold text-primary">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Πατήστε το Share κουμπί</h4>
                      <p className="text-muted-foreground text-sm">
                        Βρίσκεται στο κάτω μέρος της οθόνης (εικονίδιο με βέλος προς τα πάνω)
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center font-semibold text-primary">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Επιλέξτε "Add to Home Screen"</h4>
                      <p className="text-muted-foreground text-sm">
                        Κάντε scroll κάτω στο μενού και βρείτε την επιλογή
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center font-semibold text-primary">
                      4
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Πατήστε "Add"</h4>
                      <p className="text-muted-foreground text-sm">
                        Το CookMate θα εμφανιστεί στην αρχική οθόνη σας!
                      </p>
                    </div>
                  </div>
                </div>

                <Card className="p-4 bg-amber-500/10 border-amber-500/20 mt-6">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                        Σημαντικό για iOS
                      </p>
                      <p className="text-amber-800 dark:text-amber-200">
                        Η εγκατάσταση λειτουργεί μόνο από το Safari. Αν χρησιμοποιείτε Chrome ή άλλο browser, 
                        αντιγράψτε το URL και ανοίξτε το στο Safari.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* Android Instructions */}
            <TabsContent value="android" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Chrome className="w-5 h-5" />
                  Εγκατάσταση σε Android
                </h3>
                <p className="text-muted-foreground">
                  Χρησιμοποιήστε το Chrome για την καλύτερη εμπειρία
                </p>
                
                <div className="space-y-4 mt-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center font-semibold text-primary">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Ανοίξτε το Chrome</h4>
                      <p className="text-muted-foreground text-sm">
                        Η εφαρμογή λειτουργεί καλύτερα με Chrome στο Android
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center font-semibold text-primary">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Πατήστε το μενού (⋮)</h4>
                      <p className="text-muted-foreground text-sm">
                        Βρίσκεται στην πάνω δεξιά γωνία (τρεις κουκκίδες)
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center font-semibold text-primary">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Επιλέξτε "Install app"</h4>
                      <p className="text-muted-foreground text-sm">
                        Ή "Add to Home screen" ανάλογα με την έκδοση του Chrome
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center font-semibold text-primary">
                      4
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Επιβεβαιώστε την εγκατάσταση</h4>
                      <p className="text-muted-foreground text-sm">
                        Το CookMate θα εμφανιστεί στο app drawer σας!
                      </p>
                    </div>
                  </div>
                </div>

                <Card className="p-4 bg-blue-500/10 border-blue-500/20 mt-6">
                  <div className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                        Εναλλακτικά
                      </p>
                      <p className="text-blue-800 dark:text-blue-200">
                        Μερικές φορές εμφανίζεται αυτόματα ένα banner στο κάτω μέρος που λέει "Install app". 
                        Πατήστε το για γρήγορη εγκατάσταση!
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* Desktop Instructions */}
            <TabsContent value="desktop" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  Εγκατάσταση σε Desktop
                </h3>
                <p className="text-muted-foreground">
                  Λειτουργεί σε Chrome, Edge, Brave και άλλα Chromium browsers
                </p>
                
                <div className="space-y-4 mt-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center font-semibold text-primary">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Βρείτε το εικονίδιο εγκατάστασης</h4>
                      <p className="text-muted-foreground text-sm">
                        Κοιτάξτε στη δεξιά πλευρά της address bar (εικονίδιο με βέλος προς τα κάτω ή μικρό +)
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center font-semibold text-primary">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Πατήστε "Install"</h4>
                      <p className="text-muted-foreground text-sm">
                        Επιλέξτε Install ή Add app όταν εμφανιστεί το παράθυρο
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center font-semibold text-primary">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Ανοίξτε από το desktop</h4>
                      <p className="text-muted-foreground text-sm">
                        Το CookMate θα ανοίγει σαν ξεχωριστή εφαρμογή χωρίς tabs του browser!
                      </p>
                    </div>
                  </div>
                </div>

                <Card className="p-4 bg-purple-500/10 border-purple-500/20 mt-6">
                  <div className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-purple-900 dark:text-purple-100 mb-1">
                        Συντόμευση πληκτρολογίου
                      </p>
                      <p className="text-purple-800 dark:text-purple-200">
                        <strong>Chrome:</strong> Μενού (⋮) → Install CookMate
                        <br />
                        <strong>Edge:</strong> Μενού (...) → Apps → Install this site as an app
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Benefits */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">
            Γιατί να εγκαταστήσετε το CookMate;
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {benefits.map((benefit, index) => (
              <Card key={index} className="p-6 text-center">
                <div className="text-4xl mb-3">{benefit.icon}</div>
                <h3 className="font-semibold mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.desc}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Συχνές Ερωτήσεις</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="space">
              <AccordionTrigger>Πόσο χώρο καταλαμβάνει;</AccordionTrigger>
              <AccordionContent>
                Το CookMate καταλαμβάνει μόνο ~5MB χώρο στη συσκευή σας. Είναι πολύ ελαφρύ και δεν θα επηρεάσει 
                την απόδοση της συσκευής σας.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="uninstall">
              <AccordionTrigger>Μπορώ να το απεγκαταστήσω;</AccordionTrigger>
              <AccordionContent>
                Ναι, απολύτως! Μπορείτε να το απεγκαταστήσετε όπως οποιαδήποτε άλλη εφαρμογή:
                <br />• <strong>iOS:</strong> Πατήστε και κρατήστε το εικονίδιο, επιλέξτε "Remove App"
                <br />• <strong>Android:</strong> Πατήστε και κρατήστε, σύρετε στο "Uninstall"
                <br />• <strong>Desktop:</strong> Δεξί κλικ → Uninstall
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="account">
              <AccordionTrigger>Χρειάζομαι λογαριασμό;</AccordionTrigger>
              <AccordionContent>
                Όχι! Το CookMate λειτουργεί εντελώς χωρίς εγγραφή. Όλα τα δεδομένα σας αποθηκεύονται τοπικά 
                στη συσκευή σας, οπότε δεν χρειάζεστε account.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="offline">
              <AccordionTrigger>Λειτουργεί χωρίς internet;</AccordionTrigger>
              <AccordionContent>
                Ναι! Μόλις εγκατασταθεί, το CookMate λειτουργεί 100% offline. Μπορείτε να προσθέσετε συστατικά, 
                να δείτε συνταγές, και να χρησιμοποιήσετε όλες τις βασικές λειτουργίες χωρίς σύνδεση.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="updates">
              <AccordionTrigger>Πώς ενημερώνεται η εφαρμογή;</AccordionTrigger>
              <AccordionContent>
                Το CookMate ενημερώνεται αυτόματα στο background. Όταν υπάρχει νέα έκδοση, θα δείτε μια ειδοποίηση 
                να σας ρωτάει αν θέλετε να ενημερώσετε. Είναι απλό και γρήγορο!
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="cost">
              <AccordionTrigger>Κοστίζει κάτι;</AccordionTrigger>
              <AccordionContent>
                Όχι! Το CookMate είναι 100% δωρεάν, χωρίς διαφημίσεις, χωρίς in-app purchases, και χωρίς 
                συνδρομές. Δωρεάν για πάντα! 🎉
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* CTA */}
        <Card className="p-8 text-center bg-primary/5 border-primary/20">
          <h3 className="text-2xl font-bold mb-4">
            Έτοιμοι να ξεκινήσετε;
          </h3>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Εγκαταστήστε το CookMate τώρα και απολαύστε την καλύτερη εμπειρία μαγειρικής 
            με τεχνητή νοημοσύνη!
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" onClick={() => navigate('/onboarding')}>
              Ξεκινήστε Τώρα
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/features')}>
              Δείτε τις Δυνατότητες
            </Button>
          </div>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 mt-12">
        <div className="container max-w-4xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 CookMate. Your Smart Kitchen Companion.</p>
        </div>
      </footer>
    </div>
  );
};

export default Install;
