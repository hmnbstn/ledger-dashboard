import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ledger — Operations Dashboard",
  description: "Daily operational KPIs for banking operations",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
