import { motion } from 'motion/react';
import { Rocket, Satellite, Calendar, ArrowUpRight } from 'lucide-react';

export function Missions() {
  const launches = [
    { name: 'Artemis II', agency: 'NASA', date: 'Nov 2024', status: 'Planned', type: 'Crewed Lunar', color: 'blue' },
    { name: 'Starship Flight 5', agency: 'SpaceX', date: 'TBD', status: 'Pending Approval', type: 'Test Flight', color: 'brand' },
    { name: 'Europa Clipper', agency: 'NASA', date: 'Oct 10, 2024', status: 'Confirmed', type: 'Interplanetary', color: 'purple' },
    { name: 'Hera', agency: 'ESA', date: 'Oct 2024', status: 'Final Assembly', type: 'Asteroid Defense', color: 'green' }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <header className="flex items-center space-x-4 border-b border-white/10 pb-6">
        <div className="p-3 bg-brand-600/20 rounded-xl">
          <Rocket className="w-8 h-8 text-brand-400" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold">Mission Control</h1>
          <p className="text-brand-300">Global manifest of upcoming orbital launches and deep space missions.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-display font-bold flex items-center mb-4">
            <Calendar className="w-5 h-5 mr-2 text-brand-400" /> 
            Launch Manifest
          </h2>
          
          <div className="space-y-3">
            {launches.map((launch, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                key={launch.name} 
                className="bg-brand-900/40 p-5 rounded-2xl border border-white/5 hover:border-white/20 transition-colors flex flex-col md:flex-row md:items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center space-x-4 mb-3 md:mb-0">
                  <div className={`w-12 h-12 rounded-full bg-${launch.color}-500/20 flex items-center justify-center shrink-0`}>
                    <Rocket className={`w-5 h-5 text-${launch.color}-400`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white group-hover:text-brand-300 transition-colors">{launch.name}</h3>
                    <p className="text-sm text-gray-400">{launch.agency} &bull; {launch.type}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6 md:justify-end">
                  <div className="text-left md:text-right">
                    <p className="text-sm font-bold text-white">{launch.date}</p>
                    <p className="text-xs text-brand-400 uppercase tracking-wider mt-1 font-mono bg-brand-950 px-2 py-0.5 rounded inline-block border border-brand-800">{launch.status}</p>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-brand-900/60 p-6 rounded-2xl border border-white/10 shadow-lg relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
            <h3 className="font-bold text-lg mb-4 flex items-center">
              <Satellite className="w-5 h-5 mr-2 text-blue-400" />
              Active Payloads
            </h3>
            
            <div className="space-y-4 relative z-10">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">LEO (Low Earth Orbit)</span>
                  <span className="font-mono text-brand-300">7,542</span>
                </div>
                <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-400 w-[85%]" />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">GEO (Geosynchronous)</span>
                  <span className="font-mono text-brand-300">589</span>
                </div>
                <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-400 w-[15%]" />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">Deep Space Probes</span>
                  <span className="font-mono text-brand-300">34</span>
                </div>
                <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                  <div className="h-full bg-pink-400 w-[5%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
