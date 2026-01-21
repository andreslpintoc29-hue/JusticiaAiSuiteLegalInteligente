
import React, { useState, useRef } from 'react';
import { analyzeJudicialSupport, extractTextFromFile } from '../services/geminiService';
import { JudicialSupportResult } from '../types';

const ApoyoJudicialScreen: React.FC = () => {
    const [text, setText] = useState<string>("");
    const [processType, setProcessType] = useState("Civil");
    const [topic, setTopic] = useState("");
    const [claims, setClaims] = useState("");

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isExtracting, setIsExtracting] = useState(false);
    const [result, setResult] = useState<JudicialSupportResult | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleRunAnalysis = async () => {
        if (!text.trim() && !claims.trim()) {
            return alert("Por favor complete los hechos (o cargue un PDF) y las pretensiones.");
        }
        setIsAnalyzing(true);
        try {
            const data = await analyzeJudicialSupport(text, { type: processType, topic, claims });
            setResult(data);
        } catch (err: any) {
            alert("Error en el análisis de apoyo: " + (err.message || "Error desconocido"));
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleClear = () => {
        setText("");
        setTopic("");
        setClaims("");
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
                    alert("Error al extraer texto del PDF.");
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
                            <span className="material-symbols-outlined text-xs">book</span>
                            <span>Investigación Jurídica</span>
                            <span className="material-symbols-outlined text-xs">chevron_right</span>
                            <span>Módulo de Apoyo (No Decisorio)</span>
                        </div>
                        <h1 className="text-white text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
                            Apoyo Judicial Inteligente
                            <span className="bg-primary/20 text-primary text-[10px] px-2 py-1 rounded-full border border-primary/30">BETA</span>
                        </h1>
                        <p className="text-[#9dabb9] text-xs font-semibold uppercase tracking-widest leading-relaxed">
                            análisis jurisprudencial y normativo para juzgados
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={handleFileChange} />
                        <button onClick={() => fileInputRef.current?.click()} disabled={isExtracting || isAnalyzing} className="flex items-center gap-2 bg-primary/10 border border-primary/40 text-primary px-4 py-2 rounded-lg text-xs font-black uppercase hover:bg-primary/20 transition-all disabled:opacity-50">
                            <span className="material-symbols-outlined text-sm">{isExtracting ? 'sync' : 'upload_file'}</span>
                            {isExtracting ? 'Procesando PDF...' : 'Cargar Expediente'}
                        </button>
                        <button onClick={handleClear} className="flex items-center gap-2 bg-red-500/10 border border-red-500/50 hover:bg-red-500/20 text-red-500 px-4 py-2 rounded-lg text-xs font-black uppercase transition-all">
                            <span className="material-symbols-outlined text-sm">delete_sweep</span> Limpiar
                        </button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-8">
                    {/* Form Column */}
                    <div className="lg:col-span-5 flex flex-col gap-6">
                        <div className="bg-[#1e242b] rounded-2xl border border-[#293038] overflow-hidden shadow-2xl">
                            <div className="p-4 bg-[#161b21] border-b border-[#293038]">
                                <h3 className="text-white font-bold text-[10px] uppercase tracking-widest">Parámetros del Caso</h3>
                            </div>
                            <div className="p-6 flex flex-col gap-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[#9dabb9] text-[10px] font-bold uppercase">Tipo de Proceso</label>
                                        <select
                                            value={processType}
                                            onChange={(e) => setProcessType(e.target.value)}
                                            className="bg-[#111418] border border-[#293038] text-white text-xs rounded-lg p-2.5 focus:ring-primary focus:border-primary outline-none"
                                        >
                                            <option>Civil</option>
                                            <option>Penal</option>
                                            <option>Laboral</option>
                                            <option>Administrativo</option>
                                            <option>Familia</option>
                                            <option>Constitucional</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[#9dabb9] text-[10px] font-bold uppercase">Tema Jurídico</label>
                                        <input
                                            type="text"
                                            placeholder="Ej: Responsabilidad Extracontractual"
                                            value={topic}
                                            onChange={(e) => setTopic(e.target.value)}
                                            className="bg-[#111418] border border-[#293038] text-white text-xs rounded-lg p-2.5 outline-none focus:border-primary"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[#9dabb9] text-[10px] font-bold uppercase">Pretensiones</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Describa las pretensiones de la demanda..."
                                        value={claims}
                                        onChange={(e) => setClaims(e.target.value)}
                                        className="bg-[#111418] border border-[#293038] text-white text-xs rounded-lg p-3 outline-none focus:border-primary resize-none"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[#9dabb9] text-[10px] font-bold uppercase">Hechos / Expediente</label>
                                    <textarea
                                        rows={12}
                                        placeholder="Pegue aquí el contenido del expediente o hechos relevantes..."
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                        className="bg-[#111418] border border-[#293038] text-white text-xs rounded-lg p-3 outline-none focus:border-primary resize-none font-mono"
                                    />
                                </div>
                                <button
                                    onClick={handleRunAnalysis}
                                    disabled={isAnalyzing || isExtracting || (!text.trim() && !claims.trim())}
                                    className="w-full bg-primary hover:bg-blue-600 text-white font-black py-4 rounded-xl flex items-center justify-center gap-3 transition-all disabled:opacity-20 shadow-xl shadow-blue-900/20 uppercase text-xs mt-2"
                                >
                                    <span className="material-symbols-outlined">{isAnalyzing ? 'sync' : 'calculate'}</span>
                                    {isAnalyzing ? 'Analizando Precedentes...' : 'Iniciar Análisis de Apoyo'}
                                </button>
                            </div>
                        </div>

                        {/* Law 1581 and Audit Info */}
                        <div className="bg-amber-900/10 border border-amber-900/30 p-4 rounded-xl flex items-start gap-3">
                            <span className="material-symbols-outlined text-amber-500 text-sm">info</span>
                            <div className="flex flex-col gap-1">
                                <p className="text-amber-500 text-[10px] font-bold uppercase tracking-wider">Cumplimiento Ley 1581 de 2012</p>
                                <p className="text-amber-200/60 text-[9px] leading-relaxed">Este sistema anonimiza automáticamente datos sensibles para protección de la privacidad. Todo uso es registrado y auditado para fines de transparencia judicial.</p>
                            </div>
                        </div>
                    </div>

                    {/* Results Column */}
                    <div className="lg:col-span-7 flex flex-col gap-6">
                        {result ? (
                            <div className="animate-fade-in flex flex-col gap-6 h-full">
                                {/* Certainty & Warning Banner */}
                                <div className={`p-4 rounded-xl border flex items-center justify-between ${result.certaintyLevel === 'alto' ? 'bg-green-500/10 border-green-500/30 text-green-500' :
                                    result.certaintyLevel === 'medio' ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' :
                                        'bg-red-500/10 border-red-500/30 text-red-500'
                                    }`}>
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-sm">Verified</span>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase tracking-widest">Certeza Jurídica: {result.certaintyLevel}</span>
                                            <span className="text-[9px] opacity-80">{result.humanSupervisionWarning}</span>
                                        </div>
                                    </div>
                                    <div className="text-[10px] font-bold">CARACTER NO VINCULANTE</div>
                                </div>

                                {/* Tabs Content Simulation */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Summary Card */}
                                    <div className="bg-[#1e242b] border border-[#293038] rounded-2xl overflow-hidden shadow-xl lg:col-span-2">
                                        <div className="p-4 bg-[#161b21] border-b border-[#293038] flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm text-primary">description</span>
                                            <h4 className="text-white font-bold text-[10px] uppercase tracking-widest">Resumen Automático del Caso</h4>
                                        </div>
                                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div>
                                                    <h5 className="text-primary text-[9px] font-black uppercase mb-1">Hechos Relevantes</h5>
                                                    <p className="text-gray-300 text-xs leading-relaxed">{result.automaticSummary.facts}</p>
                                                </div>
                                                <div>
                                                    <h5 className="text-primary text-[9px] font-black uppercase mb-1">Problema Jurídico</h5>
                                                    <p className="text-gray-300 text-xs leading-relaxed">{result.automaticSummary.legalProblem}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div>
                                                    <h5 className="text-primary text-[9px] font-black uppercase mb-1">Ratio Decidendi</h5>
                                                    <p className="text-gray-300 text-xs leading-relaxed">{result.automaticSummary.ratioDecidendi}</p>
                                                </div>
                                                <div>
                                                    <h5 className="text-primary text-[9px] font-black uppercase mb-1">Normativa Sugerida</h5>
                                                    <p className="text-gray-300 text-xs leading-relaxed">{result.automaticSummary.appliedNorms}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Semantic Search Card */}
                                    <div className="md:col-span-2 bg-[#1e242b] border border-[#293038] rounded-2xl overflow-hidden shadow-xl">
                                        <div className="p-4 bg-[#161b21] border-b border-[#293038] flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm text-amber-500">travel_explore</span>
                                            <h4 className="text-white font-bold text-[10px] uppercase tracking-widest">Jurisprudencia Identificada (Similitud Semántica)</h4>
                                        </div>
                                        <div className="divide-y divide-[#293038]">
                                            {result.semanticSearch.map((sent, idx) => (
                                                <div key={idx} className="p-6 hover:bg-[#222931] transition-colors">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-white font-bold text-sm">{sent.reference}</span>
                                                                <span className="bg-[#111418] text-[#9dabb9] text-[9px] px-2 py-0.5 rounded border border-[#293038] font-bold">{sent.court}</span>
                                                            </div>
                                                            {sent.isMandatoryPrecedent && (
                                                                <span className="bg-primary/20 text-primary text-[9px] px-2 py-0.5 rounded-full border border-primary/30 font-black uppercase tracking-tighter italic">Precedente Obligatorio</span>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col items-end">
                                                            <div className="text-white font-black text-xl">{sent.similarity}%</div>
                                                            <div className="text-[9px] text-[#9dabb9] uppercase font-bold">Similitud</div>
                                                        </div>
                                                    </div>
                                                    <p className="text-gray-400 text-xs leading-relaxed mb-4">{sent.explanation}</p>
                                                    <button className="text-primary text-[10px] font-black uppercase flex items-center gap-1 hover:underline">
                                                        Ver Sentencia Completa <span className="material-symbols-outlined text-xs">open_in_new</span>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Criteria Card */}
                                    <div className="bg-[#1e242b] border border-[#293038] rounded-2xl overflow-hidden shadow-xl">
                                        <div className="p-4 bg-[#161b21] border-b border-[#293038] flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm text-purple-500">compare_arrows</span>
                                            <h4 className="text-white font-bold text-[10px] uppercase tracking-widest">Comparación de Criterios</h4>
                                        </div>
                                        <div className="p-6 flex flex-col gap-4">
                                            {result.criteriaComparison.map((crit, idx) => (
                                                <div key={idx} className="flex gap-4">
                                                    <div className={`w-1 h-auto rounded-full ${crit.type === 'obligatorio' ? 'bg-red-500' :
                                                        crit.type === 'reiterado' ? 'bg-blue-500' : 'bg-amber-500'
                                                        }`} />
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-white font-black text-[9px] uppercase tracking-wider">{crit.type}</span>
                                                        <p className="text-gray-400 text-xs">{crit.description}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Normative Card */}
                                    <div className="bg-[#1e242b] border border-[#293038] rounded-2xl overflow-hidden shadow-xl">
                                        <div className="p-4 bg-[#161b21] border-b border-[#293038] flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm text-red-500">gavel</span>
                                            <h4 className="text-white font-bold text-[10px] uppercase tracking-widest">Análisis de Vigencia Normativa</h4>
                                        </div>
                                        <div className="p-6 flex flex-col gap-4">
                                            {result.normativeAnalysis.map((norm, idx) => (
                                                <div key={idx} className="bg-[#111418] p-4 rounded-xl border border-[#293038]">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-white font-bold text-[11px]">{norm.norm}</span>
                                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded ${norm.validity.toLowerCase().includes('vigente') ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                                                            }`}>{norm.validity.toUpperCase()}</span>
                                                    </div>
                                                    {norm.alerts.map((alert, aidx) => (
                                                        <div key={aidx} className="flex items-center gap-2 text-amber-500 text-[10px] mt-1">
                                                            <span className="material-symbols-outlined text-xs">warning</span>
                                                            <span>{alert}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-[#293038] rounded-2xl text-gray-700 p-12 bg-[#111418]/50 min-h-[600px]">
                                <span className="material-symbols-outlined text-8xl opacity-10 mb-6">psychology</span>
                                <div className="text-center space-y-2">
                                    <p className="font-black uppercase text-xs tracking-[0.4em] opacity-30">Motor de Razonamiento Precedencial</p>
                                    <p className="text-[10px] opacity-20 max-w-xs mx-auto">Seleccione tipo de proceso y cargue el expediente para iniciar la auditoría de jurisprudencia y normas vigentes.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApoyoJudicialScreen;
