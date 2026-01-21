
import React, { useState, useRef } from 'react';
import { analyzeHabeasCorpusInteligente, extractTextFromFile } from '../services/geminiService';
import { HabeasCorpusInteligenteResult } from '../types';

const HabeasCorpusInteligenteScreen: React.FC = () => {
    const [text, setText] = useState<string>("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isExtracting, setIsExtracting] = useState(false);
    const [result, setResult] = useState<HabeasCorpusInteligenteResult | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'resumen' | 'legalidad' | 'tiempo' | 'normativa' | 'riesgos' | 'borrador' | 'seguimiento'>('resumen');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleRunAnalysis = async () => {
        if (!text.trim()) return alert("Debe ingresar el contenido del Hábeas Corpus o cargar un archivo.");
        setIsAnalyzing(true);
        try {
            const data = await analyzeHabeasCorpusInteligente(text);
            setResult(data);
        } catch (err: any) {
            alert("Error en el análisis integral: " + (err.message || "Error desconocido"));
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
                    setText(extractedText);
                } catch (error) {
                    alert("Error al extraer texto.");
                } finally {
                    setIsExtracting(false);
                }
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="flex-1 overflow-y-auto p-6 lg:px-12 pb-20 custom-scrollbar bg-background-dark">
            <div className="max-w-[1400px] mx-auto flex flex-col gap-8">
                {/* Header */}
                <div className="flex flex-wrap justify-between items-end gap-4 border-b border-[#293038] pb-6">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-[#9dabb9] text-sm font-medium">
                            <span className="material-symbols-outlined text-xs">verified_user</span>
                            <span>Módulo Integral</span>
                            <span className="material-symbols-outlined text-xs">chevron_right</span>
                            <span>Hábeas Corpus Inteligente</span>
                        </div>
                        <h1 className="text-white text-3xl font-black uppercase tracking-tighter">Hábeas Corpus Inteligente</h1>
                    </div>
                    <div className="flex gap-3">
                        <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={handleFileChange} />
                        <button onClick={() => fileInputRef.current?.click()} disabled={isExtracting || isAnalyzing} className="flex items-center gap-2 bg-red-500/10 border border-red-500/40 text-red-500 px-4 py-2 rounded-lg text-xs font-black uppercase hover:bg-red-500/20 transition-all disabled:opacity-50">
                            <span className="material-symbols-outlined text-sm">{isExtracting ? 'sync' : 'balance'}</span>
                            {isExtracting ? 'Procesando...' : 'Cargar HC'}
                        </button>
                        <button onClick={handleClear} className="flex items-center gap-2 bg-gray-500/10 border border-gray-500/50 hover:bg-gray-500/20 text-gray-500 px-4 py-2 rounded-lg text-xs font-black uppercase transition-all">
                            <span className="material-symbols-outlined text-sm">delete_sweep</span> Limpiar
                        </button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-8">
                    {/* Input */}
                    <div className="lg:col-span-4 flex flex-col gap-4">
                        <div className="bg-[#1e242b] rounded-2xl border border-[#293038] overflow-hidden shadow-2xl flex flex-col h-[700px]">
                            <div className="p-4 bg-[#161b21] border-b border-[#293038] flex justify-between items-center">
                                <h3 className="text-white font-bold text-[10px] uppercase tracking-widest">Solicitud de Libertad</h3>
                            </div>
                            <textarea
                                className="flex-1 bg-[#111418] p-8 text-gray-300 font-mono text-sm leading-relaxed outline-none resize-none placeholder:text-gray-800"
                                placeholder="Pegue la solicitud, acta verbal o cargue un PDF..."
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                disabled={isExtracting}
                            />
                            <div className="p-5 bg-[#161b21] border-t border-[#293038]">
                                <button
                                    onClick={handleRunAnalysis}
                                    disabled={isAnalyzing || isExtracting || !text.trim()}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl flex items-center justify-center gap-3 transition-all disabled:opacity-20 shadow-xl shadow-red-900/40 uppercase text-xs"
                                >
                                    <span className="material-symbols-outlined">{isAnalyzing ? 'sync' : 'gavel'}</span>
                                    {isAnalyzing ? 'Procesando...' : 'Analizar Hábeas Corpus'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        {result ? (
                            <div className="animate-fade-in flex flex-col h-full bg-[#1e242b] rounded-2xl border border-[#293038] overflow-hidden shadow-2xl">
                                <div className="flex bg-[#161b21] border-b border-[#293038] overflow-x-auto custom-scrollbar">
                                    <TabButton active={activeTab === 'resumen'} onClick={() => setActiveTab('resumen')} icon="person" label="Resumen" />
                                    <TabButton active={activeTab === 'legalidad'} onClick={() => setActiveTab('legalidad')} icon="policy" label="Legalidad" />
                                    <TabButton active={activeTab === 'tiempo'} onClick={() => setActiveTab('tiempo')} icon="schedule" label="36 Horas" />
                                    <TabButton active={activeTab === 'normativa'} onClick={() => setActiveTab('normativa')} icon="menu_book" label="Normas" />
                                    <TabButton active={activeTab === 'riesgos'} onClick={() => setActiveTab('riesgos')} icon="report_problem" label="Riesgos" />
                                    <TabButton active={activeTab === 'borrador'} onClick={() => setActiveTab('borrador')} icon="history_edu" label="Borrador" />
                                    <TabButton active={activeTab === 'seguimiento'} onClick={() => setActiveTab('seguimiento')} icon="verified" label="Seguimiento" />
                                </div>

                                <div className="flex-1 p-8 overflow-y-auto custom-scrollbar min-h-[550px]">
                                    {activeTab === 'resumen' && (
                                        <div className="space-y-6">
                                            <SectionTitle title="Datos de la Privación de Libertad" />
                                            <div className="grid grid-cols-2 gap-6">
                                                <InfoBlock label="Persona Privada de Libertad" value={result.resumen.personaPrivadaLibertad} />
                                                <InfoBlock label="Autoridad" value={result.resumen.autoridadOrdenaEjecuta} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-6">
                                                <InfoBlock label="Lugar de Reclusión" value={result.resumen.lugarReclusion} />
                                                <InfoBlock label="Fecha y Causa de Captura" value={result.resumen.fechaCausaCaptura} />
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'legalidad' && (
                                        <div className="space-y-6">
                                            <SectionTitle title="Control de Legalidad (Alertas)" />
                                            <div className="space-y-4">
                                                {result.controlLegalidad.alertas.map((alerta, i) => (
                                                    <div key={i} className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-500 font-bold text-sm">
                                                        <span className="material-symbols-outlined">warning</span>
                                                        {alerta}
                                                    </div>
                                                ))}
                                            </div>
                                            <InfoBlock label="Análisis de Legalidad" value={result.controlLegalidad.analisis} />
                                        </div>
                                    )}

                                    {activeTab === 'tiempo' && (
                                        <div className="flex flex-col items-center justify-center h-full gap-8">
                                            <div className="text-center">
                                                <h2 className={`text-7xl font-black mb-2 ${result.controlTiempo.isVencido ? 'text-red-600' : 'text-primary'}`}>
                                                    {result.controlTiempo.horasRestantes} HORAS
                                                </h2>
                                                <p className="text-[#9dabb9] text-xs font-bold uppercase tracking-widest">Plazo máximo legal (36h)</p>
                                            </div>
                                            <div className="w-full max-w-md bg-[#111418] h-4 rounded-full overflow-hidden border border-[#293038]">
                                                <div
                                                    className={`h-full transition-all ${result.controlTiempo.isVencido ? 'bg-red-600' : 'bg-primary'}`}
                                                    style={{ width: `${(result.controlTiempo.horasTranscurridas / 36) * 100}%` }}
                                                />
                                            </div>
                                            <p className="text-[#9dabb9] text-xs font-black uppercase italic">
                                                {result.controlTiempo.isVencido ? 'PLAZO VENCIDO - PRIORIDAD ABSOLUTA' : 'PLAZO DENTRO DEL TÉRMINO LEGAL'}
                                            </p>
                                        </div>
                                    )}

                                    {activeTab === 'normativa' && (
                                        <div className="space-y-6">
                                            <SectionTitle title="Fundamentos Jurídicos" />
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-4">
                                                    <h5 className="text-white text-[10px] font-black uppercase tracking-widest">Normativa Aplicable</h5>
                                                    <ul className="space-y-2">
                                                        {result.normativaJurisprudencia.normas.map((n, i) => (
                                                            <li key={i} className="flex items-center gap-2 text-xs text-gray-300">
                                                                <span className="material-symbols-outlined text-xs text-primary">check_circle</span>
                                                                {n}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div className="space-y-4">
                                                    <h5 className="text-white text-[10px] font-black uppercase tracking-widest">Jurisprudencia Relevante</h5>
                                                    <div className="space-y-3">
                                                        {result.normativaJurisprudencia.jurisprudencia.map((j, i) => (
                                                            <div key={i} className="p-3 bg-[#111418] border border-[#293038] rounded-lg">
                                                                <span className="text-primary font-bold text-[11px] block">{j.referencia}</span>
                                                                <p className="text-[10px] text-gray-400 mt-1">{j.resumen}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'riesgos' && (
                                        <div className="space-y-6">
                                            <SectionTitle title="Detección de Riesgos Graves" />
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {result.riesgosGraves.map((r, i) => (
                                                    <div key={i} className="bg-[#111418] border border-red-900/20 p-5 rounded-xl">
                                                        <div className="flex items-center gap-2 text-red-500 font-black text-[10px] uppercase mb-2">
                                                            <span className="material-symbols-outlined text-sm">dangerous</span>
                                                            {r.tipo}
                                                        </div>
                                                        <p className="text-xs text-gray-400">{r.descripcion}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'borrador' && (
                                        <div className="space-y-4">
                                            <div className="flex gap-2">
                                                {result.borradores.map((b, i) => (
                                                    <button key={i} className="bg-[#111418] text-white text-[10px] font-bold px-4 py-2 rounded border border-red-500/30 hover:bg-red-500/10 transition-colors uppercase">
                                                        {b.tipo}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="bg-white rounded-xl p-10 text-black font-serif text-base leading-relaxed shadow-inner min-h-[400px]">
                                                <pre className="whitespace-pre-wrap">{result.borradores[0]?.contenido}</pre>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'seguimiento' && (
                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-6">
                                                <SectionTitle title="Gestión de Oficios" />
                                                {result.notificacionCumplimiento.oficios.map((o, i) => (
                                                    <div key={i} className="flex items-center gap-3 bg-[#111418] p-4 rounded-xl border border-[#293038]">
                                                        <span className="material-symbols-outlined text-red-500">task_alt</span>
                                                        <span className="text-white text-xs font-bold">{o}</span>
                                                        <button className="ml-auto text-red-500 text-[10px] font-black uppercase">Expedir</button>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="space-y-6">
                                                <SectionTitle title="Hitos de Cumplimiento" />
                                                <div className="space-y-4">
                                                    {result.notificacionCumplimiento.accionesSeguimiento.map((a, i) => (
                                                        <div key={i} className="flex items-start gap-3">
                                                            <div className="w-2 h-2 rounded-full bg-red-600 mt-1.5" />
                                                            <p className="text-gray-300 text-xs">{a}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 bg-red-900/10 border-t border-red-900/30 flex items-center justify-center gap-3">
                                    <span className="material-symbols-outlined text-red-500 text-sm">warning</span>
                                    <span className="text-red-500 text-[9px] font-black uppercase tracking-widest text-center leading-tight">
                                        IA DE APOYO NO DECISORIA • ADVERTENCIA: LA DECISIÓN FINAL CORRESPONDE AL JUEZ • CUMPLIMIENTO LEY 1095/2006 Y CP
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-[#293038] rounded-2xl text-gray-700 p-12 bg-[#111418]/50 min-h-[600px]">
                                <span className="material-symbols-outlined text-8xl opacity-10 mb-6">lock_reset</span>
                                <div className="text-center space-y-2">
                                    <p className="font-black uppercase text-xs tracking-[0.4em] opacity-30">Protegiendo el Derecho a la Libertad</p>
                                    <p className="text-[10px] opacity-20 max-w-sm mx-auto text-white">Ingrese la solicitud de Hábeas Corpus para activar el control de legalidad y términos de 36 horas.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const TabButton = ({ active, onClick, icon, label }: any) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all flex-shrink-0 ${active ? 'border-red-600 bg-red-600/5 text-white' : 'border-transparent text-[#9dabb9] hover:text-white'
            }`}
    >
        <span className="material-symbols-outlined text-sm">{icon}</span>
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
);

const SectionTitle = ({ title }: { title: string }) => (
    <h4 className="text-red-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
        <span className="w-4 h-[1px] bg-red-500/40" /> {title}
    </h4>
);

const InfoBlock = ({ label, value }: { label: string, value: string }) => (
    <div className="bg-[#111418] p-4 rounded-xl border border-[#293038]">
        <label className="text-[#9dabb9] text-[9px] font-black uppercase tracking-wider block mb-1">{label}</label>
        <p className="text-white text-xs leading-relaxed">{value || "No identificado"}</p>
    </div>
);

export default HabeasCorpusInteligenteScreen;
