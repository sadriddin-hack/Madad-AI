import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User, Phone, MapPin, Star, GraduationCap, X, CheckCircle2, Plus, Loader2, Search, Trash2, MapPinned, Settings, Edit3 } from "lucide-react";
import { toast } from "sonner";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  phone: string;
  location: string;
  city: string;
  rating: number;
}

const CITIES = [
  "ШАҲРИ ДУШАНБЕ",
  "ШАҲРИ ХУҶАНД",
  "ШАҲРИ ҲИСОР",
  "ШАҲРИ БОХТАР",
  "НОҲИЯИ АЙНӢ",
  "НОҲИЯИ ЗАФАРОБОД",
  "ДЕҲАИ ЗЕРОБОД",
  "ҶАМОАТИ ДАР ДАР"
];

const fallbackDoctors: Doctor[] = [
  {
    id: "1",
    name: "Д-р Алишер Воҳидов",
    specialty: "Кардиология",
    experience: "15 сол",
    phone: "+992 900 11 22 33",
    location: "Маркази тиббии Душанбе",
    city: "ШАҲРИ ДУШАНБЕ",
    rating: 4.9
  },
  {
    id: "2",
    name: "Д-р Малика Раҳимова",
    specialty: "Неврология",
    experience: "12 сол",
    phone: "+992 918 44 55 66",
    location: "Клиникаи Ависенна",
    city: "ШАҲРИ ДУШАНБЕ",
    rating: 4.8
  },
  {
    id: "3",
    name: "Д-р Бахтиёр Саидов",
    specialty: "Педиатрия",
    experience: "20 сол",
    phone: "+992 935 77 88 99",
    location: "Беморхонаи марказии шаҳр",
    city: "ШАҲРИ ДУШАНБЕ",
    rating: 5.0
  }
];

interface DoctorsProps {
  user: { email: string; role: 'user' | 'admin' } | null;
}

