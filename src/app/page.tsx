"use client";

import React, { useState, useEffect } from 'react';
import { LoginCard } from '@/components/Login/LoginCard';
import { Navbar } from '@/components/Navbar/Navbar';
import { DailyForm } from '@/components/Dashboard/DailyForm';
import { ReportView } from '@/components/ReportView/ReportView';
import { HistoryView } from '@/components/History/HistoryView';
import { DailyReport } from '@/lib/types';
import { initialReportData, getEmptyDailyReport } from '@/lib/mockData';
import {
  saveReportToFirebase,
  getReportsFromFirebase,
  getLocalReports,
  removeLocalReport,
  auth
} from '@/lib/firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function Home() {
  const [user, setUser] = useState<{ name: string; role: string; email: string } | null>(null);
  // A aba inicial é 'history' (Relatórios), seguida de 'form' (Preenchimento) e 'report' (Relatório do Médico)
  const [currentTab, setCurrentTab] = useState<'form' | 'report' | 'history'>('history');
  // O formulário de preenchimento começa 100% ZERADO
  const [currentReport, setCurrentReport] = useState<DailyReport>(getEmptyDailyReport());
  const [reportsList, setReportsList] = useState<DailyReport[]>([initialReportData]);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Check login in Firebase & localStorage
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('csoam_active_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.warn("User load error:", e);
    }

    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          const userData = {
            name: firebaseUser.displayName || 'Equipe CSOAM',
            role: 'Operacional / Enfermagem',
            email: firebaseUser.email || ''
          };
          setUser(userData);
          try {
            localStorage.setItem('csoam_active_user', JSON.stringify(userData));
          } catch (e) {}
        }
      });
      return () => unsubscribe();
    }
  }, []);

  // Carrega imediatamente os relatórios salvos no navegador (sem esperar a nuvem)
  useEffect(() => {
    try {
      const cached = getLocalReports();
      if (cached && cached.length > 0) {
        setReportsList(prev => {
          const map = new Map<string, DailyReport>();
          // Relatório do dia 09/11 de exemplo
          map.set(initialReportData.data, initialReportData);
          cached.forEach(r => map.set(r.data, r));
          return Array.from(map.values()).sort((a, b) => b.data.localeCompare(a.data));
        });
      }
    } catch (e) {
      console.warn("Local cache load warning:", e);
    }

    async function loadReports() {
      try {
        const fetched = await getReportsFromFirebase();
        if (fetched && fetched.length > 0) {
          setReportsList(prev => {
            const map = new Map<string, DailyReport>();
            map.set(initialReportData.data, initialReportData);
            fetched.forEach(r => map.set(r.data, r));
            return Array.from(map.values()).sort((a, b) => b.data.localeCompare(a.data));
          });
        }
      } catch (e) {
        console.warn("Cloud reports load warning:", e);
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

  const handleLogout = async () => {
    if (auth) {
      try {
        await signOut(auth);
      } catch (e) {
        console.warn("SignOut error:", e);
      }
    }
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

      showToast("Relatório salvo com sucesso!", "success");
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
    const blankReport = getEmptyDailyReport();
    setCurrentReport(blankReport);
    setCurrentTab('form');
    showToast("Novo formulário em branco iniciado!", "success");
  };

  const handleDeleteReport = (id?: string) => {
    if (!id) return;
    if (confirm("Tem certeza que deseja excluir este relatório?")) {
      removeLocalReport(id);
      setReportsList(prev => prev.filter(r => r.id !== id));
      showToast("Relatório removido.", "success");
    }
  };

  // Se não estiver logado, exibe a tela de login protegida
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

      {/* Barra de Navegação Superior (Relatórios -> Preenchimento -> Relatório do Médico) */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        currentUser={user}
        onLogout={handleLogout}
        currentDate={currentReport.data}
      />

      {/* Conteúdo Dinâmico por Aba */}
      <main className="flex-1 pb-16">
        {currentTab === 'history' && (
          <HistoryView
            reports={reportsList}
            onSelectReport={handleSelectReport}
            onEditReport={handleEditReport}
            onNewReport={handleNewReport}
            onDeleteReport={handleDeleteReport}
          />
        )}

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
      </main>

      {/* Rodapé Simples */}
      <footer className="bg-white border-t border-gray-200/60 py-4 text-center text-xs text-gray-400">
        <p>CSOAM • Centro de Saúde Ocupacional da Amazônia &copy; 2026</p>
      </footer>

    </div>
  );
}
