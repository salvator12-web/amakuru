import type { Metadata } from "next";
import "./globals.css";
import { AuthUserProvider } from "@/lib/hooks/useAuthUser";

export const metadata: Metadata = {
  title: "Amakuru",
  description: "Amakuru news platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthUserProvider>{children}</AuthUserProvider>
      </body>
    </html>
  );
}
