
import { GoogleGenAI, Type } from "@google/genai";
import { LegalAnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * Extracts raw text from a PDF file using Gemini's multi-modal vision/document capabilities.
 * This acts as a high-fidelity OCR engine.
 */
export const extractTextFromFile = async (base64Data: string, mimeType: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-lite-latest',
    contents: [{
      parts: [
        { inlineData: { data: base64Data, mimeType: mimeType } },
        { text: "Extrae todo el texto de este documento legal de forma exacta. Mantén la estructura de los hechos, nombres y números de radicado. No añadas comentarios, solo el texto limpio." }
      ]
    }]
  });
  return response.text || "";
};

export const analyzeLegalDocument = async (text: string, processType: string): Promise<LegalAnalysisResult> => {
  const prompt = `
    ACTÚA COMO UN MAGISTRADO DE ALTA CORTE EN COLOMBIA.
    Tu objetivo es redactar una PROVIDENCIA JUDICIAL FORMAL estrictamente bajo NORMAS APA (7ma edición) y protocolo de la Rama Judicial.

    TIPO DE PROCESO: ${processType}
    CONTENIDO BASE: "${text}"

    INSTRUCCIONES DE ESTRUCTURA (draftContent):
    1. ENCABEZADO: Centrado, Mayúsculas. República de Colombia, Rama Judicial, Consejo Superior de la Judicatura.
    2. REFERENCIA: Lado derecho. Radicado, Accionante, Accionado.
    3. ANTECEDENTES: Resumen técnico-jurídico de la solicitud.
    4. CONSIDERACIONES: Análisis profundo citando jurisprudencia relevante (Corte Constitucional) usando formato APA (ej: Sentencia T-123 de 2022). Evaluar procedencia, inmediatez y subsidiariedad.
    5. RESUELVE: Parte dispositiva clara, numerada y en negrita (simulada con texto).

    REGLAS DE REDACCIÓN:
    - Lenguaje técnico-jurídico solemne.
    - Citas textuales mayores a 40 palabras en bloque aparte (simulado).
    - El análisis de competencia debe ser exhaustivo y referenciado.

    JSON SCHEMA:
    - summary: Resumen de 3 párrafos cortos.
    - rightsIdentified: Lista de derechos (ej: "Debido Proceso", "Petición").
    - competenceAnalysis: Fundamento legal de competencia.
    - suggestedAction: Decisión recomendada (ej: "ADMITIR Y VINCULAR").
    - draftContent: Texto completo con el orden: Título -> Radicación -> Antecedentes -> Fundamentos -> Fallo.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          rightsIdentified: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING } 
          },
          competenceAnalysis: { type: Type.STRING },
          suggestedAction: { type: Type.STRING },
          draftContent: { type: Type.STRING },
        },
        required: ["summary", "rightsIdentified", "competenceAnalysis", "suggestedAction", "draftContent"]
      },
    },
  });

  try {
    const jsonStr = response.text || '{}';
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error parsing Gemini response", error);
    throw new Error("No se pudo generar la providencia. Verifique el contenido e intente de nuevo.");
  }
};
