import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, RotateCcw, AlertTriangle, ShieldCheck, Calendar, Plus, MessageSquare, Trash2, Search, HeartPulse, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { cn } from "@/src/lib/utils";
import { Link } from "react-router-dom";

interface Message {
  role: "user" | "model";
  parts: { text: string }[];
  isFunctionCall?: boolean;
}

export default function AIChat() {
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [availableDoctors, setAvailableDoctors] = useState<any[]>([]);
  const [chatHistory, setChatHistory] = useState<{id: string, title: string, timestamp: number}[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load History and Doctors on Mount
  useEffect(() => {
    const savedDocs = localStorage.getItem("madad_doctors");
    if (savedDocs) setAvailableDoctors(JSON.parse(savedDocs));

    const savedHistory = localStorage.getItem("madad_chat_sessions");
    if (savedHistory) {
      const history = JSON.parse(savedHistory);
      setChatHistory(history);
      
      // Load the most recent chat if it exists
      if (history.length > 0) {
        loadChatSession(history[0].id);
      } else {
        createNewChat();
      }
    } else {
      createNewChat();
    }
  }, []);

  // Save Current Chat Messages when they change
  useEffect(() => {
    if (currentChatId) {
      localStorage.setItem(`madad_chat_${currentChatId}`, JSON.stringify(messages));
      
      // Update title if it's the first real exchange
      if (messages.length === 2 && chatHistory.find(c => c.id === currentChatId)?.title === "Навбатдорӣ...") {
        updateChatTitle(currentChatId, messages[0].parts[0].text.substring(0, 30) + "...");
      }
    }
  }, [messages, currentChatId]);

  const createNewChat = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newChat = { id: newId, title: "Навбатдорӣ...", timestamp: Date.now() };
    const updatedHistory = [newChat, ...chatHistory];
    
    setChatHistory(updatedHistory);
    localStorage.setItem("madad_chat_sessions", JSON.stringify(updatedHistory));
    setCurrentChatId(newId);
    setMessages([]);
  };

  const loadChatSession = (id: string) => {
    setCurrentChatId(id);
    const savedMessages = localStorage.getItem(`madad_chat_${id}`);
    setMessages(savedMessages ? JSON.parse(savedMessages) : []);
  };

  const deleteChat = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updatedHistory = chatHistory.filter(c => c.id !== id);
    setChatHistory(updatedHistory);
    localStorage.setItem("madad_chat_sessions", JSON.stringify(updatedHistory));
    localStorage.removeItem(`madad_chat_${id}`);
    
    if (currentChatId === id) {
      if (updatedHistory.length > 0) {
        loadChatSession(updatedHistory[0].id);
      } else {
        createNewChat();
      }
    }
    toast.success("Чат нест карда шуд");
  };

  const updateChatTitle = (id: string, newTitle: string) => {
    const updatedHistory = chatHistory.map(c => c.id === id ? { ...c, title: newTitle } : c);
    setChatHistory(updatedHistory);
    localStorage.setItem("madad_chat_sessions", JSON.stringify(updatedHistory));
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleFunctionCall = (call: any) => {
    if (call.name === "bookAppointment") {
      const args = call.args;
      const newAppointment = {
        id: Math.random().toString(36).substr(2, 9),
        doctorName: args.doctorName,
        specialty: args.specialty || "Пешниҳод нашудааст",
        date: args.date,
        time: args.time,
        patientName: args.patientName,
        status: "confirmed",
        createdAt: new Date().toISOString()
      };

      const existing = JSON.parse(localStorage.getItem("madad_appointments") || "[]");
      localStorage.setItem("madad_appointments", JSON.stringify([...existing, newAppointment]));
      
      toast.success(`Сабти вохӯрӣ бо ${args.doctorName} тасдиқ шуд!`, {
        description: `Сана: ${args.date}, Вақт: ${args.time}`,
      });

      return `МУВАФФАҚИЯТ: Вохӯрӣ бо муваффақият сабт шуд.`;
    }
    return "Хатогӣ";
  };

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = { role: "user", parts: [{ text: textToSend }] };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const historyForAI = messages.map(m => ({
        role: m.role,
        parts: m.parts
      })).slice(-10);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: historyForAI,
          availableDoctors: availableDoctors.map(d => ({
            name: d.name,
            specialty: d.specialty,
            location: d.location
          }))
        }),
      });

      if (!response.ok) throw new Error("Server error");
      const data = await response.json();
      
      if (data.functionCalls && data.functionCalls.length > 0) {
        for (const call of data.functionCalls) {
          handleFunctionCall(call);
        }
        const aiMessage: Message = { 
          role: "model", 
          parts: [{ text: "Ман вохӯрии шуморо бо муваффақият сабт кардам. Шумо метавонед онро дар саҳифаи 'Сабтҳо' бубинед. Дигар чӣ кумак карда метавонам?" }] 
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        const aiMessage: Message = { role: "model", parts: [{ text: data.text }] };
        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (error) {
      toast.error("Иртибот канда шуд.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([]);
    setChatHistory([]);
    localStorage.removeItem("madad_chat_sessions");
    // Clear all individual chat data
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith("madad_chat_")) localStorage.removeItem(key);
    });
    createNewChat();
    toast.success("Тамоми таърих тоза карда шуд.");
  };

  return (
    <div className="flex-grow flex bg-[#0a0f0d] relative overflow-hidden h-screen">
      
      {/* Sidebar - Pro Design */}
      <aside className="hidden lg:flex w-80 flex-col bg-[#050807] border-r border-white/5">
        <div className="p-8 space-y-8 h-full flex flex-col">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3 px-2 py-1 text-gray-500 hover:text-white transition-all group mb-4">
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest">АСОСӢ</span>
            </Link>
            
            <button 
              onClick={createNewChat}
              className="w-full flex items-center justify-between px-6 py-4 bg-medical-green text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_10px_30px_rgba(16,185,129,0.2)] group"
            >
              <span>Чат-и нав</span>
              <Plus className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-grow flex flex-col min-h-0">
            <div className="flex items-center justify-between px-2 mb-4">
              <h3 className="text-[10px] uppercase tracking-[0.3em] text-gray-700 font-black">ТАЪРИХИ ЧАТ</h3>
            </div>
            
            <div className="space-y-1 overflow-y-auto pr-2 custom-scrollbar flex-grow">
              {chatHistory.length > 0 ? (
                chatHistory.map(chat => (
                  <div key={chat.id} className="group relative">
                    <button 
                      onClick={() => loadChatSession(chat.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-left text-xs transition-all",
                        currentChatId === chat.id 
                          ? "bg-white/[0.07] text-white shadow-sm" 
                          : "text-gray-500 hover:text-white hover:bg-white/[0.03]"
                      )}
                    >
                      <MessageSquare className={cn("w-4 h-4 shrink-0 transition-colors", currentChatId === chat.id ? "text-medical-green" : "opacity-40")} />
                      <span className="truncate flex-grow font-bold tracking-tight">{chat.title}</span>
                    </button>
                    <button 
                      onClick={(e) => deleteChat(e, chat.id)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-gray-600 hover:text-red-500" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 opacity-30">
                  <MessageSquare className="w-8 h-8 mb-2" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Таърих нест</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-auto space-y-4 pt-6 border-t border-white/5">
            <Link to="/appointments" className="flex items-center gap-4 px-6 py-4 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-2xl text-[10px] font-black uppercase text-gray-400 hover:text-white transition-all tracking-[0.2em] group">
              <Calendar className="w-5 h-5 text-gray-600 group-hover:text-medical-green transition-colors" />
              Сабтҳои ман
            </Link>
            
            <div className="p-5 rounded-[24px] bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-10 h-10 rounded-2xl medical-gradient flex items-center justify-center shrink-0 shadow-lg">
                  <Bot className="w-6 h-6 text-black" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-medical-green">MADAD AI</p>
                  <p className="text-[8px] text-gray-600 font-bold uppercase tracking-wider">v2.0 Professional</p>
                </div>
              </div>
              <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                <div className="bg-medical-green h-full w-2/3" />
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-w-0 bg-[#0a0f0d]">
        
        {/* Header - Pro and Compact */}
        <header className="h-20 border-b border-white/5 flex justify-between items-center px-4 md:px-10 bg-[#0a0f0d]/80 backdrop-blur-xl z-30">
          <div className="flex items-center gap-2 md:gap-4">
             <Link to="/" className="p-2 hover:bg-white/5 rounded-xl text-gray-500 hover:text-white transition-all group md:hidden">
              <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
            </Link>
            
            <div className="hidden lg:flex items-center gap-4">
               <div>
                <h2 className="font-black text-xl tracking-tighter flex items-center gap-2">
                  MADAD <span className="text-medical-green italic">AI</span>
                  <span className="text-[10px] font-black bg-medical-green/10 text-medical-green px-2 py-0.5 rounded-full uppercase tracking-widest ml-1">Pro</span>
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-medical-green animate-pulse" />
                  <p className="text-[9px] uppercase tracking-[0.2em] text-gray-600 font-black">
                    Online Intelligence
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:hidden">
              <h2 className="font-black text-lg tracking-tighter uppercase leading-none">
                MADAD <span className="text-medical-green">AI</span>
              </h2>
              <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mt-1">Medical AI</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3">
            <button 
              onClick={createNewChat}
              className="lg:hidden p-2.5 bg-medical-green text-black rounded-xl shadow-lg active:scale-95 transition-all"
            >
              <Plus className="w-5 h-5" />
            </button>
            
            <Link to="/appointments" className="hidden sm:flex items-center gap-2 px-4 py-2.5 hover:bg-white/5 border border-transparent hover:border-white/5 rounded-xl transition-all text-gray-400 group">
              <Calendar className="w-4 h-4 group-hover:text-medical-green transition-colors" />
              <span className="text-[10px] font-black uppercase tracking-widest">Сабтҳо</span>
            </Link>
            
            <button 
              onClick={resetChat}
              className="p-2.5 hover:bg-white/5 border border-transparent hover:border-white/5 rounded-xl transition-colors text-gray-500 hover:text-red-500 group"
              title="Clear all history"
            >
              <RotateCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            </button>
          </div>
        </header>

        {/* Warning Badge - Compact */}
        <div className="bg-yellow-500/[0.03] border-b border-yellow-500/10 px-6 py-2 flex items-center justify-center gap-3">
          <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />
          <p className="text-[9px] text-yellow-500 font-black uppercase tracking-[0.1em]">
            Ин ёвари сунъӣ аст. Барои ташхиси дақиқ ба 103 занг занед.
          </p>
        </div>

        {/* Messages Layout */}
        <div 
          ref={scrollRef}
          className="flex-grow overflow-y-auto px-6 py-8 space-y-12 flex flex-col custom-scrollbar scroll-smooth"
        >
          {messages.length === 0 ? (
            <div className="max-w-3xl mx-auto w-full h-full flex flex-col items-center justify-center py-10">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="w-24 h-24 medical-gradient rounded-[40px] flex items-center justify-center mb-10 shadow-[0_30px_60px_-15px_rgba(16,185,129,0.4)] shrink-0"
              >
                <Bot className="w-12 h-12 text-white" />
              </motion.div>
              
              <div className="text-center space-y-4 mb-10 px-4 shrink-0">
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight uppercase">
                  Чи гуна кумак <br className="hidden sm:block" /> 
                  <span className="text-medical-green">карда метавонам?</span>
                </h1>
                <p className="text-sm text-gray-500 font-medium max-w-lg mx-auto uppercase tracking-widest">
                  MADAD AI Professional — ТЕХНОЛОГИЯИ ЗОКИРОВ САДРИДДИН
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                {[
                  { icon: Search, text: "Дарди сар давоми 2 рӯз", action: "Сабаби дарди сар дар чист? 2 рӯз боз дард мекунад." },
                  { icon: Calendar, text: "Сабт шудан ба духтур", action: "Мехоҳам ба духтур сабт шавам." },
                  { icon: HeartPulse, text: "Фишори баланди хун", action: "Фишор баланд шуда бошад чӣ бояд кард?" },
                  { icon: ShieldCheck, text: "Машварати MADAD AI", action: "Дар бораи MADAD AI маълумот диҳед." }
                ].map((s, i) => (
                  <button 
                    key={i}
                    onClick={() => handleSend(s.action)}
                    className="flex items-center gap-5 p-6 bg-white/[0.02] border border-white/5 rounded-[32px] hover:border-medical-green/40 hover:bg-white/[0.05] transition-all text-left group shadow-sm active:scale-[0.98]"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-medical-green/10 transition-colors shrink-0">
                      <s.icon className="w-6 h-6 text-gray-500 group-hover:text-medical-green" />
                    </div>
                    <span className="text-sm font-bold text-gray-400 group-hover:text-white transition-colors">{s.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto w-full space-y-12">
              <AnimatePresence>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex gap-6",
                      msg.role === "user" ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0 shadow-lg mt-1",
                      msg.role === "user" ? "bg-white/10" : "medical-gradient"
                    )}>
                      {msg.role === "user" ? <User className="w-5 h-5 text-gray-300" /> : <Bot className="w-5 h-5 text-white" />}
                    </div>
                    <div className={cn(
                      "max-w-[85%] space-y-2",
                      msg.role === "user" ? "text-right" : "text-left"
                    )}>
                      <div className={cn(
                        "text-[9px] uppercase tracking-[0.2em] font-black opacity-40 px-1",
                        msg.role === "user" ? "text-white" : "text-medical-green"
                      )}>
                        {msg.role === "user" ? "ШУМО" : "MADAD AI"}
                      </div>
                      <div className={cn(
                        "px-7 py-5 rounded-[28px] text-[15px] leading-relaxed shadow-xl border border-white/5",
                        msg.role === "user" 
                          ? "bg-medical-green text-black font-semibold rounded-tr-none" 
                          : "bg-white/[0.03] text-gray-200 rounded-tl-none backdrop-blur-sm"
                      )}>
                        <div className="markdown-body">
                           <ReactMarkdown>{msg.parts[0].text}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isLoading && (
                <div className="flex gap-6 animate-pulse">
                  <div className="w-10 h-10 rounded-[14px] medical-gradient flex items-center justify-center shrink-0 shadow-lg">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-white/[0.03] border border-white/5 px-8 py-6 rounded-[28px] rounded-tl-none flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-medical-green rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-medical-green rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-medical-green rounded-full animate-bounce"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Dock - Modern & Centered */}
        <div className="px-6 py-6 md:pb-12 md:pt-4 bg-gradient-to-t from-[#0a0f0d] via-[#0a0f0d] to-transparent z-20">
          <div className="max-w-4xl mx-auto relative px-4">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="relative group flex items-end gap-3"
            >
              <div className="relative flex-grow">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Саволи тиббии худро нависед..."
                  className="w-full bg-[#111815] border border-white/10 rounded-[28px] py-5 px-8 focus:outline-none focus:ring-2 focus:ring-medical-green/40 transition-all font-bold text-gray-200 placeholder:text-gray-600 resize-none min-h-[64px] max-h-[220px] shadow-2xl"
                  rows={1}
                />
                <div className="absolute right-6 bottom-5 flex items-center gap-1 opacity-20 group-focus-within:opacity-100 transition-opacity pointer-events-none">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest hidden sm:block">ENTER TO SEND</span>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-16 h-16 bg-medical-green text-black rounded-[24px] flex items-center justify-center hover:scale-105 active:scale-[0.98] disabled:opacity-50 disabled:scale-100 transition-all shadow-[0_15px_30px_-5px_rgba(16,185,129,0.3)] shrink-0"
              >
                <Send className="w-7 h-7" />
              </button>
            </form>
            <p className="text-[10px] text-center mt-5 text-gray-700 uppercase tracking-[0.4em] font-black">
              MADAD AI — ТЕХНОЛОГИЯИ ЗОКИРОВ САДРИДДИН
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
