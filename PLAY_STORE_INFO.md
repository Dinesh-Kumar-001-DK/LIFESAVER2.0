# TapSafe - Emergency SOS App

**Help in 3 Clicks**

## Play Store Listing

### Short Description (80 chars)
Emergency SOS alert app. Get help in seconds with one tap.

### Full Description (4000 chars)
🚨 **TapSafe** is your personal safety companion, designed to get you help in seconds when you need it most.

### How It Works
1. **Set Up** - Add your emergency contacts and configure your preferred alert methods
2. **Trigger** - Tap the SOS button, shake your phone 3 times, or press volume button 3 times
3. **Get Help** - Your emergency contacts receive your location via SMS while a loud alarm sounds

### Key Features

**Free Version:**
- SOS button with loud alarm
- Triple-trigger activation (tap, shake, volume buttons)
- SMS alerts with GPS location to emergency contacts
- Flashlight SOS signal
- Vibration alerts
- Emergency numbers (Police 100, Ambulance 108, National Emergency 112)

**Pro Version (₹99/month):**
- Auto phone call to emergency contacts
- Voice trigger ("Help me", "Emergency", "Bachao")
- Fall detection with 15-second countdown
- Silent video recording during emergencies
- SMS to up to 5 contacts
- Unlimited custom contacts

### Permissions Explained
- **Location** - Used ONLY when you trigger SOS to send your GPS coordinates to emergency contacts
- **Camera/Microphone** - Pro feature for silent video recording during emergencies
- **Contacts** - To quickly select emergency contacts from your phonebook
- **SMS** - To send emergency alerts directly from your device (not via our servers)

### Privacy First
- No account required for free version
- Your location is NEVER stored on our servers
- All alerts are sent directly from your device
- Video recordings stay on YOUR phone only

### Why TapSafe?
- Works even in **silent mode** (alarm sounds at full volume)
- **Automatic triggers** - shake or volume buttons for hands-free alerts
- **India-focused** - Pre-configured emergency numbers for India
- **Pro features** for advanced protection: voice trigger, fall detection, auto recording

Stay safe. Get TapSafe today.

### 5 Keywords for Safety Category
1. emergency app
2. sos app
3. personal safety
4. panic button
5. women safety app

### Content Rating Answers
- **Violence**: No violence depicted
- **Sex/Nudity**: None
- **Adult Content**: None
- **Harmful Content**: No
- **User Interaction**: The app sends SMS messages and makes phone calls as configured by the user
- **Location**: Only used during SOS trigger for emergency alerts

---

## Privacy Policy

**Last updated: March 2026**

### Data We Collect

**Location Data**
- We collect your GPS location ONLY when you trigger a SOS alert
- Location is sent directly to your emergency contacts via SMS
- Location data is NEVER stored on our servers
- You can request deletion of any data by contacting support

**Local Storage**
- Your settings and emergency contacts are stored locally on your device
- Alert history is stored locally on your device
- Pro subscription status is synced with RevenueCat for payment processing

**Camera & Microphone (Pro Feature)**
- Used only for silent video recording during SOS alerts
- Recordings are saved to your device's photo library
- Recordings are NEVER uploaded to our servers
- You have full control over your recordings

### How We Use Your Data

1. **To deliver emergency alerts** - Location and contact info is used only to send SMS/calls when you trigger SOS
2. **To process payments** - Subscription payments are handled by RevenueCat (Apple/Google Play standards)
3. **To improve the app** - Anonymous crash reports help us fix bugs (optional, can be disabled)

### Data We DON'T Collect
- ❌ Your location when app is not in use
- ❌ Your personal information
- ❌ Your emergency contact details on our servers
- ❌ Call/SMS content
- ❌ Video recordings (they stay on your device)

### Your Rights
- Access your data: Contact us through the app
- Delete your data: Uninstall the app or clear app data
- Opt out of crash reporting: Disable in Settings
- Cancel subscription: Through Google Play Store or Apple App Store

### Contact Us
For privacy concerns: support@tapsafe.app

---

## Build Instructions

### Development Build
```bash
eas build --platform android --profile development
```

### Preview Build (APK)
```bash
eas build --platform android --profile preview
```

### Production Build (AAB)
```bash
eas build --platform android --profile production
```

### Submit to Play Store
```bash
eas submit --platform android --latest
```

### iOS Build
```bash
eas build --platform ios --profile production
```

---

## Required Configuration

1. **RevenueCat** - Set up your RevenueCat account and add API keys to `services/revenueCatService.ts`

2. **Sentry** - Set up Sentry project and add DSN to `services/crashReportingService.ts`

3. **alarm.mp3** - Place your alarm sound file in `assets/alarm.mp3`

4. **App Icons** - Update icon assets in `assets/images/`

5. **app.json** - Update `REVENUECAT_DEV_API_KEY` and `REVENUECAT_PROD_API_KEY` placeholders
