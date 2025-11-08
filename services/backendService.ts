import { GoogleGenAI, Type } from "@google/genai";
import { UserLocation, EmergencyCategory, Responder, EmergencyCategoryEnum } from "../types";
import { EMERGENCY_CATEGORIES } from "../constants";

// =================================================================
// 🔑 PASTE YOUR GOOGLE GEMINI API KEY HERE
// Get one from https://aistudio.google.com/app/apikey
// =================================================================
const API_KEY = "AIzaSyC1jpRBHFQaH88xtj-TKPeZjndzQ_oVDw8"; // Replace with your real key

// Initialize Gemini client
let ai: GoogleGenAI | null = null;
if (API_KEY && API_KEY.trim() !== "") {
  ai = new GoogleGenAI({ apiKey: API_KEY });
  console.log("✅ Gemini AI initialized successfully.");
} else {
  console.warn("⚠️ ConnectAid AI: API Key missing. Please paste a valid key.");
}

// Ensure AI client exists
const ensureAi = () => {
  if (!ai) throw new Error("AI features are disabled. Please add a valid Gemini API key.");
  return ai;
};

// -----------------------------------------------------------------
// TEXT SIMPLIFICATION
// -----------------------------------------------------------------
export const simplifyText = async (text: string): Promise<string> => {
  if (!ai) return `(AI disabled) Original text: ${text}`;

  const prompt = `Simplify this emergency text for first responders.
Keep it factual, short, and urgent.

Original: "${text}"
Simplified:`;

  try {
    const aiClient = ensureAi();
    const res = await aiClient.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return res.text.trim();
  } catch (err) {
    console.error("Gemini simplifyText error:", err);
    return `(AI failed) Original: ${text}`;
  }
};

// -----------------------------------------------------------------
// FIND NEARBY RESPONDERS
// -----------------------------------------------------------------
export const findNearbyResponders = async (
  category: EmergencyCategory,
  details: string,
  location: UserLocation
): Promise<Responder[]> => {
  try {
    const aiClient = ensureAi();

    const prompt = `Find the nearest responders to Latitude ${location.lat}, Longitude ${location.lng}.
Category: "${category.name}".
Details: "${details}".
Return direct, actionable local contacts only.`;

    const res = await aiClient.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: location.lat,
              longitude: location.lng,
            },
          },
        },
      },
    });

    const chunks = res.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return chunks
      .map((c: any) =>
        c.maps
          ? { name: c.maps.title, uri: c.maps.uri, type: "place" }
          : c.web
          ? { name: c.web.title, uri: c.web.uri, type: "web" }
          : null
      )
      .filter(Boolean) as Responder[];
  } catch (err) {
    console.error("Gemini responder error:", err);
    throw new Error("Responder search failed.");
  }
};

// -----------------------------------------------------------------
// LANGUAGE DETECTION
// -----------------------------------------------------------------
export const detectLanguage = async (text: string): Promise<string> => {
  const aiClient = ensureAi();
  const res = await aiClient.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Detect language of this text and respond only with the IETF tag: "${text}"`,
  });
  return res.text.trim();
};

// -----------------------------------------------------------------
// TRANSLATION
// -----------------------------------------------------------------
export const translateText = async (
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string> => {
  const aiClient = ensureAi();
  const res = await aiClient.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Translate from ${sourceLang} to ${targetLang}: "${text}"`,
  });
  return res.text.trim();
};

// -----------------------------------------------------------------
// VOICE COMMAND PROCESSING
// -----------------------------------------------------------------
export const processVoiceCommand = async (
  transcript: string,
  currentStep: "initial" | "review",
  previousCategory?: string
) => {
  if (!ai)
    return {
      detectedLang: "en-US",
      englishDetails: "",
      category: null,
      isValid: false,
      isFinalConfirmation: false,
      aiResponseText: "AI features disabled. Please provide a valid API key.",
    };

  const categories = EMERGENCY_CATEGORIES.map((c) => c.name);
  const prompt = `
You are an emergency voice AI. Process this transcript into structured JSON.

User: "${transcript}"
Step: "${currentStep}"
Previous category: "${previousCategory || "none"}"

Output JSON with:
- detectedLang (IETF)
- englishDetails
- category (one of: ${categories.join(", ")})
- isValid
- isFinalConfirmation
- aiResponseText
`;

  try {
    const aiClient = ensureAi();
    const res = await aiClient.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedLang: { type: Type.STRING },
            englishDetails: { type: Type.STRING },
            category: { type: Type.STRING },
            isValid: { type: Type.BOOLEAN },
            isFinalConfirmation: { type: Type.BOOLEAN },
            aiResponseText: { type: Type.STRING },
          },
          required: [
            "detectedLang",
            "englishDetails",
            "category",
            "isValid",
            "isFinalConfirmation",
            "aiResponseText",
          ],
        },
      },
    });

    return JSON.parse(res.text.trim());
  } catch (error) {
    console.error("Error parsing voice command response:", error);
    return {
      detectedLang: "en-US",
      englishDetails: "",
      category: null,
      isValid: false,
      isFinalConfirmation: false,
      aiResponseText: "I couldn't understand. Please repeat clearly.",
    };
  }
};
