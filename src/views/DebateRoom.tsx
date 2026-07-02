import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '../db/firebase';
import { mirror } from '../db/supabase';
import { useStore } from '../store/useStore';
import { Target, Send, CheckCircle2, XCircle, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function DebateRoom() {
  const { userData, user } = useStore();
  const [debates, setDebates] = useState<any[]>([]);
  const [activeDebate, setActiveDebate] = useState<any>(null);
  const [showNewDebate, setShowNewDebate] = useState(false);

  // New Debate State
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [source, setSource] = useState('');
  const [logic, setLogic] = useState('');

  // Reply State
  const [replyType, setReplyType] = useState<'agree' | 'rebut'>('agree');
  const [replyContent, setReplyContent] = useState('');
  const [replyFacts, setReplyFacts] = useState('');

  const [checkingToxicity, setCheckingToxicity] = useState(false);

  const checkToxicity = async (text: string): Promise<{ toxic: boolean; reason?: string }> => {
    try {
      const res = await fetch('/api/moderate-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) return { toxic: false };
      return await res.json();
    } catch {
      // Fail open: if the moderation service is unreachable, don't block the user.
      return { toxic: false };
    }
  };

  useEffect(() => {
    const q = query(collection(db, 'debates'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setDebates(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const handleCreateDebate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !topic || !source || !logic) return;

    setCheckingToxicity(true);
    const modResult = await checkToxicity(`${title}\n${logic}`);
    setCheckingToxicity(false);
    if (modResult.toxic) {
      alert(`Thesis blocked by AI moderation: ${modResult.reason || 'Content violates community guidelines.'}`);
      return;
    }

    try {
      const debateDoc = {
        title, topic, source, logic,
        authorId: user?.uid,
        authorName: userData?.name,
        status: 'active',
        replies: [] as any[],
      };
      const ref = await addDoc(collection(db, 'debates'), {
        ...debateDoc,
        createdAt: serverTimestamp(),
      });
      mirror('debates', ref.id, { ...debateDoc, created_at: new Date().toISOString() });
      setShowNewDebate(false);
      setTitle(''); setTopic(''); setSource(''); setLogic('');
    } catch (err) {
      alert('Failed to create debate.');
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDebate || !replyContent) return;
    if (replyType === 'rebut' && !replyFacts) {
      alert('A rebuttal requires facts, data, and logic.');
      return;
    }

    setCheckingToxicity(true);
    const modResult = await checkToxicity(`${replyContent}\n${replyFacts}`);
    setCheckingToxicity(false);
    if (modResult.toxic) {
      alert(`Response blocked by AI moderation: ${modResult.reason || 'Content violates community guidelines.'}`);
      return;
    }

    const newReply = {
      id: Date.now().toString(),
      authorId: user?.uid,
      authorName: userData?.name,
      type: replyType,
      content: replyContent,
      facts: replyFacts,
      aiAnalysis: 'Passed toxicity screening',
      createdAt: new Date().toISOString()
    };

    try {
      const updatedReplies = [...(activeDebate.replies || []), newReply];
      await updateDoc(doc(db, 'debates', activeDebate.id), { replies: updatedReplies });
      mirror('debates', activeDebate.id, { replies: updatedReplies });
      setReplyContent(''); setReplyFacts('');
    } catch (err) {
      alert('Failed to post reply.');
    }
  };

  if (activeDebate) {
    return (
      <div className="h-full flex flex-col space-y-4 max-w-4xl mx-auto">
        <button onClick={() => setActiveDebate(null)} className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2 text-sm w-max mb-4">
          <span>&larr; Back to Debates</span>
        </button>

        <div className="bg-brand-900/40 p-6 rounded-2xl border border-white/10">
          <div className="mb-6">
            <span className="text-xs uppercase tracking-widest text-brand-400 font-bold mb-2 block">{activeDebate.topic}</span>
            <h2 className="text-2xl font-bold font-display text-white mb-4">{activeDebate.title}</h2>
            <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-3">
              <div><span className="text-gray-500 text-xs uppercase block">Thesis Logic</span><p className="text-gray-200">{activeDebate.logic}</p></div>
              <div><span className="text-gray-500 text-xs uppercase block">Source / Journal</span><a href={activeDebate.source} target="_blank" className="text-brand-400 hover:underline text-sm">{activeDebate.source}</a></div>
            </div>
            <p className="text-xs text-gray-500 mt-4">Proposed by {activeDebate.authorName}</p>
          </div>

          <div className="space-y-4 mb-6">
            <h3 className="font-bold text-lg border-b border-white/10 pb-2">Responses</h3>
            {activeDebate.replies?.length === 0 && <p className="text-gray-500">No responses yet.</p>}
            {activeDebate.replies?.map((r: any) => (
              <div key={r.id} className={`p-4 rounded-xl border ${r.type === 'agree' ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {r.type === 'agree' ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
                    <span className="font-bold text-white text-sm">{r.authorName}</span>
                  </div>
                  {r.type === 'rebut' && (
                    <span className="text-xs flex items-center bg-black/40 px-2 py-1 rounded text-orange-300">
                      <BrainCircuit className="w-3 h-3 mr-1" /> {r.aiAnalysis}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-300 mb-2">{r.content}</p>
                {r.facts && (
                  <div className="bg-black/40 p-2 rounded text-xs text-gray-400 border border-white/5">
                    <strong className="text-gray-300">Facts/Data:</strong> {r.facts}
                  </div>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleReply} className="bg-black/40 p-5 rounded-xl border border-white/10 space-y-4">
             <div className="flex space-x-4 mb-2">
               <label className="flex items-center space-x-2 cursor-pointer">
                 <input type="radio" checked={replyType === 'agree'} onChange={() => setReplyType('agree')} className="text-green-500" />
                 <span className="text-green-400 font-medium text-sm">Agree</span>
               </label>
               <label className="flex items-center space-x-2 cursor-pointer">
                 <input type="radio" checked={replyType === 'rebut'} onChange={() => setReplyType('rebut')} className="text-red-500" />
                 <span className="text-red-400 font-medium text-sm">Rebuttal</span>
               </label>
             </div>
             <textarea 
               value={replyContent} onChange={(e) => setReplyContent(e.target.value)} 
               placeholder={replyType === 'agree' ? "Why do you agree?" : "State your argument..."}
               className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-500 h-20 resize-none"
               required
             />
             {replyType === 'rebut' && (
               <textarea 
                 value={replyFacts} onChange={(e) => setReplyFacts(e.target.value)} 
                 placeholder="Provide facts, data, and logical references to support your rebuttal..."
                 className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-red-500 h-20 resize-none"
                 required
               />
             )}
             <button type="submit" disabled={checkingToxicity} className="bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold tracking-widest uppercase text-xs px-6 py-2 rounded-lg transition-colors">
               {checkingToxicity ? 'Checking...' : 'Submit Response'}
             </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6 max-w-5xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center">
            <Target className="w-8 h-8 mr-3 text-red-500" />
            Debate Room
          </h1>
          <p className="text-gray-400 mt-1">Structured arguments, logic, and data. Analyzed by AI.</p>
        </div>
        <button onClick={() => setShowNewDebate(!showNewDebate)} className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 px-6 py-2 rounded-xl text-sm font-bold tracking-widest uppercase transition-colors">
          {showNewDebate ? 'Cancel' : 'New Thesis'}
        </button>
      </header>

      {showNewDebate && (
        <motion.form 
          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          onSubmit={handleCreateDebate} className="bg-brand-900/40 p-6 rounded-2xl border border-red-500/30 space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">Thesis Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">Topic Category</label>
              <input value={topic} onChange={(e) => setTopic(e.target.value)} required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">Source / Journal Link</label>
            <input type="url" value={source} onChange={(e) => setSource(e.target.value)} required placeholder="https://..." className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">Logical Premise</label>
            <textarea value={logic} onChange={(e) => setLogic(e.target.value)} required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500 h-24 resize-none" />
          </div>
          <button type="submit" disabled={checkingToxicity} className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold tracking-widest uppercase text-xs px-6 py-2 rounded-xl transition-colors w-full">
            {checkingToxicity ? 'Checking with AI moderator...' : 'Propose Thesis'}
          </button>
        </motion.form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {debates.map(debate => (
          <div key={debate.id} onClick={() => setActiveDebate(debate)} className="bg-brand-900/40 hover:bg-brand-800/60 p-5 rounded-2xl border border-white/10 cursor-pointer transition-colors group">
            <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-1 rounded-full uppercase tracking-widest font-bold mb-3 inline-block">{debate.topic}</span>
            <h3 className="font-bold text-lg mb-2 group-hover:text-red-400 transition-colors">{debate.title}</h3>
            <p className="text-sm text-gray-400 line-clamp-2 mb-4">{debate.logic}</p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>By {debate.authorName}</span>
              <span className="flex items-center"><Target className="w-3 h-3 mr-1" /> {debate.replies?.length || 0} Responses</span>
            </div>
          </div>
        ))}
        {debates.length === 0 && <p className="text-gray-500">No active debates.</p>}
      </div>
    </div>
  );
}
