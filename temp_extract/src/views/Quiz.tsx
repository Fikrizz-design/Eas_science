import { useState } from 'react';
import { useStore } from '../store/useStore';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../db/firebase';
import { BrainCircuit, Loader2, Check, X, Trophy, ArrowRight, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const EXP_PER_CORRECT = 20;

export function Quiz() {
  const { userData, user } = useStore();
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [error, setError] = useState('');

  const startQuiz = async () => {
    setLoading(true);
    setError('');
    setQuestions(null);
    setCurrent(0);
    setSelected(null);
    setResult(null);
    setCorrectCount(0);
    setFinished(false);
    try {
      const res = await fetch('/api/quiz', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
      const data = await res.json();
      if (!res.ok || !Array.isArray(data.questions)) throw new Error(data.error || 'Gagal memuat kuis hari ini.');
      setQuestions(data.questions);
    } catch (e: any) {
      setError(e.message || 'Gagal memuat kuis hari ini.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (index: number) => {
    if (result !== null || !questions) return;
    const q = questions[current];
    setSelected(index);
    const isCorrect = index === q.correctIndex;
    setResult(isCorrect ? 'correct' : 'wrong');

    if (isCorrect) {
      setCorrectCount(c => c + 1);
      if (user && userData) {
        try {
          await updateDoc(doc(db, 'users', user.uid), { exp: (userData.exp || 0) + EXP_PER_CORRECT });
        } catch (err: any) {
          console.error(err);
        }
      }
    }
  };

  const nextQuestion = () => {
    if (!questions) return;
    if (current + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setResult(null);
    }
  };

  const progress = questions ? ((current + (result !== null ? 1 : 0)) / questions.length) * 100 : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-8">
      <motion.header initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}>
          <BrainCircuit className="w-16 h-16 text-brand-400 mx-auto mb-4" />
        </motion.div>
        <h1 className="text-3xl font-display font-bold mb-2">Kuis Astronomi Harian</h1>
        <p className="text-gray-400">20 soal baru setiap hari, dalam Bahasa Indonesia. Jawab benar untuk mendapat EXP.</p>
      </motion.header>

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-500/10 border border-red-500/30 text-red-300 p-4 rounded-xl text-sm text-center">
          {error}
        </motion.div>
      )}

      {!questions && !loading && !finished && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startQuiz}
            className="bg-brand-600 hover:bg-brand-400 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-brand-600/20 transition-all"
          >
            Mulai Kuis Hari Ini
          </motion.button>
        </motion.div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="w-12 h-12 text-brand-400 animate-spin" />
          <p className="text-sm text-gray-400">Menyiapkan 20 soal hari ini...</p>
        </div>
      )}

      {questions && !finished && (
        <>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-brand-500 to-brand-300"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 -mt-4">
            <span>Soal {current + 1} / {questions.length}</span>
            <span>{correctCount} benar</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="bg-brand-800/80 p-8 rounded-3xl border border-white/10"
            >
              <h2 className="text-xl font-medium mb-6 leading-relaxed">{questions[current].question}</h2>

              <div className="space-y-3 mb-6">
                {questions[current].options.map((opt: string, i: number) => {
                  let btnClass = "w-full text-left p-4 rounded-xl border transition-all ";
                  if (result === null) {
                    btnClass += "border-white/10 hover:border-brand-400 hover:bg-white/5";
                  } else if (i === questions[current].correctIndex) {
                    btnClass += "border-green-500 bg-green-500/10";
                  } else if (i === selected) {
                    btnClass += "border-red-500 bg-red-500/10";
                  } else {
                    btnClass += "border-white/5 opacity-50";
                  }

                  return (
                    <motion.button
                      key={i}
                      whileHover={result === null ? { scale: 1.01 } : {}}
                      whileTap={result === null ? { scale: 0.99 } : {}}
                      onClick={() => handleAnswer(i)}
                      className={btnClass}
                    >
                      <div className="flex justify-between items-center">
                        <span>{opt}</span>
                        {result !== null && i === questions[current].correctIndex && <Check className="text-green-500 w-5 h-5" />}
                        {result !== null && i === selected && i !== questions[current].correctIndex && <X className="text-red-500 w-5 h-5" />}
                      </div>
                    </motion.button>
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
                    <span className="font-bold text-brand-400">Penjelasan: </span>
                    {questions[current].explanation}
                  </p>

                  <button
                    onClick={nextQuestion}
                    className="mt-4 text-brand-400 hover:text-brand-300 font-medium flex items-center"
                  >
                    {current + 1 >= questions.length ? 'Lihat Hasil' : 'Soal Berikutnya'} <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </>
      )}

      {finished && questions && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-brand-800/80 p-8 rounded-3xl border border-white/10 text-center space-y-6"
        >
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}>
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto" />
          </motion.div>
          <div>
            <h2 className="text-2xl font-display font-bold text-white">Kuis Selesai!</h2>
            <p className="text-gray-400 mt-2">
              Kamu menjawab benar <span className="text-brand-300 font-bold">{correctCount}</span> dari {questions.length} soal
              &nbsp;(+{correctCount * EXP_PER_CORRECT} EXP)
            </p>
          </div>
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-brand-500 to-brand-300"
              initial={{ width: 0 }}
              animate={{ width: `${(correctCount / questions.length) * 100}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          <p className="text-xs text-gray-500">Kuis baru akan tersedia besok. Sampai jumpa lagi, explorer!</p>
          <button
            onClick={startQuiz}
            className="inline-flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Ulangi Kuis Hari Ini</span>
          </button>
        </motion.div>
      )}
    </div>
  );
}
