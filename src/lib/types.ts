export interface AtendimentosData {
  admissional: number;
  periodico: number;
  demissional: number;
  mudancaRisco: number;
  consultas: number;
}

export interface EnfermagemData {
  triagem: number;
  acuidadeVisual: number;
  raioX: number;
  ergometrico: number;
  ecg: number;
  eeg: number;
  espirometria: number;
  dinamometria: number;
}

export interface AudiometriaData {
  admissional: number;
  periodico: number;
  demissional: number;
}

export interface ColetasData {
  ocupacional: number;
  particular: number;
}

export interface ExamesData {
  sangue: number;
  acidos: number;
  epf: number;
  eas: number;
  coprocultura: number;
  toxicologico: number;
  baar: number;
  micologico: number;
  outros?: { nome: string; qtd: number }[];
}

export interface EmpresaItem {
  id: string;
  nome: string;
  qtd: number;
}

export interface DailyReport {
  id?: string;
  data: string; // YYYY-MM-DD or DD/MM/YYYY
  unidade: string;
  responsavel: string;
  turno: string;
  medicoPlantao?: 'dr_cleverson' | 'dra_jessica' | 'ambos' | string;
  status: 'draft' | 'finalized';
  atendimentos: AtendimentosData;
  enfermagem: EnfermagemData;
  audiometria: AudiometriaData;
  coletas: ColetasData;
  exames: ExamesData;
  empresas: EmpresaItem[];
  observacoes: string;
  analiseDia?: {
    producaoOk: boolean;
    principaisDemandas: string;
    conciliacao: string;
  };
  criadoEm?: any;
  atualizadoEm?: any;
}
