import type { Metadata } from "next";
import { Provider } from "@/components/ui/provider";
import "./globals.css";
import { Roboto } from 'next/font/google';

export const metadata: Metadata = {
  title: "Forkbomb Tools",
  description: "Web tools by Forkbomb Studio",
};

const roboto = Roboto({
    subsets: ['latin'],
    weight: ['400'], 
    display: 'swap',
    variable: '--font-roboto',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${roboto.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
