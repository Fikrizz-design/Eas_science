import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { auth } from '../db/firebase';
import { motion } from 'motion/react';
import {
  Terminal, Users, BookOpen, MessageSquare, Target, CalendarDays, RefreshCw,
  CheckCircle2, XCircle, AlertTriangle, ShieldAlert, Loader2, Sparkles
} from 'lucide-react';

function StatusPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className={`flex items-center justify-between px-4 py-2.5 rounded-xl border ${ok ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
      <span className="text-sm text-gray-300 font-mono">{label}</span>
      {ok ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
    </div>
  );
}

function StatTile({ icon: Icon, label, value, color }: { icon: any; label: string; value: number | string; color: string }) {
  return (
    <div className="hud-corners bg-black/30 border border-white/10 rounded-2xl p-5">
      <div className={`flex items-center space-x-2 mb-2 ${color}`}>
        <Icon className="w-4 h-4" />
        <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400">{label}</span>
      </div>
      <p className="text-2xl font-mono font-bold text-white">{value}</p>
    </div>
  );
}

export function DeveloperPanel() {
  const { userData } = useStore();
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStatus = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    setError('');
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch('/api/system-status', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load system status');
      setStatus(data);
    } catch (e: any) {
      setError(e.message || 'Failed to load system status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStatus(); }, []);

  if (userData?.role !== 'developer') {
    return (
      <div className="max-w-lg mx-auto text-center py-24">
        <ShieldAlert className="w-14 h-14 text-red-400 mx-auto mb-4" />
        <h1 className="text-2xl font-display font-bold text-white mb-2">Access Denied</h1>
        <p className="text-gray-400 text-sm">Halaman ini hanya untuk role developer.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-8">
      <motion.header initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-3">
          <Terminal className="w-9 h-9 text-signal-cyan" />
          <div>
            <h1 className="text-2xl font-display font-bold text-white">Developer Panel</h1>
            <p className="text-sm text-gray-400 font-mono">Full-system monitoring — root access</p>
          </div>
        </div>
        <button
          onClick={fetchStatus}
          disabled={loading}
          className="flex items-center space-x-2 text-xs text-signal-cyan hover:text-white bg-signal-cyan/10 hover:bg-signal-cyan/20 px-4 py-2 rounded-lg border border-signal-cyan/30 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </motion.header>

      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-4 rounded-xl text-sm">{error}</div>}

      {loading && !status ? (
        <div className="flex justify-center py-16"><Loader2 className="w-10 h-10 text-signal-cyan animate-spin" /></div>
      ) : status && (
        <>
          {/* Content stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <StatTile icon={Users} label="Users" value={status.counts.users} color="text-brand-300" />
            <StatTile icon={BookOpen} label="Library" value={status.counts.library} color="text-teal-400" />
            <StatTile icon={Target} label="Debates" value={status.counts.debates} color="text-red-400" />
            <StatTile icon={MessageSquare} label="Posts" value={status.counts.posts} color="text-indigo-400" />
            <StatTile icon={CalendarDays} label="Phenomena" value={status.counts.phenomena} color="text-emerald-400" />
          </div>

          {/* Role & generation breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-brand-900/40 p-6 rounded-3xl border border-white/10">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Role Breakdown</h2>
              <div className="space-y-2">
                {Object.entries(status.roleCounts).map(([role, count]: any) => (
                  <div key={role} className="flex items-center justify-between text-sm">
                    <span className="text-gray-300 capitalize font-mono">{role}</span>
                    <span className="text-white font-bold">{count}</span>
                  </div>
                ))}
              </div>
              {status.pendingWarnings > 0 && (
                <div className="mt-4 flex items-center space-x-2 text-amber-400 text-xs bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-lg">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{status.pendingWarnings} user memiliki riwayat warning</span>
                </div>
              )}
            </div>

            <div className="bg-brand-900/40 p-6 rounded-3xl border border-white/10">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Generation Breakdown</h2>
              <div className="space-y-2">
                {Object.entries(status.genCounts).length === 0 && <p className="text-sm text-gray-500">No data.</p>}
                {Object.entries(status.genCounts).map(([gen, count]: any) => (
                  <div key={gen} className="flex items-center justify-between text-sm">
                    <span className="text-gray-300 font-mono">{gen}</span>
                    <span className="text-white font-bold">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Env / integration health */}
          <div className="bg-brand-900/40 p-6 rounded-3xl border border-white/10">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Integration Health</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <StatusPill ok={status.env.firebaseServiceAccount} label="FIREBASE_SERVICE_ACCOUNT" />
              <StatusPill ok={status.env.groqApiKey} label="GROQ_API_KEY" />
              <StatusPill ok={status.env.resendApiKey} label="RESEND_API_KEY" />
              <StatusPill ok={status.env.emailFrom} label="EMAIL_FROM" />
              <StatusPill ok={status.env.nasaApiKey} label="NASA_API_KEY (optional)" />
              <StatusPill ok={status.env.cronSecret} label="CRON_SECRET" />
            </div>
          </div>

          {/* Daily quiz + SEO status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-brand-900/40 p-6 rounded-3xl border border-white/10">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Daily Quiz — {status.quiz.today}</h2>
              {status.quiz.generated ? (
                <p className="text-sm text-green-400 flex items-center"><CheckCircle2 className="w-4 h-4 mr-2" /> {status.quiz.questionCount} soal sudah tersedia hari ini</p>
              ) : (
                <p className="text-sm text-amber-400 flex items-center"><AlertTriangle className="w-4 h-4 mr-2" /> Belum ada yang mengakses kuis hari ini (akan digenerate saat user pertama buka)</p>
              )}
            </div>
            <div className="bg-brand-900/40 p-6 rounded-3xl border border-white/10">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center"><Sparkles className="w-4 h-4 mr-2" /> SEO Status</h2>
              {status.seo ? (
                <p className="text-sm text-gray-300">Terakhir digenerate: <span className="text-white">{new Date(status.seo.generatedAt).toLocaleString('id-ID')}</span></p>
              ) : (
                <p className="text-sm text-amber-400">Belum pernah digenerate.</p>
              )}
            </div>
          </div>

          {/* Recent errors */}
          <div className="bg-brand-900/40 p-6 rounded-3xl border border-white/10">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Recent Client Errors ({status.recentErrors.length})</h2>
            {status.recentErrors.length === 0 ? (
              <p className="text-sm text-gray-500">Tidak ada error yang tercatat baru-baru ini. 🎉</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
                {status.recentErrors.map((e: any) => (
                  <div key={e.id} className="bg-black/20 border border-red-500/10 rounded-xl px-4 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono text-red-300">{e.path}</span>
                      <span className="text-[10px] text-gray-500">{e.createdAt ? new Date(e.createdAt.seconds ? e.createdAt.seconds * 1000 : e.createdAt).toLocaleString('id-ID') : ''}</span>
                    </div>
                    <p className="text-sm text-gray-300 break-words">{e.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="text-[10px] text-gray-600 text-center">Checked at {new Date(status.checkedAt).toLocaleString('id-ID')}</p>
        </>
      )}
    </div>
  );
}
