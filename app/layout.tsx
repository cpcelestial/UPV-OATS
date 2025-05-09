import type { Metadata } from "next";
import { Karla, Fira_Sans } from 'next/font/google';
import "./globals.css";

const karla = Karla({ subsets: ['latin'] });
const fira_sans = Fira_Sans({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-fira_sans'
});

export const metadata: Metadata = {
  title: "UPV OATS",
  description: "An online appointment tracking system (OATS) for UPV students and faculty.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true} data-qb-installed="true">
      <body className={`${karla.className} ${fira_sans.variable}`}>{children}</body>
    </html>
  );
}
