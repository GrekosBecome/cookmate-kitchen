import { ArrowLeft, Shield, Lock, Database, Eye, Trash2, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const Privacy = () => {
  const navigate = useNavigate();

  const sections = [
    {
      icon: Shield,
      title: "Προστασία των Δεδομένων σας",
      content: `Στο CookMate, η προστασία της ιδιωτικότητάς σας είναι η πρώτη μας προτεραιότητα. Όλα τα δεδομένα σας αποθηκεύονται τοπικά στη συσκευή σας και δεν μεταφέρονται ποτέ σε εξωτερικούς servers.`
    },
    {
      icon: Database,
      title: "Ποια Δεδομένα Συλλέγουμε",
      content: `
        • Προτιμήσεις διατροφής (διατροφική επιλογή, αλλεργίες, στόχοι)
        • Αποθήκη τροφίμων και φωτογραφίες (αποθηκεύονται τοπικά)
        • Ιστορικό συνταγών και αλληλεπιδράσεις
        • Ρυθμίσεις ειδοποιήσεων
        
        ⚡ ΣΗΜΑΝΤΙΚΟ: Όλα αυτά αποθηκεύονται ΜΟΝΟ στη συσκευή σας. Δεν στέλνουμε τίποτα σε servers.
      `
    },
    {
      icon: Lock,
      title: "Πώς Χρησιμοποιούμε τα Δεδομένα σας",
      content: `
        Χρησιμοποιούμε τα δεδομένα σας αποκλειστικά για:
        
        • Εξατομικευμένες προτάσεις συνταγών
        • Βελτίωση της λειτουργικότητας της εφαρμογής
        • Τοπική μηχανική μάθηση (machine learning στη συσκευή σας)
        • Καλύτερη εμπειρία χρήσης
        
        ❌ ΔΕΝ παρακολουθούμε
        ❌ ΔΕΝ πουλάμε δεδομένα
        ❌ ΔΕΝ χρησιμοποιούμε τρίτα μέρη (trackers)
        ❌ ΔΕΝ στέλνουμε διαφημίσεις
      `
    },
    {
      icon: Eye,
      title: "Αποθήκευση & Ασφάλεια",
      content: `
        • Τοπική αποθήκευση (localStorage του browser)
        • Χωρίς cloud backups (εκτός αν επιλέξετε)
        • Κρυπτογράφηση συσκευής (iOS/Android native)
        • Χωρίς server-side αποθήκευση
        
        Τα δεδομένα σας προστατεύονται από το λειτουργικό σύστημα της συσκευής σας και παραμένουν πάντα υπό τον έλεγχό σας.
      `
    },
    {
      icon: Trash2,
      title: "Τα Δικαιώματά σας (GDPR)",
      content: `
        Έχετε πλήρη έλεγχο των δεδομένων σας:
        
        ✅ Δικαίωμα πρόσβασης - Δείτε όλα τα δεδομένα σας στις Ρυθμίσεις
        ✅ Δικαίωμα διαγραφής - Διαγράψτε τα δεδομένα από τις Ρυθμίσεις ή την εφαρμογή
        ✅ Δικαίωμα εξαγωγής - Εξάγετε τα δεδομένα σας σε JSON format
        ✅ Δικαίωμα φορητότητας - Μεταφέρετε τα δεδομένα σας σε άλλη συσκευή
        
        Επειδή όλα είναι τοπικά, έχετε πλήρη έλεγχο χωρίς να χρειάζεται να μας ρωτήσετε.
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
            Πίσω
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
            Πολιτική Απορρήτου
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Η ιδιωτικότητά σας είναι η πρώτη μας προτεραιότητα. Διαβάστε πώς προστατεύουμε τα δεδομένά σας.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Τελευταία ενημέρωση: 31 Οκτωβρίου 2025
          </p>
        </div>

        {/* Privacy-First Banner */}
        <Card className="p-6 mb-8 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-4">
            <Lock className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-lg mb-2">🔒 Privacy-First by Design</h3>
              <p className="text-muted-foreground">
                Το CookMate σχεδιάστηκε από την αρχή να σεβαστεί την ιδιωτικότητά σας. 
                <strong className="text-foreground"> Όλα τα δεδομένα σας αποθηκεύονται ΜΟΝΟ στη συσκευή σας</strong> και 
                δεν μεταφέρονται ποτέ σε εξωτερικούς servers ή τρίτα μέρη.
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
          <h2 className="text-xl font-semibold mb-4">Υπηρεσίες Τρίτων</h2>
          <div className="space-y-3 text-muted-foreground">
            <p>
              <strong className="text-foreground">Capacitor:</strong> Χρησιμοποιείται για native λειτουργίες (κάμερα, ειδοποιήσεις). 
              Δεν συλλέγει δεδομένα.
            </p>
            <p>
              <strong className="text-foreground">Local Notifications:</strong> Οι ειδοποιήσεις διαχειρίζονται τοπικά από τη συσκευή σας. 
              Δεν στέλνουμε push notifications από servers.
            </p>
            <p className="font-semibold text-foreground">
              ✅ Χωρίς Google Analytics
              <br />
              ✅ Χωρίς Facebook Pixel
              <br />
              ✅ Χωρίς διαφημιστικά trackers
              <br />
              ✅ Χωρίς τρίτα cookies
            </p>
          </div>
        </Card>

        {/* Children's Privacy */}
        <Card className="p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">Προστασία Ανηλίκων</h2>
          <p className="text-muted-foreground">
            Η εφαρμογή είναι κατάλληλη για όλες τις ηλικίες. Δεν συλλέγουμε προσωπικά δεδομένα από παιδιά 
            ή οποιονδήποτε άλλο χρήστη, καθώς όλα τα δεδομένα παραμένουν τοπικά στη συσκευή.
          </p>
        </Card>

        {/* Changes to Policy */}
        <Card className="p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">Αλλαγές στην Πολιτική Απορρήτου</h2>
          <p className="text-muted-foreground">
            Ενδέχεται να ενημερώσουμε την πολιτική απορρήτου περιστασιακά. Θα σας ενημερώσουμε για 
            οποιεσδήποτε σημαντικές αλλαγές μέσω της εφαρμογής. Η ημερομηνία "Τελευταία ενημέρωση" 
            στην κορυφή αυτής της σελίδας δείχνει πότε έγινε η τελευταία τροποποίηση.
          </p>
        </Card>

        {/* Contact */}
        <Card className="p-6 mt-8 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-4">
            <Mail className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-3">Επικοινωνία</h2>
              <p className="text-muted-foreground mb-4">
                Έχετε ερωτήσεις σχετικά με την πολιτική απορρήτου μας; Επικοινωνήστε μαζί μας:
              </p>
              <p className="font-medium">
                📧 Email: privacy@cookmate.app
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Απαντάμε συνήθως εντός 48 ωρών
              </p>
            </div>
          </div>
        </Card>

        {/* CTA */}
        <div className="text-center mt-12 pt-8 border-t">
          <h3 className="text-xl font-semibold mb-4">
            Έτοιμοι να ξεκινήσετε με γνώμονα την ιδιωτικότητα;
          </h3>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" onClick={() => navigate('/onboarding')}>
              Ξεκινήστε Τώρα
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/install')}>
              Εγκατάσταση Εφαρμογής
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 mt-12">
        <div className="container max-w-4xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 CookMate. Your Smart Kitchen Companion.</p>
          <p className="mt-2">Όλα τα δικαιώματα διατηρούνται.</p>
        </div>
      </footer>
    </div>
  );
};

export default Privacy;
