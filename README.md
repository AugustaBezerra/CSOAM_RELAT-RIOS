# CSOAM • Produção Operacional Integrada

Sistema web moderno e simples para registro, consolidação e emissão de relatórios diários de saúde ocupacional da **CSOAM / ASO** (Centro de Saúde Ocupacional da Amazônia).

Desenvolvido para uso diário da equipe operacional e médica (Dona Rosineide Souza, Dra. Jessica Yasmin e enfermagem).

---

## 🌟 Funcionalidades

1. **Login Institucional Seguro:**
   - Tela *split screen* verde e branca moderna inspirada nas propostas da clínica.
   - Autenticação conectada ao Firebase Auth, com modo de acesso rápido da equipe para demonstração.

2. **Preenchimento Diário ("Planilha Inteligente"):**
   - Tela única e intuitiva com todos os blocos operacionais:
     - **Atendimentos Ocupacionais:** Admissional, Periódico, Demissional, Mudança de Risco e Consultas.
     - **Serviços de Enfermagem:** Triagem, Acuidade visual, Raio-X, Ergométrico, ECG, EEG, Espirometria e Dinamometria.
     - **Audiometria Ocupacional:** Exames admissionais, periódicos e demissionais com percentuais calculados na hora.
     - **Laboratório:** Coletas ocupacionais/particulares e exames realizados (Sangue, Ácidos, EPF, EAS, Coprocultura, etc.).
     - **Empresas Atendidas:** Registro dinâmico de empresas e quantidades de atendimentos.
     - **Observações / Ocorrências:** Campo de texto livre para anotações do plantão.
   - **Cálculos 100% Automáticos em Tempo Real:** Sem necessidade de calculadora; todos os totais e percentuais recalculam instantaneamente ao digitar.

3. **Relatório Visual do Médico (A4 Paisagem):**
   - Renderização idêntica ao dashboard executivo oficial aprovado pela clínica.
   - 5 Cartões KPI de destaque no topo com ícones 3D.
   - Gráficos de rosca dinâmicos e barras de dados de enfermagem.
   - Exportação nativa em 1 clique:
     - 📥 **Baixar PDF (A4 Paisagem)**
     - 🖼️ **Baixar Imagem PNG**

4. **Histórico Mensal:**
   - Lista organizada de todos os relatórios diários salvos no Cloud Firestore.
   - Permite consultar dias anteriores, carregar dados para edição ou reemitir PDFs.

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js 18+ ou 20+ instalado
- npm ou yarn

### 1. Instalação das Dependências
```bash
npm install
```

### 2. Configuração do Firebase
O arquivo `.env.local` contém as credenciais públicas do projeto Firebase `csoam-relatorios`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=sua_chave_firebase_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=csoam-relatorios.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=csoam-relatorios
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=csoam-relatorios.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=1:seu_sender_id:web:c1d765e245db62ac66f192
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-2VJ2P12VQK
```

### 3. Executando em Desenvolvimento
```bash
npm run dev
```
Acesse no seu navegador: `http://localhost:3000`

### 4. Build de Produção
```bash
npm run build
npm run start
```

---

## 🛠️ Tecnologias Utilizadas
- **Next.js 14 (App Router)**
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Firebase 10 (Auth & Cloud Firestore)**
- **Lucide Icons**
- **html2canvas & jsPDF** (Geração de relatórios em alta resolução)
