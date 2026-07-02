import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../db/firebase';
import { useStore } from '../store/useStore';
import { Sparkles, DollarSign, Lock, Unlock, CheckCircle2 } from 'lucide-react';

const GRID_SIZE = 3;
const PIECE_COST = 50;
const REWARD_DISCOVERIES = 1;

interface DailyAstronomyPuzzleProps {
  puzzleId: string;
  puzzleImage: string;
}

export function DailyAstronomyPuzzle({ puzzleId, puzzleImage }: DailyAstronomyPuzzleProps) {
  const { user, userData } = useStore();
  const [unlockedPieces, setUnlockedPieces] = useState<number[]>([]);
  
  // Check if this puzzle is already completely solved and in the book
  const isAlreadySolved = userData?.puzzleBook?.includes(puzzleId);
  const isSolved = isAlreadySolved || unlockedPieces.length === GRID_SIZE * GRID_SIZE;

  const unlockPiece = async (idx: number) => {
    if (unlockedPieces.includes(idx)) return;
    
    if (!userData || (userData.coins || 0) < PIECE_COST) {
      alert(`Not enough Funding! You need $${PIECE_COST} to decode this fragment.`);
      return;
    }
    
    const newUnlocked = [...unlockedPieces, idx];
    const newlySolved = newUnlocked.length === GRID_SIZE * GRID_SIZE;
    
    let updatedUserData = {
      ...userData,
      coins: userData.coins - PIECE_COST,
    };

    if (newlySolved) {
      updatedUserData = {
        ...updatedUserData,
        diamonds: (updatedUserData.diamonds || 0) + REWARD_DISCOVERIES,
        exp: (updatedUserData.exp || 0) + 150,
        puzzleBook: [...(updatedUserData.puzzleBook || []), puzzleId]
      };
    }

    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), updatedUserData);
        setUnlockedPieces(newUnlocked);
      } catch (err: any) {
        console.error(err);
      }
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {isSolved ? (
         <motion.div initial={{scale: 0.95, opacity: 0}} animate={{scale: 1, opacity: 1}} className="aspect-video rounded-xl border-2 border-green-500/50 overflow-hidden relative shadow-[0_0_30px_rgba(34,197,94,0.2)]">
            <img src={puzzleImage} className="w-full h-full object-cover" alt="Decoded Telemetry" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-8">
               <h3 className="font-display font-bold text-3xl text-green-400 flex items-center space-x-3 mb-2">
                 <Sparkles className="w-8 h-8" />
                 <span>Telemetry Decoded!</span>
               </h3>
               <p className="text-gray-200 font-medium text-lg">Saved to your Puzzle Book. +1 Diamond, +150 EXP.</p>
            </div>
         </motion.div>
      ) : (
        <div className="max-w-2xl w-full mx-auto flex flex-col flex-1">
          <div className="flex justify-between items-end mb-4 bg-black/20 p-4 rounded-xl border border-white/5">
            <div>
              <h3 className="font-display font-bold text-xl text-white">Decrypt Fragments</h3>
              <p className="text-sm text-brand-300 mt-1">Unlock each data fragment for ${PIECE_COST} to reconstruct the image.</p>
            </div>
            <div className="text-right">
              <span className="text-xs uppercase tracking-widest text-gray-500 font-mono">Progress</span>
              <div className="text-brand-400 font-mono text-lg font-bold">{unlockedPieces.length} / {GRID_SIZE * GRID_SIZE}</div>
            </div>
          </div>
          
          <div className="aspect-square grid grid-cols-3 grid-rows-3 gap-1 p-3 bg-brand-950 rounded-2xl border border-white/10 shadow-2xl">
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, idx) => {
              const isUnlocked = unlockedPieces.includes(idx);
              const row = Math.floor(idx / GRID_SIZE);
              const col = idx % GRID_SIZE;
              
              return (
                <div key={idx} className="relative w-full h-full rounded-lg overflow-hidden border border-white/10 bg-brand-900 group">
                  {isUnlocked ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full h-full"
                      style={{
                        backgroundImage: `url(${puzzleImage})`,
                        backgroundSize: `${GRID_SIZE * 100}% ${GRID_SIZE * 100}%`,
                        backgroundPosition: `${col * 50}% ${row * 50}%`
                      }}
                    />
                  ) : (
                    <button 
                      onClick={() => unlockPiece(idx)}
                      className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 hover:text-brand-400 hover:bg-brand-800/50 transition-colors w-full h-full"
                    >
                      <Lock className="w-8 h-8 mb-2 group-hover:hidden" />
                      <Unlock className="w-8 h-8 mb-2 hidden group-hover:block text-brand-400" />
                      <span className="font-mono text-sm flex items-center font-bold">
                        <DollarSign className="w-3 h-3" />
                        {PIECE_COST}
                      </span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  )
}
