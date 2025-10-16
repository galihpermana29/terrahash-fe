import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import WalletProvider from "@/components/wallet/WalletProvider";
import QueryProvider from "@/components/providers/QueryProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import "./globals.css";

import 'leaflet/dist/leaflet.css';
import { Suspense } from "react";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TerraHash - Decentralized Land Registry",
  description: "Blockchain-based land registry system for transparent and secure land ownership management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <AntdRegistry>
          <QueryProvider>
            <WalletProvider>
              <AuthProvider>
                <Navbar />
                <Suspense>
                  {children}
                </Suspense>
              </AuthProvider>
            </WalletProvider>
          </QueryProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
