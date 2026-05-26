"use client";

import { useUser } from "./UserProvider";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Briefcase, 
  Calendar, 
  Bell, 
  User, 
  LogOut,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, setCurrentUser } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!currentUser && pathname !== "/login") {
      router.push("/login");
    }
  }, [currentUser, pathname, router]);

  if (pathname === "/login") {
    return <div className="h-screen w-full bg-slate-50 dark:bg-slate-900">{children}</div>;
  }

  if (!currentUser) return null;

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Program Kerja", href: "/programs", icon: Briefcase },
    { name: "Jadwal & Reminder", href: "/meetings", icon: Calendar },
  ];

  const handleLogout = () => {
    setCurrentUser(null);
    router.push("/login");
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-0 opacity-0 md:opacity-100 md:w-20'} bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 z-20 whitespace-nowrap overflow-hidden shrink-0`}>
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center mr-3 shadow-lg shadow-blue-500/30 shrink-0">
            <span className="text-white font-bold text-lg">T</span>
          </div>
          <span className={`font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
            DTP Panel
          </span>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto overflow-x-hidden">
          <div className="space-y-1 mb-6">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link 
                  key={item.name} 
                  href={item.href}
                  className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive 
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium" 
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                  title={!isSidebarOpen ? item.name : undefined}
                >
                  <Icon className={`w-5 h-5 transition-colors shrink-0 ${isSidebarOpen ? 'mr-3' : 'mx-auto'} ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"}`} />
                  <span className={`transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden md:block md:w-0'}`}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>

          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 group text-slate-500 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200`}
            title={isSidebarOpen ? "Sembunyikan Panel" : "Buka Panel"}
          >
            {isSidebarOpen ? (
              <ChevronLeft className="w-5 h-5 transition-colors shrink-0 mr-3" />
            ) : (
              <ChevronRight className="w-5 h-5 transition-colors shrink-0 mx-auto" />
            )}
            <span className={`text-sm font-medium transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden md:block md:w-0'}`}>
              Sembunyikan Panel
            </span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative transition-all">
        {/* Header */}
        <header className="h-16 glass z-10 flex items-center justify-between px-8 absolute top-0 left-0 right-0">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold text-slate-800 dark:text-white capitalize">
              {pathname === "/" ? "Dashboard" : pathname.replace("/", "")}
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            {mounted && (
              <button 
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Toggle Theme"
              >
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            )}

            <div className="relative">
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications && notifications.length === 0) {
                    fetch("/api/activity")
                      .then(res => res.json())
                      .then(setNotifications);
                  }
                }}
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative focus:outline-none"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700 mb-2">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200">Riwayat Aktivitas</h3>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-slate-500">Memuat riwayat...</div>
                  ) : (
                    notifications.map((log: any) => (
                      <div key={log.id} className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-50 dark:border-slate-700/50 last:border-0">
                        <div className="flex items-start">
                          <div className={`w-2 h-2 mt-1.5 rounded-full mr-3 shrink-0 ${log.action === "MENGHAPUS" ? "bg-red-500" : log.action === "MEMBUAT" ? "bg-green-500" : "bg-blue-500"}`} />
                          <div>
                            <p className="text-sm text-slate-700 dark:text-slate-300">
                              <span className="font-semibold">{log.actorName}</span> {log.action.toLowerCase()} <span className="font-medium text-slate-900 dark:text-white">{log.entityTitle}</span>
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">{log.details}</p>
                            <p className="text-[10px] text-slate-400 mt-1">
                              {new Date(log.createdAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            
            <div className="relative">
              <button 
                className="flex items-center space-x-3 focus:outline-none pl-2"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="text-right hidden md:block">
                  <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">{currentUser?.name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{currentUser?.role}</div>
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-md">
                  {currentUser?.name.charAt(0) || "U"}
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-1 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700 md:hidden">
                    <div className="font-medium text-slate-800 dark:text-slate-200">{currentUser?.name}</div>
                    <div className="text-xs text-slate-500">{currentUser?.role}</div>
                  </div>
                  <button className="w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center">
                    <User className="w-4 h-4 mr-2" /> Profil
                  </button>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center">
                    <LogOut className="w-4 h-4 mr-2" /> Keluar
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto pt-24 p-8">
          <div className="max-w-7xl mx-auto h-full animate-in fade-in duration-500">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
