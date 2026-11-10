import { DailyReport } from './types';

// Retorna a data atual no fuso horário oficial de Manaus (America/Manaus - UTC-4)
export const getManausDateToday = (): string => {
  try {
    const d = new Date();
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Manaus',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return formatter.format(d); // Formato YYYY-MM-DD
  } catch (e) {
    return new Date().toISOString().split('T')[0];
  }
};

// Formulário inicial ZERADO para o dia de hoje (Manaus)
export const getEmptyDailyReport = (): DailyReport => {
  const today = getManausDateToday();
  return {
    data: today,
    unidade: 'CSOAM – Matriz',
    responsavel: 'Equipe de Atendimento',
    turno: 'Integral',
    medicoPlantao: 'dr_cleverson',
    status: 'draft',
    atendimentos: {
      admissional: 0,
      periodico: 0,
      demissional: 0,
      mudancaRisco: 0,
      consultas: 0,
    },
    enfermagem: {
      triagem: 0,
      acuidadeVisual: 0,
      raioX: 0,
      ergometrico: 0,
      ecg: 0,
      eeg: 0,
      espirometria: 0,
      dinamometria: 0,
    },
    audiometria: {
      admissional: 0,
      periodico: 0,
      demissional: 0,
    },
    coletas: {
      ocupacional: 0,
      particular: 0,
    },
    exames: {
      sangue: 0,
      acidos: 0,
      epf: 0,
      eas: 0,
      coprocultura: 0,
      toxicologico: 0,
      baar: 0,
      micologico: 0,
      outros: [],
    },
    empresas: [],
    observacoes: '',
  };
};

export const emptyDailyReport = getEmptyDailyReport();

// Relatório histórico do dia 09/11 para consulta no Histórico / Relatórios
export const initialReportData: DailyReport = {
  id: 'rel_09_11_2026',
  data: '2026-11-09',
  unidade: 'CSOAM – Matriz',
  responsavel: 'Rosineide Souza',
  turno: 'Integral',
  medicoPlantao: 'dr_cleverson',
  status: 'finalized',
  atendimentos: {
    admissional: 31,
    periodico: 6,
    demissional: 6,
    mudancaRisco: 1,
    consultas: 0,
  },
  enfermagem: {
    triagem: 44,
    acuidadeVisual: 18,
    raioX: 6,
    ergometrico: 10,
    ecg: 6,
    eeg: 5,
    espirometria: 0,
    dinamometria: 0,
  },
  audiometria: {
    admissional: 9,
    periodico: 3,
    demissional: 1,
  },
  coletas: {
    ocupacional: 22,
    particular: 0,
  },
  exames: {
    sangue: 58,
    acidos: 0,
    epf: 3,
    eas: 1,
    coprocultura: 2,
    toxicologico: 0,
    baar: 0,
    micologico: 0,
    outros: [],
  },
  empresas: [
    { id: '1', nome: 'Particular', qtd: 14 },
    { id: '2', nome: 'Vlademir', qtd: 6 },
    { id: '3', nome: 'Alta Med', qtd: 5 },
    { id: '4', nome: 'Mantris', qtd: 4 },
    { id: '5', nome: 'Care Plus', qtd: 3 },
    { id: '6', nome: 'RMP', qtd: 2 },
    { id: '7', nome: 'Porto', qtd: 1 },
    { id: '8', nome: 'Mestra', qtd: 1 },
    { id: '9', nome: 'PL Brasil', qtd: 1 },
    { id: '10', nome: 'Valgroup', qtd: 3 },
    { id: '11', nome: 'Akmos', qtd: 2 },
    { id: '12', nome: 'Medical Clin', qtd: 2 },
  ],
  observacoes: '• Fluxo operacional transcorreu normalmente nos turnos matutino e vespertino.\n• Todos os atendimentos admissionais e periódicos concluídos com sucesso.\n• Sem intercorrências médicas graves registradas no plantão.',
  analiseDia: {
    producaoOk: true,
    principaisDemandas: 'admissionais e triagens.',
    conciliacao: 'Verificar e conciliar eventuais divergências de registros (ex.: atendimentos x empresas).',
  },
};
