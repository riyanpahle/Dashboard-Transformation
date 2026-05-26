"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/components/UserProvider";
import { WorkProgram, Meeting, Team, User } from "@prisma/client";
import { Calendar as CalendarIcon, Plus, Mail, ExternalLink } from "lucide-react";

type MeetingWithRelations = Meeting & { workProgram: WorkProgram & { team: Team } };
type WPWithTeam = WorkProgram & { team: Team };

export default function MeetingsPage() {
  const { currentUser, users } = useUser();
  const [meetings, setMeetings] = useState<MeetingWithRelations[]>([]);
  const [programs, setPrograms] = useState<WPWithTeam[]>([]);
  const [showForm, setShowForm] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [programId, setProgramId] = useState("");
  const [notifyKadiv, setNotifyKadiv] = useState(false);
  const [participantEmails, setParticipantEmails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/meetings").then(res => res.json()).then(setMeetings);
    fetch("/api/programs").then(res => res.json()).then(setPrograms);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Combine date and time
    const dateTime = new Date(`${date}T${time}`);
    
    const res = await fetch("/api/meetings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        date: dateTime.toISOString(),
        workProgramId: programId,
        notifyKepalaDivisi: notifyKadiv,
        participantEmails,
        description: `Meeting untuk program kerja: ${programs.find(p => p.id === programId)?.programKerja}`
      })
    });

    if (res.ok) {
      const newMeeting = await res.json();
      setMeetings([...meetings, newMeeting]);
      setShowForm(false);
      setTitle(""); setDate(""); setTime(""); setProgramId(""); setNotifyKadiv(false); setParticipantEmails("");
    }
    setSubmitting(false);
  };

  const getGCalLink = (m: MeetingWithRelations) => {
    const start = new Date(m.date);
    const end = new Date(start.getTime() + 60 * 60 * 1000); // +1 hour
    
    const formatGcalDate = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");
    
    // Kumpulkan email peserta
    const guests = [];
    if (m.participantEmails) {
      guests.push(...m.participantEmails.split(",").map(e => e.trim()).filter(e => e));
    }
    if (m.notifyKepalaDivisi) {
      guests.push("riyanpahlevi97@gmail.com"); // Email Kepala Divisi yang disepakati
    }

    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: m.title,
      dates: `${formatGcalDate(start)}/${formatGcalDate(end)}`,
      details: `${m.description}\n\nTerkait Program: ${m.workProgram.programKerja} (${m.workProgram.team.name})`,
    });
    
    if (guests.length > 0) {
      params.append("add", guests.join(","));
    }

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Jadwal & Reminder</h2>
          <p className="text-slate-500 text-sm mt-1">Kelola jadwal meeting dan sinkronisasi ke Google Calendar</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center shadow-lg shadow-blue-500/30"
        >
          <Plus className="w-4 h-4 mr-2" />
          Jadwal Baru
        </button>
      </div>

      {showForm && (
        <div className="glass-panel p-6 rounded-2xl animate-in slide-in-from-top-4 fade-in duration-300">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Buat Jadwal Meeting Baru</h3>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Judul Meeting</label>
                <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Cth: Pembahasan Internal..." />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Terkait Program Kerja</label>
                <select required value={programId} onChange={e => setProgramId(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="" disabled>Pilih Program Kerja</option>
                  {programs.map(p => (
                    <option key={p.id} value={p.id}>{p.team.name} - {p.programKerja.substring(0, 40)}...</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tanggal</label>
                <input required type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Waktu</label>
                <input required type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Peserta (Pisahkan dengan koma)</label>
                <input type="text" value={participantEmails} onChange={e => setParticipantEmails(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Cth: anggota1@dtp.com, anggota2@dtp.com" />
              </div>
            </div>
            
            <div className="flex items-center space-x-3 py-2">
              <input 
                type="checkbox" 
                id="notifyKadiv" 
                checked={notifyKadiv} 
                onChange={e => setNotifyKadiv(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <label htmlFor="notifyKadiv" className="text-sm text-slate-700 dark:text-slate-300">
                Kirim Undangan ke Kepala Divisi (riyanpahlevi97@gmail.com)
              </label>
            </div>

            <div className="flex justify-end pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-800 mr-2">Batal</button>
              <button disabled={submitting} type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                {submitting ? "Menyimpan..." : "Simpan & Kirim Notifikasi"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {meetings.length === 0 && !showForm && (
          <div className="col-span-full text-center py-20 text-slate-500">Belum ada jadwal meeting.</div>
        )}
        {meetings.map(meeting => (
          <div key={meeting.id} className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 text-xs px-2 py-1 rounded font-medium">
                  {meeting.workProgram.team.name}
                </span>
                {meeting.notifyKepalaDivisi && (
                  <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded flex items-center" title="Termasuk Kepala Divisi">
                    <Mail className="w-3 h-3 mr-1" /> Kadiv
                  </span>
                )}
              </div>
              <h4 className="font-bold text-slate-800 dark:text-white text-lg mb-2 leading-tight">{meeting.title}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                Program: {meeting.workProgram.programKerja}
              </p>
            </div>
            
            <div className="mt-auto space-y-4">
              <div className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                <CalendarIcon className="w-4 h-4 mr-2 text-blue-500" />
                {new Date(meeting.date).toLocaleString('id-ID', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute:'2-digit'
                })}
              </div>
              
              <a 
                href={getGCalLink(meeting)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center space-x-2 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-700 dark:text-slate-300 transition-colors py-2 rounded-lg text-sm font-medium"
              >
                <span>Add to Google Calendar</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
