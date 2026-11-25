import { DailyReport, EmpresaItem } from './types';
import { computePrincipaisDemandas } from './demandasAnalysis';

export const MONTH_NAMES_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

/**
 * Extrai a chave de ano e mês no formato YYYY-MM
 * Suporta formatos 'YYYY-MM-DD' e 'DD/MM/YYYY'
 */
export function getYearMonthKey(dateStr: string): string {
  if (!dateStr) return '';
  const clean = dateStr.trim();
  if (clean.includes('-')) {
    const parts = clean.split('-');
    if (parts.length >= 2) {
      return `${parts[0]}-${parts[1].padStart(2, '0')}`;
    }
  }
  if (clean.includes('/')) {
    const parts = clean.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}`;
    }
  }
  return '';
}

/**
 * Formata '2026-11' como 'Novembro / 2026'
 */
export function formatMonthDisplay(yearMonthKey: string): string {
  if (!yearMonthKey || !yearMonthKey.includes('-')) return yearMonthKey || 'Mês Atual';
  const [year, month] = yearMonthKey.split('-');
  const idx = parseInt(month, 10) - 1;
  const monthName = MONTH_NAMES_PT[idx] || month;
  return `${monthName} / ${year}`;
}

export interface MonthOption {
  key: string; // '2026-11'
  label: string; // 'Novembro / 2026'
  count: number;
}

/**
 * Retorna todos os meses disponíveis a partir da lista de relatórios,
 * ordenados do mais recente para o mais antigo.
 */
export function getAvailableMonths(reports: DailyReport[]): MonthOption[] {
  const map = new Map<string, number>();

  reports.forEach(r => {
    const key = getYearMonthKey(r.data);
    if (key) {
      map.set(key, (map.get(key) || 0) + 1);
    }
  });

  return Array.from(map.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([key, count]) => ({
      key,
      label: formatMonthDisplay(key),
      count
    }));
}

export interface ConsolidatedMonthlyReport extends DailyReport {
  monthKey: string;
  monthLabel: string;
  totalDiasRegistrados: number;
  diasComputados: string[];
}

/**
 * Agrega e consolida todos os relatórios pertencentes ao mês selecionado.
 */
export function aggregateMonthlyReport(
  reports: DailyReport[],
  targetMonthKey: string
): ConsolidatedMonthlyReport | null {
  const monthReports = reports.filter(r => getYearMonthKey(r.data) === targetMonthKey);
  if (monthReports.length === 0) return null;

  // Dias únicos computados
  const diasUnicos = Array.from(new Set(monthReports.map(r => r.data))).sort();

  const consolidated: ConsolidatedMonthlyReport = {
    id: `consolidado_${targetMonthKey}`,
    data: targetMonthKey,
    unidade: monthReports[0]?.unidade || 'CSOAM – Matriz',
    responsavel: 'Equipe Multidisciplinar CSOAM',
    turno: 'Integral (Consolidado Mensal)',
    medicoPlantao: 'ambos',
    status: 'finalized',
    monthKey: targetMonthKey,
    monthLabel: formatMonthDisplay(targetMonthKey),
    totalDiasRegistrados: diasUnicos.length,
    diasComputados: diasUnicos,
    atendimentos: {
      admissional: 0,
      periodico: 0,
      demissional: 0,
      mudancaRisco: 0,
      consulta: 0,
      retorno: 0,
      pcd: 0,
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
      mudancaRisco: 0,
      terceiro: 0,
      terceirosPcd: 0,
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
    analiseDia: {
      producaoOk: true,
      principaisDemandas: '',
      conciliacao: 'Consolidação mensal gerada a partir dos relatórios diários arquivados.',
    },
  };

  const empresasMap = new Map<string, number>();
  const outrosExamesMap = new Map<string, number>();
  const observacoesList: string[] = [];

  monthReports.forEach(r => {
    // 1. Atendimentos
    if (r.atendimentos) {
      consolidated.atendimentos.admissional += Number(r.atendimentos.admissional) || 0;
      consolidated.atendimentos.periodico += Number(r.atendimentos.periodico) || 0;
      consolidated.atendimentos.demissional += Number(r.atendimentos.demissional) || 0;
      consolidated.atendimentos.mudancaRisco += Number(r.atendimentos.mudancaRisco) || 0;
      const c = Number(r.atendimentos.consulta ?? r.atendimentos.consultas ?? 0);
      consolidated.atendimentos.consulta += c;
      consolidated.atendimentos.retorno += Number(r.atendimentos.retorno) || 0;
      consolidated.atendimentos.pcd += Number(r.atendimentos.pcd) || 0;
    }

    // 2. Enfermagem
    if (r.enfermagem) {
      consolidated.enfermagem.triagem += Number(r.enfermagem.triagem) || 0;
      consolidated.enfermagem.acuidadeVisual += Number(r.enfermagem.acuidadeVisual) || 0;
      consolidated.enfermagem.raioX += Number(r.enfermagem.raioX) || 0;
      consolidated.enfermagem.ergometrico += Number(r.enfermagem.ergometrico) || 0;
      consolidated.enfermagem.ecg += Number(r.enfermagem.ecg) || 0;
      consolidated.enfermagem.eeg += Number(r.enfermagem.eeg) || 0;
      consolidated.enfermagem.espirometria += Number(r.enfermagem.espirometria) || 0;
      consolidated.enfermagem.dinamometria += Number(r.enfermagem.dinamometria) || 0;
    }

    // 3. Audiometria
    if (r.audiometria) {
      consolidated.audiometria.admissional += Number(r.audiometria.admissional) || 0;
      consolidated.audiometria.periodico += Number(r.audiometria.periodico) || 0;
      consolidated.audiometria.demissional += Number(r.audiometria.demissional) || 0;
      consolidated.audiometria.mudancaRisco += Number(r.audiometria.mudancaRisco) || 0;
      consolidated.audiometria.terceiro += Number(r.audiometria.terceiro) || 0;
      consolidated.audiometria.terceirosPcd += Number(r.audiometria.terceirosPcd) || 0;
    }

    // 4. Coletas
    if (r.coletas) {
      consolidated.coletas.ocupacional += Number(r.coletas.ocupacional) || 0;
      consolidated.coletas.particular += Number(r.coletas.particular) || 0;
    }

    // 5. Exames
    if (r.exames) {
      consolidated.exames.sangue += Number(r.exames.sangue) || 0;
      consolidated.exames.acidos += Number(r.exames.acidos) || 0;
      consolidated.exames.epf += Number(r.exames.epf) || 0;
      consolidated.exames.eas += Number(r.exames.eas) || 0;
      consolidated.exames.coprocultura += Number(r.exames.coprocultura) || 0;
      consolidated.exames.toxicologico += Number(r.exames.toxicologico) || 0;
      consolidated.exames.baar += Number(r.exames.baar) || 0;
      consolidated.exames.micologico += Number(r.exames.micologico) || 0;

      if (Array.isArray(r.exames.outros)) {
        r.exames.outros.forEach(out => {
          if (out.nome && out.qtd) {
            const trimmed = out.nome.trim();
            outrosExamesMap.set(trimmed, (outrosExamesMap.get(trimmed) || 0) + Number(out.qtd));
          }
        });
      }
    }

    // 6. Empresas (agrupadas e somadas por nome)
    if (Array.isArray(r.empresas)) {
      r.empresas.forEach(emp => {
        if (emp.nome) {
          const nomeClean = emp.nome.trim();
          empresasMap.set(nomeClean, (empresasMap.get(nomeClean) || 0) + (Number(emp.qtd) || 0));
        }
      });
    }

    // 7. Observações
    if (r.observacoes && r.observacoes.trim()) {
      r.observacoes.split('\n').forEach(line => {
        const trimmed = line.trim().replace(/^[•\-\*]\s*/, '');
        if (trimmed && !observacoesList.includes(trimmed)) {
          observacoesList.push(trimmed);
        }
      });
    }
  });

  // Outros exames consolidados
  consolidated.exames.outros = Array.from(outrosExamesMap.entries()).map(([nome, qtd]) => ({
    nome,
    qtd
  }));

  // Lista de empresas consolidadas ordenada por quantidade decrescente
  const empresasConsolidadas: EmpresaItem[] = Array.from(empresasMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([nome, qtd], index) => ({
      id: `emp_${index + 1}`,
      nome,
      qtd
    }));
  consolidated.empresas = empresasConsolidadas;

  // Observações do mês
  const defaultObs = [
    `• Consolidado mensal referente a ${diasUnicos.length} dia(s) de produção operacional em ${formatMonthDisplay(targetMonthKey)}.`,
    `• Atendimentos de medicina ocupacional, enfermagem, fonoaudiologia e exames laboratoriais integrados.`,
  ];
  if (observacoesList.length > 0) {
    const topObs = observacoesList.slice(0, 3).map(o => `• ${o}`);
    consolidated.observacoes = [...defaultObs, ...topObs].join('\n');
  } else {
    consolidated.observacoes = defaultObs.join('\n');
  }

  // Principais demandas acumuladas do mês
  const demandasCalculadas = computePrincipaisDemandas(consolidated);
  consolidated.analiseDia = {
    producaoOk: true,
    principaisDemandas: demandasCalculadas,
    conciliacao: `Total de ${diasUnicos.length} dias computados no mês.`,
  };

  return consolidated;
}
