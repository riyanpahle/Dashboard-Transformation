import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/components/UserProvider";
import { AppLayout } from "@/components/AppLayout";
import { ThemeProvider } from "@/components/ThemeProvider";
import { PrismaClient } from "@prisma/client";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dashboard DTP",
  description: "Dashboard Progress Divisi Transformasi Perusahaan",
};

const prisma = new PrismaClient();

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch users for the mock login context
  const users = await prisma.user.findMany({
    include: { team: true },
  });

  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <UserProvider initialUsers={users}>
            <AppLayout>
              {children}
            </AppLayout>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
