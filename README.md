# 📱 VoiceBox - Smart Bill Scanner

Hey! This is a cool bill scanning app that works with Hindi/English and lets you make payments too. 

---

## What's This?

- Scan bills in any language 📸
- Voice commands for hands-free use 🗣️
- Make UPI payments & generate QR codes 💳
- Admin panel to manage everything 👨‍💼
- Works on mobile, tablet, desktop 📱💻

---

## How to Use

### Just Open It!

```
1. Go to html/login.html
2. Double-click or drag to browser
3. That's it! 🎉
```

**Using VS Code?**
- Install Live Server extension
- Right-click `html/login.html` → "Open with Live Server"

---

## Login Info

**Regular User:**
```
Email: demo@example.com
Password: demo123
```

**Admin Access:** (Keep it secret!)
```
File: html/admin-login.html
Email: admin@voicebox.com
Password: admin123
```

⚠️ Change the admin password ASAP!

---

## What's Inside

```
VoiceBox/
├── html/          → All the pages
├── js/            → JavaScript magic
├── css/           → Makes it pretty
└── assets/        → Images & stuff
```

---

## Want to Deploy?

### GitHub Pages (Free!)
1. Push to GitHub
2. Go to Settings → Pages
3. Select main branch
4. Done! Your URL will be ready

### Netlify (Super Easy!)
- Just drag & drop your folder here: https://app.netlify.com/drop
- Get instant live URL 🚀

### Firebase Hosting
```bash
firebase init hosting
firebase deploy
```

---

## Firebase Setup (Optional)

The app works fine without Firebase (uses localStorage).

**But if you want real database:**
1. Create project: https://console.firebase.google.com/
2. Copy config to `js/auth.js` and `js/admin.js`
3. Enable Authentication + Firestore
4. You're good to go!

---

## How It Works

### For Users
- Login → Scan bills → Make payments → Done!
- Everything saved in your history

### For Admins  
- Secret admin page → Login → Manage users → View analytics
- Export reports, track payments, all that good stuff

---

## Tech Stuff

- Pure HTML/CSS/JavaScript (no frameworks!)
- Firebase for auth & database (optional)
- Tesseract.js for OCR scanning
- Web Speech API for voice commands

---

## Browser Support

Works on pretty much everything:
- Chrome ✅
- Firefox ✅  
- Safari ✅
- Edge ✅

---

## Need Help?

- Check the files in `html/` for setup guides
- Open an issue on GitHub
- Or just figure it out - it's pretty simple! 😄

---

## License

MIT - Do whatever you want with it!

---

**Made by someone who was tired of manual bill entry** 💪

Enjoy! ⭐
