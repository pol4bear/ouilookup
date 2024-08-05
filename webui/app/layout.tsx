import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import ThemeConfig from "@/components/ThemeConfig";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OUI Lookup",
  description: "Search OUI information",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeConfig>
    <html lang="en" suppressHydrationWarning={true}>
      <body className={inter.className}>
        {children}
      </body>
    </html>
    </ThemeConfig>
  );
}
