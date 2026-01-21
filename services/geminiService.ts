
import { GoogleGenerativeAI } from "@google/generative-ai";
import { LegalAnalysisResult, JudicialSupportResult, TutelaIntegralResult, HabeasCorpusInteligenteResult, DesacatoInteligenteResult } from "../types";

// Acceso a variables de entorno en Vite
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Extrae texto de un PDF (Base64) usando Gemini Flash.
 */
export const extractTextFromFile = async (base64Data: string, mimeType: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key de Gemini no configurada.");

  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  const result = await model.generateContent([
    {
      inlineData: {
        data: base64Data,
        mimeType: mimeType
      }
    },
    { text: "Extrae todo el texto de este documento legal de forma exacta. Mantén la estructura de los hechos, nombres y números de radicado. No añadas comentarios ni uses bloques de código Markdown (```). Devuelve solo el texto limpio." }
  ]);

  const response = await result.response;
  return response.text();
};

/**
 * Analiza un documento legal y genera una providencia judicial.
 */
export const analyzeLegalDocument = async (text: string, processType: string): Promise<LegalAnalysisResult> => {
  if (!apiKey) throw new Error("API Key de Gemini no configurada.");

  const model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
  });

  const prompt = `
    ACTÚA SEGÚN EL ROL:
    - Si es Tutela o Hábeas Corpus: Actúa como JUEZ DE LA REPÚBLICA. Firma como JUEZ.
    - Si es Corte Constitucional: Actúa como MAGISTRADO DE LA CORTE CONSTITUCIONAL. Firma como MAGISTRADO PONENTE.

    Tu objetivo es redactar una PROVIDENCIA JUDICIAL FORMAL estrictamente bajo PROTOCOLO DE LA RAMA JUDICIAL.

    TIPO DE PROCESO: ${processType}
    CONTENIDO BASE: "${text}"

    INSTRUCCIONES DE ESTRUCTURA:
    1. ENCABEZADO: Centrado, Mayúsculas. República de Colombia, Rama Judicial.
       - Si es Tutela: JUZGADO DE CIRCUITO.
       - Si es Hábeas Corpus: JUZGADO PENAL.
       - Si es Corte: CORTE CONSTITUCIONAL DE COLOMBIA.
    2. REFERENCIA: Lado derecho. Radicado, Accionante, Accionado.
    3. ANTECEDENTES: Resumen técnico-jurídico de la solicitud.
    4. CONSIDERACIONES: Análisis profundo citando jurisprudencia relevante.
       - SI ES HÁBEAS CORPUS: Citar Ley 1095 de 2006 y Art. 30 Constitución.
    5. RESUELVE: Parte dispositiva clara y numerada.

    REGLAS:
    - No añadas explicaciones externas al documento.
    - El contenido de "draftContent" DEBE SER ÚNICAMENTE TEXTO PLANO.
    - NO USES ETIQUETAS HTML (como <b>, <p>, etc.).
    - NO USES BLOQUES DE CÓDIGO MARKDOWN (como \`\`\`html o \`\`\`).
    - Evita cualquier tipo de formateo que no sea texto limpio y legible.
    
    JSON FORMAT REQUIRED:
    {
      "summary": "Resumen corto.",
      "rightsIdentified": ["derecho1", "derecho2"],
      "competenceAnalysis": "Fundamento de competencia.",
      "suggestedAction": "Acción recomendada.",
      "draftContent": "Texto completo del documento en TEXTO PLANO, sin etiquetas."
    }
  `;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const response = await result.response;
    return JSON.parse(response.text()) as LegalAnalysisResult;
  } catch (error: any) {
    console.error("Error en analyzeLegalDocument:", error);
    throw new Error(error.message || "Error al conectar con la IA de Gemini");
  }
};
/**
 * Realiza un análisis de apoyo judicial (Investigación, Precedentes y Normativa).
 */
