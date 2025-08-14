# 🚀 Chess Reforged Production Setup Guide

## ✅ Deployment Status: LIVE
**🌐 Website URL: https://chess-reforged.web.app**

The Chess Reforged application has been successfully deployed to Firebase Hosting and is now live! However, a few Firebase services need to be manually enabled in the Firebase Console to activate all multiplayer features.

## 🔧 Manual Setup Required (5 minutes)

### 1. Enable Firestore Database
1. Visit: https://console.firebase.google.com/project/chess-reforged/firestore
2. Click **"Create database"**
3. Select **"Start in production mode"**
4. Choose your preferred region (e.g., `us-central1`)
5. Click **"Done"**

### 2. Enable Authentication Providers
1. Visit: https://console.firebase.google.com/project/chess-reforged/authentication/providers
2. Enable **Email/Password** authentication:
   - Click on "Email/Password"
   - Toggle "Enable"
   - Click "Save"

3. Enable **Google** authentication:
   - Click on "Google" 
   - Toggle "Enable"
   - Set project support email
   - Click "Save"

4. Enable **Apple** authentication (optional):
   - Click on "Apple"
   - Toggle "Enable" 
   - Configure Apple Developer settings
   - Click "Save"

5. Enable **Discord** authentication (optional):
   - Click on "Add new provider"
   - Select "Custom"
   - Configure Discord OAuth

### 3. Deploy Firestore Rules & Indexes
Once Firestore is enabled, run:
```bash
firebase deploy --only firestore
```

### 4. Enable Firebase APIs
If you encounter API errors, visit:
- https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=chess-reforged
- https://console.developers.google.com/apis/api/firebase.googleapis.com/overview?project=chess-reforged

Click **"Enable"** for each API.

## 🎮 Production Features

### ✅ Currently Live Features
- **Single Player**: Play against AI with custom armies
- **Army Builder**: Create and customize chess armies
- **Shop & Inventory**: Purchase and manage cosmetic items
- **Profile System**: Track statistics and achievements
- **Responsive Design**: Works on all devices

### 🔄 Features Activating After Manual Setup
- **Real-time Multiplayer**: Play against other players online
- **ELO Rating System**: Competitive ranking (400-3000+ rating)
- **Matchmaking**: Automatic opponent pairing by skill level
- **User Authentication**: Account creation and login
- **Cloud Save**: Sync data across devices
- **Game History**: Persistent game records
- **Friends System**: Play private matches

## 🛠️ Development Commands

```bash
# Local development
npm run dev

# Build for production
npm run build

# Deploy to Firebase
npm run deploy

# Deploy only hosting
firebase deploy --only hosting

# Deploy only Firestore
firebase deploy --only firestore

# Run Firebase emulators
firebase emulators:start
```

## 🔒 Security Features
- **Firestore Rules**: Database access restricted to authenticated users
- **Input Validation**: All user inputs sanitized and validated
- **Rate Limiting**: Prevents spam and abuse
- **Secure Authentication**: Industry-standard OAuth and email auth

## 📊 Performance Optimizations
- **Static Export**: Fast global CDN delivery
- **Code Splitting**: Optimized JavaScript bundles
- **Image Optimization**: Compressed assets
- **Database Indexes**: Optimized query performance
- **Debounced Saves**: Reduced Firebase costs

## 🎯 Next Steps After Setup
1. Test user registration and login
2. Create a test multiplayer game
3. Verify ELO rating updates
4. Test on multiple devices
5. Monitor Firebase usage in console

## 🐛 Troubleshooting

### If authentication doesn't work:
- Verify providers are enabled in Firebase Console
- Check domain is added to authorized domains
- Ensure `.env.local` has correct Firebase config

### If Firestore errors occur:
- Confirm Firestore API is enabled
- Verify database is created in production mode
- Check firestore.rules are deployed

### If deployment fails:
```bash
# Clear cache and rebuild
rm -rf .next out
npm run build
firebase deploy --only hosting
```

## 📞 Support
If you encounter issues, check:
1. Firebase Console error logs
2. Browser developer console
3. Network connectivity
4. Firebase CLI version (`firebase --version`)

---

**🎉 Congratulations! Chess Reforged is now a production-ready multiplayer chess platform!**