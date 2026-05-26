"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/components/UserProvider";
import { WorkProgram, Team, Meeting } from "@prisma/client";
import { ArrowLeft, Check, Edit2, Calendar, Target, Activity, FileText } from "lucide-react";
import Link from "next/link";

type ProgramDetail = WorkProgram & { 
  team: Team, 
  meetings: Meeting[] 
};

export default function ProgramDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { currentUser } = useUser();
  const [program, setProgram] = useState<ProgramDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit states
  const [editingDone, setEditingDone] = useState(false);
  const [doneText, setDoneText] = useState("");
  const [editingNext, setEditingNext] = useState(false);
  const [nextText, setNextText] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetch(`/api/programs/${params.id}`)
        .then(res => {
          if (!res.ok) throw new Error("Not found");
          return res.json();
        })
        .then((data: ProgramDetail) => {
          setProgram(data);
          setDoneText(data.whatHasBeenDone);
          setNextText(data.nextActivity);
          setLoading(false);
        })
        .catch(() => {
          router.push("/programs");
        });
    }
  }, [params.id, router]);

  const canEdit = () => {
    return !!currentUser;
  };

  const saveUpdates = async (field: "done" | "next") => {
    if (!program) return;
    setSaving(true);
    
    const payload = field === "done" 
      ? { whatHasBeenDone: doneText } 
      : { nextActivity: nextText };

    const res = await fetch(`/api/programs/${program.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...program, ...payload })
    });

    if (res.ok) {
      const updated = await res.json();
      setProgram({ ...program, ...updated });
      if (field === "done") setEditingDone(false);
      else setEditingNext(false);
    } else {
      alert("Gagal menyimpan data");
    }
    setSaving(false);
  };

  if (loading) return <div className="py-20 text-center animate-pulse text-slate-500">Memuat Detail...</div>;
  if (!program) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <Link href="/programs" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors mb-4">
        <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Daftar
      </Link>

      <div className="glass-panel p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
          <div className="flex-1 space-y-4">
            <div className="flex items-center space-x-3">
              <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                {program.team.name}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                program.priority === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' :
                program.priority === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' :
                'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
              }`}>
                Prioritas: {program.priority}
              </span>
            </div>
            
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white leading-tight">
              {program.programKerja}
            </h1>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800/50">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold mb-1">Kategori</p>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{program.kategori}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold mb-1">Target</p>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{program.target || "-"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold mb-1">Output</p>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{program.output || "-"}</p>
              </div>
            </div>
          </div>

          {/* Progress Card */}
          <div className="w-full md:w-64 bg-white dark:bg-slate-800/80 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center text-center">
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Progress Saat Ini</span>
            <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-4">{program.progress}%</span>
            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-1000" style={{ width: `${program.progress}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* What Has Been Done */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-500" />
              What Has Been Done
            </h3>
            {canEdit() && !editingDone && (
              <button onClick={() => setEditingDone(true)} className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                <Edit2 className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <div className="flex-1">
            {editingDone ? (
              <div className="space-y-3 h-full flex flex-col">
                <textarea 
                  value={doneText} 
                  onChange={e => setDoneText(e.target.value)}
                  className="w-full flex-1 min-h-[150px] p-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none text-slate-800 dark:text-slate-200"
                  placeholder="Deskripsikan apa saja yang sudah diselesaikan..."
                />
                <div className="flex justify-end space-x-2">
                  <button onClick={() => { setEditingDone(false); setDoneText(program.whatHasBeenDone); }} className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">Batal</button>
                  <button disabled={saving} onClick={() => saveUpdates("done")} className="px-4 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center transition-colors disabled:opacity-50">
                    <Check className="w-3 h-3 mr-1" /> {saving ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed h-full">
                {program.whatHasBeenDone ? program.whatHasBeenDone : <span className="text-slate-400 italic">Belum ada catatan aktivitas.</span>}
              </div>
            )}
          </div>
        </div>

        {/* Next Activity */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center">
              <Target className="w-5 h-5 mr-2 text-indigo-500" />
              Next Activity
            </h3>
            {canEdit() && !editingNext && (
              <button onClick={() => setEditingNext(true)} className="p-2 text-slate-400 hover:text-indigo-600 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors">
                <Edit2 className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <div className="flex-1">
            {editingNext ? (
              <div className="space-y-3 h-full flex flex-col">
                <textarea 
                  value={nextText} 
                  onChange={e => setNextText(e.target.value)}
                  className="w-full flex-1 min-h-[150px] p-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-slate-800 dark:text-slate-200"
                  placeholder="Deskripsikan rencana aktivitas selanjutnya..."
                />
                <div className="flex justify-end space-x-2">
                  <button onClick={() => { setEditingNext(false); setNextText(program.nextActivity); }} className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">Batal</button>
                  <button disabled={saving} onClick={() => saveUpdates("next")} className="px-4 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center transition-colors disabled:opacity-50">
                    <Check className="w-3 h-3 mr-1" /> {saving ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed h-full">
                {program.nextActivity ? program.nextActivity : <span className="text-slate-400 italic">Belum ada rencana selanjutnya.</span>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Meeting History Section */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm mt-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-slate-500 dark:text-slate-400" />
            Riwayat & Jadwal Meeting Terkait
          </h3>
          <Link href="/meetings" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-sm font-medium rounded-lg transition-colors text-slate-700 dark:text-slate-300">
            Jadwalkan Baru
          </Link>
        </div>
        
        {program.meetings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {program.meetings.map(m => {
              const isPast = new Date(m.date) < new Date();
              return (
                <div key={m.id} className={`p-4 rounded-xl border ${isPast ? 'bg-slate-50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-800 opacity-70' : 'bg-white border-blue-100 dark:bg-slate-800 dark:border-blue-900/30'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${isPast ? 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'}`}>
                      {isPast ? 'Selesai' : 'Mendatang'}
                    </span>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {new Date(m.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-800 dark:text-white text-sm mb-2">{m.title}</h4>
                  <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(m.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute:'2-digit' })} WIB
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800">
            <FileText className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Belum ada meeting yang dijadwalkan untuk program kerja ini.</p>
          </div>
        )}
      </div>

    </div>
  );
}
