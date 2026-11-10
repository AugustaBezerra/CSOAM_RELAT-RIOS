"use client";

import React, { useRef, useState } from 'react';
import { Download, Image as ImageIcon, ArrowLeft, Printer, CheckCircle, Stethoscope, HeartPulse, Ear, Users } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { DailyReport } from '@/lib/types';
import { basePath } from '@/lib/constants';

interface ReportViewProps {
  report: DailyReport;
  onBackToEdit: () => void;
}

export const ReportView: React.FC<ReportViewProps> = ({ report, onBackToEdit }) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  // Totais calculados
  const totalAtendimentos = 
    (Number(report.atendimentos.admissional) || 0) +
    (Number(report.atendimentos.periodico) || 0) +
    (Number(report.atendimentos.demissional) || 0) +
    (Number(report.atendimentos.mudancaRisco) || 0) +
    (Number(report.atendimentos.consultas) || 0);

  const totalEnfermagem = 
    (Number(report.enfermagem.triagem) || 0) +
    (Number(report.enfermagem.acuidadeVisual) || 0) +
    (Number(report.enfermagem.raioX) || 0) +
    (Number(report.enfermagem.ergometrico) || 0) +
    (Number(report.enfermagem.ecg) || 0) +
    (Number(report.enfermagem.eeg) || 0) +
    (Number(report.enfermagem.espirometria) || 0) +
    (Number(report.enfermagem.dinamometria) || 0);

  const totalAudiometria = 
    (Number(report.audiometria.admissional) || 0) +
    (Number(report.audiometria.periodico) || 0) +
    (Number(report.audiometria.demissional) || 0);

  const totalColetas = 
    (Number(report.coletas.ocupacional) || 0) +
    (Number(report.coletas.particular) || 0);

  const totalExames = 
    (Number(report.exames.sangue) || 0) +
    (Number(report.exames.acidos) || 0) +
    (Number(report.exames.epf) || 0) +
    (Number(report.exames.eas) || 0) +
    (Number(report.exames.coprocultura) || 0) +
    (Number(report.exames.toxicologico) || 0) +
    (Number(report.exames.baar) || 0) +
    (Number(report.exames.micologico) || 0) +
    (report.exames.outros?.reduce((acc, curr) => acc + (Number(curr.qtd) || 0), 0) || 0);

  const formatPct = (val: number, total: number) => {
    if (!total || total === 0) return '(0,0%)';
    return `(${((val / total) * 100).toFixed(1).replace('.', ',')}%)`;
  };

  const getMedicoInfo = () => {
    switch (report.medicoPlantao) {
      case 'dra_jessica':
        return {
          nome: 'Dra. Jessica Yasmin',
          cargo: 'Médica Examinadora / Coord.'
        };
      case 'ambos':
        return {
          nome: 'Dr. Cleverson Redivo & Dra. Jessica Yasmin',
          cargo: 'Médicos Examinadores / Coord.'
        };
      case 'dr_cleverson':
      default:
        return {
          nome: 'Dr. Cleverson Redivo',
          cargo: 'Médico Examinador / Coord.'
        };
    }
  };
  const medicoInfo = getMedicoInfo();

  const formatDateDisplay = (d: string) => {
    if (!d) return '09/11/2026';
    if (d.includes('-')) {
      const [year, month, day] = d.split('-');
      return `${day}/${month}/${year}`;
    }
    return d;
  };

  // Funções de exportação
  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    setDownloading(true);
    try {
      const element = printRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Relatorio_CSOAM_${report.data.replace(/[/\\-]/g, '_')}.pdf`);
    } catch (e) {
      console.error("PDF generation error:", e);
      alert("Erro ao gerar PDF.");
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadPNG = async () => {
    if (!printRef.current) return;
    setDownloading(true);
    try {
      const element = printRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      const link = document.createElement('a');
      link.download = `Relatorio_CSOAM_${report.data.replace(/[/\\-]/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error("PNG generation error:", e);
      alert("Erro ao gerar imagem.");
    } finally {
      setDownloading(false);
    }
  };

  // Divisão das empresas em 2 colunas
  const half = Math.ceil(report.empresas.length / 2);
  const empresasCol1 = report.empresas.slice(0, half);
  const empresasCol2 = report.empresas.slice(half);

  // Lista de procedimentos de enfermagem com ícones e barras
  const enfermagemList = [
    { nome: 'Triagem', val: report.enfermagem.triagem, emoji: '👥' },
    { nome: 'Acuidade visual', val: report.enfermagem.acuidadeVisual, emoji: '👁️' },
    { nome: 'Raio-X', val: report.enfermagem.raioX, emoji: '🦴' },
    { nome: 'Ergométrico', val: report.enfermagem.ergometrico, emoji: '🏃' },
    { nome: 'ECG', val: report.enfermagem.ecg, emoji: '💓' },
    { nome: 'EEG', val: report.enfermagem.eeg, emoji: '🧠' },
    { nome: 'Espirometria', val: report.enfermagem.espirometria, emoji: '🫁' },
    { nome: 'Dinamometria', val: report.enfermagem.dinamometria, emoji: '✋' },
  ];
  const maxEnfermagemVal = Math.max(...enfermagemList.map(e => e.val), 1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 font-sans">
      
      {/* BARRA SUPERIOR DE AÇÕES */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 mb-6 flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onBackToEdit}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Preenchimento</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadPNG}
            disabled={downloading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md shadow-emerald-700/20 transition-all active:scale-[0.98]"
          >
            <ImageIcon className="w-4 h-4" />
            <span>Baixar Imagem PNG</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Gerando...' : 'Baixar PDF (A4 Paisagem)'}</span>
          </button>
        </div>
      </div>

      {/* ÁREA DO RELATÓRIO EXECUTIVO (CANVAS A4 PAISAGEM) */}
      <div className="overflow-x-auto pb-8 flex justify-center">
        <div 
          ref={printRef}
          style={{ width: '1060px', minHeight: '745px' }}
          className="bg-white text-gray-900 p-6 shadow-2xl border border-gray-200 select-none flex flex-col justify-between"
        >
          
          {/* 1. CABEÇALHO COMPLETO INSTITUCIONAL */}
          <div>
            <div className="flex items-center justify-between pb-3 gap-2">
              {/* Logos CSOAM & ASO */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="h-12 flex items-center justify-center">
                    <img 
                      src={`${basePath}/assets/logo.png`}
                      alt="CSOAM" 
                      className="h-12 w-auto object-contain"
                    />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black text-[#006B35] leading-none tracking-tight">CSOAM</h1>
                    <p className="text-[10px] text-[#008C45] font-bold">CENTRO DE SAÚDE OCUPACIONAL DA AMAZÔNIA</p>
                  </div>
                </div>

                <div className="h-8 w-px bg-gray-300 mx-1" />

                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-black text-[#006B35]">ASO</span>
                  <span className="text-[9px] text-gray-500 font-semibold leading-tight max-w-[75px]">AMAZON SAÚDE OCUPACIONAL</span>
                </div>
              </div>

              {/* Título Central */}
              <div className="text-center flex-1 px-2">
                <div className="inline-flex items-center gap-2">
                  <span className="text-emerald-700 text-xl font-black">📈</span>
                  <h2 className="text-xl font-black text-[#0B3C2A] tracking-wider uppercase whitespace-nowrap">
                    Relatório Diário de Atendimentos
                  </h2>
                </div>
                <p className="text-xs text-gray-500 font-semibold mt-0.5">Produção Operacional Integrada</p>
              </div>

              {/* Metadados Direita (Data e Locação com emojis perfeitamente alinhados) */}
              <div className="flex flex-col items-end justify-center text-xs space-y-1.5 shrink-0 pl-2">
                <div className="flex items-center gap-2 text-gray-800 font-bold whitespace-nowrap bg-emerald-50/70 px-3 py-1 rounded-lg border border-emerald-200/80 shadow-2xs">
                  <span className="text-sm">📅</span>
                  <span>Data: <strong className="text-gray-900">{formatDateDisplay(report.data)}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-gray-800 font-bold whitespace-nowrap bg-emerald-50/70 px-3 py-1 rounded-lg border border-emerald-200/80 shadow-2xs">
                  <span className="text-sm">📍</span>
                  <span>Locação: <strong className="text-gray-900">{report.unidade || 'CSOAM – Matriz'}</strong></span>
                </div>
              </div>
            </div>

            {/* Fita Resumo do Dia */}
            <div className="relative mt-2 mb-3">
              <div className="h-4 bg-gradient-to-r from-[#006B35] via-[#8BCF27] to-[#1769D2] rounded-full opacity-90" />
              <div className="absolute -top-1.5 left-4 px-4 py-0.5 bg-[#006B35] text-white text-[11px] font-black rounded-full shadow-md tracking-wider">
                RESUMO DO DIA
              </div>
            </div>

            {/* 2. 5 CARTÕES KPI DO TOPO */}
            <div className="grid grid-cols-5 gap-3 mt-3">
              {/* Card 1 */}
              <div className="bg-white border-2 border-emerald-500 rounded-2xl p-2.5 flex items-center gap-3 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center text-lg font-bold shrink-0 shadow">
                  👥
                </div>
                <div className="min-w-0">
                  <div className="text-2xl font-black text-[#0B3C2A] leading-none">{totalAtendimentos}</div>
                  <div className="text-[10px] font-bold text-gray-700 mt-1 leading-tight truncate">Atendimentos Ocupacionais</div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white border-2 border-emerald-500 rounded-2xl p-2.5 flex items-center gap-3 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center text-lg font-bold shrink-0 shadow">
                  🩺
                </div>
                <div className="min-w-0">
                  <div className="text-2xl font-black text-[#0B3C2A] leading-none">{totalEnfermagem}</div>
                  <div className="text-[10px] font-bold text-gray-700 mt-1 leading-tight truncate">Serviços de Enfermagem</div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white border-2 border-emerald-500 rounded-2xl p-2.5 flex items-center gap-3 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center text-lg font-bold shrink-0 shadow">
                  👂
                </div>
                <div className="min-w-0">
                  <div className="text-2xl font-black text-[#0B3C2A] leading-none">{totalAudiometria}</div>
                  <div className="text-[10px] font-bold text-gray-700 mt-1 leading-tight truncate">Audiometrias Ocupacionais</div>
                </div>
              </div>

              {/* Card 4 */}
              <div className="bg-white border-2 border-emerald-500 rounded-2xl p-2.5 flex items-center gap-3 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center text-lg font-bold shrink-0 shadow">
                  🧪
                </div>
                <div className="min-w-0">
                  <div className="text-2xl font-black text-[#0B3C2A] leading-none">{totalColetas}</div>
                  <div className="text-[10px] font-bold text-gray-700 mt-1 leading-tight truncate">Coletas (Laboratório)</div>
                </div>
              </div>

              {/* Card 5 */}
              <div className="bg-white border-2 border-emerald-500 rounded-2xl p-2.5 flex items-center gap-3 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center text-lg font-bold shrink-0 shadow">
                  🔬
                </div>
                <div className="min-w-0">
                  <div className="text-2xl font-black text-[#0B3C2A] leading-none">{totalExames}</div>
                  <div className="text-[10px] font-bold text-gray-700 mt-1 leading-tight truncate">Exames (Laboratório)</div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. SEÇÃO DO MEIO (3 BLOCOS PRINCIPAIS) */}
          <div className="grid grid-cols-12 gap-3 my-3">
            
            {/* BLOCO 1: ATENDIMENTOS OCUPACIONAIS (Cols 4) */}
            <div className="col-span-4 border border-emerald-300 rounded-2xl p-2.5 bg-white flex flex-col justify-between shadow-sm">
              <div>
                {/* Header ribbon */}
                <div className="bg-[#006B35] text-white px-3 py-1 rounded-xl flex items-center gap-2 mb-2 shadow-sm">
                  <Stethoscope className="w-4 h-4 text-[#8BCF27]" />
                  <span className="text-[11px] font-black tracking-wide uppercase">Atendimentos Ocupacionais</span>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  {/* Gráfico Donut SVG */}
                  <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                    <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-gray-100"
                        strokeWidth="5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      {/* Fatia Admissional */}
                      <path
                        className="text-blue-600"
                        strokeWidth="5"
                        strokeDasharray={`${totalAtendimentos ? (report.atendimentos.admissional / totalAtendimentos) * 100 : 0}, 100`}
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-base font-black text-gray-900 leading-none">{totalAtendimentos}</span>
                      <span className="text-[9px] font-bold text-gray-500">Total</span>
                    </div>
                  </div>

                  {/* Tabela de Valores */}
                  <div className="flex-1 text-[11px] space-y-1">
                    <div className="flex justify-between items-center py-0.5 border-b border-gray-50">
                      <span className="flex items-center gap-1.5 font-medium text-gray-800">
                        <span className="w-2 h-2 rounded-sm bg-blue-600 inline-block" />
                        Admissional:
                      </span>
                      <span className="font-bold text-gray-900">{report.atendimentos.admissional}</span>
                      <span className="text-[10px] text-gray-500 font-semibold">{formatPct(report.atendimentos.admissional, totalAtendimentos)}</span>
                    </div>

                    <div className="flex justify-between items-center py-0.5 border-b border-gray-50">
                      <span className="flex items-center gap-1.5 font-medium text-gray-800">
                        <span className="w-2 h-2 rounded-sm bg-emerald-600 inline-block" />
                        Periódico:
                      </span>
                      <span className="font-bold text-gray-900">{report.atendimentos.periodico}</span>
                      <span className="text-[10px] text-gray-500 font-semibold">{formatPct(report.atendimentos.periodico, totalAtendimentos)}</span>
                    </div>

                    <div className="flex justify-between items-center py-0.5 border-b border-gray-50">
                      <span className="flex items-center gap-1.5 font-medium text-gray-800">
                        <span className="w-2 h-2 rounded-sm bg-orange-500 inline-block" />
                        Demissional:
                      </span>
                      <span className="font-bold text-gray-900">{report.atendimentos.demissional}</span>
                      <span className="text-[10px] text-gray-500 font-semibold">{formatPct(report.atendimentos.demissional, totalAtendimentos)}</span>
                    </div>

                    <div className="flex justify-between items-center py-0.5">
                      <span className="flex items-center gap-1.5 font-medium text-gray-800">
                        <span className="w-2 h-2 rounded-sm bg-gray-400 inline-block" />
                        Consultas/Outros:
                      </span>
                      <span className="font-bold text-gray-900">{report.atendimentos.consultas}</span>
                      <span className="text-[10px] text-gray-500 font-semibold">{formatPct(report.atendimentos.consultas, totalAtendimentos)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Pill */}
              <div className="mt-2 py-1 px-3 rounded-lg bg-emerald-100/80 border border-emerald-300 flex justify-between items-center text-xs font-black text-emerald-900">
                <span>Total Atendimentos</span>
                <span>{totalAtendimentos}</span>
              </div>
            </div>

            {/* BLOCO 2: SERVIÇOS DE ENFERMAGEM (Cols 4) */}
            <div className="col-span-4 border border-emerald-300 rounded-2xl p-2.5 bg-white flex flex-col justify-between shadow-sm">
              <div>
                <div className="bg-[#006B35] text-white px-3 py-1 rounded-xl flex items-center gap-2 mb-2 shadow-sm">
                  <HeartPulse className="w-4 h-4 text-[#8BCF27]" />
                  <span className="text-[11px] font-black tracking-wide uppercase">Serviços de Enfermagem</span>
                </div>

                <div className="flex gap-2 mt-2">
                  {/* Lista com Barras Azuis */}
                  <div className="flex-1 space-y-1">
                    {enfermagemList.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-1 text-gray-800 w-24 truncate font-medium">
                          <span>{item.emoji}</span>
                          <span>{item.nome}</span>
                        </div>
                        {/* Barra azul horizontal */}
                        <div className="flex-1 mx-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-600 rounded-full" 
                            style={{ width: `${(item.val / maxEnfermagemVal) * 100}%` }}
                          />
                        </div>
                        <span className="font-bold text-gray-900 w-5 text-right">{item.val}</span>
                      </div>
                    ))}
                  </div>

                  {/* Card Total de Serviços Lateral */}
                  <div className="w-24 rounded-xl bg-emerald-50/70 border border-emerald-200 p-2 flex flex-col items-center justify-center text-center">
                    <span className="text-[9px] font-bold text-emerald-800 uppercase">Total de Serviços</span>
                    <span className="text-2xl font-black text-emerald-900 my-1">{totalEnfermagem}</span>
                    <span className="text-[8px] text-gray-500 leading-tight">Procedimentos Realizados</span>
                  </div>
                </div>
              </div>
            </div>

            {/* BLOCO 3: AUDIOMETRIA OCUPACIONAL (Cols 4) */}
            <div className="col-span-4 border border-emerald-300 rounded-2xl p-2.5 bg-white flex flex-col justify-between shadow-sm">
              <div>
                <div className="bg-[#006B35] text-white px-3 py-1 rounded-xl flex items-center gap-2 mb-2 shadow-sm">
                  <Ear className="w-4 h-4 text-[#8BCF27]" />
                  <span className="text-[11px] font-black tracking-wide uppercase">Audiometria Ocupacional</span>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  {/* Gráfico Donut SVG */}
                  <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                    <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-gray-100"
                        strokeWidth="5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-blue-600"
                        strokeWidth="5"
                        strokeDasharray={`${totalAudiometria ? (report.audiometria.admissional / totalAudiometria) * 100 : 0}, 100`}
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-base font-black text-gray-900 leading-none">{totalAudiometria}</span>
                      <span className="text-[9px] font-bold text-gray-500">Total</span>
                    </div>
                  </div>

                  {/* Tabela de Valores */}
                  <div className="flex-1 text-[11px] space-y-1.5">
                    <div className="flex justify-between items-center py-0.5 border-b border-gray-50">
                      <span className="flex items-center gap-1.5 font-medium text-gray-800">
                        <span className="w-2 h-2 rounded-sm bg-blue-600 inline-block" />
                        Admissional:
                      </span>
                      <span className="font-bold text-gray-900">{report.audiometria.admissional}</span>
                      <span className="text-[10px] text-gray-500 font-semibold">{formatPct(report.audiometria.admissional, totalAudiometria)}</span>
                    </div>

                    <div className="flex justify-between items-center py-0.5 border-b border-gray-50">
                      <span className="flex items-center gap-1.5 font-medium text-gray-800">
                        <span className="w-2 h-2 rounded-sm bg-emerald-600 inline-block" />
                        Periódico:
                      </span>
                      <span className="font-bold text-gray-900">{report.audiometria.periodico}</span>
                      <span className="text-[10px] text-gray-500 font-semibold">{formatPct(report.audiometria.periodico, totalAudiometria)}</span>
                    </div>

                    <div className="flex justify-between items-center py-0.5">
                      <span className="flex items-center gap-1.5 font-medium text-gray-800">
                        <span className="w-2 h-2 rounded-sm bg-orange-500 inline-block" />
                        Demissional:
                      </span>
                      <span className="font-bold text-gray-900">{report.audiometria.demissional}</span>
                      <span className="text-[10px] text-gray-500 font-semibold">{formatPct(report.audiometria.demissional, totalAudiometria)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Pill */}
              <div className="mt-2 py-1 px-3 rounded-lg bg-emerald-100/80 border border-emerald-300 flex justify-between items-center text-xs font-black text-emerald-900">
                <span>Total Audiometrias</span>
                <span>{totalAudiometria}</span>
              </div>
            </div>

          </div>

          {/* 4. SEÇÃO INFERIOR: LABORATÓRIO, EMPRESAS E OBSERVAÇÕES */}
          <div className="grid grid-cols-12 gap-3 mb-2">
            
            {/* Bloco Laboratório (Coletas e Exames) - Cols 4 */}
            <div className="col-span-4 border border-emerald-300 rounded-2xl p-2.5 bg-white text-[10px]">
              <div className="grid grid-cols-2 gap-2">
                {/* Coluna Coletas */}
                <div>
                  <div className="bg-[#006B35] text-white px-2 py-0.5 rounded-lg text-center font-bold mb-1.5">
                    LABORATÓRIO
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between border-b border-gray-100 pb-0.5">
                      <span className="text-gray-700">Coletas - Ocupac.</span>
                      <span className="font-bold text-gray-900">{report.coletas.ocupacional}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-0.5">
                      <span className="text-gray-700">Coletas - Partic.</span>
                      <span className="font-bold text-gray-900">{report.coletas.particular}</span>
                    </div>
                    <div className="p-1 rounded bg-emerald-100 font-bold text-emerald-900 flex justify-between mt-2">
                      <span>Total Coletas</span>
                      <span>{totalColetas}</span>
                    </div>
                  </div>
                </div>

                {/* Coluna Exames */}
                <div>
                  <div className="bg-[#008C45] text-white px-2 py-0.5 rounded-lg text-center font-bold mb-1.5">
                    Exames Realizados
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex justify-between"><span>Sangue</span><span className="font-bold">{report.exames.sangue}</span></div>
                    <div className="flex justify-between"><span>Ácidos (urina)</span><span className="font-bold">{report.exames.acidos}</span></div>
                    <div className="flex justify-between"><span>EPF</span><span className="font-bold">{report.exames.epf}</span></div>
                    <div className="flex justify-between"><span>EAS</span><span className="font-bold">{report.exames.eas}</span></div>
                    <div className="flex justify-between"><span>Coprocultura</span><span className="font-bold">{report.exames.coprocultura}</span></div>
                    <div className="p-1 rounded bg-emerald-100 font-bold text-emerald-900 flex justify-between mt-1">
                      <span>Total Exames</span>
                      <span>{totalExames}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bloco Empresas Atendidas - Cols 4 */}
            <div className="col-span-4 border border-emerald-300 rounded-2xl p-2.5 bg-white text-[10px] flex flex-col justify-between">
              <div>
                <div className="bg-[#006B35] text-white px-2 py-0.5 rounded-lg text-center font-bold mb-1.5 flex items-center justify-center gap-1">
                  <span>🏢</span>
                  <span>EMPRESAS ATENDIDAS ({report.empresas.length})</span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="space-y-0.5">
                    {empresasCol1.map(e => (
                      <div key={e.id} className="flex justify-between border-b border-gray-50 pb-0.5">
                        <span className="text-gray-800 truncate max-w-[85px]">{e.nome}</span>
                        <span className="font-bold text-gray-900">{e.qtd}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-0.5">
                    {empresasCol2.map(e => (
                      <div key={e.id} className="flex justify-between border-b border-gray-50 pb-0.5">
                        <span className="text-gray-800 truncate max-w-[85px]">{e.nome}</span>
                        <span className="font-bold text-gray-900">{e.qtd}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-1 rounded-lg bg-emerald-100 font-bold text-emerald-900 text-center text-[10px] mt-1">
                Total de Empresas: {report.empresas.length}
              </div>
            </div>

            {/* Bloco Observações / Ocorrências - Cols 4 */}
            <div className="col-span-4 border border-emerald-300 rounded-2xl p-2.5 bg-white text-[10px] flex flex-col justify-between">
              <div>
                <div className="bg-[#006B35] text-white px-2 py-0.5 rounded-lg text-center font-bold mb-1.5 flex items-center justify-center gap-1">
                  <span>✏️</span>
                  <span>OBSERVAÇÕES / OCORRÊNCIAS</span>
                </div>

                <div className="space-y-1 text-gray-800 py-1 leading-snug">
                  {report.observacoes.split('\n').filter(Boolean).map((line, idx) => (
                    <div key={idx} className="border-b border-gray-100 pb-0.5">
                      {line.startsWith('•') ? line : `• ${line}`}
                    </div>
                  ))}
                  {report.observacoes.split('\n').filter(Boolean).length === 0 && (
                    <div className="text-gray-400 italic">Nenhuma intercorrência registrada no plantão.</div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* 5. RODAPÉ OFICIAL: ANÁLISE DO DIA & EQUIPE RESPONSÁVEL */}
          <div className="space-y-1.5 mt-1">
            {/* Faixa Análise do Dia */}
            <div className="border border-emerald-200 rounded-xl px-3 py-1 bg-gradient-to-r from-emerald-50/90 via-white to-emerald-50/90 flex items-center justify-between text-[9px] text-gray-700">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-[#006B35] text-white text-[9px] font-black uppercase tracking-wide">
                  📈 ANÁLISE DO DIA
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <CheckCircle className="w-3 h-3 text-emerald-600 inline" />
                  Produção dentro da capacidade operacional.
                </span>
                <span className="text-gray-300">•</span>
                <span className="flex items-center gap-1 font-medium">
                  <CheckCircle className="w-3 h-3 text-emerald-600 inline" />
                  Principais demandas: admissionais e triagens.
                </span>
              </div>
              <span className="text-emerald-800 font-bold text-[9px]">
                {report.unidade} • {formatDateDisplay(report.data)} • Turno {report.turno}
              </span>
            </div>

            {/* TABELA OFICIAL DA EQUIPE RESPONSÁVEL PELOS REGISTROS */}
            <div className="border border-[#006B35] rounded-xl overflow-hidden bg-white shadow-xs">
              <div className="grid grid-cols-12 divide-x divide-emerald-200 text-[10px]">
                
                {/* Título da Seção */}
                <div className="col-span-3 bg-[#006B35] text-white p-2 flex items-center justify-center gap-2 text-center">
                  <Users className="w-4 h-4 text-[#8BCF27] shrink-0" />
                  <div className="font-black tracking-tight text-[9px] leading-tight uppercase">
                    <span>EQUIPE RESPONSÁVEL</span><br />
                    <span className="text-[#8BCF27]">PELOS REGISTROS</span>
                  </div>
                </div>

                {/* Coluna 1: Medicina Ocupacional */}
                <div className="col-span-3 flex flex-col justify-between">
                  <div className="bg-emerald-50/80 text-[#006B35] font-bold text-center py-0.5 border-b border-emerald-200 text-[9px] flex items-center justify-center gap-1">
                    <Stethoscope className="w-3 h-3 text-emerald-700" />
                    <span>Medicina Ocupacional</span>
                  </div>
                  <div className="p-1.5 text-center flex-1 flex flex-col justify-center">
                    <div className="font-black text-gray-900 leading-tight text-[10px]">{medicoInfo.nome}</div>
                    <div className="text-[8px] text-gray-500 font-medium">{medicoInfo.cargo}</div>
                  </div>
                </div>

                {/* Coluna 2: Enfermagem */}
                <div className="col-span-2 flex flex-col justify-between">
                  <div className="bg-emerald-50/80 text-[#006B35] font-bold text-center py-0.5 border-b border-emerald-200 text-[9px] flex items-center justify-center gap-1">
                    <HeartPulse className="w-3 h-3 text-emerald-700" />
                    <span>Enfermagem</span>
                  </div>
                  <div className="p-1.5 text-center flex-1 flex flex-col justify-center">
                    <div className="font-black text-gray-900 leading-tight text-[10px]">TET: Rosineide Souza</div>
                    <div className="text-[8px] text-gray-500 font-medium">COREN: 385.633</div>
                  </div>
                </div>

                {/* Coluna 3: Fonoaudiologia */}
                <div className="col-span-2 flex flex-col justify-between">
                  <div className="bg-emerald-50/80 text-[#006B35] font-bold text-center py-0.5 border-b border-emerald-200 text-[9px] flex items-center justify-center gap-1">
                    <Ear className="w-3 h-3 text-emerald-700" />
                    <span>Fonoaudiologia</span>
                  </div>
                  <div className="p-1.5 text-center flex-1 flex flex-col justify-center">
                    <div className="font-black text-gray-900 leading-tight text-[10px]">Fga. Elise Beatriz</div>
                    <div className="text-[8px] text-gray-500 font-medium">CRFa: 9-2207</div>
                  </div>
                </div>

                {/* Coluna 4: Laboratório (Biomédica) */}
                <div className="col-span-2 flex flex-col justify-between">
                  <div className="bg-emerald-50/80 text-[#006B35] font-bold text-center py-0.5 border-b border-emerald-200 text-[9px] flex items-center justify-center gap-1">
                    <span className="text-[9px]">🔬</span>
                    <span>Laboratório (Biomédica)</span>
                  </div>
                  <div className="p-1.5 text-center flex-1 flex flex-col justify-center">
                    <div className="font-black text-gray-900 leading-tight text-[10px]">Maria Elcila</div>
                    <div className="text-[8px] text-gray-500 font-medium">CRBM: 8345</div>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
