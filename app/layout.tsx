import type { Metadata } from "next";
import type { CSSProperties } from "react";
import "./globals.css";
import { GalaProvider } from "./lib/store";

export const metadata: Metadata = {
  title: "Gala de Remise de Médailles — 2024",
  description:
    "Application de check-in et de visualisation de salle pour le Gala de Remise de Médailles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className="h-full antialiased"
      style={
        {
          "--font-cinzel": '"Playfair Display", ui-serif, Georgia, serif',
          "--font-inter": 'ui-sans-serif, system-ui, sans-serif',
        } as CSSProperties
      }
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <GalaProvider>{children}</GalaProvider>
      </body>
    </html>
  );
}
