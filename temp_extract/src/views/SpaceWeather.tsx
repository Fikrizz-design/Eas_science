import { motion } from 'motion/react';
import { Sun, AlertTriangle, Activity, ThermometerSun } from 'lucide-react';

export function SpaceWeather() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <header className="flex items-center space-x-4 border-b border-white/10 pb-6">
        <div className="p-3 bg-brand-600/20 rounded-xl">
          <Sun className="w-8 h-8 text-amber-500" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold">Space Weather Center</h1>
          <p className="text-brand-300">Live monitoring of solar activity and geomagnetic conditions.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-amber-900/40 to-black p-6 rounded-3xl border border-amber-500/20 shadow-lg relative overflow-hidden group col-span-1 md:col-span-2">
           <div className="absolute -right-20 -top-20 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl animate-pulse" />
           <div className="relative z-10 flex flex-col h-full justify-between">
             <div>
               <div className="flex justify-between items-start mb-6">
                 <div>
                   <h2 className="text-xl font-bold text-white mb-1">Solar Flare Activity</h2>
                   <p className="text-amber-300/80 text-sm">X-Ray Flux Measurements (GOES-16)</p>
                 </div>
                 <span className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse">
                   Class M Flare Active
                 </span>
               </div>
               
               {/* Mock Chart Area */}
               <div className="h-40 border-b border-l border-amber-500/30 relative flex items-end pt-4 pb-1 pl-1">
                 {/* Decorative chart lines */}
                 <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                   <polyline points="0,90 20,85 40,95 50,70 60,80 70,30 80,45 90,20 100,25" fill="none" stroke="rgb(245 158 11)" strokeWidth="2" strokeLinejoin="round" />
                   <polyline points="0,100 20,100 40,100 50,100 60,100 70,100 80,100 90,100 100,100" fill="none" stroke="rgba(245, 158, 11, 0.2)" strokeWidth="1" />
                 </svg>
                 <div className="absolute top-1/4 left-0 w-full border-t border-amber-500/20 border-dashed" />
                 <div className="absolute top-1/2 left-0 w-full border-t border-amber-500/20 border-dashed" />
                 <div className="absolute top-3/4 left-0 w-full border-t border-amber-500/20 border-dashed" />
               </div>
               <div className="flex justify-between text-[10px] text-amber-500/60 font-mono mt-2">
                 <span>00:00 UTC</span>
                 <span>06:00 UTC</span>
                 <span>12:00 UTC</span>
                 <span>NOW</span>
               </div>
             </div>
           </div>
        </div>

        <div className="space-y-6">
          <div className="bg-brand-900/60 p-5 rounded-2xl border border-white/10 flex items-center space-x-4">
            <div className="p-3 bg-red-500/20 rounded-xl shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Geomagnetic Storm</h3>
              <p className="text-2xl font-bold text-white">Kp-Index: 6</p>
              <p className="text-xs text-red-400 mt-1">Moderate (G2) Warning</p>
            </div>
          </div>
          
          <div className="bg-brand-900/60 p-5 rounded-2xl border border-white/10 flex items-center space-x-4">
            <div className="p-3 bg-blue-500/20 rounded-xl shrink-0">
              <Activity className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Solar Wind Speed</h3>
              <p className="text-2xl font-bold text-white">520 km/s</p>
              <p className="text-xs text-blue-300 mt-1">Slightly Elevated</p>
            </div>
          </div>

          <div className="bg-brand-900/60 p-5 rounded-2xl border border-white/10 flex items-center space-x-4">
            <div className="p-3 bg-yellow-500/20 rounded-xl shrink-0">
              <ThermometerSun className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">10.7cm Radio Flux</h3>
              <p className="text-2xl font-bold text-white">142 sfu</p>
              <p className="text-xs text-yellow-300 mt-1">High Solar Activity</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
