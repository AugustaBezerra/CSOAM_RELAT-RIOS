import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CSOAM | Produção Operacional Integrada',
  description: 'Sistema de Relatórios Diários de Saúde Ocupacional da CSOAM / ASO',
  icons: {
    icon: '/assets/csoam_aso_logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased selection:bg-[#8BCF27]/30 selection:text-[#006B35]">
        {children}
      </body>
    </html>
  );
}
