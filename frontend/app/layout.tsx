import type { Metadata } from "next";
import "./globals.css";
import LanguageProvider from "@/lib/i18n/LanguageProvider";

export const metadata: Metadata = {
  title: "Amakuru",
  description: "Amakuru news platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
