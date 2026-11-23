# 💰 Rathore Money Tracker

> **Smart, Private & Offline Personal Finance & Budgeting Web App (PWA)**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![PWA](https://img.shields.io/badge/PWA-Ready-success)
![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS%20%7C%20Web-purple)
![Privacy](https://img.shields.io/badge/Storage-100%25%20On--Device%20(Local)-emerald)

---

## 🌟 Key Highlights

- ⚡ **Zero Setup & 100% Private:** Operates entirely client-side using `localStorage` and `ServiceWorker`. No backend server tracking your financial secrets.
- 📱 **Native App Feel (PWA):** Install directly to your Android or iPhone home screen via "Add to Home Screen".
- 💸 **Income & Expense Tracking:** Fast logging with UPI, Cash, and Card modes.
- 🎯 **Monthly Budgeting & Alert:** Set spending limits with visual progress bars and warning notifications.
- 📊 **Visual Analytics:** Interactive category breakdown donut charts and 7-day spending trends powered by Chart.js.
- ☕ **1-Tap Quick Presets:** Add frequent expenses (+₹50 Chai, +₹100 Travel, +₹200 Meal, +₹500 Grocery) with a single tap.
- 💾 **Data Portability:** 1-click Export to Excel/CSV, JSON backup download, and instant JSON restore.
- 🌐 **Multi-Currency Support:** Default ₹ (INR), with $, €, £, AED support.

---

## 🚀 How to Run Locally

You can run this app with any simple static file server:

### Option 1: Python
```bash
cd Rathore-traker-
python3 -m http.server 3000
```
Then open: `http://localhost:3000`

### Option 2: Node.js (npx serve)
```bash
npx serve .
```

---

## 🌐 Deploy to GitHub Pages (Free Hosting)

1. Push this repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: complete money tracker PWA app"
   git push origin main
   ```
2. In your GitHub repository:
   - Go to **Settings** → **Pages**
   - Under **Build and deployment** > **Source**, choose `Deploy from a branch`
   - Select `main` branch and `/ (root)` folder
   - Click **Save**
3. Your app will be live at:
   `https://rahulrathore2.github.io/Rathore-traker-/`

---

## 📁 Project Architecture

```
Rathore-traker-/
├── index.html          # Main HTML structure with Tailwind CSS & Lucide icons
├── manifest.json       # PWA manifest for Android/iOS installation
├── sw.js               # Service Worker for offline performance
├── css/
│   └── styles.css      # Glassmorphism theme, animations & modals
├── js/
│   └── app.js          # Core reactive state, charts, CSV export & storage
├── icons/
│   └── icon.svg        # Scalable app vector icon
└── README.md           # Documentation
```

---
Developed by **Rahul Rathore**