export const analyzeJudicialSupport = async (
  text: string,
  processDetails: { type: string, topic: string, claims: string }
): Promise<JudicialSupportResult> => {
  if (!apiKey) throw new Error("API Key de Gemini no configurada.");

  const model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
  });

  const prompt = `
    ACTÚA COMO UN ANALISTA JURÍDICO DE ALTO NIVEL PARA LA RAMA JUDICIAL DE COLOMBIA.
    Tu tarea es proporcionar APOYO JUDICIAL NO DECISORIO basándote en la siguiente información:

    CASO/EXPEDIENTE: "${text}"
    TIPO DE PROCESO: ${processDetails.type}
    TEMA JURÍDICO: ${processDetails.topic}
    PRETENSIONES: ${processDetails.claims}

    DEBES GENERAR UN ANÁLISIS EXPLICABLE Y TÉCNICO QUE INCLUYA:
    1. Resumen automático: Hechos, problema jurídico, ratio decidendi, normas y decisión sugerida (basada en ley).
    2. Búsqueda semántica (Simulación): Encuentra o cita al menos 3 sentencias relevantes (CC, CSJ o CE) con radicado, % de similitud y explica por qué aplica. Marca si es precedente obligatorio.
    3. Comparación de criterios: Identifica si el criterio es obligatorio, reiterado o divergente.
    4. Análisis normativo: Verifica vigencia de normas citadas y genera alertas (derogatorias, modificaciones).
    5. Nivel de certeza: Evalúa la claridad del precedente (alto/medio/bajo).

    REGLAS:
    - NO TOMES LA DECISIÓN. SUGIERE APOYO.
    - RECUERDA LA LEY 1581 DE 2012 (PROTECCIÓN DE DATOS).
    - TODO EL CONTENIDO DEBE SER TEXTO PLANO.

    JSON FORMAT REQUIRED:
    {
      "automaticSummary": {
        "facts": "...",
        "legalProblem": "...",
        "ratioDecidendi": "...",
        "appliedNorms": "...",
        "decision": "..."
      },
      "semanticSearch": [
        { "court": "...", "reference": "...", "similarity": 95, "isMandatoryPrecedent": true, "explanation": "..." }
      ],
      "criteriaComparison": [
        { "type": "obligatorio", "description": "..." }
      ],
      "normativeAnalysis": [
        { "norm": "...", "validity": "Vigente", "alerts": ["..."] }
      ],
      "certaintyLevel": "alto",
      "humanSupervisionWarning": "ADVERTENCIA: Este es un documento de apoyo judicial generado por IA. No es vinculante y requiere supervisión humana obligatoria."
    }
  `;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const response = await result.response;
    return JSON.parse(response.text()) as JudicialSupportResult;
  } catch (error: any) {
    console.error("Error en analyzeJudicialSupport:", error);
    throw new Error(error.message || "Error en el motor de análisis de apoyo.");
  }
};

/**
 * Análisis integral de Tutela (Flujo completo).
 */
