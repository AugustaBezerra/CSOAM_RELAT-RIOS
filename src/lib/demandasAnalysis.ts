import { DailyReport } from './types';

export interface DemandaRanked {
  nome: string;
  qtd: number;
  setor: string;
}

/**
 * Analisa todos os procedimentos, atendimentos e exames preenchidos no relatório
 * e retorna uma lista ordenada pelas maiores demandas do dia.
 */
export function getRankedDemandas(report: DailyReport): DemandaRanked[] {
  if (!report) return [];

  const itens: DemandaRanked[] = [];

  // 1. Atendimentos Ocupacionais (Médico)
  if (report.atendimentos) {
    const a = report.atendimentos;
    if (Number(a.admissional) > 0) itens.push({ nome: 'admissionais', qtd: Number(a.admissional), setor: 'Atendimentos' });
    if (Number(a.periodico) > 0) itens.push({ nome: 'periódicos', qtd: Number(a.periodico), setor: 'Atendimentos' });
    if (Number(a.demissional) > 0) itens.push({ nome: 'demissionais', qtd: Number(a.demissional), setor: 'Atendimentos' });
    if (Number(a.mudancaRisco) > 0) itens.push({ nome: 'mudança de riscos', qtd: Number(a.mudancaRisco), setor: 'Atendimentos' });
    const consultasQtd = Number(a.consulta ?? a.consultas ?? 0);
    if (consultasQtd > 0) itens.push({ nome: 'consultas clínicas', qtd: consultasQtd, setor: 'Atendimentos' });
    if (Number(a.retorno) > 0) itens.push({ nome: 'retornos', qtd: Number(a.retorno), setor: 'Atendimentos' });
    if (Number(a.pcd) > 0) itens.push({ nome: 'atendimentos PCD', qtd: Number(a.pcd), setor: 'Atendimentos' });
  }

  // 2. Serviços de Enfermagem
  if (report.enfermagem) {
    const e = report.enfermagem;
    if (Number(e.triagem) > 0) itens.push({ nome: 'triagens', qtd: Number(e.triagem), setor: 'Enfermagem' });
    if (Number(e.acuidadeVisual) > 0) itens.push({ nome: 'acuidade visual', qtd: Number(e.acuidadeVisual), setor: 'Enfermagem' });
    if (Number(e.raioX) > 0) itens.push({ nome: 'raio-X', qtd: Number(e.raioX), setor: 'Enfermagem' });
    if (Number(e.ergometrico) > 0) itens.push({ nome: 'testes ergométricos', qtd: Number(e.ergometrico), setor: 'Enfermagem' });
    if (Number(e.ecg) > 0) itens.push({ nome: 'eletrocardiogramas (ECG)', qtd: Number(e.ecg), setor: 'Enfermagem' });
    if (Number(e.eeg) > 0) itens.push({ nome: 'eletroencefalogramas (EEG)', qtd: Number(e.eeg), setor: 'Enfermagem' });
    if (Number(e.espirometria) > 0) itens.push({ nome: 'espirometrias', qtd: Number(e.espirometria), setor: 'Enfermagem' });
    if (Number(e.dinamometria) > 0) itens.push({ nome: 'dinamometrias', qtd: Number(e.dinamometria), setor: 'Enfermagem' });
  }

  // 3. Audiometria
  if (report.audiometria) {
    const au = report.audiometria;
    const totalAudio = 
      (Number(au.admissional) || 0) +
      (Number(au.periodico) || 0) +
      (Number(au.demissional) || 0) +
      (Number(au.mudancaRisco) || 0) +
      (Number(au.terceiro) || 0) +
      (Number(au.terceirosPcd) || 0);

    if (totalAudio > 0) {
      itens.push({ nome: 'audiometrias', qtd: totalAudio, setor: 'Audiometria' });
    }
  }

  // 4. Laboratório (Exames e Coletas)
  if (report.exames) {
    const ex = report.exames;
    if (Number(ex.sangue) > 0) itens.push({ nome: 'exames de sangue', qtd: Number(ex.sangue), setor: 'Laboratório' });
    if (Number(ex.acidos) > 0) itens.push({ nome: 'ácidos (urina)', qtd: Number(ex.acidos), setor: 'Laboratório' });
    if (Number(ex.epf) > 0) itens.push({ nome: 'exames parasitológicos (EPF)', qtd: Number(ex.epf), setor: 'Laboratório' });
    if (Number(ex.eas) > 0) itens.push({ nome: 'sumário de urina (EAS)', qtd: Number(ex.eas), setor: 'Laboratório' });
    if (Number(ex.coprocultura) > 0) itens.push({ nome: 'coproculturas', qtd: Number(ex.coprocultura), setor: 'Laboratório' });
    if (Number(ex.toxicologico) > 0) itens.push({ nome: 'exames toxicológicos', qtd: Number(ex.toxicologico), setor: 'Laboratório' });
    if (Number(ex.baar) > 0) itens.push({ nome: 'exames de BAAR', qtd: Number(ex.baar), setor: 'Laboratório' });
    if (Number(ex.micologico) > 0) itens.push({ nome: 'exames micológicos', qtd: Number(ex.micologico), setor: 'Laboratório' });
  }

  // Se não houve exames de sangue computados mas houve coletas registradas
  if (report.coletas) {
    const totalColetas = (Number(report.coletas.ocupacional) || 0) + (Number(report.coletas.particular) || 0);
    const temExameSangue = (Number(report.exames?.sangue) || 0) > 0;
    if (totalColetas > 0 && !temExameSangue) {
      itens.push({ nome: 'coletas laboratoriais', qtd: totalColetas, setor: 'Laboratório' });
    }
  }

  // Ordena por quantidade decrescente
  return itens.sort((a, b) => b.qtd - a.qtd);
}

/**
 * Gera a frase oficial para a faixa "ANÁLISE DO DIA"
 * Exemplo: "exames de sangue e triagens." ou "admissionais, triagens e exames de sangue."
 */
export function computePrincipaisDemandas(report: DailyReport): string {
  const ranked = getRankedDemandas(report);

  if (ranked.length === 0) {
    return 'sem demandas registradas no plantão.';
  }

  if (ranked.length === 1) {
    return `${ranked[0].nome}.`;
  }

  if (ranked.length === 2) {
    return `${ranked[0].nome} e ${ranked[1].nome}.`;
  }

  // 3 ou mais: se o 3º colocado tiver volume relevante (>= 35% do 2º ou >= 5), inclui o top 3
  const [top1, top2, top3] = ranked;
  if (top3.qtd >= 5 || top3.qtd >= top2.qtd * 0.35) {
    return `${top1.nome}, ${top2.nome} e ${top3.nome}.`;
  }

  return `${top1.nome} e ${top2.nome}.`;
}
