"use client";

import { useUser } from "@/components/UserProvider";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Lock } from "lucide-react";
import { ThemeProvider, useTheme } from "next-themes";

export default function LoginPage() {
  const { users, setCurrentUser, currentUser } = useUser();
  const router = useRouter();
  const [selectedUserId, setSelectedUserId] = useState("");
  const [password, setPassword] = useState("");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (currentUser) {
      router.push("/");
    }
  }, [currentUser, router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return alert("Pilih akun terlebih dahulu.");
    // In a real app we'd check password, but for this prototype we just log them in
    if (password === "") return alert("Masukkan password (bebas untuk simulasi).");

    const user = users.find(u => u.id === selectedUserId);
    if (user) {
      setCurrentUser(user);
      router.push("/");
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors duration-300 p-4">
      <div className="absolute top-4 right-4">
        <button 
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
        >
          {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
        </button>
      </div>

      <div className="w-full max-w-md glass-panel p-8 rounded-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">DTP Portal</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 text-center">
            Login untuk mengelola Program Kerja Divisi Transformasi Perusahaan
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Pilih Akun</label>
            <select 
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-slate-200 transition-all"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              required
            >
              <option value="" disabled>-- Pilih Akun Anda --</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.team ? u.team.name : u.role})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Masukkan password..."
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-slate-200 transition-all"
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 rounded-xl shadow-lg shadow-blue-500/25 transition-all active:scale-95"
          >
            Masuk ke Dashboard
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400">
            Hanya untuk penggunaan internal.<br/>(Untuk demo: bebas isi password apa saja)
          </p>
        </div>
      </div>
    </div>
  );
}
