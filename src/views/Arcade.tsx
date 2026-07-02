import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { DailyAstronomyPuzzle } from '../components/DailyAstronomyPuzzle';
import { Gamepad2, Loader2 } from 'lucide-react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../db/firebase';
import { useStore } from '../store/useStore';

export function Arcade() {
  const [puzzles, setPuzzles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    

    const unsub = onSnapshot(query(collection(db, 'puzzles')), (snap) => {
      setPuzzles(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (error) => {
      console.warn("Firestore error in Arcade (puzzles):", error);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return (
    <div className="space-y-6">
      <header className="flex items-center space-x-4">
        <div className="p-3 bg-brand-600/20 rounded-xl">
          <Gamepad2 className="w-8 h-8 text-brand-400" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold">Cosmic Arcade</h1>
          <p className="text-gray-400">Decrypt fragments to unlock beautiful cosmic telemetry.</p>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
        </div>
      ) : puzzles.length === 0 ? (
        <div className="bg-brand-800/50 p-12 rounded-2xl border border-white/10 text-center">
           <h3 className="text-xl font-bold text-gray-300">No puzzles available</h3>
           <p className="text-gray-500 mt-2">Check back later for new telemetry.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {puzzles.map((p) => (
            <motion.div 
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-brand-800/50 p-6 rounded-2xl border border-white/10"
            >
              <DailyAstronomyPuzzle puzzleId={p.id} puzzleImage={p.imageUrl} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
