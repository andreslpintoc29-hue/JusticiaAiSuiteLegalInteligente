
import React, { useState, useRef } from 'react';
import { analyzeLegalDocument, extractTextFromFile } from '../services/geminiService';
import { LegalAnalysisResult } from '../types';

const HabeasCorpusScreen: React.FC = () => {
  const [text, setText] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [result, setResult] = useState<LegalAnalysisResult | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRunAnalysis = async () => {
    if (!text.trim()) return alert("No hay información para analizar.");
    setIsAnalyzing(true);
    try {
      // Sistema de limpieza ultra-agresivo para eliminar HTML
      const ultraCleanText = (str: string) => {
        if (!str) return "";

        // 1. Eliminar bloques de código markdown si existen
        let temp = str.replace(/```[a-z]*\n?/gi, '').replace(/```/g, '');

        // 2. Eliminar bloques de estilo o scripts que la IA pudiera inventar
        temp = temp.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

        // 3. Usar DOMParser del navegador (el estándar más confiable)
        try {
          const parser = new DOMParser();
          const doc = parser.parseFromString(temp, 'text/html');
          temp = doc.body.textContent || doc.body.innerText || temp;
        } catch (e) {
          // Fallback a regex si el parser falla
          temp = temp.replace(/<[^>]+>/g, '');
        }

        // 4. Limpieza final por si el parser dejó etiquetas huérfanas
        temp = temp.replace(/<[^>]+>/g, '');

        // 5. Normalizar entidades HTML comunes
        const entities: { [key: string]: string } = {
          '&nbsp;': ' ', '&quot;': '"', '&lt;': '<', '&gt;': '>', '&amp;': '&'
        };
        Object.keys(entities).forEach(key => {
          temp = temp.replace(new RegExp(key, 'g'), entities[key]);
        });

        return temp.replace(/\n\s*\n\s*\n/g, '\n\n').trim();
      };

      const strictFormatPrompt = `Hábeas Corpus (Control de Captura). 
      !!! IMPORTANTE: NO USAR ABSOLUTAMENTE NADA DE CÓDIGO HTML (div, styles, p, strong, br). 
      ENTREGAR SOLO TEXTO PLANO LIMPIO Y ORGANIZADO CON SALTOS DE LÍNEA.`;

      const data = await analyzeLegalDocument(text, strictFormatPrompt);

      if (data && data.draftContent) {
        // Aplicamos la limpieza ultra-agresiva
        const cleanedContent = ultraCleanText(data.draftContent);
        setResult({ ...data, draftContent: cleanedContent });
      } else {
        setResult(data);
      }
    } catch (err: any) {
      alert("Error al procesar el Hábeas Corpus: " + (err.message || "Error desconocido"));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClear = () => {
    setText("");
    setResult(null);
    setFileName(null);
    setIsAnalyzing(false);
    setIsExtracting(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsExtracting(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result?.toString().split(',')[1];
      if (base64Data) {
        try {
          const extractedText = await extractTextFromFile(base64Data, file.type);
          if (fileInputRef.current?.value !== "") {
            setText(extractedText);
          }
        } catch (error) {
          alert("Falla en el motor de OCR.");
        } finally {
          setIsExtracting(false);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:px-12 pb-20 custom-scrollbar">
      <div className="max-w-[1200px] mx-auto flex flex-col gap-8">
        <div className="flex flex-wrap justify-between items-end gap-4 border-b border-[#293038] pb-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[#9dabb9] text-sm font-medium">
              <span className="material-symbols-outlined text-xs">security</span>
              <span>Constitución Política</span>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
              <span>Hábeas Corpus</span>
            </div>
            <h1 className="text-white text-3xl font-black uppercase tracking-tighter">Hábeas Corpus</h1>
          </div>
          <div className="flex gap-3">
            <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={handleFileChange} />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isExtracting || isAnalyzing}
              className="flex items-center gap-2 bg-primary/10 border border-primary/40 text-primary px-4 py-2 rounded-lg text-xs font-black uppercase hover:bg-primary/20 transition-all disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-sm">{isExtracting ? 'sync' : 'picture_as_pdf'}</span>
              {isExtracting ? 'Leyendo PDF...' : 'Cargar PDF (OCR)'}
            </button>
            <button
              onClick={handleClear}
              className="flex items-center gap-2 bg-red-500/10 border border-red-500/50 hover:bg-red-500/20 text-red-500 px-4 py-2 rounded-lg text-xs font-black uppercase transition-all"
            >
              <span className="material-symbols-outlined text-sm">delete_sweep</span>
              Limpiar
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="flex flex-col gap-4">
            <div className="bg-[#1e242b] rounded-xl border border-[#293038] overflow-hidden shadow-2xl">
              <div className="p-4 bg-[#161b21] border-b border-[#293038] flex items-center justify-between">
                <h3 className="text-white font-bold text-[10px] uppercase tracking-widest">Petición de Libertad</h3>
                {isExtracting && <span className="animate-pulse text-primary text-[10px] font-bold">IA procesando documento...</span>}
              </div>
              <textarea
                className="w-full h-[550px] bg-[#111418] border-none text-[#d0d6dc] text-sm font-mono p-8 focus:ring-0 outline-none resize-none placeholder:text-gray-800 leading-relaxed"
                placeholder="Pegue la solicitud o cargue un PDF para lectura automática..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={isExtracting}
              />
              <div className="p-5 bg-[#161b21] border-t border-[#293038]">
                <button
                  onClick={handleRunAnalysis}
                  disabled={isAnalyzing || isExtracting || !text.trim()}
                  className="w-full bg-primary hover:bg-blue-600 text-white font-black py-4 rounded-xl flex items-center justify-center gap-3 transition-all disabled:opacity-20 shadow-xl shadow-blue-900/20 uppercase text-xs"
                >
                  <span className="material-symbols-outlined">{isAnalyzing ? 'sync' : 'auto_awesome'}</span>
                  {isAnalyzing ? 'Proyectando Fallo...' : 'Resolver Hábeas Corpus'}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {result ? (
              <div className="animate-fade-in flex flex-col gap-6 h-full">
                <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col h-full">
                  <div className="px-6 py-4 bg-red-600 border-b border-red-700 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-white">
                      <span className="material-symbols-outlined text-sm">security</span>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">Sentencia Prioritaria - Control de Libertad</span>
                    </div>
                    <button className="bg-white text-red-600 text-[10px] font-black px-3 py-1 rounded hover:bg-gray-100">DESCARGAR</button>
                  </div>
                  <div className="p-12 h-[550px] overflow-y-auto custom-scrollbar text-black font-serif text-base leading-[1.8] text-justify bg-[#fdfdfd]">
                    <div className="max-w-prose mx-auto">
                      <pre className="whitespace-pre-wrap font-serif selection:bg-blue-100">
                        {result.draftContent}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-[#293038] rounded-2xl text-gray-700 p-12 bg-[#111418]/50">
                <span className="material-symbols-outlined text-8xl opacity-10 mb-6">history_edu</span>
                <p className="text-center font-black uppercase text-[10px] tracking-[0.4em] opacity-30">Esperando procesamiento de libertad</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HabeasCorpusScreen;
