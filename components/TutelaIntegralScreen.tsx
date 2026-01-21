
import React, { useState, useRef } from 'react';
import { analyzeTutelaIntegral, extractTextFromFile } from '../services/geminiService';
import { TutelaIntegralResult } from '../types';

const TutelaIntegralScreen: React.FC = () => {
    const [text, setText] = useState<string>("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isExtracting, setIsExtracting] = useState(false);
    const [result, setResult] = useState<TutelaIntegralResult | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'resumen' | 'alertas' | 'terminos' | 'jurisprudencia' | 'borrador' | 'cumplimiento'>('resumen');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleRunAnalysis = async () => {
        if (!text.trim()) return alert("Debe ingresar el contenido de la tutela o cargar un archivo.");
        setIsAnalyzing(true);
        try {
            const data = await analyzeTutelaIntegral(text);
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
                            <span className="material-symbols-outlined text-xs">auto_fix_high</span>
                            <span>Módulo Integral</span>
                            <span className="material-symbols-outlined text-xs">chevron_right</span>
                            <span>Acción de Tutela (Flujo Completo)</span>
                        </div>
                        <h1 className="text-white text-3xl font-black uppercase tracking-tighter">Apoyo Integral Tutela</h1>
                    </div>
                    <div className="flex gap-3">
                        <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={handleFileChange} />
                        <button onClick={() => fileInputRef.current?.click()} disabled={isExtracting || isAnalyzing} className="flex items-center gap-2 bg-primary/10 border border-primary/40 text-primary px-4 py-2 rounded-lg text-xs font-black uppercase hover:bg-primary/20 transition-all disabled:opacity-50">
                            <span className="material-symbols-outlined text-sm">{isExtracting ? 'sync' : 'picture_as_pdf'}</span>
                            {isExtracting ? 'Procesando...' : 'Cargar Tutela'}
                        </button>
                        <button onClick={handleClear} className="flex items-center gap-2 bg-red-500/10 border border-red-500/50 hover:bg-red-500/20 text-red-500 px-4 py-2 rounded-lg text-xs font-black uppercase transition-all">
                            <span className="material-symbols-outlined text-sm">delete_sweep</span> Limpiar
                        </button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-8">
                    {/* Left: Input */}
                    <div className="lg:col-span-4 flex flex-col gap-4">
                        <div className="bg-[#1e242b] rounded-2xl border border-[#293038] overflow-hidden shadow-2xl flex flex-col h-[700px]">
                            <div className="p-4 bg-[#161b21] border-b border-[#293038] flex justify-between items-center">
                                <h3 className="text-white font-bold text-[10px] uppercase tracking-widest">Contenido de la Tutela</h3>
                                {isExtracting && <span className="animate-pulse text-primary text-[10px] font-bold">IA Leyendo...</span>}
                            </div>
                            <textarea
                                className="flex-1 bg-[#111418] p-8 text-gray-300 font-mono text-sm leading-relaxed outline-none resize-none placeholder:text-gray-800"
                                placeholder="Pegue la acción de tutela o cargue un archivo PDF..."
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
                                    <span className="material-symbols-outlined">{isAnalyzing ? 'sync' : 'bolt'}</span>
                                    {isAnalyzing ? 'Analizando Todo...' : 'Iniciar Flujo Integral'}
                                </button>
                            </div>
                        </div>
                        <div className="bg-blue-900/10 border border-blue-900/30 p-4 rounded-xl">
                            <p className="text-blue-400 text-[9px] font-black uppercase tracking-widest mb-1 italic">Garantías Legales</p>
                            <p className="text-blue-200/50 text-[9px] leading-relaxed">IA no decisoria • Registro de intervención humana • Auditoría judicial completa • Cumplimiento Ley 1581 de 2012.</p>
                        </div>
                    </div>

                    {/* Right: Tabs and Results */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        {result ? (
                            <div className="animate-fade-in flex flex-col h-full bg-[#1e242b] rounded-2xl border border-[#293038] overflow-hidden shadow-2xl">
                                {/* Tab Navigation */}
                                <div className="flex bg-[#161b21] border-b border-[#293038] overflow-x-auto custom-scrollbar">
                                    <TabButton active={activeTab === 'resumen'} onClick={() => setActiveTab('resumen')} icon="description" label="Resumen" />
                                    <TabButton active={activeTab === 'alertas'} onClick={() => setActiveTab('alertas')} icon="warning" label="Alertas" />
                                    <TabButton active={activeTab === 'terminos'} onClick={() => setActiveTab('terminos')} icon="alarm" label="Términos" />
                                    <TabButton active={activeTab === 'jurisprudencia'} onClick={() => setActiveTab('jurisprudencia')} icon="library_books" label="Jurisprudencia" />
                                    <TabButton active={activeTab === 'borrador'} onClick={() => setActiveTab('borrador')} icon="edit_note" label="Borrador" />
                                    <TabButton active={activeTab === 'cumplimiento'} onClick={() => setActiveTab('cumplimiento')} icon="checklist" label="Cumplimiento" />
                                </div>

                                {/* Tab Content */}
                                <div className="flex-1 p-8 overflow-y-auto custom-scrollbar min-h-[550px]">
                                    {activeTab === 'resumen' && (
                                        <div className="space-y-6">
                                            <SectionTitle title="Identificación del Caso" />
                                            <div className="grid grid-cols-2 gap-6">
                                                <InfoBlock label="Accionante" value={result.resumen.accionante} />
                                                <InfoBlock label="Accionado" value={result.resumen.accionado} />
                                            </div>
                                            <div>
                                                <InfoBlock label="Derechos Vulnerados" value={result.resumen.derechosVulnerados.join(", ")} />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <InfoBlock label="Hechos Clave" value={result.resumen.hechosClave} />
                                                <InfoBlock label="Pretensiones" value={result.resumen.pretensiones} />
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'alertas' && (
                                        <div className="space-y-6">
                                            <SectionTitle title="Control de Procedibilidad" />
                                            <div className="grid grid-cols-2 gap-4">
                                                <StatusBlock label="Subsidiariedad" value={result.procedibilidad.subsidiariedad} />
                                                <StatusBlock label="Inmediatez" value={result.procedibilidad.inmediatez} />
                                                <StatusBlock label="Otros Medios" value={result.procedibilidad.otrosMedios} />
                                                <StatusBlock label="Perjuicio" value={result.procedibilidad.perjuicioIrremediable} />
                                                <StatusBlock label="Competencia" value={result.procedibilidad.competencia} />
                                                <StatusBlock label="Legitimación" value={result.procedibilidad.legitimacion} />
                                            </div>
                                            <div className="mt-8">
                                                <SectionTitle title="Alertas Procesales" />
                                                {result.procedibilidad.alertas.map((al, i) => (
                                                    <div key={i} className="flex items-center gap-3 bg-red-500/10 text-red-400 p-3 rounded-lg border border-red-500/20 mb-2 text-xs">
                                                        <span className="material-symbols-outlined text-sm">error</span>
                                                        {al}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'terminos' && (
                                        <div className="flex flex-col items-center justify-center h-full gap-8">
                                            <div className="text-center">
                                                <h2 className={`text-6xl font-black mb-2 ${result.terminos.prioridad === 'urgente' ? 'text-red-500' : 'text-primary'}`}>{result.terminos.diasRestantes} DÍAS</h2>
                                                <p className="text-[#9dabb9] text-xs font-bold uppercase tracking-widest">Restantes para el fallo</p>
                                            </div>
                                            <div className={`p-6 rounded-2xl border flex flex-col items-center gap-2 max-w-sm w-full ${result.terminos.prioridad === 'urgente' ? 'bg-red-500/10 border-red-500/30' : 'bg-primary/10 border-primary/30'}`}>
                                                <span className="text-[10px] font-black uppercase text-gray-400">Nivel de Prioridad</span>
                                                <span className={`text-xl font-black uppercase ${result.terminos.prioridad === 'urgente' ? 'text-red-500' : 'text-primary'}`}>{result.terminos.prioridad}</span>
                                                <p className="text-center text-xs text-white/70 mt-2">{result.terminos.razonPrioridad}</p>
                                            </div>
                                            <div className="text-[#9dabb9] text-[10px] font-bold uppercase">Vencimiento Estimado: {result.terminos.vencimiento}</div>
                                        </div>
                                    )}

                                    {activeTab === 'jurisprudencia' && (
                                        <div className="space-y-4">
                                            <SectionTitle title="Precedentes Identificados" />
                                            {result.jurisprudencia.map((j, i) => (
                                                <div key={i} className="p-5 bg-[#111418] border border-[#293038] rounded-xl">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <span className="text-white font-bold text-sm block">{j.referencia}</span>
                                                            <span className="text-primary text-[10px] font-bold uppercase tracking-widest">{j.tribunal}</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-white font-black">{j.similitud}%</span>
                                                            <span className="text-[8px] text-[#9dabb9] block uppercase">Similitud</span>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-gray-400 leading-relaxed mb-4">{j.resumen}</p>
                                                    {j.precedenteObligatorio && <span className="text-[9px] bg-red-500/20 text-red-400 px-2 py-1 rounded-full border border-red-500/20 font-black uppercase">Obligatorio</span>}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {activeTab === 'borrador' && (
                                        <div className="space-y-6">
                                            <SectionTitle title="Generación de Providencias" />
                                            <div className="flex gap-2">
                                                {result.borradores.map((b, i) => (
                                                    <button key={i} className="bg-[#111418] text-white text-[10px] font-bold px-4 py-2 rounded border border-primary/30 hover:bg-primary/10 transition-colors uppercase">
                                                        {b.tipo}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="bg-white rounded-xl p-10 text-black font-serif text-base leading-relaxed shadow-inner min-h-[400px]">
                                                <pre className="whitespace-pre-wrap">{result.borradores[0]?.contenido}</pre>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'cumplimiento' && (
                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-6">
                                                <SectionTitle title="Oficios a Generar" />
                                                {result.seguimiento.oficiosGenerados.map((o, i) => (
                                                    <div key={i} className="flex items-center gap-3 bg-[#111418] p-4 rounded-xl border border-[#293038]">
                                                        <span className="material-symbols-outlined text-primary">mail</span>
                                                        <span className="text-white text-xs font-bold">{o}</span>
                                                        <button className="ml-auto text-primary text-[10px] font-black uppercase">Generar</button>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="space-y-6">
                                                <SectionTitle title="Hitos de Seguimiento" />
                                                {result.seguimiento.hitosCumplimiento.map((h, i) => (
                                                    <div key={i} className="flex items-start gap-3">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                                                        <span className="text-gray-300 text-xs">{h}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Persistent Warning */}
                                <div className="p-4 bg-amber-900/10 border-t border-amber-900/30 flex items-center justify-center gap-3">
                                    <span className="material-symbols-outlined text-amber-500 text-sm">warning</span>
                                    <span className="text-amber-500 text-[9px] font-black uppercase tracking-widest">IA APOYO NO DECISORIO - REQUIERE FIRMA DEL JUEZ PARA VALIDEZ</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-[#293038] rounded-2xl text-gray-700 p-12 bg-[#111418]/50 min-h-[600px]">
                                <span className="material-symbols-outlined text-8xl opacity-10 mb-6">dynamic_form</span>
                                <div className="text-center space-y-2">
                                    <p className="font-black uppercase text-xs tracking-[0.4em] opacity-30">Motor Integral de Tutela</p>
                                    <p className="text-[10px] opacity-20 max-w-xs mx-auto text-white">Ingrese la tutela para activar todas las pestañas de flujo judicial automatizado.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Sub-components for cleaner structure
const TabButton = ({ active, onClick, icon, label }: any) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all flex-shrink-0 ${active ? 'border-primary bg-primary/5 text-white' : 'border-transparent text-[#9dabb9] hover:text-white'
            }`}
    >
        <span className="material-symbols-outlined text-sm">{icon}</span>
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
);

const SectionTitle = ({ title }: { title: string }) => (
    <h4 className="text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
        <span className="w-4 h-[1px] bg-primary/40" /> {title}
    </h4>
);

const InfoBlock = ({ label, value }: { label: string, value: string }) => (
    <div className="bg-[#111418] p-4 rounded-xl border border-[#293038]">
        <label className="text-[#9dabb9] text-[9px] font-black uppercase tracking-wider block mb-1">{label}</label>
        <p className="text-white text-xs leading-relaxed">{value || "No identificado"}</p>
    </div>
);

const StatusBlock = ({ label, value }: { label: string, value: string }) => (
    <div className="flex items-center justify-between bg-[#111418] p-3 rounded-lg border border-[#293038]">
        <span className="text-[#9dabb9] text-[9px] font-black uppercase">{label}</span>
        <span className="text-white text-[10px] font-semibold">{value}</span>
    </div>
);

export default TutelaIntegralScreen;
