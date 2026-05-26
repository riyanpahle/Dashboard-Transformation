import { PrismaClient } from "@prisma/client";
import { 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Briefcase
} from "lucide-react";
import Link from "next/link";

const prisma = new PrismaClient();

export default async function DashboardPage() {
  // Fetch data
  const teams = await prisma.team.findMany();
  const workPrograms = await prisma.workProgram.findMany({
    include: { team: true }
  });
  const upcomingMeetings = await prisma.meeting.findMany({
    where: {
      date: { gte: new Date() }
    },
    orderBy: { date: "asc" },
    take: 5,
    include: { workProgram: { include: { team: true } } }
  });

  // Calculate statistics
  const totalPrograms = workPrograms.length;
  const avgProgress = totalPrograms > 0 
    ? Math.round(workPrograms.reduce((acc, wp) => acc + wp.progress, 0) / totalPrograms)
    : 0;
  
  const highPriorityCount = workPrograms.filter(wp => wp.priority === "High").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Overview</h2>
        <div className="text-sm text-slate-500">
          Last updated: {new Date().toLocaleDateString('id-ID')}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Program Kerja</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{totalPrograms}</h3>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Rata-rata Progress</p>
            <div className="flex items-baseline space-x-2">
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{avgProgress}%</h3>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Prioritas Tinggi</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{highPriorityCount}</h3>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Meeting Mendatang</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{upcomingMeetings.length}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress per Team */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Progress Tim</h3>
            <Link href="/programs" className="text-sm text-blue-600 hover:underline">Lihat Detail</Link>
          </div>
          
          <div className="space-y-6">
            {teams.map(team => {
              const teamWPs = workPrograms.filter(wp => wp.teamId === team.id);
              const teamAvg = teamWPs.length > 0
                ? Math.round(teamWPs.reduce((acc, wp) => acc + wp.progress, 0) / teamWPs.length)
                : 0;
                
              return (
                <div key={team.id} className="relative">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-slate-700 dark:text-slate-200">{team.name}</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{teamAvg}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${teamAvg}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Meetings */}
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Meeting Mendatang</h3>
            <Link href="/meetings" className="text-sm text-blue-600 hover:underline">Semua</Link>
          </div>

          <div className="space-y-4">
            {upcomingMeetings.length > 0 ? (
              upcomingMeetings.map(meeting => (
                <div key={meeting.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/50 hover:border-blue-200 transition-colors">
                  <h4 className="font-semibold text-slate-800 dark:text-white text-sm mb-1">{meeting.title}</h4>
                  <div className="flex items-center text-xs text-slate-500 mb-2">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(meeting.date).toLocaleString('id-ID', {
                      weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit'
                    })}
                  </div>
                  <div className="inline-flex items-center px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium">
                    {meeting.workProgram.team.name}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500 text-sm">
                Tidak ada meeting terjadwal.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
