import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // AI Chat Endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history, availableDoctors } = req.body;
      
      const doctorsContext = availableDoctors && availableDoctors.length > 0
        ? `\n\nДастрасии духтурони мо:\n${availableDoctors.map((d: any) => `- ${d.name}: ${d.specialty} (${d.location})`).join("\n")}\n\nАлоқамандӣ: Агар бемор ба яке аз ин мутахассисон эҳтиёҷ дошта бошад, ҳатман зикр кун.`
        : "";

      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          tools: [{
            functionDeclarations: [
              {
                name: "bookAppointment",
                description: "Book a medical appointment with a doctor",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    doctorName: { type: Type.STRING, description: "Name of the doctor" },
                    specialty: { type: Type.STRING, description: "Specialty of the doctor" },
                    date: { type: Type.STRING, description: "Date of appointment (e.g. 2024-05-20)" },
                    time: { type: Type.STRING, description: "Time of appointment (e.g. 14:30)" },
                    patientName: { type: Type.STRING, description: "Full name of the patient" }
                  },
                  required: ["doctorName", "date", "time", "patientName"]
                }
              }
            ]
          }],
          systemInstruction: `You are MADAD AI, a specialized medical AI platform. 
            Your goal is to provide intelligent medical assistance for users without easy doctor access.
            
            RULES:
            1. ONLY answer medical questions.
            2. Analyze symptoms carefully and propose potential causes cautiously.
            3. Suggest first aid when appropriate and mention possible treatments (with a strong disclaimer).
            4. RECOMMEND a specialty. If there is a matching doctor in the provided list, explicitly mention them.
            5. BOOK appointments if requested. Use the 'bookAppointment' tool when the user confirms they want to schedule a visit with one of our doctors.
            6. REJECT non-medical questions. Respond EXACTLY with: “Your question is outside the medical domain. Please describe your symptoms.”
            7. If asked 'Чаро MADAD AI?' (Why MADAD AI?), explain that MADAD AI was created by ZOKIROV SADRIDDIN to improve healthcare accessibility.
            
            Maintain a professional, empathetic, and informative tone. 
            Important: Always include a disclaimer that you are an AI and not a substitute for professional medical advice.
            Medical AI Advisor: ZOKIROV SADRIDDIN${doctorsContext}`,
        },
        history: (history || []).map((h: any) => ({
          role: h.role,
          parts: h.parts
        })),
      });

      const response = await chat.sendMessage({ message });
      const responseText = response.text;
      const functionCalls = response.functionCalls;

      res.json({ 
        text: responseText, 
        functionCalls: functionCalls || [] 
      });
    } catch (error: any) {
      console.error("AI Error:", error);
      res.status(500).json({ error: "Medical consultation currently unavailable. Please try again later." });
    }
  });

  // Admin Config Endpoint (Mocked persistence since no DB)
  // In a real app, this would be in PostgreSQL
  let platformConfig = {
    instagram: "https://instagram.com/sadriddin_zokirov",
    telegramBot: "https://t.me/madad_ai_bot",
    ads: [],
  };

  app.get("/api/config", (req, res) => {
    res.json(platformConfig);
  });

  app.post("/api/admin/update-config", (req, res) => {
    // Simple auth check for POC: email/password should be handled client side for demo
    // but here we just update if authorized
    platformConfig = { ...platformConfig, ...req.body };
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MADAD AI Server running on http://localhost:${PORT}`);
  });
}

startServer();
