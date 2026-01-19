
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
  DESACATOS = 'desacatos'
}
