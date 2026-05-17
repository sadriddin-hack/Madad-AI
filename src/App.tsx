/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Toaster } from "sonner";
import Navbar from "@/src/components/layout/Navbar";
import PromotionalAd from "@/src/components/PromotionalAd";
import Home from "@/src/pages/Home";
import AIChat from "@/src/pages/AIChat";
import Doctors from "@/src/pages/Doctors";
import TelegramBot from "@/src/pages/TelegramBot";
import Auth from "@/src/pages/Auth";
import Admin from "@/src/pages/Admin";
import MyAppointments from "@/src/pages/MyAppointments";

export default function App() {
  const [user, setUser] = useState<{ email: string; role: 'user' | 'admin' } | null>(null);
  const location = useLocation();
  const isChatPage = location.pathname === "/chat";

  useEffect(() => {
    const savedUser = localStorage.getItem("madad_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("madad_user");
    setUser(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {!isChatPage && <PromotionalAd />}
      <Navbar user={user} onLogout={handleLogout} />
      
      <main className={isChatPage ? "flex-grow flex flex-col" : "flex-grow container mx-auto px-4 py-8"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<AIChat />} />
          <Route path="/doctors" element={<Doctors user={user} />} />
          <Route path="/appointments" element={<MyAppointments />} />
          <Route path="/telegram" element={<TelegramBot />} />
          <Route path="/login" element={<Auth onLogin={setUser} />} />
          
          <Route 
            path="/admin" 
            element={
              user?.role === 'admin' ? <Admin /> : <Navigate to="/login" />
            } 
          />
        </Routes>
      </main>

      {!isChatPage && (
        <footer className="py-6 border-t border-white/10 text-center text-sm text-gray-400">
          <p>© 2026 MADAD AI - Кумаки оқилонаи тиббӣ</p>
          <p className="mt-1">Мушовири тиббии СУ: ЗОКИРОВ САДРИДДИН</p>
        </footer>
      )}

      <Toaster position="top-right" expand={false} richColors />
    </div>
  );
}

