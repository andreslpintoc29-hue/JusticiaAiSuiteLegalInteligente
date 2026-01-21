
import React, { useState, useRef } from 'react';
import { analyzeDesacatoInteligente, extractTextFromFile } from '../services/geminiService';
import { DesacatoInteligenteResult } from '../types';

const DesacatoInteligenteScreen: React.FC = () => {
    const [text, setText] = useState<string>("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isExtracting, setIsExtracting] = useState(false);
    const [result, setResult] = useState<DesacatoInteligenteResult | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'resumen' | 'procedencia' | 'seguimiento' | 'analisis' | 'riesgos' | 'borrador' | 'ejecucion'>('resumen');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleRunAnalysis = async () => {
        if (!text.trim()) return alert("Debe ingresar las pruebas del incidente o cargar un archivo.");
        setIsAnalyzing(true);
        try {
            const data = await analyzeDesacatoInteligente(text);
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
                            <span className="material-symbols-outlined text-xs">priority_high</span>
                            <span>Módulo Integral</span>
                            <span className="material-symbols-outlined text-xs">chevron_right</span>
                            <span>Desacato Inteligente</span>
                        </div>
                        <h1 className="text-white text-3xl font-black uppercase tracking-tighter">Desacato Inteligente</h1>
                    </div>
                    <div className="flex gap-3">
                        <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={handleFileChange} />
                        <button onClick={() => fileInputRef.current?.click()} disabled={isExtracting || isAnalyzing} className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/40 text-amber-500 px-4 py-2 rounded-lg text-xs font-black uppercase hover:bg-amber-500/20 transition-all disabled:opacity-50">
                            <span className="material-symbols-outlined text-sm">{isExtracting ? 'sync' : 'attach_file'}</span>
                            {isExtracting ? 'Procesando...' : 'Cargar Pruebas'}
                        </button>
                        <button onClick={handleClear} className="flex items-center gap-2 bg-gray-500/10 border border-gray-500/50 hover:bg-gray-500/20 text-gray-500 px-4 py-2 rounded-lg text-xs font-black uppercase transition-all">
                            <span className="material-symbols-outlined text-sm">delete_sweep</span> Limpiar
                        </button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-8">
                    {/* Left: Input */}
                    <div className="lg:col-span-4 flex flex-col gap-4">
                        <div className="bg-[#1e242b] rounded-2xl border border-[#293038] overflow-hidden shadow-2xl flex flex-col h-[700px]">
                            <div className="p-4 bg-[#161b21] border-b border-[#293038] flex justify-between items-center">
                                <h3 className="text-white font-bold text-[10px] uppercase tracking-widest">Evidencia de Incumplimiento</h3>
                                {isExtracting && <span className="animate-pulse text-amber-500 text-[10px] font-bold">IA Analizando...</span>}
                            </div>
                            <textarea
                                className="flex-1 bg-[#111418] p-8 text-gray-300 font-mono text-sm leading-relaxed outline-none resize-none placeholder:text-gray-800"
                                placeholder="Pegue el relato de incumplimiento o cargue las pruebas del incidente..."
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                disabled={isExtracting}
                            />
                            <div className="p-5 bg-[#161b21] border-t border-[#293038]">
                                <button
                                    onClick={handleRunAnalysis}
                                    disabled={isAnalyzing || isExtracting || !text.trim()}
                                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black py-4 rounded-xl flex items-center justify-center gap-3 transition-all disabled:opacity-20 shadow-xl shadow-amber-900/40 uppercase text-xs"
                                >
                                    <span className="material-symbols-outlined">{isAnalyzing ? 'sync' : 'rule'}</span>
                                    {isAnalyzing ? 'Evaluando...' : 'Analizar Incidente'}
                                </button>
                            </div>
                        </div>
                        <div className="bg-amber-900/10 border border-amber-900/30 p-4 rounded-xl">
                            <p className="text-amber-500 text-[9px] font-black uppercase tracking-widest mb-1 italic">Garantías Procedimentales</p>
                            <p className="text-amber-200/50 text-[9px] leading-relaxed">IA no decisoria • Autonomía judicial preservada • Control de proporcionalidad • Cumplimiento Ley 1581 de 2012.</p>
                        </div>
                    </div>

                    {/* Right: Tabs and Results */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        {result ? (
                            <div className="animate-fade-in flex flex-col h-full bg-[#1e242b] rounded-2xl border border-[#293038] overflow-hidden shadow-2xl">
                                {/* Tab Navigation */}
                                <div className="flex bg-[#161b21] border-b border-[#293038] overflow-x-auto custom-scrollbar">
                                    <TabButton active={activeTab === 'resumen'} onClick={() => setActiveTab('resumen')} icon="assignment" label="Resumen" color="amber" />
                                    <TabButton active={activeTab === 'procedencia'} onClick={() => setActiveTab('procedencia')} icon="verified" label="Procedencia" color="amber" />
                                    <TabButton active={activeTab === 'seguimiento'} onClick={() => setActiveTab('seguimiento')} icon="timeline" label="Seguimiento" color="amber" />
                                    <TabButton active={activeTab === 'analisis'} onClick={() => setActiveTab('analisis')} icon="gavel" label="Análisis" color="amber" />
                                    <TabButton active={activeTab === 'riesgos'} onClick={() => setActiveTab('riesgos')} icon="warning" label="Riesgos" color="amber" />
                                    <TabButton active={activeTab === 'borrador'} onClick={() => setActiveTab('borrador')} icon="description" label="Borrador" color="amber" />
                                    <TabButton active={activeTab === 'ejecucion'} onClick={() => setActiveTab('ejecucion')} icon="task_alt" label="Ejecución" color="amber" />
                                </div>

                                {/* Tab Content */}
                                <div className="flex-1 p-8 overflow-y-auto custom-scrollbar min-h-[550px]">
                                    {activeTab === 'resumen' && (
                                        <div className="space-y-6">
                                            <SectionTitle title="Datos del Incidente" color="amber" />
                                            <div className="grid grid-cols-2 gap-6">
                                                <InfoBlock label="Tutela Base" value={result.resumen.tutelaBase} />
                                                <InfoBlock label="Autoridad Responsable" value={result.resumen.autoridadResponsable} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-6">
                                                <InfoBlock label="Orden Incumplida" value={result.resumen.ordenIncumplida} />
                                                <InfoBlock label="Fecha Límite" value={result.resumen.fechaLimite} />
                                            </div>
                                            <InfoBlock label="Pruebas de Incumplimiento" value={result.resumen.pruebasIncumplimiento} />
                                        </div>
                                    )}

                                    {activeTab === 'procedencia' && (
                                        <div className="space-y-6">
                                            <SectionTitle title="Análisis de Procedencia" color="amber" />
                                            <div className="grid grid-cols-2 gap-4">
                                                <StatusBlock label="Orden Clara/Expresa" value={result.procedencia.ordenClaraExpresaExigible} />
                                                <StatusBlock label="Notificación Válida" value={result.procedencia.notificacionValida} />
                                                <StatusBlock label="Vencimiento Plazo" value={result.procedencia.vencimientoPlazo} />
                                                <StatusBlock label="Sujeto Obligado" value={result.procedencia.sujetoObligadoIdentificado} />
                                            </div>
                                            <div className="mt-8">
                                                <SectionTitle title="Alertas de Procedencia" color="amber" />
                                                {result.procedencia.alertas.map((al, i) => (
                                                    <div key={i} className="flex items-center gap-3 bg-red-500/10 text-red-400 p-3 rounded-lg border border-red-500/20 mb-2 text-xs">
                                                        <span className="material-symbols-outlined text-sm">warning</span>
                                                        {al}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'seguimiento' && (
                                        <div className="space-y-8">
                                            <div>
                                                <SectionTitle title="Línea de Tiempo de la Orden" color="amber" />
                                                <div className="space-y-4 ml-4 border-l-2 border-amber-500/20 pl-6 py-2">
                                                    {result.seguimiento.lineaTiempo.map((ev, i) => (
                                                        <div key={i} className="relative">
                                                            <div className="absolute -left-[31px] top-1 w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                                                            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">{ev.fecha}</span>
                                                            <p className="text-gray-300 text-xs mt-1">{ev.evento}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <h5 className="text-amber-500 text-[10px] font-black uppercase mb-3">Evidencia Aportada</h5>
                                                    <div className="flex flex-wrap gap-2">
                                                        {result.seguimiento.evidenciaAportada.map((ev, i) => (
                                                            <span key={i} className="bg-[#111418] text-gray-400 text-[10px] px-3 py-1.5 rounded-lg border border-[#293038]">{ev}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-center justify-center bg-[#111418] rounded-2xl p-6 border border-[#293038]">
                                                    <span className="text-[10px] font-black text-gray-500 uppercase mb-2">Estado Actual</span>
                                                    <span className={`text-xl font-black uppercase ${result.seguimiento.estadoCumplimiento === 'cumplido' ? 'text-green-500' :
                                                            result.seguimiento.estadoCumplimiento === 'parcial' ? 'text-amber-500' : 'text-red-500'
                                                        }`}>{result.seguimiento.estadoCumplimiento}</span>
                                                    {result.seguimiento.alertaDilacion && (
                                                        <p className="text-[10px] text-red-400 text-center mt-3 animate-pulse font-bold">{result.seguimiento.alertaDilacion}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'analisis' && (
                                        <div className="space-y-6">
                                            <SectionTitle title="Análisis Jurídico Especializado" color="amber" />
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <InfoBlock label="Reglas Constitucionales" value={result.analisisJuridico.reglasConstitucionales} />
                                                <InfoBlock label="Límites a Sanciones" value={result.analisisJuridico.limitesSanciones} />
                                            </div>
                                            <InfoBlock label="Juicio de Proporcionalidad" value={result.analisisJuridico.proporcionalidadRatio} />
                                            <div className="mt-4">
                                                <h5 className="text-amber-500 text-[10px] font-black uppercase mb-3 px-1">Jurisprudencia Sugerida</h5>
                                                <div className="space-y-3">
                                                    {result.analisisJuridico.jurisprudencia.map((j, i) => (
                                                        <div key={i} className="p-4 bg-[#111418] border border-[#293038] rounded-xl">
                                                            <span className="text-white font-bold text-xs block mb-1">{j.referencia}</span>
                                                            <p className="text-xs text-gray-400 leading-relaxed">{j.resumen}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'riesgos' && (
                                        <div className="space-y-6">
                                            <SectionTitle title="Detección de Riesgos Procesales" color="amber" />
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {result.riesgos.map((r, i) => (
                                                    <div key={i} className={`p-5 rounded-xl border ${r.nivelRiesgo === 'alto' ? 'bg-red-500/5 border-red-500/20 text-red-400' :
                                                            r.nivelRiesgo === 'medio' ? 'bg-amber-500/5 border-amber-500/20 text-amber-400' :
                                                                'bg-blue-500/5 border-blue-500/20 text-blue-400'
                                                        }`}>
                                                        <div className="flex items-center gap-2 font-black text-[10px] uppercase mb-2">
                                                            <span className="material-symbols-outlined text-sm">warning</span>
                                                            {r.tipo} ({r.nivelRiesgo})
                                                        </div>
                                                        <p className="text-xs opacity-80">{r.descripcion}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'borrador' && (
                                        <div className="space-y-4">
                                            <div className="flex gap-2">
                                                {result.borradores.map((b, i) => (
                                                    <button key={i} className="bg-[#111418] text-white text-[10px] font-bold px-4 py-2 rounded border border-amber-500/30 hover:bg-amber-500/10 transition-colors uppercase">
                                                        {b.tipo}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="bg-white rounded-xl p-10 text-black font-serif text-base leading-relaxed shadow-inner min-h-[400px]">
                                                <pre className="whitespace-pre-wrap">{result.borradores[0]?.contenido}</pre>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'ejecucion' && (
                                        <div className="space-y-8">
                                            <div className="grid grid-cols-2 gap-8">
                                                <div className="space-y-6">
                                                    <SectionTitle title="Registro de Sanción" color="amber" />
                                                    <InfoBlock label="Sanción Impuesta (Sugerida)" value={result.ejecucion.registroSancion} />
                                                </div>
                                                <div className="space-y-6">
                                                    <SectionTitle title="Estado de ejecución" color="amber" />
                                                    <InfoBlock label="Confirmación" value={result.ejecucion.confirmacionCumplimiento} />
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between bg-[#111418] p-6 rounded-2xl border border-amber-500/20">
                                                <div className="flex items-center gap-4">
                                                    <span className={`material-symbols-outlined text-3xl ${result.ejecucion.archivoAutomatico ? 'text-green-500' : 'text-gray-600'}`}>
                                                        {result.ejecucion.archivoAutomatico ? 'check_circle' : 'pending'}
                                                    </span>
                                                    <div>
                                                        <h5 className="text-white text-sm font-bold">Archivo del Expediente</h5>
                                                        <p className="text-[#9dabb9] text-xs">Validación de cumplimiento total para cierre</p>
                                                    </div>
                                                </div>
                                                <button className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase ${result.ejecucion.archivoAutomatico ? 'bg-green-500/20 text-green-500 border border-green-500/30' : 'bg-gray-500/10 text-gray-500 border border-gray-500/30'
                                                    }`}>
                                                    {result.ejecucion.archivoAutomatico ? 'CERRAR INCIDENTE' : 'PENDIENTE CUMPLIMIENTO'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 bg-amber-900/10 border-t border-amber-900/30 flex items-center justify-center gap-3 text-center">
                                    <span className="material-symbols-outlined text-amber-500 text-sm">security</span>
                                    <span className="text-amber-500 text-[9px] font-black uppercase tracking-widest leading-tight">
                                        IA NO SANCIONA • LA DECISIÓN DE SANCIÓN ES EXCLUSIVA DEL JUEZ • CUMPLIMIENTO LEY 1581/2012 Y ART. 52 DECRETO 2591
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-[#293038] rounded-2xl text-gray-700 p-12 bg-[#111418]/50 min-h-[600px]">
                                <span className="material-symbols-outlined text-8xl opacity-10 mb-6">notification_important</span>
                                <div className="text-center space-y-2">
                                    <p className="font-black uppercase text-xs tracking-[0.4em] opacity-30">Motor de Control de Cumplimiento</p>
                                    <p className="text-[10px] opacity-20 max-w-sm mx-auto text-white">Ingrese la evidencia de incumplimiento para activar el contraste con la orden previa y el análisis sancionatorio.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const TabButton = ({ active, onClick, icon, label, color }: any) => {
    const activeClass = color === 'amber' ? 'border-amber-500 bg-amber-500/5 text-white' : 'border-primary bg-primary/5 text-white';
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all flex-shrink-0 ${active ? activeClass : 'border-transparent text-[#9dabb9] hover:text-white'
                }`}
        >
            <span className="material-symbols-outlined text-sm">{icon}</span>
            <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
        </button>
    );
};

const SectionTitle = ({ title, color }: { title: string, color?: string }) => {
    const textColor = color === 'amber' ? 'text-amber-500' : 'text-primary';
    const bgColor = color === 'amber' ? 'bg-amber-500/40' : 'bg-primary/40';
    return (
        <h4 className={`${textColor} text-[10px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2`}>
            <span className={`w-4 h-[1px] ${bgColor}`} /> {title}
        </h4>
    );
};

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

export default DesacatoInteligenteScreen;
