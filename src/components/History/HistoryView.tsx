"use client";

import React from 'react';
import { Calendar, Eye, Edit, Trash2, Plus, FileText, CheckCircle2 } from 'lucide-react';
import { DailyReport } from '@/lib/types';

interface HistoryViewProps {
  reports: DailyReport[];
  onSelectReport: (report: DailyReport) => void;
  onEditReport: (report: DailyReport) => void;
  onNewReport: () => void;
  onDeleteReport: (id?: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  reports,
  onSelectReport,
  onEditReport,
  onNewReport,
  onDeleteReport,
}) => {
  const formatDateDisplay = (d: string) => {
    if (!d) return '--/--/----';
    if (d.includes('-')) {
      const [year, month, day] = d.split('-');
      return `${day}/${month}/${year}`;
    }
    return d;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      
      {/* Cabeçalho */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200/80 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2.5">
            <Calendar className="w-7 h-7 text-emerald-600" />
            <span>Histórico de Relatórios Diários</span>
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Acompanhe a produção operacional ao longo dos dias do mês e consulte relatórios anteriores.
          </p>
        </div>

        <button
          onClick={onNewReport}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#008C45] hover:bg-[#007037] text-white text-sm font-bold shadow-md shadow-emerald-700/20 transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Relatório Diário</span>
        </button>
      </div>

      {/* Lista de Relatórios */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200/80 overflow-hidden">
        {reports.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-base font-semibold text-gray-600">Nenhum relatório salvo ainda.</p>
            <p className="text-sm mt-1">Preencha o primeiro relatório na aba de preenchimento!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200/80 text-[11px] font-black text-emerald-950 uppercase tracking-wider">
                  <th className="py-4 px-6">Data</th>
                  <th className="py-4 px-6">Responsável</th>
                  <th className="py-4 px-6">Unidade</th>
                  <th className="py-4 px-6 text-center">Atendimentos</th>
                  <th className="py-4 px-6 text-center">Enfermagem</th>
                  <th className="py-4 px-6 text-center">Audiometrias</th>
                  <th className="py-4 px-6 text-center">Exames</th>
                  <th className="py-4 px-6 text-center">Situação</th>
                  <th className="py-4 px-6 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {reports.map((rep, idx) => {
                  const totalAtend = 
                    (Number(rep.atendimentos.admissional) || 0) +
                    (Number(rep.atendimentos.periodico) || 0) +
                    (Number(rep.atendimentos.demissional) || 0) +
                    (Number(rep.atendimentos.mudancaRisco) || 0) +
                    (Number(rep.atendimentos.consulta) || 0) +
                    (Number(rep.atendimentos.retorno) || 0) +
                    (Number(rep.atendimentos.pcd) || 0) +
                    (Number(rep.atendimentos.consultas) || 0);

                  const totalEnf = 
                    (Number(rep.enfermagem.triagem) || 0) +
                    (Number(rep.enfermagem.acuidadeVisual) || 0) +
                    (Number(rep.enfermagem.raioX) || 0) +
                    (Number(rep.enfermagem.ergometrico) || 0) +
                    (Number(rep.enfermagem.ecg) || 0) +
                    (Number(rep.enfermagem.eeg) || 0) +
                    (Number(rep.enfermagem.espirometria) || 0) +
                    (Number(rep.enfermagem.dinamometria) || 0);

                  const totalAudio = 
                    (Number(rep.audiometria.admissional) || 0) +
                    (Number(rep.audiometria.periodico) || 0) +
                    (Number(rep.audiometria.demissional) || 0) +
                    (Number(rep.audiometria.mudancaRisco) || 0) +
                    (Number(rep.audiometria.terceiro) || 0) +
                    (Number(rep.audiometria.terceirosPcd) || 0);

                  const totalEx = 
                    (Number(rep.exames.sangue) || 0) +
                    (Number(rep.exames.acidos) || 0) +
                    (Number(rep.exames.epf) || 0) +
                    (Number(rep.exames.eas) || 0) +
                    (Number(rep.exames.coprocultura) || 0);

                  return (
                    <tr key={rep.id || idx} className="hover:bg-emerald-50/30 transition-colors">
                      <td className="py-4 px-6 font-bold text-gray-900 whitespace-nowrap">
                        {formatDateDisplay(rep.data)}
                      </td>
                      <td className="py-4 px-6 text-gray-700 font-medium">
                        {rep.responsavel}
                      </td>
                      <td className="py-4 px-6 text-gray-500 text-xs">
                        {rep.unidade}
                      </td>
                      <td className="py-4 px-6 text-center font-bold text-emerald-800">
                        {totalAtend}
                      </td>
                      <td className="py-4 px-6 text-center font-bold text-teal-800">
                        {totalEnf}
                      </td>
                      <td className="py-4 px-6 text-center font-bold text-blue-800">
                        {totalAudio}
                      </td>
                      <td className="py-4 px-6 text-center font-bold text-gray-800">
                        {totalEx}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Salvo
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap space-x-2">
                        <button
                          onClick={() => onSelectReport(rep)}
                          title="Visualizar Relatório do Médico"
                          className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-colors inline-block"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditReport(rep)}
                          title="Editar Relatório"
                          className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 transition-colors inline-block"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteReport(rep.id)}
                          title="Excluir"
                          className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors inline-block"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
