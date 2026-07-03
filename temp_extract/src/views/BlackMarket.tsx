import { Crown, Sparkles, Gem, Ghost } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export function BlackMarket() {
  return (
    <div className="h-full flex flex-col items-center justify-center space-y-6 max-w-4xl mx-auto text-center">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-24 h-24 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500"
      >
        <Crown className="w-12 h-12 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
      </motion.div>
      <h1 className="text-4xl font-display font-bold text-yellow-400">The Black Market</h1>
      <p className="text-gray-400 text-lg max-w-2xl">
        Welcome to the exclusive VIP sector. Since you have unlocked the custom frame or hold the Owner role, you have access to these hidden modules.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-8">
        <div className="bg-yellow-900/10 p-6 rounded-2xl border border-yellow-500/20 text-left hover:border-yellow-500/50 transition-colors">
          <Sparkles className="w-8 h-8 text-yellow-400 mb-4" />
          <h3 className="font-bold text-xl mb-2 text-white">Quantum Predictions</h3>
          <p className="text-sm text-gray-400 mb-4">Access classified AI models to predict astronomical events before they happen.</p>
          <button className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold uppercase tracking-widest text-xs px-4 py-2 rounded-xl transition-colors">Enter</button>
        </div>

        <div className="bg-yellow-900/10 p-6 rounded-2xl border border-yellow-500/20 text-left hover:border-yellow-500/50 transition-colors">
          <Gem className="w-8 h-8 text-yellow-400 mb-4" />
          <h3 className="font-bold text-xl mb-2 text-white">Infinite Funding</h3>
          <p className="text-sm text-gray-400 mb-4">Withdraw undocumented funding from the black market reserves.</p>
          <button className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold uppercase tracking-widest text-xs px-4 py-2 rounded-xl transition-colors">Withdraw 1M</button>
        </div>

        <div className="bg-yellow-900/10 p-6 rounded-2xl border border-yellow-500/20 text-left hover:border-yellow-500/50 transition-colors">
          <Ghost className="w-8 h-8 text-yellow-400 mb-4" />
          <h3 className="font-bold text-xl mb-2 text-white">Ghost Mode Protocol</h3>
          <p className="text-sm text-gray-400 mb-4">Browse the EAS network and forums entirely undetected by other users.</p>
          <button className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold uppercase tracking-widest text-xs px-4 py-2 rounded-xl transition-colors">Activate</button>
        </div>
      </div>

      <Link to="/" className="text-sm text-gray-500 hover:text-white mt-8 transition-colors">
        &larr; Return to Dashboard
      </Link>
    </div>
  );
}
