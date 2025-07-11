import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";
import Dashboard from "./pages/Dashboard";
import CropPlanning from "./pages/CropPlanning";
import Weather from "./pages/Weather";
import Insurance from "./pages/Insurance";
import Advisory from "./pages/Advisory";
import CropHealth from "./pages/CropHealth";
import MarketPrices from "./pages/MarketPrices";
import NotFound from "./pages/NotFound";

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/crop-planning" element={<CropPlanning />} />
          <Route path="/weather" element={<Weather />} />
          <Route path="/insurance" element={<Insurance />} />
          <Route path="/advisory" element={<Advisory />} />
          <Route path="/crop-health" element={<CropHealth />} />
          <Route path="/market-prices" element={<MarketPrices />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
