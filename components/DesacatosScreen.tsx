
import React, { useState, useRef } from 'react';
import { analyzeLegalDocument, extractTextFromFile } from '../services/geminiService';
import { LegalAnalysisResult } from '../types';

const DesacatosScreen: React.FC = () => {
  const [text, setText] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [result, setResult] = useState<LegalAnalysisResult | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRunAnalysis = async () => {
    if (!text.trim()) return alert("Debe ingresar la orden original y las pruebas de incumplimiento.");
    setIsAnalyzing(true);
    try {
      const data = await analyzeLegalDocument(text, 'Incidente de Desacato');
      setResult(data);
    } catch (err: any) {
      alert("Error al procesar el incidente: " + (err.message || "Error desconocido"));
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
          alert("Error en la extracción por IA.");
        } finally {
          setIsExtracting(false);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="bg-surface-dark border-b border-surface-highlight p-5 flex justify-between items-center shadow-2xl">
        <div>
          <h2 className="text-white text-xl font-black uppercase tracking-tighter">Trámite de Desacato</h2>
          <p className="text-[10px] text-primary font-black uppercase tracking-widest">Evaluación de cumplimiento de sentencias</p>
        </div>
        <div className="flex gap-2">
          <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={handleFileChange} />
          <button onClick={() => fileInputRef.current?.click()} disabled={isExtracting} className="flex items-center gap-2 bg-primary/5 border border-primary/30 text-primary px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all">
            <span className="material-symbols-outlined text-sm">file_open</span> {isExtracting ? 'Analizando...' : 'Adjuntar PDF'}
          </button>
          <button onClick={handleClear} className="flex items-center gap-2 bg-red-500/5 border border-red-500/30 text-red-500 px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all">
            <span className="material-symbols-outlined text-sm">close</span> Limpiar
          </button>
          <button onClick={handleRunAnalysis} disabled={isAnalyzing || isExtracting || !text.trim()} className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg text-[10px] font-black uppercase shadow-2xl shadow-blue-900/40 disabled:opacity-20 transition-all">
            <span className="material-symbols-outlined text-sm">{isAnalyzing ? 'sync' : 'rule'}</span>
            {isAnalyzing ? 'Evaluando...' : 'Abrir Incidente'}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden p-6">
        <div className="grid grid-cols-12 gap-6 h-full">
          <section className="col-span-12 lg:col-span-5 bg-surface-dark rounded-2xl border border-surface-highlight overflow-hidden flex flex-col shadow-inner">
            <div className="p-3 px-6 bg-[#1a2128] border-b border-surface-highlight flex justify-between">
              <span className="text-[9px] text-[#9dabb9] font-black uppercase tracking-widest">Evidencia y Orden Judicial</span>
              {fileName && <span className="text-[9px] text-primary font-mono">{fileName}</span>}
            </div>
            <textarea
              className="flex-1 bg-background-dark p-8 text-gray-300 font-mono text-sm leading-relaxed outline-none resize-none placeholder:text-gray-900"
              placeholder="Contraste la orden impartida con las pruebas de cumplimiento..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isExtracting}
            />
          </section>

          <section className="col-span-12 lg:col-span-7 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-2 px-8">
              <span className="material-symbols-outlined text-sm text-gray-400">article</span>
              <span className="text-[9px] text-gray-500 font-black uppercase tracking-[0.3em]">Proyectado Judicial APA 7</span>
            </div>
            <div className="flex-1 p-16 overflow-y-auto text-black font-serif text-base leading-8 text-justify custom-scrollbar selection:bg-blue-100">
              {result ? (
                <div className="max-w-prose mx-auto">
                  <pre className="whitespace-pre-wrap font-serif">{result.draftContent}</pre>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-5">
                  <span className="material-symbols-outlined text-9xl mb-4">balance</span>
                  <p className="font-black text-xs uppercase tracking-[0.5em]">Evaluación Técnica</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DesacatosScreen;
