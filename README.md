readme:
  project: "GeoGrow"
  title: "🌾 GeoGrow – Precision Farming & Agri Intelligence Dashboard"
  description: >
    GeoGrow is an AI-driven smart farming dashboard designed for farmers, agronomists, and agritech startups to manage crops,
    monitor weather, analyze satellite data, and access real-time farm intelligence.
    It integrates NDVI, weather APIs, market prices, and insurance tools – all in one clean, animated, and responsive dashboard.

  features:
    - 📍 Live GPS location
    - 🛰️ NDVI Vegetation Health Map
    - 🧑‍🌾 Crop Health Diagnosis (via image)
    - 🌦️ 7-Day Weather Forecast
    - 📊 Yield Prediction
    - 📉 Mandi Price Analysis
    - ⚠️ Weather & Disease Alerts
    - 🗺️ Reflectance & Stress Maps
    - 🛡️ Crop Insurance Premium Calculator
    - 🤖 AI Advisory Chatbot
    - 🧬 Soil & Season-Based Crop Advice
    - 🔔 Smart Notifications & Warnings

  animations:
    - TailwindCSS transitions and hover effects
    - Hero-based animation sections
    - Metric fade-in-out loaders
    - Cards with responsive blur/glow on interaction

  tech_stack:
    - React.js + TypeScript
    - Vite
    - Tailwind CSS
    - Shadcn/UI Components
    - Axios
    - Leaflet + React-Leaflet
    - OpenWeatherMap API
    - Serper (optional fallback API)

  project_structure: |
    📦 GeoGrow/
     ┣ 📁 public/
     ┣ 📁 src/
     ┃ ┣ 📁 assets/
     ┃ ┣ 📁 components/
     ┃ ┣ 📁 pages/
     ┃ ┣ 📁 services/
     ┃ ┣ 📁 styles/
     ┃ ┗ 📜 main.tsx
     ┗ 📜 vite.config.ts

  setup:
    prerequisites:
      - Node.js ≥ 18
      - Git
      - npm or yarn
    commands:
      - git clone https://github.com/deba2k5/GeoGrow.git
      - cd GeoGrow
      - npm install
      - npm install axios leaflet react-leaflet
      - npm run dev

  scripts:
    - npm run dev
    - npm run build
    - npm run preview

  deployment:
    platform: "Vercel"
    steps:
      - Push to GitHub
      - Import project on vercel.com
      - Set root directory and build settings
      - Click 'Deploy'
      - Connect custom domain via Vercel dashboard

  ai_modules:
    - 🤖 AI Chatbot
    - 🌱 Cross Crop Advisory
    - 🛰️ NDVI Analyzer
    - ☁️ Weather AI Alerts
    - 📉 Price Parser & Market Advisory

  troubleshooting:
    - error: src refspec main does not match any → Run `git branch -M main`
    - Remote origin already exists → Run `git remote remove origin`
    - 404 on Vercel → Enable SPA fallback in Vercel routing config

  contributing:
    steps: |
      git checkout -b feature/new-feature
      # make your changes
      git add .
      git commit -m "feat: added new feature"
      git push origin feature/new-feature

  license: MIT

  author:
    name: "Debangshu Chatterjee"
    title: "Founder – SteadyStride"
    email: "deba2k5@gmail.com"
    github: "https://github.com/deba2k5"
    portfolio: "Coming Soon..."

  roadmap:
    - 🌐 Multilingual support (Hindi, Bengali, Tamil)
    - 📲 Mobile App version
    - 🧬 ML-based yield predictor
    - 📡 KVK and local data integration

  quote: >
    🌱 Empowering farmers with data. From soil to sky, we’ve got you covered.
