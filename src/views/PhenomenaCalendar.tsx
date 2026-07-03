import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../db/firebase';
import { CalendarDays, Loader2, ExternalLink, AlertTriangle, Sparkles, Shield } from 'lucide-react';
import { motion } from 'motion/react';

interface PhenomenonItem {
  id: string;
  type: 'apod' | 'asteroid' | 'admin';
  date: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  sourceUrl?: string;
  hazardous?: boolean;
  source: 'nasa' | 'admin';
}

function formatDateID(dateStr: string) {
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export function PhenomenaCalendar() {
  const [nasaEvents, setNasaEvents] = useState<PhenomenonItem[]>([]);
  const [adminEvents, setAdminEvents] = useState<PhenomenonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/nasa-phenomena')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.events)) {
          setNasaEvents(data.events.map((e: any, i: number) => ({ id: `nasa-${i}`, ...e })));
        }
      })
      .catch(() => setError('Gagal memuat data fenomena dari NASA.'))
      .finally(() => setLoading(false));

    const q = query(collection(db, 'phenomena'), orderBy('date', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      setAdminEvents(snap.docs.map(d => ({ id: d.id, source: 'admin', ...d.data() } as PhenomenonItem)));
    });
    return () => unsub();
  }, []);

  const allEvents = [...adminEvents, ...nasaEvents].sort((a, b) => a.date.localeCompare(b.date));
  const grouped = allEvents.reduce((acc: Record<string, PhenomenonItem[]>, ev) => {
    (acc[ev.date] ||= []).push(ev);
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8">
      <motion.header initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <CalendarDays className="w-14 h-14 text-brand-400 mx-auto mb-4" />
        <h1 className="text-3xl font-display font-bold mb-2">Kalender Fenomena Langit</h1>
        <p className="text-gray-400">Peristiwa astronomi minggu ini — gabungan data NASA dan info dari admin E.A.S.</p>
      </motion.header>

      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-4 rounded-xl text-sm text-center">{error}</div>}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-10 h-10 text-brand-400 animate-spin" /></div>
      ) : Object.keys(grouped).length === 0 ? (
        <p className="text-center text-gray-500 py-12">Belum ada fenomena yang tercatat untuk periode ini.</p>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([date, items], gi) => (
            <motion.div key={date} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: gi * 0.05 }}>
              <div className="flex items-center space-x-3 mb-3">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-xs font-mono uppercase tracking-widest text-brand-300 whitespace-nowrap">{formatDateID(date)}</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>
              <div className="space-y-3">
                {items.map((ev, i) => (
                  <motion.div
                    key={ev.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="hud-corners bg-brand-800/60 border border-white/10 rounded-2xl p-5 flex gap-4"
                  >
                    {ev.imageUrl && (
                      <img src={ev.imageUrl} alt={ev.title} className="w-20 h-20 rounded-xl object-cover shrink-0 hidden sm:block" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {ev.source === 'admin' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest bg-brand-500/20 text-brand-300 px-2 py-0.5 rounded-full"><Shield className="w-3 h-3" /> Admin</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest bg-signal-cyan/10 text-signal-cyan px-2 py-0.5 rounded-full"><Sparkles className="w-3 h-3" /> NASA</span>
                        )}
                        {ev.hazardous && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full"><AlertTriangle className="w-3 h-3" /> Perlu Diperhatikan</span>
                        )}
                      </div>
                      <h3 className="font-bold text-white">{ev.title}</h3>
                      <p className="text-sm text-gray-400 mt-1 leading-relaxed">{ev.description}</p>
                      {ev.sourceUrl && (
                        <a href={ev.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center text-xs text-brand-400 hover:text-brand-300 mt-2">
                          Sumber <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
