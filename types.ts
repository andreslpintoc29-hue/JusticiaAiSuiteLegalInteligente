
export interface LegalAnalysisResult {
  summary: string;
  rightsIdentified: string[];
  competenceAnalysis: string;
  suggestedAction: string;
  draftContent: string;
}

export enum ProcessType {
  TUTELA = 'tutela',
  HABEAS_CORPUS = 'habeas-corpus',
  DESACATOS = 'desacatos',
  CORTE_CONSTITUCIONAL = 'corte-constitucional',
  APOYO_JUDICIAL = 'apoyo-judicial',
  TUTELA_INTEGRAL = 'tutela-integral',
  HABEAS_CORPUS_INTELIGENTE = 'habeas-corpus-inteligente',
  DESACATO_INTELIGENTE = 'desacato-inteligente'
}

export interface DesacatoInteligenteResult {
  resumen: {
    tutelaBase: string;
    ordenIncumplida: string;
    autoridadResponsable: string;
    fechaLimite: string;
    pruebasIncumplimiento: string;
  };
  procedencia: {
    ordenClaraExpresaExigible: string;
    notificacionValida: string;
    vencimientoPlazo: string;
    sujetoObligadoIdentificado: string;
    alertas: string[];
  };
  seguimiento: {
    lineaTiempo: { fecha: string; evento: string }[];
    evidenciaAportada: string[];
    estadoCumplimiento: 'cumplido' | 'parcial' | 'incumplido';
    alertaDilacion: string | null;
  };
  analisisJuridico: {
    reglasConstitucionales: string;
    limitesSanciones: string;
    proporcionalidadRatio: string;
    jurisprudencia: { referencia: string; resumen: string }[];
  };
  riesgos: {
    tipo: string;
    descripcion: string;
    nivelRiesgo: 'bajo' | 'medio' | 'alto';
  }[];
  borradores: {
    tipo: string;
    contenido: string;
  }[];
  ejecucion: {
    registroSancion: string;
    confirmacionCumplimiento: string;
    archivoAutomatico: boolean;
  };
}

export interface HabeasCorpusInteligenteResult {
  resumen: {
    personaPrivadaLibertad: string;
    autoridadOrdenaEjecuta: string;
    lugarReclusion: string;
    fechaCausaCaptura: string;
  };
  controlLegalidad: {
    alertas: string[];
    analisis: string;
  };
  controlTiempo: {
    horasTranscurridas: number;
    horasRestantes: number;
    limiteHoras: 36;
    isVencido: boolean;
  };
  normativaJurisprudencia: {
    normas: string[];
    jurisprudencia: {
      referencia: string;
      resumen: string;
    }[];
  };
  riesgosGraves: {
    tipo: string;
    descripcion: string;
  }[];
  borradores: {
    tipo: string;
    contenido: string;
  }[];
  notificacionCumplimiento: {
    oficios: string[];
    accionesSeguimiento: string[];
  };
}

export interface TutelaIntegralResult {
  resumen: {
    accionante: string;
    accionado: string;
    derechosVulnerados: string[];
    hechosClave: string;
    pretensiones: string;
  };
  procedibilidad: {
    subsidiariedad: string;
    inmediatez: string;
    otrosMedios: string;
    perjuicioIrremediable: string;
    competencia: string;
    legitimacion: string;
    alertas: string[];
  };
  terminos: {
    diasRestantes: number;
    vencimiento: string;
    prioridad: 'baja' | 'media' | 'alta' | 'urgente';
    razonPrioridad: string;
  };
  jurisprudencia: {
    referencia: string;
    tribunal: string;
    precedenteObligatorio: boolean;
    resumen: string;
    similitud: number;
  }[];
  riesgosProcesales: {
    tipo: string;
    descripcion: string;
    nivelRiesgo: 'bajo' | 'medio' | 'alto';
  }[];
  borradores: {
    tipo: string;
    contenido: string;
  }[];
  seguimiento: {
    oficiosGenerados: string[];
    hitosCumplimiento: string[];
  };
}

export interface JudicialSupportResult {
  automaticSummary: {
    facts: string;
    legalProblem: string;
    ratioDecidendi: string;
    appliedNorms: string;
    decision: string;
  };
  semanticSearch: {
    court: string;
    reference: string;
    similarity: number;
    isMandatoryPrecedent: boolean;
    explanation: string;
  }[];
  criteriaComparison: {
    type: 'obligatorio' | 'reiterado' | 'divergente';
    description: string;
  }[];
  normativeAnalysis: {
    norm: string;
    validity: string;
    alerts: string[];
  }[];
  certaintyLevel: 'alto' | 'medio' | 'bajo';
  humanSupervisionWarning: string;
}
