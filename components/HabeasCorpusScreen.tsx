
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
      const data = await analyzeLegalDocument(text, 'Hábeas Corpus (Control de Captura)');
      setResult(data);
    } catch (err) {
      alert("Error al procesar el Hábeas Corpus.");
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
    <div className="flex flex-1 overflow-hidden h-full flex-col">
       <header className="flex flex-col gap-4 border-b border-border-dark bg-[#111418] px-6 py-4">
          <div className="flex items-center text-xs text-[#9dabb9] font-bold uppercase tracking-widest">
              <span className="material-symbols-outlined text-sm mr-2 text-primary">security</span>
              <span>Constitución Política</span>
              <span className="mx-2 text-gray-700">/</span>
              <span className="text-white">Hábeas Corpus</span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Derecho de Libertad</h2>
                  <p className="text-[10px] text-red-500 uppercase font-black tracking-widest">Trámite Preferente - Resolución en 36 horas</p>
              </div>
              <div className="flex gap-2">
                  <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={handleFileChange} />
                  <button onClick={() => fileInputRef.current?.click()} disabled={isExtracting} className="flex items-center gap-2 rounded-lg border border-primary text-primary px-4 py-2 text-[10px] font-black uppercase hover:bg-primary/10 transition-all">
                      <span className="material-symbols-outlined text-[18px]">upload</span> {isExtracting ? 'Leyendo...' : 'PDF (OCR)'}
                  </button>
                  <button onClick={handleClear} className="flex items-center gap-2 rounded-lg border border-red-500 text-red-500 px-4 py-2 text-[10px] font-black uppercase hover:bg-red-500/10 transition-all">
                      <span className="material-symbols-outlined text-[18px]">backspace</span> Limpiar
                  </button>
                  <button onClick={handleRunAnalysis} disabled={isAnalyzing || isExtracting || !text.trim()} className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-[10px] font-black uppercase text-white hover:bg-blue-600 shadow-xl shadow-blue-900/40 disabled:opacity-20 transition-all">
                      <span className="material-symbols-outlined text-[18px]">{isAnalyzing ? 'sync' : 'gavel'}</span>
                      {isAnalyzing ? 'Proyectando Fallo...' : 'Resolver Hábeas'}
                  </button>
              </div>
          </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
          <div className="w-1/2 flex flex-col bg-[#0d1216] border-r border-border-dark shadow-inner">
              <div className="p-3 border-b border-border-dark bg-[#111418] flex items-center justify-between px-6">
                <span className="text-[9px] text-[#9dabb9] font-black uppercase tracking-[0.2em]">Petición de Libertad</span>
                {fileName && <span className="text-[9px] text-primary font-mono">{fileName}</span>}
              </div>
              <textarea 
                className="flex-1 bg-transparent p-10 text-white font-mono text-base resize-none outline-none leading-relaxed placeholder:text-gray-900"
                placeholder="Pegue la solicitud o adjunte el documento PDF para lectura por IA..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={isExtracting}
              />
          </div>

          <div className="w-1/2 flex flex-col bg-[#111418]">
              {result ? (
                <div className="flex-1 flex flex-col animate-fade-in bg-white text-black shadow-2xl">
                  <div className="p-3 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest text-center">
                    Documento Prioritario - Control Jurisdiccional de Libertad
                  </div>
                  <div className="flex-1 overflow-y-auto p-16 custom-scrollbar text-justify font-serif text-base leading-[1.75]">
                    <div className="max-w-[65ch] mx-auto whitespace-pre-wrap">
                       {result.draftContent}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-800 bg-[#111418]">
                  <span className="material-symbols-outlined text-9xl opacity-5 mb-4">security</span>
                  <p className="text-[10px] uppercase font-black tracking-[0.5em] opacity-20">Esperando Actuación</p>
                </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default HabeasCorpusScreen;
