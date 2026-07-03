import { motion } from 'motion/react';
import { Globe, Search, Filter, Info } from 'lucide-react';

export function Exoplanets() {
  const planets = [
    { name: 'Kepler-186f', type: 'Earth-like', distance: '582 ly', mass: '1.11 M⊕', system: 'Kepler-186' },
    { name: 'TRAPPIST-1e', type: 'Terrestrial', distance: '39 ly', mass: '0.69 M⊕', system: 'TRAPPIST-1' },
    { name: 'Proxima Centauri b', type: 'Super-Earth', distance: '4.2 ly', mass: '1.27 M⊕', system: 'Alpha Centauri' },
    { name: 'HD 209458 b (Osiris)', type: 'Hot Jupiter', distance: '159 ly', mass: '0.69 MJ', system: 'HD 209458' },
    { name: '55 Cancri e', type: 'Super-Earth', distance: '41 ly', mass: '8.08 M⊕', system: '55 Cancri' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center space-x-4 mb-2">
            <div className="p-3 bg-brand-600/20 rounded-xl">
              <Globe className="w-8 h-8 text-brand-400" />
            </div>
            <h1 className="text-3xl font-display font-bold">Exoplanet Archive</h1>
          </div>
          <p className="text-brand-300">Browse confirmed discoveries from Kepler, TESS, and JWST.</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search systems..." className="bg-black/30 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-1 focus:ring-brand-400 outline-none w-full md:w-64" />
          </div>
          <button className="p-2 bg-brand-800 hover:bg-brand-700 border border-white/10 rounded-lg transition-colors">
            <Filter className="w-5 h-5 text-brand-300" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {planets.map((planet, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            key={planet.name} 
            className="bg-brand-900/40 p-5 rounded-2xl border border-white/5 hover:border-brand-500/30 transition-colors group cursor-pointer relative overflow-hidden"
          >
             <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl group-hover:bg-brand-500/20 transition-colors" />
             
             <div className="flex justify-between items-start mb-4 relative z-10">
               <div>
                 <h3 className="font-bold text-lg text-white group-hover:text-brand-300 transition-colors">{planet.name}</h3>
                 <p className="text-xs text-gray-400 uppercase tracking-widest">{planet.type}</p>
               </div>
               <Info className="w-4 h-4 text-gray-500 group-hover:text-brand-400" />
             </div>

             <div className="space-y-2 text-sm relative z-10">
               <div className="flex justify-between border-b border-white/5 pb-2">
                 <span className="text-gray-400">Distance</span>
                 <span className="font-mono text-gray-200">{planet.distance}</span>
               </div>
               <div className="flex justify-between border-b border-white/5 pb-2">
                 <span className="text-gray-400">Mass</span>
                 <span className="font-mono text-gray-200">{planet.mass}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-gray-400">Host Star</span>
                 <span className="font-mono text-gray-200">{planet.system}</span>
               </div>
             </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
