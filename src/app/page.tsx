"use client";

import React, { useState, useEffect } from 'react';
import { LoginCard } from '@/components/Login/LoginCard';
import { Navbar } from '@/components/Navbar/Navbar';
import { DailyForm } from '@/components/Dashboard/DailyForm';
import { ReportView } from '@/components/ReportView/ReportView';
import { HistoryView } from '@/components/History/HistoryView';
import { DailyReport } from '@/lib/types';
import { initialReportData } from '@/lib/mockData';
import { saveReportToFirebase, getReportsFromFirebase } from '@/lib/firebase';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function Home() {
  const [user, setUser] = useState<{ name: string; role: string; email: string } | null>(null);
  const [currentTab, setCurrentTab] = useState<'form' | 'report' | 'history'>('form');
  const [currentReport, setCurrentReport] = useState<DailyReport>(initialReportData);
  const [reportsList, setReportsList] = useState<DailyReport[]>([initialReportData]);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Check login in localStorage
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('csoam_active_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.warn("User load error:", e);
    }
  }, []);

  // Fetch reports from Firebase on start
  useEffect(() => {
    async function loadReports() {
      try {
        const fetched = await getReportsFromFirebase();
        if (fetched && fetched.length > 0) {
          setReportsList(fetched);
          // Set the latest report as current
          setCurrentReport(fetched[0]);
        }
      } catch (e) {
        console.warn("Could not load initial reports:", e);
      }
    }
    loadReports();
  }, []);

  const handleLoginSuccess = (userData: { name: string; role: string; email: string }) => {
    setUser(userData);
    try {
      localStorage.setItem('csoam_active_user', JSON.stringify(userData));
    } catch (e) {}
  };

  const handleLogout = () => {
    setUser(null);
    try {
      localStorage.removeItem('csoam_active_user');
    } catch (e) {}
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleSaveReport = async () => {
    setSaving(true);
    try {
      const id = await saveReportToFirebase(currentReport);
      const updatedReport = { ...currentReport, id };
      setCurrentReport(updatedReport);
      
      // Update reports list
      setReportsList(prev => {
        const idx = prev.findIndex(r => r.id === id || r.data === updatedReport.data);
        if (idx >= 0) {
          const clone = [...prev];
          clone[idx] = updatedReport;
          return clone;
        }
        return [updatedReport, ...prev];
      });

      showToast("Relatório salvo com sucesso no Firebase!", "success");
    } catch (e) {
      console.error("Save error:", e);
      showToast("Erro ao salvar relatório.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSelectReport = (report: DailyReport) => {
    setCurrentReport(report);
    setCurrentTab('report');
  };

  const handleEditReport = (report: DailyReport) => {
    setCurrentReport(report);
    setCurrentTab('form');
  };

  const handleNewReport = () => {
    const today = new Date().toISOString().split('T')[0];
    const newEmptyReport: DailyReport = {
      ...initialReportData,
      id: undefined,
      data: today,
      responsavel: user?.name || 'Rosineide Souza',
      observacoes: '',
      atendimentos: { admissional: 0, periodico: 0, demissional: 0, mudancaRisco: 0, consultas: 0 },
      enfermagem: { triagem: 0, acuidadeVisual: 0, raioX: 0, ergometrico: 0, ecg: 0, eeg: 0, espirometria: 0, dinamometria: 0 },
      audiometria: { admissional: 0, periodico: 0, demissional: 0 },
      coletas: { ocupacional: 0, particular: 0 },
      exames: { sangue: 0, acidos: 0, epf: 0, eas: 0, coprocultura: 0, toxicologico: 0, baar: 0, micologico: 0 },
      empresas: []
    };
    setCurrentReport(newEmptyReport);
    setCurrentTab('form');
    showToast("Novo formulário em branco iniciado para hoje!", "success");
  };

  const handleDeleteReport = (id?: string) => {
    if (!id) return;
    if (confirm("Tem certeza que deseja excluir este relatório?")) {
      setReportsList(prev => prev.filter(r => r.id !== id));
      showToast("Relatório removido.", "success");
    }
  };

  // Se não estiver logado, exibe a tela de login
  if (!user) {
    return <LoginCard onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#F5F7F6] flex flex-col font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 animate-bounce">
          <div className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl text-sm font-bold text-white ${
            toastMessage.type === 'success' ? 'bg-emerald-700' : 'bg-red-600'
          }`}>
            {toastMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Barra de Navegação Superior */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        currentUser={user}
        onLogout={handleLogout}
        currentDate={currentReport.data}
      />

      {/* Conteúdo Dinâmico por Aba */}
      <main className="flex-1 pb-16">
        {currentTab === 'form' && (
          <DailyForm
            report={currentReport}
            onUpdateReport={setCurrentReport}
            onSave={handleSaveReport}
            onViewReport={() => setCurrentTab('report')}
            saving={saving}
          />
        )}

        {currentTab === 'report' && (
          <ReportView
            report={currentReport}
            onBackToEdit={() => setCurrentTab('form')}
          />
        )}

        {currentTab === 'history' && (
          <HistoryView
            reports={reportsList}
            onSelectReport={handleSelectReport}
            onEditReport={handleEditReport}
            onNewReport={handleNewReport}
            onDeleteReport={handleDeleteReport}
          />
        )}
      </main>

      {/* Rodapé Simples */}
      <footer className="bg-white border-t border-gray-200/60 py-4 text-center text-xs text-gray-400">
        <p>CSOAM • Centro de Saúde Ocupacional da Amazônia &copy; 2026</p>
      </footer>

    </div>
  );
}
