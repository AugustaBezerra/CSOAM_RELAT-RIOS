"use client";

import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, ShieldCheck, HeartPulse, HardHat } from 'lucide-react';
import { basePath } from '@/lib/constants';

interface LoginCardProps {
  onLoginSuccess: (user: { name: string; role: string; email: string }) => void;
}

export const LoginCard: React.FC<LoginCardProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('rosineide.souza@csoam.com.br');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      onLoginSuccess({
        name: 'Rosineide Souza',
        role: 'TET / Enfermagem',
        email: email || 'rosineide.souza@csoam.com.br'
      });
      setLoading(false);
    }, 400);
  };

  const handleQuickDemo = (name: string, role: string) => {
    onLoginSuccess({
      name,
      role,
      email: `${name.toLowerCase().replace(' ', '.')}@csoam.com.br`
    });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F0F4F2] p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[640px] border border-gray-100">
        
        {/* LADO ESQUERDO: IDENTIDADE VISUAL CSOAM */}
        <div className="md:w-1/2 bg-gradient-to-br from-[#005228] via-[#006B35] to-[#008C45] p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden text-white">
          {/* Formas orgânicas de fundo */}
          <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-white/5 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#8BCF27]/10 blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-[#8BCF27]/5 blur-xl pointer-events-none" />

          {/* Topo: Logo CSOAM */}
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg p-1.5">
                <img 
                  src={`${basePath}/assets/csoam_aso_logo.png`}
                  alt="Logo CSOAM" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback visual icon
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-wider text-white">CSOAM</h1>
                <p className="text-xs text-white/80 font-medium">Centro de Saúde Ocupacional da Amazônia</p>
              </div>
            </div>
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-emerald-100 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-[#8BCF27] animate-pulse" />
              Produção Operacional Integrada
            </div>
          </div>

          {/* Centro: Arte de Saúde e Segurança do Trabalho */}
          <div className="relative z-10 my-8 py-6 flex flex-col items-center text-center">
            <div className="relative w-48 h-48 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-white/15 animate-spin" style={{ animationDuration: '30s' }} />
              <div className="absolute inset-4 rounded-full border border-dashed border-[#8BCF27]/40" />
              <div className="w-32 h-32 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center shadow-inner gap-2">
                <HeartPulse className="w-10 h-10 text-[#8BCF27]" />
                <HardHat className="w-7 h-7 text-emerald-100" />
              </div>
            </div>
            <p className="mt-4 text-sm text-emerald-100 font-light max-w-xs">
              Ambiente seguro para registro e emissão dos relatórios de saúde ocupacional da clínica.
            </p>
          </div>

          {/* Rodapé institucional */}
          <div className="relative z-10 border-l-4 border-[#8BCF27] pl-4">
            <p className="text-xs text-white/80 font-medium">Gestão inteligente. Cuidado integrado.</p>
            <p className="text-sm font-bold text-white tracking-wide">Saúde em primeiro lugar.</p>
          </div>
        </div>

        {/* LADO DIREITO: AUTENTICAÇÃO */}
        <div className="md:w-1/2 p-8 sm:p-12 flex flex-col justify-between bg-white">
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Bem-vinda de volta!</h2>
              <p className="mt-2 text-sm text-gray-500">
                Acesse sua conta para gerenciar a produção operacional da clínica.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Campo Usuário */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Usuário ou e-mail institucional
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Digite seu usuário ou e-mail"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#008C45] focus:ring-4 focus:ring-[#008C45]/10 text-gray-800 text-sm transition-all outline-none bg-gray-50/50 hover:bg-white"
                  />
                </div>
              </div>

              {/* Campo Senha */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Digite sua senha"
                    className="w-full pl-11 pr-11 py-3 rounded-xl border border-gray-200 focus:border-[#008C45] focus:ring-4 focus:ring-[#008C45]/10 text-gray-800 text-sm transition-all outline-none bg-gray-50/50 hover:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Opções extras */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-gray-600 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#008C45] focus:ring-[#008C45] border-gray-300"
                  />
                  <span>Manter conectado</span>
                </label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Por favor, solicite a redefinição à administração da CSOAM.'); }} className="text-[#008C45] font-semibold hover:underline">
                  Esqueci minha senha
                </a>
              </div>

              {/* Botão Entrar */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-[#008C45] hover:bg-[#007037] text-white font-bold text-sm shadow-lg shadow-[#008C45]/20 hover:shadow-xl hover:shadow-[#008C45]/30 transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Entrar no sistema</span>
                )}
              </button>
            </form>

            {/* Acesso rápido para testes */}
            <div className="mt-6 pt-5 border-t border-gray-100">
              <p className="text-xs text-gray-400 font-medium mb-2.5 text-center">Acesso Rápido da Equipe:</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('Rosineide Souza', 'TET / Enfermagem')}
                  className="flex-1 py-2 px-3 rounded-lg border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-800 text-xs font-semibold transition-colors text-center"
                >
                  👩‍⚕️ Dona Rosineide
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('Dra. Jessica Yasmin', 'Médica do Trabalho')}
                  className="flex-1 py-2 px-3 rounded-lg border border-blue-100 bg-blue-50/50 hover:bg-blue-50 text-blue-800 text-xs font-semibold transition-colors text-center"
                >
                  🩺 Dra. Jessica
                </button>
              </div>
            </div>
          </div>

          {/* Rodapé direito */}
          <div className="mt-8 pt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Ambiente interno seguro • CSOAM 2026</span>
          </div>
        </div>

      </div>
    </div>
  );
};
