import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Telescope, Users, Brain, MessageSquare, CalendarDays, BookOpen,
  ArrowRight, Sparkles, Star
} from 'lucide-react';

interface PreviewEvent {
  type: string;
  date: string;
  title: string;
  description: string;
}

export function LandingPage() {
  const navigate = useNavigate();
  const [preview, setPreview] = useState<PreviewEvent[]>([]);

  useEffect(() => {
    fetch('/api/nasa-phenomena')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data.events)) setPreview(data.events.slice(0, 3)); })
      .catch(() => {});
  }, []);

  const features = [
    { icon: Brain, title: 'Kuis Astronomi Harian', desc: '20 soal baru setiap hari dalam Bahasa Indonesia, topik dari tata surya sampai kosmologi.' },
    { icon: MessageSquare, title: 'Ruang Debat Sains', desc: 'Adu argumen berbasis fakta dengan sesama pelajar, dijaga moderasi AI anti-toxic.' },
    { icon: CalendarDays, title: 'Kalender Fenomena Langit', desc: 'Info hujan meteor, asteroid mendekat, dan foto astronomi harian dari NASA.' },
    { icon: BookOpen, title: 'Perpustakaan Riset Komunitas', desc: 'Jurnal, foto, dan hasil riset yang dikurasi bersama anggota komunitas.' },
  ];

  return (
    <div className="min-h-screen w-full bg-brand-950 text-gray-200 relative overflow-x-hidden">
      <div className="starfield fixed inset-0 z-0 pointer-events-none opacity-50" />
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-800/30 via-brand-950 to-brand-950" />

      {/* Nav */}
      <nav className="relative z-10 max-w-6xl mx-auto flex items-center justify-between px-6 py-6">
        <div className="flex items-center space-x-2">
          <Telescope className="w-7 h-7 text-brand-400" />
          <span className="font-display font-bold text-lg text-white tracking-wide">E.A.S</span>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/phenomena')} className="hidden sm:inline text-sm text-gray-300 hover:text-white transition-colors">
            Kalender Fenomena
          </button>
          <button
            onClick={() => navigate('/auth')}
            className="bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors"
          >
            Masuk / Daftar
          </button>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative z-10 max-w-4xl mx-auto text-center px-6 pt-12 pb-16">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center space-x-2 bg-brand-500/10 text-brand-300 border border-brand-500/20 px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-widest mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Komunitas Astronomi Indonesia</span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl font-display font-bold text-white leading-tight"
        >
          E.A.S — Education Astronomy Science
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-gray-400 mt-6 max-w-2xl mx-auto leading-relaxed"
        >
          Komunitas belajar astronomi untuk pelajar Indonesia. Ikut kuis astronomi harian,
          diskusi di ruang debat sains, pantau fenomena langit terbaru, dan jelajahi alam
          semesta bersama ribuan explorer lainnya — gratis.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-8">
          <button
            onClick={() => navigate('/auth')}
            className="inline-flex items-center space-x-2 bg-brand-500 hover:bg-brand-400 text-white font-bold px-8 py-4 rounded-xl text-lg shadow-xl shadow-brand-600/20 transition-all"
          >
            <span>Gabung Komunitas Sekarang</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </header>

      {/* Features */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-16">
        <h2 className="text-center text-sm font-mono uppercase tracking-widest text-brand-300 mb-8">Apa yang bisa kamu lakukan di E.A.S</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="hud-corners bg-white/5 border border-white/10 rounded-2xl p-6"
            >
              <f.icon className="w-8 h-8 text-brand-400 mb-4" />
              <h3 className="font-bold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Live phenomena preview — real, fresh content for search engines */}
      {preview.length > 0 && (
        <section className="relative z-10 max-w-4xl mx-auto px-6 pb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-bold text-white flex items-center">
              <CalendarDays className="w-5 h-5 mr-2 text-brand-400" />
              Fenomena Langit Terbaru
            </h2>
            <button onClick={() => navigate('/phenomena')} className="text-sm text-brand-400 hover:text-brand-300">
              Lihat semua &rarr;
            </button>
          </div>
          <div className="space-y-3">
            {preview.map((ev, i) => (
              <div key={i} className="bg-brand-800/50 border border-white/10 rounded-2xl p-4">
                <p className="text-xs font-mono text-gray-500 mb-1">{ev.date}</p>
                <h3 className="font-bold text-white text-sm">{ev.title}</h3>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{ev.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Footer CTA */}
      <footer className="relative z-10 max-w-4xl mx-auto px-6 pb-16 text-center">
        <div className="bg-gradient-to-br from-brand-800/60 to-brand-900/60 border border-white/10 rounded-3xl p-10">
          <Star className="w-10 h-10 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-display font-bold text-white mb-3">Siap jadi bagian dari komunitas?</h2>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">Gratis, dan cocok untuk pelajar SD sampai mahasiswa yang penasaran dengan luar angkasa.</p>
          <button
            onClick={() => navigate('/auth')}
            className="inline-flex items-center space-x-2 bg-brand-500 hover:bg-brand-400 text-white font-bold px-8 py-3.5 rounded-xl transition-all"
          >
            <Users className="w-5 h-5" />
            <span>Daftar Sekarang</span>
          </button>
        </div>
        <p className="text-xs text-gray-600 mt-8">E.A.S — Education Astronomy Science. Komunitas belajar astronomi untuk pelajar Indonesia.</p>
      </footer>
    </div>
  );
}
