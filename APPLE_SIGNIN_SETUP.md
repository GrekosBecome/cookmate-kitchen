# Apple Sign-In Setup Guide 🍎

Ολοκληρωμένος οδηγός για τη ρύθμιση του Apple Sign-In στο KitchenMate app.

---

## 📋 Προαπαιτούμενα

1. **Apple Developer Account** (πληρωμένο - $99/year)
2. **App ID** με Sign in with Apple capability
3. **Service ID** για web authentication
4. **Πρόσβαση στο Lovable Cloud Backend**

---

## 🎯 Βήμα 1: Apple Developer Console Setup

### 1.1 Δημιουργία App ID

1. Πήγαινε στο [Apple Developer Portal](https://developer.apple.com/account/)
2. **Certificates, Identifiers & Profiles** → **Identifiers**
3. Κάνε κλικ στο **+** για να δημιουργήσεις νέο App ID
4. Επέλεξε **App IDs** και συνέχισε
5. **Bundle ID**: `com.cookmate.kitchen` (το ίδιο με το `capacitor.config.ts`)
6. **Capabilities**: Ενεργοποίησε **Sign in with Apple**
7. Αποθήκευσε το App ID

### 1.2 Δημιουργία Service ID

1. Πίσω στα **Identifiers**, κάνε κλικ στο **+**
2. Επέλεξε **Services IDs** και συνέχισε
3. **Description**: `KitchenMate Auth Service`
4. **Identifier**: `com.cookmate.kitchen.auth` (διαφορετικό από το App ID!)
5. Τσεκάρισε **Sign in with Apple**
6. Κάνε κλικ **Configure** δίπλα στο Sign in with Apple:
   - **Primary App ID**: Επέλεξε `com.cookmate.kitchen`
   - **Website URLs**:
     - **Domains**: `gsozaqboqcjbthbighqg.supabase.co`
     - **Return URLs**: `https://gsozaqboqcjbthbighqg.supabase.co/auth/v1/callback`
   - Αποθήκευσε τις αλλαγές
7. Αποθήκευσε το Service ID

### 1.3 Δημιουργία Private Key

1. **Certificates, Identifiers & Profiles** → **Keys**
2. Κάνε κλικ στο **+** για να δημιουργήσεις νέο κλειδί
3. **Key Name**: `KitchenMate Apple Sign In Key`
4. Ενεργοποίησε **Sign in with Apple**
5. Κάνε κλικ **Configure**:
   - **Primary App ID**: Επέλεξε `com.cookmate.kitchen`
6. Αποθήκευσε το κλειδί
7. **⚠️ ΠΡΟΣΟΧΗ**: Κατέβασε το `.p8` αρχείο αμέσως - δεν θα μπορείς να το κατεβάσεις ξανά!
8. Κράτα το **Key ID** (10 χαρακτήρες) - θα το χρειαστείς

### 1.4 Βρες το Team ID

1. Πήγαινε στο [Apple Developer Membership](https://developer.apple.com/account/#/membership/)
2. Βρες το **Team ID** (10 χαρακτήρες) - θα το χρειαστείς για το Supabase

---

## 🔧 Βήμα 2: Supabase Configuration

### 2.1 Ρύθμιση στο Lovable Cloud

1. **Άνοιξε το Lovable Cloud Backend**:
   - Μέσα από το Lovable project, κάνε κλικ στο "View Backend"

2. **Πήγαινε στα Authentication Settings**:
   - **Users** → **Auth Settings** → **Apple Settings**

3. **Συμπλήρωσε τα πεδία**:

   ```
   Service  com.cookmate.signin
   Team ID: 47VDHHUY34
   Key ID: RSULFLF9WS
   Private Key: -----BEGIN PRIVATE KEY-----
   MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQgsCJtHjUIM0L5LfC2
   +1Cw35wnJmkXR1v9DxRJNPSSkrmgCgYIKoZIzj0DAQehRANCAASXPH06ozBK+nBn
   lvY+Ixdw1xTnF6Bn2m51fy6Wn3qsb5OHxvKPRxTxsQR86vZAARlKDHd9r/ybrPHM
   qTIyt1sb
   -----END PRIVATE KEY-----

   **Private Key format**:
   ```

   -----BEGIN PRIVATE KEY-----
   MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...
   [όλες οι γραμμές του .p8 αρχείου]
   ...kE1DfZpKaGkLxBzJF9A==
   -----END PRIVATE KEY-----

4. **Αποθήκευσε** τις ρυθμίσεις

### 2.2 Ρύθμιση Redirect URLs

1. Στο **Auth Settings** → **URL Configuration**
2. Βεβαιώσου ότι υπάρχει το:
   ```
   https://gsozaqboqcjbthbighqg.supabase.co/auth/v1/callback
   ```

---

## 📱 Βήμα 3: iOS Project Configuration

### 3.1 Προσθήκη Capability στο Xcode

1. **Git pull το project** (αφού έχεις κάνει export to GitHub)
2. Τρέξε:

   ```bash
   npm install
   npm run build
   npx cap sync ios
   npx cap open ios
   ```

3. Στο Xcode:
   - Επέλεξε το project στο navigator (πάνω αριστερά)
   - Επέλεξε το **target** (KitchenMate)
   - Πήγαινε στο tab **Signing & Capabilities**
   - Κάνε κλικ στο **+ Capability**
   - Αναζήτησε και πρόσθεσε **Sign in with Apple**

### 3.2 Build και Test

1. **Συνδέεσου** με το Apple Developer account στο Xcode:
   - **Xcode** → **Preferences** → **Accounts**
   - Πρόσθεσε το Apple ID σου

2. **Επέλεξε Team**:
   - Πίσω στο **Signing & Capabilities**
   - **Team**: Επέλεξε το team σου

3. **Build το project**:

   ```bash
   npx cap run ios --livereload --external
   ```

4. **Δοκίμασε το Apple Sign-In** στη συσκευή ή simulator

---

## ✅ Βήμα 4: Testing Checklist

- [ ] To Apple Sign-In button εμφανίζεται μόνο σε iOS native app
- [ ] Το button είναι μαύρο με Apple icon
- [ ] Όταν πατάω το button, εμφανίζεται το Apple authentication sheet
- [ ] Μετά το sign in, redirectάρει στο `/onboarding`
- [ ] Ο χρήστης εμφανίζεται logged in στο app
- [ ] Το email του χρήστη αποθηκεύεται στο Supabase

---

## 🚨 Troubleshooting

### Error: "invalid_request"

- **Αιτία**: Λάθος Service ID ή Redirect URL
- **Λύση**: Τσέκαρε ότι το Service ID στο Apple Developer ταιριάζει με το Supabase

### Error: "invalid_client"

- **Αιτία**: Λάθος Team ID ή Key ID
- **Λύση**: Επιβεβαίωσε τα IDs στο Apple Developer και Supabase

### Error: "unauthorized_client"

- **Αιτία**: Λάθος Private Key
- **Λύση**: Αντιγράψε ξανά το **πλήρες** περιεχόμενο του .p8 αρχείου (με τις -----BEGIN/END----- γραμμές)

### Το button δεν εμφανίζεται

- **Αιτία**: Δεν τρέχει σε iOS native app
- **Λύση**: Το Apple Sign-In button εμφανίζεται μόνο όταν το app τρέχει σε iOS συσκευή/simulator μέσω Capacitor

### Error: "Sign in with Apple capability not found"

- **Αιτία**: Δεν έχει προστεθεί το capability στο Xcode
- **Λύση**: Πρόσθεσε **Sign in with Apple** capability στο Xcode (Βήμα 3.1)

---

## 📚 Χρήσιμα Links

- [Apple Sign In Documentation](https://developer.apple.com/sign-in-with-apple/)
- [Capacitor Apple Sign In Plugin](https://github.com/capacitor-community/apple-sign-in)
- [Supabase Apple OAuth Guide](https://supabase.com/docs/guides/auth/social-login/auth-apple)
- [App Store Review Guidelines 4.8](https://developer.apple.com/app-store/review/guidelines/#sign-in-with-apple)

---

## 🎉 Ready για App Store!

Μόλις ολοκληρώσεις όλα τα βήματα και δοκιμάσεις ότι λειτουργεί, είσαι έτοιμος για App Store submission!

Θυμήσου:

- Το Apple Sign-In είναι **υποχρεωτικό** για iOS apps που έχουν άλλα third-party sign-in options (όπως Google)
- Πρέπει να εμφανίζεται πρώτο ή με ίση προβολή με τα άλλα sign-in options
- Το button πρέπει να ακολουθεί τα [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/sign-in-with-apple)
