import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn, Github, MailPlus, Apple } from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";

interface AuthProps {
  onLogin: (user: { email: string; role: 'user' | 'admin' }) => void;
}

export default function Auth({ onLogin }: AuthProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Super Admin Logic
    if (email === "sadriddinzokirov65@gmail.com" && password === "Dushanbe24@") {
      const adminUser = { email, role: 'admin' as const };
      localStorage.setItem("madad_user", JSON.stringify(adminUser));
      onLogin(adminUser);
      toast.success("Хуш омадед, Супер Админ Садриддин!");
      navigate("/admin");
    } else {
      // Mock user login
      const regularUser = { email, role: 'user' as const };
      localStorage.setItem("madad_user", JSON.stringify(regularUser));
      onLogin(regularUser);
      toast.success("Воридшавӣ муваффақона!");
      navigate("/");
    }
    setIsLoading(false);
  };

  const handleSocialLogin = (platform: string) => {
    toast.info(`${platform} login selected. Redirecting...`);
    // Mock successful login
    setTimeout(() => {
      const mockUser = { email: `user@${platform.toLowerCase()}.com`, role: 'user' as const };
      localStorage.setItem("madad_user", JSON.stringify(mockUser));
      onLogin(mockUser);
      navigate("/");
    }, 1000);
  };

  return (
    <div className="max-w-md mx-auto pt-10 md:pt-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-10 rounded-[40px] border-white/5 space-y-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 medical-gradient" />
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Хуш омадед</h1>
          <p className="text-gray-400">Ба портали тиббии худ ворид шавед</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Суроғаи почтаи электронӣ</label>
            <div className="relative">
              <Mail className="absolute left-4 top-4 w-5 h-5 text-gray-500" />
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom@example.com"
                className="w-full bg-medical-dark border border-white/10 rounded-2xl py-4 pl-12 focus:outline-none focus:ring-2 focus:ring-medical-green/50 transition-all font-medium"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Рамз</label>
            <div className="relative">
              <Lock className="absolute left-4 top-4 w-5 h-5 text-gray-500" />
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-medical-dark border border-white/10 rounded-2xl py-4 pl-12 focus:outline-none focus:ring-2 focus:ring-medical-green/50 transition-all font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full medical-gradient py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg hover:translate-y-[-2px] transition-all active:translate-y-0"
          >
            {isLoading ? "Дар ҳоли санҷиш..." : "Ворид шудан"}
            <LogIn className="w-5 h-5" />
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-medical-dark px-4 text-gray-500 font-bold tracking-widest">Ё идома диҳед бо</span></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => handleSocialLogin("Google")}
            className="glass flex items-center justify-center gap-3 py-3 rounded-2xl hover:bg-white/10 transition-all border-white/5 font-bold text-sm"
          >
            <MailPlus className="w-5 h-5 text-red-500" />
            Google
          </button>
          <button 
            onClick={() => handleSocialLogin("iCloud")}
            className="glass flex items-center justify-center gap-3 py-3 rounded-2xl hover:bg-white/10 transition-all border-white/5 font-bold text-sm"
          >
            <Apple className="w-5 h-5 text-gray-100" />
            iCloud
          </button>
        </div>

        <p className="text-center text-xs text-gray-500 font-bold uppercase tracking-wider">
          Аутентификатсияи бехатари тиббӣ
        </p>
      </motion.div>
    </div>
  );
}
