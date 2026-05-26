"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/components/UserProvider";
import { WorkProgram, Team } from "@prisma/client";
import { Plus, Edit2, Trash2, X, Check } from "lucide-react";
import Link from "next/link";

type WPWithTeam = WorkProgram & { team: Team };

export default function ProgramsPage() {
  const { currentUser, users } = useUser();
  const [programs, setPrograms] = useState<WPWithTeam[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    no: "",
    kategori: "",
    programKerja: "",
    output: "",
    target: "",
    linkToRjpp: "",
    effortLevel: "Medium",
    impactLevel: "Medium",
    priority: "Medium",
    whatHasBeenDone: "",
    nextActivity: "",
    teamId: "",
  });

  // Inline edit state
  const [editProgressId, setEditProgressId] = useState<string | null>(null);
  const [tempProgress, setTempProgress] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [progRes, teamsRes] = await Promise.all([
      fetch("/api/programs"),
      fetch("/api/teams") // We need to create this API route
    ]);
    if (progRes.ok) setPrograms(await progRes.json());
    if (teamsRes.ok) setTeams(await teamsRes.json());
    setLoading(false);
  };

  const updateProgress = async (id: string, newProgress: number) => {
    setPrograms(prev => prev.map(p => p.id === id ? { ...p, progress: newProgress } : p));
    await fetch(`/api/programs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ progress: newProgress })
    });
  };

  const handleProgressSubmit = (id: string) => {
    let val = parseInt(tempProgress);
    if (isNaN(val)) val = 0;
    if (val < 0) val = 0;
    if (val > 100) val = 100;
    updateProgress(id, val);
    setEditProgressId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus program kerja ini?")) return;
    await fetch(`/api/programs/${id}`, { method: 'DELETE' });
    setPrograms(prev => prev.filter(p => p.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      const res = await fetch(`/api/programs/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) fetchData();
    } else {
      const res = await fetch(`/api/programs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) fetchData();
    }
    closeModal();
  };

  const openModal = (wp?: WPWithTeam) => {
    if (wp) {
      setEditingId(wp.id);
      setFormData({
        no: wp.no,
        kategori: wp.kategori,
        programKerja: wp.programKerja,
        output: wp.output,
        target: wp.target,
        linkToRjpp: wp.linkToRjpp,
        effortLevel: wp.effortLevel,
        impactLevel: wp.impactLevel,
        priority: wp.priority,
        whatHasBeenDone: wp.whatHasBeenDone,
        nextActivity: wp.nextActivity,
        teamId: wp.teamId,
      });
    } else {
      setEditingId(null);
      setFormData({
        no: "", kategori: "", programKerja: "", output: "", target: "", 
        linkToRjpp: "", effortLevel: "Medium", impactLevel: "Medium", 
        priority: "Medium", whatHasBeenDone: "", nextActivity: "", 
        teamId: currentUser?.teamId || (teams[0]?.id || ""),
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const canEdit = (wp: WPWithTeam) => {
    if (!currentUser) return false;
    if (currentUser.role === "Kepala Divisi") return true;
    if (currentUser.teamId === wp.teamId) return true;
    return false;
  };

  const canCreate = () => {
    return currentUser?.role === "Kepala Divisi" || currentUser?.teamId != null;
  };

  if (loading) return <div className="text-center py-20 animate-pulse text-slate-500">Memuat Data...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Program Kerja</h2>
          <p className="text-slate-500 text-sm mt-1">Kelola dan pantau progress program kerja setiap tim</p>
        </div>
        {canCreate() && (
          <button 
            onClick={() => openModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center shadow-lg shadow-blue-500/30"
          >
            <Plus className="w-4 h-4 mr-2" /> Tambah Program
          </button>
        )}
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-600 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-4 whitespace-nowrap">Tim</th>
                <th className="px-4 py-4 whitespace-nowrap">Program Kerja</th>
                <th className="px-4 py-4 whitespace-nowrap">Kategori</th>
                <th className="px-4 py-4 whitespace-nowrap">Prioritas</th>
                <th className="px-4 py-4 whitespace-nowrap">Progress</th>
                <th className="px-4 py-4 whitespace-nowrap text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {programs.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-slate-500">Belum ada program kerja.</td></tr>
              )}
              {programs.map(wp => (
                <tr key={wp.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-4 font-medium text-slate-800 dark:text-slate-200">
                    <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs px-2 py-1 rounded">{wp.team.name}</span>
                  </td>
                  <td className="px-4 py-4 max-w-xs truncate" title={wp.programKerja}>
                    <Link href={`/programs/${wp.id}`} className="hover:text-blue-600 hover:underline font-medium transition-colors">
                      {wp.programKerja}
                    </Link>
                  </td>
                  <td className="px-4 py-4">{wp.kategori}</td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      wp.priority === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' :
                      wp.priority === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' :
                      'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                    }`}>
                      {wp.priority}
                    </span>
                  </td>
                  <td className="px-4 py-4 min-w-[200px]">
                    <div className="flex items-center space-x-3">
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${wp.progress}%` }}></div>
                      </div>
                      
                      {editProgressId === wp.id ? (
                        <div className="flex items-center space-x-1">
                          <input 
                            type="number" 
                            min="0" max="100" 
                            autoFocus
                            value={tempProgress}
                            onChange={(e) => setTempProgress(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleProgressSubmit(wp.id); }}
                            className="w-14 px-1 py-1 text-xs border rounded bg-white dark:bg-slate-800 dark:text-white"
                          />
                          <button onClick={() => handleProgressSubmit(wp.id)} className="text-green-600 hover:text-green-700"><Check className="w-4 h-4"/></button>
                        </div>
                      ) : (
                        <span 
                          onClick={() => {
                            if(canEdit(wp)) {
                              setTempProgress(wp.progress.toString());
                              setEditProgressId(wp.id);
                            }
                          }}
                          className={`text-xs font-medium w-8 text-right ${canEdit(wp) ? "cursor-pointer hover:underline text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-300"}`}
                          title={canEdit(wp) ? "Klik untuk mengubah persentase" : ""}
                        >
                          {wp.progress}%
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    {canEdit(wp) ? (
                      <div className="flex justify-end space-x-2">
                        <button onClick={() => openModal(wp)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(wp.id)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">No Access</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal CRUD */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">{editingId ? "Edit Program Kerja" : "Tambah Program Kerja Baru"}</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="wp-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Tim Pelaksana</label>
                    <select required value={formData.teamId} onChange={e => setFormData({...formData, teamId: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none">
                      <option value="" disabled>Pilih Tim</option>
                      {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Kategori</label>
                    <input required type="text" value={formData.kategori} onChange={e => setFormData({...formData, kategori: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none" placeholder="Cth: SDM / Business" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Nama Program Kerja</label>
                  <input required type="text" value={formData.programKerja} onChange={e => setFormData({...formData, programKerja: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Output</label>
                    <input type="text" value={formData.output} onChange={e => setFormData({...formData, output: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Target</label>
                    <input type="text" value={formData.target} onChange={e => setFormData({...formData, target: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none" placeholder="Cth: Des 2026" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Priority</label>
                    <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none">
                      <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Effort</label>
                    <select value={formData.effortLevel} onChange={e => setFormData({...formData, effortLevel: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none">
                      <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Impact</label>
                    <select value={formData.impactLevel} onChange={e => setFormData({...formData, impactLevel: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none">
                      <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end space-x-3">
              <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-800">Batal</button>
              <button type="submit" form="wp-form" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
                {editingId ? "Simpan Perubahan" : "Buat Program"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
