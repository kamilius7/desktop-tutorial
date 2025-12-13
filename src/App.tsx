
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { SportsPage } from './pages/SportsPage';
import { NutritionPage } from './pages/NutritionPage';
import { EverydayFitPage } from './pages/EverydayFitPage';
import { SettingsPage } from './pages/SettingsPage';
export function App() {
  return <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/sports" element={<SportsPage />} />
        <Route path="/nutrition" element={<NutritionPage />} />
        <Route path="/everyday-fit" element={<EverydayFitPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>;
}