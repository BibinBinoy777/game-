import type {Metadata} from 'next';
import { Outfit, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Gully Kerala Premier | Village Padam Cricket',
  description: 'An arcade-style village cricket game set in rural Kerala on a lush paddy-field pitch with local rules, Manglish commentary, and synthesized chenda beats.',
  openGraph: {
    title: 'Gully Kerala Premier | Village Padam Cricket',
    description: 'An arcade-style village cricket game set in rural Kerala on a lush paddy-field pitch with local rules, Manglish commentary, and synthesized chenda beats.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gully Kerala Premier | Village Padam Cricket',
    description: 'An arcade-style village cricket game set in rural Kerala on a lush paddy-field pitch with local rules, Manglish commentary, and synthesized chenda beats.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${outfit.variable} ${jakarta.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-[#0e2414] text-[#fdfbf2] antialiased selection:bg-[#d4af37] selection:text-[#14361b] overflow-hidden" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
