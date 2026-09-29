# MacroTrack AI 🍎💪

> AI-Powered Macro & Calorie Companion designed specifically for iPhone & Progressive Web App (PWA).

MacroTrack AI combines multimodal visual AI food recognition (Google Gemini 2.5 Flash / GPT-4o) with conversational natural language logging, personalized daily protein & calorie targets, hydration tracking, and a native iOS interface.

---

## 📱 Features

- **Designed for iPhone UI**:
  - Glassmorphism bottom Tab Bar with frosted blur (`backdrop-blur-2xl bg-zinc-950/85`).
  - Native iOS safe areas (`env(safe-area-inset-bottom)`, `env(safe-area-inset-top)`).
  - Apple Watch / Activity-inspired Concentric Rings for Calories, Protein, and Carbs.
  - Interactive Dynamic Island with real-time remaining calorie status.
  - Haptic feedback and confetti celebration animations upon crushing daily goals.
  - iPhone 16 Pro desktop mockup preview with a 1-click toggle for full-screen responsive view.
  - Progressive Web App (PWA) manifest ready for iOS **Add to Home Screen**.

- **Three Core Tabs**:
  1. **Log (Default Tab)**:
     - Real-time calorie & macro dashboard (Calories, Protein, Carbs, Fat).
     - Day switcher (`< Yesterday | Today | Tomorrow >`).
     - AI Natural Language Food Bar (e.g., *"2 scrambled eggs, sourdough avocado toast, black coffee"*).
     - Voice dictation via Web Speech API.
     - Hydration tracker with quick `+250ml` and `+500ml` taps.
     - Categorized meal breakdown: Breakfast, Lunch, Dinner, and Snacks.
  2. **Camera AI Tab**:
     - Live video viewfinder or native iPhone Camera / Photo Library picker.
     - Laser sweep scanning animation.
     - Multimodal AI Vision identifies dish items, calculates portions in grams, and computes exact calories, protein, carbs, fat, and fiber.
     - Instant 1-tap save to daily log with photo thumbnail preview.
  3. **Profile & Goals Tab**:
     - Daily Calorie Target and Daily Protein Goal (customizable with g/lb calculation).
     - Smart TDEE & Macro Calculator (Mifflin-St Jeor formula).
     - Weight check-in tracker with historical log.
     - AI Model selector (Gemini 2.5 Flash, GPT-4o, Llama 3.3, Claude 3.5).
     - Custom API key setting saved securely in client `localStorage`.
     - Data Backup & Restore (JSON export/import).

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev
# or start production build:
npm run build && npm run start -p 3008
```

Open [http://localhost:3008](http://localhost:3008) in your browser.

---

## 🌐 Deploy to Vercel, Netlify, or GitHub

### Option A: Vercel (Recommended — 1-Click)
1. Push this folder to a GitHub repository:
   ```bash
   git add .
   git commit -m "Initial MacroTrack AI release"
   git branch -M main
   git remote add origin https://github.com/<your-username>/macrotrack.git
   git push -u origin main
   ```
2. Go to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Under **Environment Variables**, add:
   - `OPENROUTER_API_KEY`: `sk-or-v1-...`
5. Click **Deploy**. Your app is live with full serverless AI API endpoints!

### Option B: Netlify
1. Connect your repository in [Netlify](https://app.netlify.com).
2. Set Build command: `npm run build`
3. Set Publish directory: `.next`
4. Add environment variable: `OPENROUTER_API_KEY`
5. Deploy site.

---

## 📲 How to Install as an iPhone Web App

1. Open your live hosted URL in **Safari** on your iPhone.
2. Tap the **Share icon** (square with an arrow pointing up at the bottom).
3. Scroll down and tap **"Add to Home Screen"**.
4. Tap **"Add"** in the top right corner.
5. Launch **MacroTrack AI** from your iPhone home screen — it will run full-screen without any browser address bar!