export const analyzeTutelaIntegral = async (text: string): Promise<TutelaIntegralResult> => {
  if (!apiKey) throw new Error("API Key de Gemini no configurada.");

  const model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
  });

  const prompt = `
    ACTÚA COMO UN ASISTENTE JUDICIAL EXPERTO EN ACCIONES DE TUTELA (COLOMBIA).
    Tu tarea es realizar un ANÁLISIS INTEGRAL (NO DECISORIO) de la siguiente acción de tutela:

    CONTENIDO DE LA TUTELA: "${text}"

    DEBES GENERAR UN JSON CON LA SIGUIENTE ESTRUCTURA EXACTA:
    1. Resumen: Identificar Accionante, Accionado, Derechos, Hechos y Pretensiones.
    2. Procedibilidad: Analizar (sin decidir) Subsidiariedad, Inmediatez, Otros Medios, Perjuicio Irremediable, Competencia y Legitimación. Generar alertas.
    3. Términos: Calcular plazos y definir prioridad (Vida, Salud, Niños son prioridad URGENTE).
    4. Jurisprudencia: Citar sentencias T, SU o C relevantes con radicado y resumen.
    5. Riesgos: Identificar órdenes ambiguas o riesgos de desacato.
    6. Borradores: Generar texto plano para: Auto Admisorio, Medida Provisional (si aplica) y Estructura de Fallo.
    7. Seguimiento: Sugerir oficios y hitos de cumplimiento.

    REGLAS:
    - TODO EL CONTENIDO DEBE SER TEXTO PLANO (SIN HTML).
    - ACLARAR SIEMPRE QUE ES APOYO NO VINCULANTE.
    - RESPETAR LEY 1581 DE 2012.

    JSON FORMAT:
    {
      "resumen": { "accionante": "...", "accionado": "...", "derechosVulnerados": ["..."], "hechosClave": "...", "pretensiones": "..." },
      "procedibilidad": { "subsidiariedad": "...", "inmediatez": "...", "otrosMedios": "...", "perjuicioIrremediable": "...", "competencia": "...", "legitimacion": "...", "alertas": ["..."] },
      "terminos": { "diasRestantes": 10, "vencimiento": "...", "prioridad": "...", "razonPrioridad": "..." },
      "jurisprudencia": [ { "referencia": "...", "tribunal": "...", "precedenteObligatorio": true, "resumen": "...", "similitud": 90 } ],
      "riesgosProcesales": [ { "tipo": "...", "descripcion": "...", "nivelRiesgo": "..." } ],
      "borradores": [ { "tipo": "Auto Admisorio", "contenido": "..." }, { "tipo": "Fallo (Estructura)", "contenido": "..." } ],
      "seguimiento": { "oficiosGenerados": ["..."], "hitosCumplimiento": ["..."] }
    }
  `;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const response = await result.response;
    return JSON.parse(response.text()) as TutelaIntegralResult;
  } catch (error: any) {
    console.error("Error en analyzeTutelaIntegral:", error);
    throw new Error(error.message || "Error en el motor integral de Tutela.");
  }
};

/**
 * Análisis integral de Hábeas Corpus Inteligente.
 */
export const analyzeHabeasCorpusInteligente = async (text: string): Promise<HabeasCorpusInteligenteResult> => {
  if (!apiKey) throw new Error("API Key de Gemini no configurada.");

  const model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
  });

  const prompt = `
    ACTÚA COMO UN ASISTENTE JUDICIAL EXPERTO EN HÁBEAS CORPUS (COLOMBIA).
    Realiza un ANÁLISIS INTEGRAL (NO DECISORIO) de la siguiente solicitud:

    CONTENIDO: "${text}"

    DEBES GENERAR UN JSON CON LA SIGUIENTE ESTRUCTURA EXACTA:
    1. Resumen: Identificar Persona privada de la libertad, Autoridad, Lugar de reclusión, Fecha y causa de captura.
    2. Control Legalidad: Alerta sobre captura sin orden, sin flagrancia, falta de legalización, etc.
    3. Control Tiempo: Estimar horas transcurridas desde la captura/radicación (límite 36h).
    4. Normativa/Jurisprudencia: Citar Art 30 CP, Ley 1095/2006 y sentencias CC relevantes.
    5. Riesgos Graves: Detención arbitraria, prolongación ilegal, autoridad incompetente.
    6. Borradores: Generar texto plano para: Auto Admisorio Inmediato, Oficios de información urgente y Estructura de Decisión.
    7. Notificación: Sugerir oficios automáticos y acciones de seguimiento.

    REGLAS:
    - TODO EL CONTENIDO DEBE SER TEXTO PLANO.
    - IA NO DECISORIA. ADVERTENCIAS VISIBLES.
    - RESPETAR LEY 1581 DE 2012 Y LEY 1095 DE 2006.

    JSON FORMAT:
    {
      "resumen": { "personaPrivadaLibertad": "...", "autoridadOrdenaEjecuta": "...", "lugarReclusion": "...", "fechaCausaCaptura": "..." },
      "controlLegalidad": { "alertas": ["..."], "analisis": "..." },
      "controlTiempo": { "horasTranscurridas": 0, "horasRestantes": 36, "limiteHoras": 36, "isVencido": false },
      "normativaJurisprudencia": { "normas": ["..."], "jurisprudencia": [ { "referencia": "...", "resumen": "..." } ] },
      "riesgosGraves": [ { "tipo": "...", "descripcion": "..." } ],
      "borradores": [ { "tipo": "Auto Admisorio", "contenido": "..." }, { "tipo": "Oficio Urgente", "contenido": "..." } ],
      "notificacionCumplimiento": { "oficios": ["..."], "accionesSeguimiento": ["..."] }
    }
  `;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const response = await result.response;
    return JSON.parse(response.text()) as HabeasCorpusInteligenteResult;
  } catch (error: any) {
    console.error("Error en analyzeHabeasCorpusInteligente:", error);
    throw new Error(error.message || "Error en el motor integral de Hábeas Corpus.");
  }
};

