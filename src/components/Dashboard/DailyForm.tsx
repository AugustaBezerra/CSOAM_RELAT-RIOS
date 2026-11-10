"use client";

import React, { useState } from 'react';
import { 
  Users, Stethoscope, Ear, FlaskConical, Microscope, 
  Building2, FileEdit, Plus, Trash2, CheckCircle2, 
  Save, Eye, Calendar, MapPin, Clock, User
} from 'lucide-react';
import { DailyReport, EmpresaItem } from '@/lib/types';

interface DailyFormProps {
  report: DailyReport;
  onUpdateReport: (updated: DailyReport) => void;
  onSave: () => void;
  onViewReport: () => void;
  saving?: boolean;
}

export const DailyForm: React.FC<DailyFormProps> = ({
  report,
  onUpdateReport,
  onSave,
  onViewReport,
  saving = false,
}) => {
  const [newEmpresaNome, setNewEmpresaNome] = useState('');
  const [newEmpresaQtd, setNewEmpresaQtd] = useState<number>(1);
  const [showAddEmpresa, setShowAddEmpresa] = useState(false);

  // Cálculos dinâmicos em tempo real
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

  const totalEmpresasCount = report.empresas.length;

  const handleFieldChange = (section: keyof DailyReport, field: string, val: any) => {
    onUpdateReport({
      ...report,
      [section]: {
        ...(report[section] as any),
        [field]: Number(val) >= 0 ? Number(val) : 0
      }
    });
  };

  const handleMetaChange = (field: keyof DailyReport, val: string) => {
    onUpdateReport({
      ...report,
      [field]: val
    });
  };

  const handleAddEmpresa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpresaNome.trim()) return;
    const newEmpresas: EmpresaItem[] = [
      ...report.empresas,
      {
        id: Date.now().toString(),
        nome: newEmpresaNome.trim(),
        qtd: Number(newEmpresaQtd) || 1
      }
    ];
    onUpdateReport({
      ...report,
      empresas: newEmpresas
    });
    setNewEmpresaNome('');
    setNewEmpresaQtd(1);
    setShowAddEmpresa(false);
  };

  const handleRemoveEmpresa = (id: string) => {
    const filtered = report.empresas.filter(e => e.id !== id);
    onUpdateReport({
      ...report,
      empresas: filtered
    });
  };

  const handleUpdateEmpresaQtd = (id: string, qtd: number) => {
    const updated = report.empresas.map(e => e.id === id ? { ...e, qtd: Number(qtd) || 0 } : e);
    onUpdateReport({
      ...report,
      empresas: updated
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      
      {/* CABEÇALHO DO RELATÓRIO */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200/80">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <span>Novo Relatório Diário</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                Online
              </span>
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Preencha os números do dia. Todos os totais e percentuais recalculam na mesma hora!
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Sincronização Firebase Ativa
            </span>
          </div>
        </div>

        {/* METADADOS: DATA, UNIDADE, RESPONSÁVEL, TURNO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 mb-1.5">
              <Calendar className="w-4 h-4 text-emerald-600" />
              Data do Relatório *
            </label>
            <input
              type="date"
              value={report.data}
              onChange={(e) => handleMetaChange('data', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 text-sm font-medium text-gray-900 bg-gray-50/50"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 mb-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              Unidade / Localidade *
            </label>
            <select
              value={report.unidade}
              onChange={(e) => handleMetaChange('unidade', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 text-sm font-medium text-gray-900 bg-gray-50/50"
            >
              <option value="CSOAM – Matriz">CSOAM – Matriz (Manaus)</option>
              <option value="CSOAM – Iranduba">CSOAM – Iranduba</option>
              <option value="Atendimento In Company">Atendimento In Company</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 mb-1.5">
              <User className="w-4 h-4 text-emerald-600" />
              Responsável *
            </label>
            <input
              type="text"
              value={report.responsavel}
              onChange={(e) => handleMetaChange('responsavel', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 text-sm font-medium text-gray-900 bg-gray-50/50"
              placeholder="Nome da responsável"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 mb-1.5">
              <Clock className="w-4 h-4 text-emerald-600" />
              Turno
            </label>
            <select
              value={report.turno}
              onChange={(e) => handleMetaChange('turno', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 text-sm font-medium text-gray-900 bg-gray-50/50"
            >
              <option value="Integral">Integral (Manhã e Tarde)</option>
              <option value="Matutino">Matutino</option>
              <option value="Vespertino">Vespertino</option>
            </select>
          </div>
        </div>
      </div>

      {/* GRADE DE PREENCHIMENTO EM BLOCOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* BLOCO 1: ATENDIMENTOS OCUPACIONAIS */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-gray-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Atendimentos Ocupacionais</h2>
                  <p className="text-xs text-gray-500">Medicina e Enfermagem Ocupacional</p>
                </div>
              </div>
              <Users className="w-5 h-5 text-emerald-600" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 mt-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Admissional</label>
                <input
                  type="number"
                  min="0"
                  value={report.atendimentos.admissional}
                  onChange={(e) => handleFieldChange('atendimentos', 'admissional', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-center font-bold text-gray-900 text-base focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Periódico</label>
                <input
                  type="number"
                  min="0"
                  value={report.atendimentos.periodico}
                  onChange={(e) => handleFieldChange('atendimentos', 'periodico', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-center font-bold text-gray-900 text-base focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Demissional</label>
                <input
                  type="number"
                  min="0"
                  value={report.atendimentos.demissional}
                  onChange={(e) => handleFieldChange('atendimentos', 'demissional', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-center font-bold text-gray-900 text-base focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Mudança de Risco</label>
                <input
                  type="number"
                  min="0"
                  value={report.atendimentos.mudancaRisco}
                  onChange={(e) => handleFieldChange('atendimentos', 'mudancaRisco', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-center font-bold text-gray-900 text-base focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 bg-gray-50"
                />
              </div>

              <div className="col-span-2 sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Consultas / Retornos / Outros</label>
                <input
                  type="number"
                  min="0"
                  value={report.atendimentos.consultas}
                  onChange={(e) => handleFieldChange('atendimentos', 'consultas', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-center font-bold text-gray-900 text-base focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Card de Total Automático */}
          <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-950 uppercase tracking-wider">Total de Atendimentos</p>
                <p className="text-xs text-emerald-700">Soma automática em tempo real</p>
              </div>
            </div>
            <span className="text-3xl font-black text-emerald-900">{totalAtendimentos}</span>
          </div>
        </div>

        {/* BLOCO 2: SERVIÇOS DE ENFERMAGEM */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-gray-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Serviços de Enfermagem</h2>
                  <p className="text-xs text-gray-500">Medicina Assistencial e Triagens</p>
                </div>
              </div>
              <Stethoscope className="w-5 h-5 text-teal-600" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Triagem</label>
                <input
                  type="number"
                  min="0"
                  value={report.enfermagem.triagem}
                  onChange={(e) => handleFieldChange('enfermagem', 'triagem', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-center font-bold text-gray-900 text-base focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Acuidade Visual</label>
                <input
                  type="number"
                  min="0"
                  value={report.enfermagem.acuidadeVisual}
                  onChange={(e) => handleFieldChange('enfermagem', 'acuidadeVisual', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-center font-bold text-gray-900 text-base focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Raio-X</label>
                <input
                  type="number"
                  min="0"
                  value={report.enfermagem.raioX}
                  onChange={(e) => handleFieldChange('enfermagem', 'raioX', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-center font-bold text-gray-900 text-base focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Ergométrico</label>
                <input
                  type="number"
                  min="0"
                  value={report.enfermagem.ergometrico}
                  onChange={(e) => handleFieldChange('enfermagem', 'ergometrico', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-center font-bold text-gray-900 text-base focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">ECG</label>
                <input
                  type="number"
                  min="0"
                  value={report.enfermagem.ecg}
                  onChange={(e) => handleFieldChange('enfermagem', 'ecg', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-center font-bold text-gray-900 text-base focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">EEG</label>
                <input
                  type="number"
                  min="0"
                  value={report.enfermagem.eeg}
                  onChange={(e) => handleFieldChange('enfermagem', 'eeg', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-center font-bold text-gray-900 text-base focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Espirometria</label>
                <input
                  type="number"
                  min="0"
                  value={report.enfermagem.espirometria}
                  onChange={(e) => handleFieldChange('enfermagem', 'espirometria', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-center font-bold text-gray-900 text-base focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Dinamometria</label>
                <input
                  type="number"
                  min="0"
                  value={report.enfermagem.dinamometria}
                  onChange={(e) => handleFieldChange('enfermagem', 'dinamometria', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-center font-bold text-gray-900 text-base focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Card de Total de Serviços */}
          <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-teal-950 uppercase tracking-wider">Total de Serviços de Enfermagem</p>
                <p className="text-xs text-teal-700">Soma automática de todos os procedimentos</p>
              </div>
            </div>
            <span className="text-3xl font-black text-teal-900">{totalEnfermagem}</span>
          </div>
        </div>

        {/* BLOCO 3: AUDIOMETRIA OCUPACIONAL */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-gray-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Audiometria Ocupacional</h2>
                  <p className="text-xs text-gray-500">Exames auditivos da cabine acústica</p>
                </div>
              </div>
              <Ear className="w-5 h-5 text-blue-600" />
            </div>

            <div className="grid grid-cols-3 gap-4 mt-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Admissional</label>
                <input
                  type="number"
                  min="0"
                  value={report.audiometria.admissional}
                  onChange={(e) => handleFieldChange('audiometria', 'admissional', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-center font-bold text-gray-900 text-base focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Periódico</label>
                <input
                  type="number"
                  min="0"
                  value={report.audiometria.periodico}
                  onChange={(e) => handleFieldChange('audiometria', 'periodico', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-center font-bold text-gray-900 text-base focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Demissional</label>
                <input
                  type="number"
                  min="0"
                  value={report.audiometria.demissional}
                  onChange={(e) => handleFieldChange('audiometria', 'demissional', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-center font-bold text-gray-900 text-base focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 bg-gray-50"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                <Ear className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-blue-950 uppercase tracking-wider">Total de Audiometrias</p>
                <p className="text-xs text-blue-700">Calculado automaticamente</p>
              </div>
            </div>
            <span className="text-3xl font-black text-blue-900">{totalAudiometria}</span>
          </div>
        </div>

        {/* BLOCO 4: LABORATÓRIO (COLETAS E EXAMES) */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-gray-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Laboratório (Coletas & Exames)</h2>
                  <p className="text-xs text-gray-500">Coletas ocupacionais e análises clínicas</p>
                </div>
              </div>
              <FlaskConical className="w-5 h-5 text-emerald-600" />
            </div>

            {/* Coletas */}
            <div className="mt-5">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Coletas</h3>
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Ocupacional</label>
                  <input
                    type="number"
                    min="0"
                    value={report.coletas.ocupacional}
                    onChange={(e) => handleFieldChange('coletas', 'ocupacional', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-center font-bold text-gray-900 text-base focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Particular</label>
                  <input
                    type="number"
                    min="0"
                    value={report.coletas.particular}
                    onChange={(e) => handleFieldChange('coletas', 'particular', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-center font-bold text-gray-900 text-base focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 bg-gray-50"
                  />
                </div>
              </div>
            </div>

            {/* Exames */}
            <div className="mt-5">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Exames Realizados</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Sangue</label>
                  <input
                    type="number"
                    min="0"
                    value={report.exames.sangue}
                    onChange={(e) => handleFieldChange('exames', 'sangue', e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-center font-bold text-gray-900 text-sm bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Ácidos (urina)</label>
                  <input
                    type="number"
                    min="0"
                    value={report.exames.acidos}
                    onChange={(e) => handleFieldChange('exames', 'acidos', e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-center font-bold text-gray-900 text-sm bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">EPF</label>
                  <input
                    type="number"
                    min="0"
                    value={report.exames.epf}
                    onChange={(e) => handleFieldChange('exames', 'epf', e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-center font-bold text-gray-900 text-sm bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">EAS</label>
                  <input
                    type="number"
                    min="0"
                    value={report.exames.eas}
                    onChange={(e) => handleFieldChange('exames', 'eas', e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-center font-bold text-gray-900 text-sm bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Coprocultura</label>
                  <input
                    type="number"
                    min="0"
                    value={report.exames.coprocultura}
                    onChange={(e) => handleFieldChange('exames', 'coprocultura', e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-center font-bold text-gray-900 text-sm bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Toxicológico</label>
                  <input
                    type="number"
                    min="0"
                    value={report.exames.toxicologico}
                    onChange={(e) => handleFieldChange('exames', 'toxicologico', e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-center font-bold text-gray-900 text-sm bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">BAAR</label>
                  <input
                    type="number"
                    min="0"
                    value={report.exames.baar}
                    onChange={(e) => handleFieldChange('exames', 'baar', e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-center font-bold text-gray-900 text-sm bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Micológico</label>
                  <input
                    type="number"
                    min="0"
                    value={report.exames.micologico}
                    onChange={(e) => handleFieldChange('exames', 'micologico', e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-center font-bold text-gray-900 text-sm bg-gray-50"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
              <span className="block text-[11px] font-bold text-emerald-800">Total de Coletas</span>
              <span className="text-2xl font-black text-emerald-900">{totalColetas}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 text-center">
              <span className="block text-[11px] font-bold text-teal-800">Total de Exames</span>
              <span className="text-2xl font-black text-teal-900">{totalExames}</span>
            </div>
          </div>
        </div>

      </div>

      {/* BLOCO 5: EMPRESAS ATENDIDAS */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              5
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Empresas Atendidas no Dia</h2>
              <p className="text-xs text-gray-500">Registre cada empresa e a quantidade de atendimentos</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
              Total de Empresas: {totalEmpresasCount}
            </span>
            <button
              type="button"
              onClick={() => setShowAddEmpresa(!showAddEmpresa)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Empresa</span>
            </button>
          </div>
        </div>

        {/* Formulário rápido para adicionar empresa */}
        {showAddEmpresa && (
          <form onSubmit={handleAddEmpresa} className="mt-4 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 flex flex-col sm:flex-row items-center gap-3">
            <div className="w-full sm:flex-1">
              <input
                type="text"
                value={newEmpresaNome}
                onChange={(e) => setNewEmpresaNome(e.target.value)}
                placeholder="Nome da empresa (ex: Construtora Alfa, Particular...)"
                required
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm bg-white"
              />
            </div>
            <div className="w-full sm:w-32">
              <input
                type="number"
                min="1"
                value={newEmpresaQtd}
                onChange={(e) => setNewEmpresaQtd(Number(e.target.value) || 1)}
                placeholder="Qtd"
                required
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-center bg-white"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                type="submit"
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800"
              >
                Salvar
              </button>
              <button
                type="button"
                onClick={() => setShowAddEmpresa(false)}
                className="px-3 py-2 rounded-xl bg-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-300"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Tabela de Empresas em 2 colunas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          {report.empresas.map((emp) => (
            <div
              key={emp.id}
              className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/70 hover:bg-white hover:border-emerald-200 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-sm font-semibold text-gray-800">{emp.nome}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-400 font-medium">Qtd:</span>
                  <input
                    type="number"
                    min="0"
                    value={emp.qtd}
                    onChange={(e) => handleUpdateEmpresaQtd(emp.id, Number(e.target.value))}
                    className="w-14 px-2 py-1 rounded-lg border border-gray-200 text-center font-bold text-sm bg-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveEmpresa(emp.id)}
                  title="Remover empresa"
                  className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BLOCO 6: OBSERVAÇÕES E OCORRÊNCIAS */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200/80">
        <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100 mb-4">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            6
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">Observações / Ocorrências do Plantão</h2>
            <p className="text-xs text-gray-500">Informações relevantes, intercorrências ou avisos do dia</p>
          </div>
        </div>

        <textarea
          rows={4}
          value={report.observacoes}
          onChange={(e) => handleMetaChange('observacoes', e.target.value)}
          placeholder="Descreva ocorrências, observações ou informações importantes sobre a produção..."
          className="w-full p-4 rounded-2xl border border-gray-200 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 text-sm text-gray-900 bg-gray-50/50 leading-relaxed outline-none"
        />
        <div className="mt-2 text-right text-xs text-gray-400">
          {report.observacoes.length} caracteres
        </div>
      </div>

      {/* BARRA DE AÇÕES INFERIOR */}
      <div className="sticky bottom-6 z-40 bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-xl border border-emerald-900/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            Total geral: <strong className="text-emerald-900">{totalAtendimentos} atendimentos</strong> e <strong className="text-emerald-900">{totalEnfermagem} serviços de enfermagem</strong>.
          </span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#008C45] hover:bg-[#007037] text-white font-bold text-sm shadow-md shadow-emerald-700/20 transition-all active:scale-[0.98]"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Salvando...' : 'Salvar no Firebase'}</span>
          </button>

          <button
            type="button"
            onClick={onViewReport}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#1769D2] hover:bg-[#1255ab] text-white font-bold text-sm shadow-md shadow-blue-700/20 transition-all active:scale-[0.98]"
          >
            <Eye className="w-4 h-4" />
            <span>Ver Relatório do Médico</span>
          </button>
        </div>
      </div>

    </div>
  );
};
