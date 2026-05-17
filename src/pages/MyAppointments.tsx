import { useState, useEffect } from "react";
import { Calendar, Clock, User, ArrowLeft, Trash2, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  patientName: string;
  status: 'confirmed' | 'pending' | 'completed';
  createdAt: string;
}

export default function MyAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("madad_appointments");
    if (saved) {
      setAppointments(JSON.parse(saved).sort((a: Appointment, b: Appointment) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    }
  }, []);

  const deleteAppointment = (id: string) => {
    const updated = appointments.filter(a => a.id !== id);
    setAppointments(updated);
    localStorage.setItem("madad_appointments", JSON.stringify(updated));
    toast.success("Сабт хориҷ карда шуд");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-24 pt-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div className="space-y-4">
          <Link to="/chat" className="inline-flex items-center gap-2 text-medical-green font-black uppercase tracking-widest text-[10px] hover:gap-4 transition-all">
            <ArrowLeft className="w-4 h-4" />
            Баргашт ба чат
          </Link>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Сабтҳои <br className="md:hidden" /> <span className="text-medical-green italic">Ман</span></h1>
          <p className="text-gray-500 font-medium max-w-md uppercase text-[10px] tracking-[0.2em]">Рӯйхати вохӯриҳои шумо бо духтурони MADAD AI</p>
        </div>
        <div className="px-6 py-3 glass rounded-2xl flex items-center gap-4 border border-white/5 shadow-2xl">
          <div className="w-10 h-10 rounded-full bg-medical-green/10 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-medical-green" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Миқдори сабтҳо</p>
            <p className="text-xl font-black text-white">{appointments.length}</p>
          </div>
        </div>
      </div>

      {appointments.length === 0 ? (
        <div className="glass rounded-[40px] p-16 md:p-32 text-center space-y-10 border border-white/5 shadow-inner">
          <div className="relative inline-block">
             <div className="absolute inset-0 bg-medical-green/20 blur-3xl rounded-full" />
             <div className="w-24 h-24 bg-[#111815] border border-white/10 rounded-[32px] flex items-center justify-center relative z-10 mx-auto">
                <Calendar className="w-10 h-10 text-gray-600" />
             </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-black tracking-tight text-white uppercase italic">Шумо ҳоло ягон сабт надоред</h2>
            <p className="text-gray-500 max-w-sm mx-auto font-medium leading-relaxed">
              Лутфан бо AI-и мо сӯҳбат кунед, то ёвари сунъӣ ба шумо духтури мувофиқро пайдо кунад ва қабули шуморо сабт намояд.
            </p>
          </div>
          <Link 
            to="/chat" 
            className="medical-gradient inline-flex px-12 py-5 rounded-[24px] font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all text-black shadow-2xl shadow-medical-green/20"
          >
            Ба чат гузаштан
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 px-4">
          <AnimatePresence mode="popLayout">
            {appointments.map((app) => (
              <motion.div
                key={app.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#0c1210] p-8 rounded-[32px] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-8 hover:border-medical-green/30 transition-all duration-500 group shadow-lg"
              >
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-[20px] medical-gradient flex items-center justify-center shrink-0 shadow-[0_15px_30px_rgba(16,185,129,0.3)] group-hover:rotate-6 transition-transform">
                    <User className="text-black w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-black text-2xl tracking-tighter text-white">{app.doctorName}</h3>
                      <div className="px-3 py-1 bg-medical-green/10 rounded-full border border-medical-green/20">
                        <span className="text-[10px] font-black text-medical-green uppercase tracking-widest">Тасдиқ шуд</span>
                      </div>
                    </div>
                    <p className="text-medical-green text-[11px] font-black uppercase tracking-[0.2em]">{app.specialty}</p>
                    <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 pt-2">
                      <div className="flex items-center gap-2 font-bold">
                        <Calendar className="w-4 h-4 text-gray-600" />
                        {app.date}
                      </div>
                      <div className="flex items-center gap-2 font-bold">
                        <Clock className="w-4 h-4 text-gray-600" />
                        {app.time}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-white/5">
                  <div className="hidden md:block h-12 w-px bg-white/5 mx-4" />
                  <button 
                    onClick={() => deleteAppointment(app.id)}
                    className="flex-grow md:flex-grow-0 py-4 px-6 md:p-4 bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white rounded-[18px] transition-all border border-red-500/10 flex items-center justify-center gap-3 md:gap-0"
                  >
                    <span className="md:hidden text-xs font-black uppercase tracking-widest">Хориҷ кардан</span>
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <div className="mx-4 p-8 rounded-[32px] bg-white/[0.02] border border-white/5 flex flex-col md:flex-row items-center gap-8 shadow-inner">
        <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center shrink-0">
          <CheckCircle className="w-8 h-8 text-medical-green" />
        </div>
        <div className="space-y-2 text-center md:text-left">
          <h4 className="font-black text-lg uppercase tracking-tight text-white italic">Муҳим барои беморон:</h4>
          <p className="text-sm text-gray-500 font-medium leading-relaxed">
            Ин сабтҳо мустақиман дар дастгоҳи шумо (Local Storage) нигоҳ дошта шудаанд. 
            Лутфан дар вақти муайяншуда ба беморхона ҳозир шавед ва ин саҳифаро ба қабулгоҳ нишон диҳед. 
            <br />
            <span className="text-medical-green font-bold opacity-60">МАЪЛУМОТҲОИ ШУМО МАХФӢ НИГОҲ ДОШТА МЕШАВАНД.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
