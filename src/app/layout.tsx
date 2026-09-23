import type { Metadata } from "next";
import "./global.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "MYFIN — Student Expense Tracker",
  description: "Enterprise financial management dashboard for university students",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