/**
 * Análisis integral de Desacato Inteligente.
 */
export const analyzeDesacatoInteligente = async (text: string): Promise<DesacatoInteligenteResult> => {
  if (!apiKey) throw new Error("API Key de Gemini no configurada.");

  const model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
  });

  const prompt = `
    ACTÚA COMO UN ASISTENTE JUDICIAL EXPERTO EN INCIDENTES DE DESACATO (COLOMBIA).
    Realiza un ANÁLISIS INTEGRAL (NO DECISORIO) del incidente basado en la siguiente información:

    CONTENIDO/PRUEBAS: "${text}"

    DEBES GENERAR UN JSON CON LA SIGUIENTE ESTRUCTURA EXACTA:
    1. Resumen: Identificar Tutela base, orden incumplida, autoridad responsable, fecha límite y pruebas aportadas.
    2. Procedencia: Evaluar si la orden es clara, expresa y exigible; si hubo notificación válida y si el plazo venció. Generar alertas.
    3. Seguimiento: Crear una línea de tiempo sugerida de la orden y estado de cumplimiento (cumplido/parcial/incumplido).
    4. Análisis Jurídico: Reglas constitucionales, límites a sanciones y principios de proporcionalidad. Citar jurisprudencia relevante.
    5. Riesgos: Órdenes ambiguas, falta de contradicción o riesgos de nulidad.
    6. Borradores: Generar texto plano para: Auto de Apertura, Requerimiento Previo y Estructura de Decisión (Fallo de incidente).
    7. Ejecución: Sugerir registro de sanción y confirmación de cumplimiento.

    REGLAS:
    - TODO EL CONTENIDO DEBE SER TEXTO PLANO (SIN HTML).
    - LA IA NO SANCIONA NI DECIDE. ADVERTENCIAS VISIBLES.
    - RESPETAR LEY 1581 DE 2012.

    JSON FORMAT:
    {
      "resumen": { "tutelaBase": "...", "ordenIncumplida": "...", "autoridadResponsable": "...", "fechaLimite": "...", "pruebasIncumplimiento": "..." },
      "procedencia": { "ordenClaraExpresaExigible": "...", "notificacionValida": "...", "vencimientoPlazo": "...", "sujetoObligadoIdentificado": "...", "alertas": ["..."] },
      "seguimiento": { "lineaTiempo": [ { "fecha": "...", "evento": "..." } ], "evidenciaAportada": ["..."], "estadoCumplimiento": "incumplido", "alertaDilacion": "..." },
      "analisisJuridico": { "reglasConstitucionales": "...", "limitesSanciones": "...", "proporcionalidadRatio": "...", "jurisprudencia": [ { "referencia": "...", "resumen": "..." } ] },
      "riesgos": [ { "tipo": "...", "descripcion": "...", "nivelRiesgo": "..." } ],
      "borradores": [ { "tipo": "Auto de Apertura", "contenido": "..." }, { "tipo": "Requerimiento Previo", "contenido": "..." } ],
      "ejecucion": { "registroSancion": "...", "confirmacionCumplimiento": "...", "archivoAutomatico": false }
    }
  `;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const response = await result.response;
    return JSON.parse(response.text()) as DesacatoInteligenteResult;
  } catch (error: any) {
    console.error("Error en analyzeDesacatoInteligente:", error);
    throw new Error(error.message || "Error en el motor integral de Desacato.");
  }
};
