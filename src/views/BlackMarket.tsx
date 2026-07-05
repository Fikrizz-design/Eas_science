import { Crown, ImageIcon, Palette, Zap, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

export function BlackMarket() {
  const { userData } = useStore();
  const navigate = useNavigate();
  const isVIP = !!userData?.isVIP;

  return (
    <div className="h-full flex flex-col items-center justify-center space-y-6 max-w-4xl mx-auto text-center py-8">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-24 h-24 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500"
      >
        <Crown className="w-12 h-12 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
      </motion.div>
      <h1 className="text-4xl font-display font-bold text-yellow-400">The Black Market</h1>
      <p className="text-gray-400 text-lg max-w-2xl">
        Sektor eksklusif untuk VIP dan Owner. Kelola perk visual dan gamifikasi khusus kamu di sini.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-8">
        <div className="bg-yellow-900/10 p-6 rounded-2xl border border-yellow-500/20 text-left hover:border-yellow-500/50 transition-colors flex flex-col">
          <ImageIcon className="w-8 h-8 text-yellow-400 mb-4" />
          <h3 className="font-bold text-xl mb-2 text-white">Custom Profile Banner</h3>
          <p className="text-sm text-gray-400 mb-4 flex-1">Upload banner sendiri untuk header profilmu di Command Center.</p>
          <button
            onClick={() => navigate('/', { state: { openSettings: true } })}
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold uppercase tracking-widest text-xs px-4 py-2 rounded-xl transition-colors self-start flex items-center space-x-1"
          >
            <span>Atur di Profile Settings</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="bg-yellow-900/10 p-6 rounded-2xl border border-yellow-500/20 text-left hover:border-yellow-500/50 transition-colors flex flex-col">
          <Palette className="w-8 h-8 text-yellow-400 mb-4" />
          <h3 className="font-bold text-xl mb-2 text-white">Nameplate Color</h3>
          <p className="text-sm text-gray-400 mb-4 flex-1">Pilih warna nama yang tampil di Forum dan Debate Room.</p>
          <button
            onClick={() => navigate('/', { state: { openSettings: true } })}
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold uppercase tracking-widest text-xs px-4 py-2 rounded-xl transition-colors self-start flex items-center space-x-1"
          >
            <span>Atur di Profile Settings</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="bg-yellow-900/10 p-6 rounded-2xl border border-yellow-500/20 text-left hover:border-yellow-500/50 transition-colors flex flex-col">
          <Zap className="w-8 h-8 text-yellow-400 mb-4" />
          <h3 className="font-bold text-xl mb-2 text-white">2x EXP Kuis Harian</h3>
          <p className="text-sm text-gray-400 mb-4 flex-1">Setiap jawaban benar di Kuis Harian memberi EXP dua kali lipat selama VIP aktif.</p>
          <span className={`self-start font-bold uppercase tracking-widest text-xs px-4 py-2 rounded-xl ${isVIP ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/5 text-gray-500 border border-white/10'}`}>
            {isVIP ? 'Aktif' : 'Butuh VIP'}
          </span>
        </div>
      </div>

      <Link to="/" className="text-sm text-gray-500 hover:text-white mt-8 transition-colors">
        &larr; Return to Dashboard
      </Link>
    </div>
  );
}
