# 📱 Native Build Instructions για iOS & Android

Το CookMate είναι τώρα έτοιμο για native build με πλήρη υποστήριξη notifications!

## ⚠️ ΣΗΜΑΝΤΙΚΟ: Development vs Production Config

**Δύο config files υπάρχουν:**
- `capacitor.config.ts` - **PRODUCTION** config (χωρίς server.url, για App Store submission)
- `capacitor.config.dev.ts` - **DEVELOPMENT** config (με server.url για hot reload testing)

### 🔧 Development Workflow (Testing με hot reload):
```bash
npm run build
npx cap sync --config capacitor.config.dev.ts
npx cap open ios  # ή android
```
Το app θα φορτώνει απευθείας από το Lovable preview URL με instant updates!

### 🚀 Production Workflow (App Store submission):
```bash
npm run build
npx cap sync  # Uses capacitor.config.ts (χωρίς server.url)
npx cap open ios
```
Στο Xcode: Product → Archive → Distribute App

**App Store Checklist:**
- ✅ Δεν υπάρχει `server.url` στο production config
- ✅ Δεν υπάρχει `allowNavigation` με wildcard
- ✅ Το app λειτουργεί offline (Airplane Mode)
- ✅ Δεν εμφανίζονται dev menus / debug banners
- ✅ Web assets είναι bundled στο app (ios/App/App/public/)
- ✅ Notifications δουλεύουν χωρίς dev server

## ✅ Τι έχει ολοκληρωθεί

- ✅ Capacitor configuration (capacitor.config.ts)
- ✅ iOS & Android dependencies
- ✅ Notification abstraction layer με native support
- ✅ iOS-ready permission UI
- ✅ Local notification scheduling
- ✅ Test notification functionality

## 📋 Επόμενα Βήματα

### 1. Export to GitHub
Πήγαινε στο Lovable interface και κάνε export το project στο GitHub:
- Click "Export to GitHub" button
- Create repository στο GitHub account σου

### 2. Clone Repository
```bash
git clone [your-repo-url]
cd cookmate-kitchen
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Initialize Capacitor
```bash
npx cap init
```
Χρησιμοποίησε τις τιμές που υπάρχουν ήδη στο `capacitor.config.ts`:
- App ID: `app.lovable.5b916d5046614c65933e1881660781d8`
- App Name: `cookmate-kitchen`

### 5. Add Native Platforms

#### Για iOS (χρειάζεσαι Mac + Xcode):
```bash
npx cap add ios
npx cap update ios
```

#### Για Android (χρειάζεσαι Android Studio):
```bash
npx cap add android
npx cap update android
```

### 6. Build το Project
```bash
npm run build
```

### 7. Sync με Native Platform
```bash
npx cap sync
```

**ΣΗΜΑΝΤΙΚΟ**: Κάθε φορά που κάνεις `git pull` νέες αλλαγές, τρέχεις:
```bash
npm install
npm run build
npx cap sync
```

### 8. Run σε Emulator ή Device

#### iOS:
```bash
npx cap run ios
```
Ή άνοιξε το Xcode manually:
```bash
npx cap open ios
```

#### Android:
```bash
npx cap run android
```
Ή άνοιξε το Android Studio manually:
```bash
npx cap open android
```

## 🔔 iOS Notification Setup

Για να δουλέψουν τα notifications στο iOS, πρέπει να:

1. Άνοιξε το project στο Xcode
2. Πήγαινε στο target → "Signing & Capabilities"
3. Πρόσθεσε "Push Notifications" capability
4. Πρόσθεσε "Background Modes" capability και ενεργοποίησε:
   - Remote notifications
   - Background fetch

### Info.plist Configuration

Το Xcode θα προσθέσει αυτόματα, αλλά βεβαιώσου ότι υπάρχει:

```xml
<key>UIBackgroundModes</key>
<array>
    <string>remote-notification</string>
