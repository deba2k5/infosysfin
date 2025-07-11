# 🌾 GeoGrow – Precision Farming & Agri Intelligence Dashboard

GeoGrow is an AI-driven smart agriculture platform built for **farmers**, **agronomists**, and **agritech innovators** to analyze crop health, manage resources, receive real-time alerts, and boost yield sustainably. 

With integrations across satellite intelligence, weather forecasts, mandi prices, crop insurance, and AI advisories – **GeoGrow** bridges the gap between the farm and future-ready data.

---

## 🚀 Project Highlights

| Feature                         | Description                                                                 |
|---------------------------------|-----------------------------------------------------------------------------|
| 🛰️ **NDVI Vegetation Health**   | Real-time NDVI & surface reflectance maps via **Planet API + Leaflet**     |
| ☁️ **Weather Forecast**         | 7-day forecasts + alerts via **Tomorrow.io API**                           |
| 📉 **Mandi Price Analysis**     | Crop-wise price trends via **Agmarknet API**                               |
| 🧬 **Crop Health Diagnosis**    | Upload plant image → detect diseases using **Gemini API**                  |
| 🌱 **Cross Crop Advisory**      | Soil-Season-Crop input → get companion crop suggestions (via AI)           |
| 🔔 **Smart Alerts**             | WhatsApp/SMS via **Twilio API**, alerts for weather, disease & prices      |
| 🛡️ **Crop Insurance Calculator**| Estimate premium & find available government insurance                     |
| 📍 **Farm Location Mapping**    | Field polygons + markers with **Leaflet + React-Leaflet**                  |
| 🤖 **Chatbot Advisory**         | Personalized chatbot powered by **Firebase + Gemini API**                  |
| 🔒 **User Authentication**      | Secure login using **Firebase Auth**                                       |

---

## 🧩 Tech Stack

| Frontend | Backend / APIs | Tools & Libraries |
|----------|----------------|-------------------|
| ✅ React.js + TypeScript | ☁️ Tomorrow Weather API | ⚙️ Vite |
| 🎨 Tailwind CSS | 🛰️ Planet API (NDVI) | 🌍 Leaflet + React-Leaflet |
| 🧩 Shadcn/UI | 📊 Agmarknet API (Mandi prices) | 📦 Axios |
| 🧠 Gemini AI | 🔐 Firebase (Auth, DB) | ✨ Animations via Tailwind |
| 💬 Serper AI (fallback NLP) | 📲 Twilio API (SMS/WhatsApp) | 🧠 Gemini (Disease/Chat AI) |

---

## 📂 Project Structure

GeoGrow/
├── public/ # Static assets
├── src/
│ ├── assets/ # Images, icons
│ ├── components/ # Reusable UI components
│ ├── pages/ # Main app pages (Dashboard, Weather, Prices)
│ ├── services/ # API services (weather, NDVI, price, chatbot)
│ ├── styles/ # Tailwind + global styles
│ └── main.tsx # App entry point
├── vite.config.ts
└── README.md


---

## ⚙️ Setup & Installation

> Prerequisites: `Node.js >= 18`, `npm`, `Git`

```bash
# 1. Clone the repository
git clone https://github.com/deba2k5/GeoGrow.git
cd GeoGrow

# 2. Install dependencies
npm install
npm install axios leaflet react-leaflet

# 3. Run locally
npm run dev

| Command           | Action                   |
| ----------------- | ------------------------ |
| `npm run dev`     | Start dev server         |
| `npm run build`   | Build production bundle  |
| `npm run preview` | Preview production build |

| Module                | Description                                                |
| --------------------- | ---------------------------------------------------------- |
| 🤖 Chatbot Advisor    | Firebase + Gemini powered natural advisory engine          |
| 🌱 Cross Crop Advisor | AI generates intercropping tips based on soil + season     |
| 🛰️ NDVI Classifier   | Uses Planet's NDVI & reflectance bands for crop health map |
| ☁️ Weather AI Alerts  | Intelligent push alerts via Twilio for severe forecasts    |
| 📉 Price Extractor    | Market rates parsed with Serper AI fallback when necessary |

| API / Service        | Purpose                               |
| -------------------- | ------------------------------------- |
| 🌍 **Planet API**    | NDVI & surface reflectance imagery    |
| ⛅ **Tomorrow\.io**   | Weather forecast & real-time alerts   |
| 🧬 **Gemini API**    | Disease prediction from leaf images   |
| 📉 **Agmarknet API** | Mandi price data across India         |
| 💬 **Twilio API**    | SMS/WhatsApp for urgent alerts        |
| 🔐 **Firebase**      | Auth, Firestore DB, Chatbot storage   |
| 🔎 **Serper API**    | Fallback NLP advisory if Gemini fails |

| Issue                                        | Fix                                                |
| -------------------------------------------- | -------------------------------------------------- |
| `error: src refspec main does not match any` | `git branch -M main`                               |
| `remote origin already exists`               | `git remote remove origin`                         |
| `404 on Vercel`                              | Set fallback route in Vercel → `/* => /index.html` |

# Create a new feature branch
git checkout -b feature/my-feature

# Make changes, then commit
git add .
git commit -m "feat: add NDVI map feature"

# Push changes
git push origin feature/my-feature