export default function Doctors({ user }: DoctorsProps) {
  const [showModal, setShowModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingDoctorId, setEditingDoctorId] = useState<string | null>(null);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("Ҳама");
  const [formData, setFormData] = useState({
    name: "",
    specialty: "",
    experience: "",
    phone: "",
    location: "",
    city: CITIES[0],
    rating: 5.0
  });

  useEffect(() => {
    // Load from LocalStorage
    const savedDoctors = localStorage.getItem("madad_doctors");
    if (savedDoctors) {
      setDoctors(JSON.parse(savedDoctors));
    } else {
      setDoctors(fallbackDoctors);
    }

    const savedCity = localStorage.getItem("user_city");
    if (savedCity) {
      setSelectedCity(savedCity);
    } else {
      setShowLocationPrompt(true);
    }

    setIsLoading(false);
  }, []);

  const handleSelectCity = (city: string) => {
    setSelectedCity(city);
    localStorage.setItem("user_city", city);
    setShowLocationPrompt(false);
  };

  const filteredDoctors = useMemo(() => {
    return doctors.filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.specialty.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCity = selectedCity === "Ҳама" || doc.city === selectedCity;
      return matchesSearch && matchesCity;
    });
  }, [doctors, searchQuery, selectedCity]);

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.role !== 'admin') return;
    
    setIsAdding(true);
    try {
      let updatedDoctors;
      
      if (editingDoctorId) {
        updatedDoctors = doctors.map(doc => 
          doc.id === editingDoctorId ? { ...formData, id: editingDoctorId } : doc
        );
        toast.success("Маълумоти духтур нав карда шуд!");
      } else {
        const newDoctor: Doctor = {
          ...formData,
          id: Date.now().toString(),
        };
        updatedDoctors = [...doctors, newDoctor];
        toast.success("Духтур бомуваффақият илова шуд!");
      }
      
      setDoctors(updatedDoctors);
      localStorage.setItem("madad_doctors", JSON.stringify(updatedDoctors));
      
      setShowModal(false);
      setEditingDoctorId(null);
      setFormData({
        name: "",
        specialty: "",
        experience: "",
        phone: "",
        location: "",
        city: CITIES[0],
        rating: 5.0
      });
    } catch (error) {
      toast.error("Хатогӣ ҳангоми иҷрои амалиёт");
    } finally {
      setIsAdding(false);
    }
  };

  const handleEditClick = (doc: Doctor) => {
    setEditingDoctorId(doc.id);
    setFormData({
      name: doc.name,
      specialty: doc.specialty,
      experience: doc.experience,
      phone: doc.phone,
      location: doc.location,
      city: doc.city,
      rating: doc.rating
    });
    setShowModal(true);
  };

  const handleDeleteDoctor = (id: string) => {
    if (!user || user.role !== 'admin') return;

    try {
      const updatedDoctors = doctors.filter(doc => doc.id !== id);
      setDoctors(updatedDoctors);
      localStorage.setItem("madad_doctors", JSON.stringify(updatedDoctors));
      toast.success("Маълумот нест карда шуд");
    } catch (error) {
      toast.error("Хатогӣ ҳангоми нест кардан");
    }
  };

  return (
    <div className="space-y-12 relative">
      <AnimatePresence>
        {showLocationPrompt && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative glass-dark p-8 md:p-10 rounded-[40px] border-white/10 max-w-2xl w-full shadow-2xl space-y-8 text-center"
            >
              <div className="space-y-4">
                <div className="w-20 h-20 bg-medical-green/20 rounded-3xl flex items-center justify-center mx-auto">
                  <MapPinned className="w-10 h-10 text-medical-green" />
                </div>
                <h2 className="text-3xl font-bold">Хуш омадед!</h2>
                <p className="text-gray-400 text-lg">
                  Лутфан макони зисти худро интихоб кунед, то мо тавонем духтурони наздиктарини шуморо пешниҳод кунем.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <button
                  onClick={() => handleSelectCity("Ҳама")}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-medical-green hover:bg-medical-green/10 transition-all font-bold text-sm"
                >
                  Ҳамаи маконҳо
                </button>
                {CITIES.map(city => (
                  <button
                    key={city}
                    onClick={() => handleSelectCity(city)}
                    className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-medical-green hover:bg-medical-green/10 transition-all font-bold text-sm leading-tight"
                  >
                    {city}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {showAdminPanel && user?.role === 'admin' && (
          <div className="fixed inset-0 z-[55] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAdminPanel(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative glass-dark p-8 md:p-10 rounded-[40px] border-white/10 max-w-4xl w-full shadow-2xl space-y-8 max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-6 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-medical-green/20 rounded-2xl flex items-center justify-center">
                    <Settings className="w-6 h-6 text-medical-green" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">Тағйирот ва Идоракунӣ</h2>
                    <p className="text-gray-400 text-sm">Рӯйхати пурраи духтурони воридшуда</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAdminPanel(false)}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                {doctors.map((doc) => (
                  <div 
                    key={doc.id} 
                    className="p-6 bg-white/5 border border-white/5 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/10 transition-all group"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 bg-medical-green/10 rounded-[1.5rem] flex items-center justify-center shrink-0">
                        <User className="w-8 h-8 text-medical-green" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xl font-bold text-white group-hover:text-medical-green transition-colors">{doc.name}</h4>
                        <p className="text-sm text-gray-400 font-medium">{doc.specialty} • {doc.city}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEditClick(doc)}
                        className="flex-1 md:flex-none px-6 py-3 bg-blue-600/10 text-blue-500 border border-blue-600/20 rounded-xl font-bold hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2"
                      >
                        <Edit3 className="w-4 h-4" />
                        Тағйир додан
                      </button>
                      <button
                        onClick={() => handleDeleteDoctor(doc.id)}
                        className="flex-1 md:flex-none px-6 py-3 bg-red-600/10 text-red-500 border border-red-600/20 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Нест кардан
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-white/5 flex justify-between items-center shrink-0">
                <p className="text-gray-500 text-sm font-medium">Ҳамагӣ: <span className="text-white">{doctors.length} духтур</span></p>
                <button
                  onClick={() => {
                    setEditingDoctorId(null);
                    setShowModal(true);
                  }}
                  className="px-8 py-3 medical-gradient rounded-xl font-bold shadow-lg flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Духтури нав
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative glass-dark p-8 md:p-10 rounded-[40px] border-white/10 max-w-lg w-full shadow-2xl space-y-6 overflow-y-auto max-h-[90vh]"
            >
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full transition-colors z-10"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>

              {user?.role === 'admin' ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                      {editingDoctorId ? <Edit3 className="w-6 h-6 text-blue-500" /> : <Plus className="w-6 h-6 text-blue-500" />}
                    </div>
                    <h3 className="text-2xl font-bold">{editingDoctorId ? "Тағйир додани маълумот" : "Иловаи духтур"}</h3>
                  </div>
                  
                  <form onSubmit={handleAddDoctor} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Ному насаб</label>
                      <input 
                        required
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="масалан: Д-р Алишер Воҳидов"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Ихтисос</label>
                        <input 
                          required
                          type="text"
                          value={formData.specialty}
                          onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          placeholder="Кардиология"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Таҷриба</label>
                        <input 
                          required
                          type="text"
                          value={formData.experience}
                          onChange={(e) => setFormData({...formData, experience: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          placeholder="15 сол"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Телефон</label>
                      <input 
                        required
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white font-mono"
                        placeholder="+992 000 00 00 00"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Макон (Суроға)</label>
                        <input 
                          required
                          type="text"
                          value={formData.location}
                          onChange={(e) => setFormData({...formData, location: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          placeholder="масалан: Маркази тиббии №1"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Шаҳр / Ноҳия</label>
                        <select 
                          required
                          value={formData.city}
                          onChange={(e) => setFormData({...formData, city: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
                        >
                          {CITIES.map(city => (
                            <option key={city} value={city} className="bg-gray-900">{city}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <button 
                      disabled={isAdding}
                      className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : editingDoctorId ? <CheckCircle2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                      {editingDoctorId ? "Захира кардани тағйирот" : "Илова кардан"}
                    </button>
                    {editingDoctorId && (
                      <button 
                        type="button"
                        onClick={() => {
                          setEditingDoctorId(null);
                          setShowModal(false);
                        }}
                        className="w-full bg-white/5 hover:bg-white/10 py-4 rounded-xl font-bold transition-all"
                      >
                        Бекор кардан
                      </button>
                    )}
                  </form>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 bg-medical-green/20 rounded-2xl flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-medical-green" />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold">Ҳамкории тиббӣ</h3>
                    <p className="text-gray-300 leading-relaxed">
                      Агар шумо духтури ботаҷриба дар соҳаи худ ҳастед, пас барои ҳамкорӣ ба админ муроҷиат кунед. Шуморо сари вақт ба платформа илова мекунад то ба беморон ёрӣ расонед.
                    </p>
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/5 space-y-2">
                      <p className="text-xs text-white/40 uppercase tracking-[0.2em] font-bold">Тамос бо Админ</p>
                      <p className="text-2xl font-mono font-bold text-medical-green">+992 901 66 00 65</p>
                      <p className="text-sm text-gray-400">ЗОКИРОВ САДРИДДИН</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => setShowModal(false)}
                    className="w-full py-4 medical-gradient rounded-2xl font-bold shadow-lg"
                  >
                    Фаҳмо, ташаккур
                  </button>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Мутахассисони тавсияшуда</h1>
        <div className="space-y-2">
          <p className="text-gray-400 max-w-xl mx-auto text-lg">
            Шумо дар ин панел духтурони беҳтарини Ҷумҳурии Тоҷикистонро пайдо мекунед.
          </p>
          <p className="text-medical-green font-bold italic text-sm tracking-wide">
            Шиори мо: "Саломатии халқ ҳадафи асосии мост!"
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="relative group max-w-md mx-auto">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-500 group-focus-within:text-medical-green transition-colors" />
          </div>
          <input 
            type="text"
            placeholder="Ҷустуҷӯи духтур (Ном ё ихтисос)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-medical-green/50 transition-all font-medium text-lg"
          />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 p-2 glass rounded-[2rem]">
          <button
            onClick={() => handleSelectCity("Ҳама")}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
              selectedCity === "Ҳама" 
                ? "bg-medical-green text-white border-medical-green" 
                : "bg-white/5 text-gray-400 border-white/5 hover:border-white/10"
            }`}
          >
            Ҳамаи маконҳо
          </button>
          {CITIES.map(city => (
            <button
              key={city}
              onClick={() => handleSelectCity(city)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                selectedCity === city 
                  ? "bg-medical-green text-white border-medical-green" 
                  : "bg-white/5 text-gray-400 border-white/5 hover:border-white/10"
              }`}
            >
              {city}
            </button>
          ))}
        </div>
        
        {selectedCity === "Ҳама" && (
           <div className="flex items-center justify-center gap-2 text-gray-400 animate-pulse">
             <MapPinned className="w-4 h-4" />
             <span className="text-sm">Лутфан макони худро интихоб кунед, то духтурони наздики шуморо нишон диҳем.</span>
           </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-medical-green" />
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="col-span-full text-center py-20 glass rounded-3xl space-y-4">
            <Search className="w-12 h-12 text-gray-600 mx-auto opacity-20" />
            <p className="text-gray-400 font-medium">Ҳеҷ духтуре бо ин ном ё ихтисос ёфт нашуд.</p>
          </div>
        ) : (
          filteredDoctors.map((doc, i) => (
            <motion.div
              key={doc.id || i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-3xl p-6 space-y-6 group hover:translate-y-[-8px] transition-all duration-300 border-white/5 hover:border-medical-green/40 shadow-xl relative overflow-hidden"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-medical-green/10 flex items-center justify-center shrink-0">
                  <User className="w-8 h-8 text-medical-green" />
                </div>
                <div>
                  <h3 className="font-bold text-xl leading-tight">{doc.name}</h3>
                  <p className="text-medical-green text-sm font-semibold uppercase tracking-wider">{doc.specialty}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-bold text-gray-300">{doc.rating}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <GraduationCap className="w-4 h-4 text-medical-green shrink-0" />
                  <span>Таҷриба: {doc.experience}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <MapPin className="w-4 h-4 text-medical-green shrink-0" />
                  <div className="flex flex-col">
                    <span className="truncate">{doc.location}</span>
                    <span className="text-[10px] text-medical-green font-bold">{doc.city}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <Phone className="w-4 h-4 text-medical-green shrink-0" />
                  <span className="font-mono">{doc.phone}</span>
                </div>
              </div>

              <a 
                href={`tel:${doc.phone}`}
                className="w-full bg-white/10 hover:bg-medical-green hover:text-white py-3 rounded-xl font-bold transition-all border border-white/10 flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                Занг задан
              </a>
            </motion.div>
          ))
        )}
      </div>
      
      <div className="glass p-8 rounded-3xl text-center space-y-6 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold">{user?.role === 'admin' ? "Панели Админ" : "Шумо духтур ҳастед?"}</h2>
        <p className="text-gray-400 italic">
          {user?.role === 'admin' 
            ? "Маълумоти духтурони навро илова кунед, то дар барнома намоиш дода шаванд."
            : '"Ба шабакаи мутахассисони элитаи тиббии мо ҳамроҳ шавед ва ба мо дар тағир додани дастрасии соҳаи тандурустӣ кумак кунед."'
          }
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => {
              setEditingDoctorId(null);
              setShowModal(true);
            }}
            className={`px-8 py-3 rounded-xl font-bold shadow-lg shrink-0 transition-all ${
              user?.role === 'admin' ? "bg-blue-600 hover:bg-blue-700 w-full sm:w-auto" : "medical-gradient w-full sm:w-auto"
            }`}
          >
            {user?.role === 'admin' ? "Илова кардани духтур" : "Дархост барои ҳамроҳшавӣ"}
          </button>
          
          {user?.role === 'admin' && (
            <button 
              onClick={() => setShowAdminPanel(true)}
              className="px-8 py-3 rounded-xl font-bold shadow-lg shrink-0 transition-all border w-full sm:w-auto flex items-center justify-center gap-2 bg-purple-600/10 text-purple-500 border-purple-600/20 hover:bg-purple-600/20"
            >
              <Settings className="w-5 h-5" />
              Тағйирот
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
