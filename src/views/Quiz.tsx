import { useState } from 'react';
import { useStore } from '../store/useStore';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../db/firebase';
import { BrainCircuit, Loader2, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function Quiz() {
  const { userData, user } = useStore();
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState<any>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);

  const generateQuiz = async () => {
    setLoading(true);
    setQuiz(null);
    setSelected(null);
    setResult(null);
    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: 'Solar System and Universe', difficulty: 'medium' })
      });
      const data = await res.json();
      setQuiz(data);
    } catch (e) {
      console.error(e);
      alert('Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (index: number) => {
    if (result !== null) return;
    setSelected(index);
    const isCorrect = index === quiz.correctIndex;
    setResult(isCorrect ? 'correct' : 'wrong');

    if (isCorrect && user && userData) {
      

      try {
        await updateDoc(doc(db, 'users', user.uid), {
          exp: (userData.exp || 0) + 20
        });
      } catch (err: any) {
        console.error(err);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-8">
      <header className="text-center">
        <BrainCircuit className="w-16 h-16 text-brand-400 mx-auto mb-4" />
        <h1 className="text-3xl font-display font-bold mb-2">AI Adaptive Quiz</h1>
        <p className="text-gray-400">Test your knowledge and earn EXP (2x Daily Benefit).</p>
      </header>

      {!quiz && !loading && (
        <div className="text-center">
          <button 
            onClick={generateQuiz}
            className="bg-brand-600 hover:bg-brand-400 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-brand-600/20 transition-all hover:scale-105"
          >
            Start Quiz
          </button>
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-12 h-12 text-brand-400 animate-spin" />
        </div>
      )}

      <AnimatePresence mode="wait">
        {quiz && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-brand-800/80 p-8 rounded-3xl border border-white/10"
          >
            <h2 className="text-xl font-medium mb-6 leading-relaxed">{quiz.question}</h2>
            
            <div className="space-y-3 mb-6">
              {quiz.options.map((opt: string, i: number) => {
                let btnClass = "w-full text-left p-4 rounded-xl border transition-all ";
                if (result === null) {
                  btnClass += "border-white/10 hover:border-brand-400 hover:bg-white/5";
                } else if (i === quiz.correctIndex) {
                  btnClass += "border-green-500 bg-green-500/10";
                } else if (i === selected) {
                  btnClass += "border-red-500 bg-red-500/10";
                } else {
                  btnClass += "border-white/5 opacity-50";
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    className={btnClass}
                  >
                    <div className="flex justify-between items-center">
                      <span>{opt}</span>
                      {result !== null && i === quiz.correctIndex && <Check className="text-green-500 w-5 h-5" />}
                      {result !== null && i === selected && i !== quiz.correctIndex && <X className="text-red-500 w-5 h-5" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {result && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 bg-black/40 rounded-xl border border-white/5"
              >
                <p className="text-gray-300">
                  <span className="font-bold text-brand-400">Explanation: </span>
                  {quiz.explanation}
                </p>
                
                <button
                  onClick={generateQuiz}
                  className="mt-4 text-brand-400 hover:text-brand-300 font-medium"
                >
                  Next Question &rarr;
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
