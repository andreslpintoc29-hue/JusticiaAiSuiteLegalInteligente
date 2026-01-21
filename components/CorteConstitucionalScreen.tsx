
import React, { useState, useRef } from 'react';
import { analyzeLegalDocument, extractTextFromFile } from '../services/geminiService';
import { LegalAnalysisResult } from '../types';

const CorteConstitucionalScreen: React.FC = () => {
    const [text, setText] = useState<string>("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isExtracting, setIsExtracting] = useState(false);
    const [result, setResult] = useState<LegalAnalysisResult | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleRunAnalysis = async () => {
        if (!text.trim()) return alert("El campo de texto está vacío. Ingrese los hechos o adjunte un documento.");
        setIsAnalyzing(true);
        try {
            const data = await analyzeLegalDocument(text, 'Sentencia de la Corte Constitucional (Magistrado Ponente)');
            setResult(data);
        } catch (err: any) {
            alert("Error en el análisis jurídico: " + (err.message || "Error desconocido"));
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
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
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
                    alert("Error al extraer texto. Intente manualmente.");
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
                            <span className="material-symbols-outlined text-xs">account_balance</span>
                            <span>Corte Constitucional</span>
                            <span className="material-symbols-outlined text-xs">chevron_right</span>
                            <span>Sala Plena / Magistratura</span>
                        </div>
                        <h1 className="text-white text-3xl font-black uppercase tracking-tighter">Corte Constitucional</h1>
                    </div>
                    <div className="flex gap-3">
                        <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={handleFileChange} />
                        <button onClick={() => fileInputRef.current?.click()} disabled={isExtracting || isAnalyzing} className="flex items-center gap-2 bg-primary/10 border border-primary/40 text-primary px-4 py-2 rounded-lg text-xs font-black uppercase hover:bg-primary/20 transition-all disabled:opacity-50">
                            <span className="material-symbols-outlined text-sm">{isExtracting ? 'sync' : 'upload_file'}</span>
                            {isExtracting ? 'Procesando...' : 'Cargar Expediente'}
                        </button>
                        <button onClick={handleClear} className="flex items-center gap-2 bg-red-500/10 border border-red-500/50 hover:bg-red-500/20 text-red-500 px-4 py-2 rounded-lg text-xs font-black uppercase transition-all">
                            <span className="material-symbols-outlined text-sm">delete_sweep</span> Limpiar
                        </button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-4">
                        <div className="bg-[#1e242b] rounded-xl border border-[#293038] overflow-hidden shadow-2xl">
                            <div className="p-4 bg-[#161b21] border-b border-[#293038] flex items-center justify-between">
                                <h3 className="text-white font-bold text-[10px] uppercase tracking-widest">Hechos del Expediente</h3>
                                {isExtracting && <span className="animate-pulse text-amber-500 text-[10px] font-bold">Lectura Digital Activa...</span>}
                            </div>
                            <textarea
                                className="w-full h-[550px] bg-[#111418] border-none text-[#d0d6dc] text-sm font-mono p-8 focus:ring-0 outline-none resize-none placeholder:text-gray-800 leading-relaxed"
                                placeholder="Pegue el resumen del expediente o adjunte documentos para revisión técnica constitucional..."
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                disabled={isExtracting}
                            />
                            <div className="p-5 bg-[#161b21] border-t border-[#293038]">
                                <button
                                    onClick={handleRunAnalysis}
                                    disabled={isAnalyzing || isExtracting || !text.trim()}
                                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black py-4 rounded-xl flex items-center justify-center gap-3 transition-all disabled:opacity-20 shadow-xl shadow-amber-900/20 uppercase text-xs"
                                >
                                    <span className="material-symbols-outlined">{isAnalyzing ? 'sync' : 'account_balance'}</span>
                                    {isAnalyzing ? 'Magistratura en sesión...' : 'Proyectar Sentencia (Sala Plena)'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6">
                        {result ? (
                            <div className="animate-fade-in flex flex-col gap-6 h-full">
                                <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col h-full border-t-8 border-t-amber-600">
                                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-amber-700">security</span>
                                            <span className="text-amber-900 text-[10px] font-black uppercase tracking-[0.2em]">Sentencia de Constitucionalidad (C- / T-)</span>
                                        </div>
                                        <button className="bg-amber-600 text-white text-[10px] font-black px-3 py-1 rounded hover:bg-amber-700">EXPEDIR TÍTULO</button>
                                    </div>
                                    <div className="p-12 overflow-y-auto custom-scrollbar text-black font-serif text-base leading-[1.8] text-justify bg-[#fdfdfd]">
                                        <div className="max-w-prose mx-auto">
                                            <pre className="whitespace-pre-wrap font-serif selection:bg-amber-100">
                                                {result.draftContent}
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-[#293038] rounded-2xl text-gray-700 p-12 bg-[#111418]/50">
                                <span className="material-symbols-outlined text-8xl opacity-10 mb-6">workspace_premium</span>
                                <p className="text-center font-black uppercase text-[10px] tracking-[0.4em] opacity-30">Esperando revisión oficial de la Corte</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CorteConstitucionalScreen;