</array>
<key>NSUserNotificationsUsageDescription</key>
<string>Get daily recipe suggestions based on your pantry and preferences</string>
```

## 🤖 Android Notification Setup

Για Android, τα πάντα είναι έτοιμα! Απλά βεβαιώσου ότι:

1. Το `AndroidManifest.xml` έχει τα notification permissions (auto-added)
2. Έχεις notification icons στο `android/app/src/main/res/`

## 🧪 Testing Notifications

### Στο Development (με hot reload):
1. Τρέξε την εφαρμογή στο device/emulator
2. Πήγαινε στο Settings
3. Enable notifications (θα δεις το native permission prompt)
4. Επίλεξε ώρα και μέρες
5. Πάτα "Send Test Notification"
6. Θα πρέπει να δεις notification στο notification center!

### Production Testing:
1. Build την εφαρμογή για production
2. Install στο device
3. Βγες από την εφαρμογή (background)
4. Περίμενε την scheduled ώρα
5. Θα λάβεις notification ακόμα κι αν η εφαρμογή είναι κλειστή!

## 🎯 App Store Submission Checklist

Πριν κάνεις submit στο App Store:

### iOS:
- [ ] Ολοκληρωμένο Xcode project με valid bundle ID
- [ ] App icons σε όλα τα μεγέθη (AppIcon.appiconset)
- [ ] Launch screen configured
- [ ] Notification permission description στο Info.plist
- [ ] Privacy policy URL
- [ ] Test σε physical iOS device
- [ ] Screenshots για όλα τα device sizes

### Android:
- [ ] Signed APK/AAB με valid keystore
- [ ] App icons (ic_launcher)
- [ ] Feature graphic για Play Store
- [ ] Privacy policy URL
- [ ] Test σε physical Android device
- [ ] Screenshots για διάφορα screen sizes

## 🔄 Development Workflow

### Development Mode (με hot reload):

1. Κάνε changes στο Lovable
2. Push to GitHub (auto-sync)
3. Local: `git pull`
4. `npm run build`
5. `npx cap sync --config capacitor.config.dev.ts`
6. `npx cap open ios` (ή android)
7. Η native app θα φορτώνει από Lovable preview με instant updates!

### Production Build (για App Store):

1. Βεβαιώσου ότι όλες οι αλλαγές είναι committed
2. `git pull` (για τελευταίες αλλαγές)
3. `npm install`
4. `npm run build`
5. `npx cap sync` (uses production config χωρίς server.url)
6. `npx cap open ios`
7. Στο Xcode: Product → Archive
8. Distribute App → App Store Connect

## 🐛 Troubleshooting

### Notifications δεν εμφανίζονται:
1. Check αν έχεις permission granted (Settings → Notifications)
2. iOS: Βεβαιώσου ότι έχεις τα capabilities στο Xcode
3. Android: Check logcat για errors
4. Test με το "Send Test Notification" button πρώτα

### Build errors:
1. `npm run build` πρώτα πάντα
2. `npx cap sync` μετά από κάθε build
3. Clean build folders: iOS (Product → Clean) / Android (Build → Clean)

### Hot reload δεν δουλεύει:
1. Βεβαιώσου ότι το device είναι στο ίδιο network
2. Check το `server.url` στο `capacitor.config.ts`
3. iOS: Πρέπει να επιτρέψεις "Insecure HTTP loads" για development

## 📚 Resources

- [Capacitor Docs](https://capacitorjs.com/docs)
- [Local Notifications Plugin](https://capacitorjs.com/docs/apis/local-notifications)
- [iOS Push Notifications Guide](https://developer.apple.com/notifications/)
- [Android Notifications Guide](https://developer.android.com/develop/ui/views/notifications)

## 🎉 Ready to Ship!

Όλα είναι έτοιμα! Το CookMate app σου:
- ✅ Δουλεύει ως PWA (web)
- ✅ Έτοιμο για iOS App Store
- ✅ Έτοιμο για Google Play Store
- ✅ Full notification support
- ✅ iOS-compliant permission flow
- ✅ Offline-ready με service workers

Καλή τύχη με το launch! 🚀
