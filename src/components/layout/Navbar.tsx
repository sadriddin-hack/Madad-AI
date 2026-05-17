import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Stethoscope, User, LogOut, HeartPulse, Settings, Calendar, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";

interface NavbarProps {
  user: { email: string; role: 'user' | 'admin' } | null;
  onLogout: () => void;
}

export default function Navbar({ user, onLogout }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isChatPage = location.pathname === "/chat";

  const navItems = [
    { name: "Асосӣ", path: "/" },
    { name: "Ёвари сунъӣ", path: "/chat" },
    { name: "Духтурон", path: "/doctors" },
    { name: "Сабтҳо", path: "/appointments" },
    { name: "Телеграм Бот", path: "/telegram" },
    { name: "Инстаграми мо", path: "https://www.instagram.com/madad_ai_tj?igsh=MW82aG42bDk0bjc0bA%3D%3D&utm_source=qr", external: true },
  ];

  const handleLogout = () => {
    onLogout();
    navigate("/");
    setIsOpen(false);
  };

  if (isChatPage) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 py-6 px-4 sm:px-8">
      <div className="container mx-auto flex justify-between items-center glass-dark rounded-[2.5rem] py-2 pl-2 pr-6 sm:pr-8 border border-white/5 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
        <Link to="/" className="flex items-center gap-4 group px-4 py-2 rounded-[2rem] hover:bg-white/[0.03] transition-all duration-300">
          <div className="relative shrink-0">
            <img 
              src="/src/assets/images/madad_ai_logo_1779016666737.png" 
              alt="MADAD AI" 
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain relative z-10 transition-transform duration-500 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl sm:text-2xl font-black tracking-tighter text-white leading-none uppercase">
              MADAD <span className="text-medical-green">AI</span>
            </h1>
            <span className="text-[8px] font-black text-gray-500 uppercase tracking-[0.4em] mt-1">
              Medical Intelligence
            </span>
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-2 lg:gap-4">
          <div className="flex items-center bg-white/[0.03] border border-white/5 rounded-full px-2 py-1.5 mr-4">
            {navItems.map((item) => (
              item.external ? (
                <a
                  key={item.name}
                  href={item.path}
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-500 hover:text-white transition-all font-bold text-[10px] lg:text-[11px] uppercase tracking-widest px-4 py-2.5 rounded-full hover:bg-white/5"
                >
                  {item.name}
                </a>
              ) : (
                <Link
                  key={item.name}
                  to={item.path}
                  className={cn(
                    "transition-all font-bold text-[10px] lg:text-[11px] uppercase tracking-widest px-4 py-2.5 rounded-full hover:bg-white/5",
                    location.pathname === item.path ? "text-medical-green bg-white/5 shadow-sm" : "text-gray-500 hover:text-white"
                  )}
                >
                  {item.name}
                </Link>
              )
            ))}
          </div>

          {user ? (
            <div className="flex items-center gap-3 ml-2">
              {user.role === 'admin' && (
                <Link to="/admin" className="text-[9px] font-black text-medical-green border border-medical-green/20 px-4 py-2 rounded-full hover:bg-medical-green hover:text-black transition-all uppercase tracking-widest">
                  ADMIN
                </Link>
              )}
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/5 rounded-full p-1">
                <div className="w-9 h-9 rounded-full bg-[#111815] border border-white/10 flex items-center justify-center text-medical-green shadow-inner">
                  <User className="w-4 h-4" />
                </div>
                <button 
                  onClick={handleLogout}
                  className="w-9 h-9 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-full transition-all flex items-center justify-center border border-red-500/10"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-8 py-3.5 bg-medical-green text-black rounded-full font-black text-[11px] uppercase tracking-widest transition-all hover:scale-105 hover:shadow-[0_10px_30px_rgba(16,185,129,0.3)] active:scale-95 shadow-lg"
            >
              LOGIN
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 text-gray-300"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="md:hidden absolute top-[105%] left-4 right-4 glass-dark rounded-[2rem] py-6 px-6 flex flex-col gap-1 shadow-2xl border border-white/10 z-[60] backdrop-blur-3xl"
          >
            {navItems.map((item) => (
              item.external ? (
                <a
                  key={item.name}
                  href={item.path}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-bold text-gray-500 hover:text-white py-4 px-4 rounded-2xl hover:bg-white/5 transition-all flex items-center justify-between group uppercase tracking-widest"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                  <ChevronLeft className="w-4 h-4 opacity-0 group-hover:opacity-100 rotate-180 transition-all text-medical-green" />
                </a>
              ) : (
                <Link
                  key={item.name}
                  to={item.path}
                  className={cn(
                    "text-sm font-bold py-4 px-4 rounded-2xl transition-all flex items-center justify-between group uppercase tracking-widest",
                    location.pathname === item.path ? "text-medical-green bg-white/5" : "text-gray-500 hover:text-white hover:bg-white/5"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                  <ChevronLeft className="w-4 h-4 opacity-0 group-hover:opacity-100 rotate-180 transition-all text-medical-green" />
                </Link>
              )
            ))}
            {user ? (
              <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center justify-between p-4 bg-medical-green/10 border border-medical-green/20 rounded-2xl text-medical-green font-black uppercase tracking-widest text-[10px]"
                    onClick={() => setIsOpen(false)}
                  >
                    <span>Admin Panel</span>
                    <Settings className="w-4 h-4" />
                  </Link>
                )}
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-full border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-medical-green/10 flex items-center justify-center text-medical-green">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 truncate max-w-[120px]">{user.email}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="p-2.5 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all border border-red-500/5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-medical-green text-black py-4 rounded-[1.5rem] text-center font-black uppercase tracking-[0.2em] text-xs mt-4 shadow-xl shadow-medical-green/20 active:scale-[0.98] transition-all"
                onClick={() => setIsOpen(false)}
              >
                LOGIN
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
