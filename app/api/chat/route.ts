import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
  try {
    const { prompt, equipmentName } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // 1. Direct Live Gemini API Call
    if (apiKey && apiKey.startsWith("AIzaSy")) {
      const ai = new GoogleGenAI({ apiKey });

      const systemInstruction =
        "You are LabBot AI, a concise laboratory equipment safety and standard operating procedure (SOP) advisor for LabLedger. Provide clear, direct safety advice in plain text without markdown headers.";

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Equipment Name: ${equipmentName || "General Laboratory System"}\nUser Question: ${prompt}`,
              },
            ],
          },
        ],
        config: {
          systemInstruction,
          maxOutputTokens: 300,
        },
      });

      const textContent = response.text || "No advisory text generated.";

      return NextResponse.json({
        response: textContent,
        isFallback: false,
      });
    }

    // 2. Local Fallback Matrix (if API key is missing or invalid)
    const eq = (equipmentName || "").toLowerCase();
    let fallbackText = `[SOP ADVISORY for ${equipmentName || "Lab System"}]: Perform pre-operation visual inspection, wear required safety PPE (safety glasses, lab coat, closed-toe shoes), and confirm active supervisor authorization before toggling main power.`;

    if (eq.includes("laser") || eq.includes("sapphire")) {
      fallbackText = `[SAFETY CLASS 4 LASER ADVISORY]: High-Power Ti:Sapphire lasers present severe eye hazards. Ensure OD6+ laser safety goggles tuned to 800nm wavelength are worn by all personnel. Confirm interlocks on optics room doors are engaged before emission.`;
    } else if (eq.includes("printer") || eq.includes("resin")) {
      fallbackText = `[RESIN 3D PRINTER SOP]: Liquid UV photopolymer resins are skin irritants. Always operate inside a ventilated fume hood with Nitrile gloves and eye protection. Wash uncured parts in pure Isopropyl Alcohol (IPA).`;
    } else if (eq.includes("electron") || eq.includes("cryo")) {
      fallbackText = `[CRYO-SEM OPERATIONAL SAFETY]: Handle liquid Nitrogen (-196°C) using cryogenic insulated gloves and a full face shield. Verify vacuum chamber pressure (<10^-4 Pa) before activating high voltage electron beam emitter.`;
    }

    return NextResponse.json({
      response: fallbackText,
      isFallback: true,
    });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({
      response:
        "[SAFETY ADVISORY]: Inspect system cables, confirm active safety certification, and adhere to standard operating procedure guidelines.",
      isFallback: true,
    });
  }
}