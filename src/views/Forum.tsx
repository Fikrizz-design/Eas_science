import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../db/firebase';
import { mirror } from '../db/supabase';
import { useStore } from '../store/useStore';
import { MessageSquare, Send, ShieldAlert, BookOpen, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';

export function Forum() {
  const { userData, user } = useStore();
  const [category, setCategory] = useState('general');
  const [posts, setPosts] = useState<any[]>([]);
  const [newPost, setNewPost] = useState('');
  const [reference, setReference] = useState('');

  const canDelete = userData?.role === 'admin' || userData?.role === 'owner';

  useEffect(() => {
    

    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setPosts(data.filter(p => p.category === category));
    }, (error) => {
      console.warn("Firestore error in Forum:", error);
    });
    return () => unsub();
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    if (category === 'debate' && !reference.trim()) {
      alert('Debate category requires a logical reference/source.');
      return;
    }

    

    try {
      const postDoc = {
        content: newPost,
        reference,
        category,
        authorId: user?.uid,
        authorName: userData?.name,
        authorNameColor: userData?.nameColor || null,
      };
      const ref = await addDoc(collection(db, 'posts'), {
        ...postDoc,
        createdAt: serverTimestamp(),
      });
      mirror('chat_messages', ref.id, { ...postDoc, created_at: new Date().toISOString() });
      setNewPost('');
      setReference('');
    } catch (err: any) {
      console.error(err);
      alert('Failed to post. Permissions might be denied.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    try {
      await deleteDoc(doc(db, 'posts', id));
    } catch (err) {
      alert('Failed to delete post.');
    }
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      <header>
        <h1 className="text-3xl font-display font-bold">Interactive Forum</h1>
        <p className="text-gray-400">Discuss astronomy, share references, and debate theories.</p>
      </header>

      <div className="flex space-x-2">
        {['general', 'debate', 'admin'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-lg capitalize font-medium transition-colors ${
              category === cat ? 'bg-brand-600 text-white' : 'bg-brand-800/50 text-gray-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {(category === 'admin' && userData?.role !== 'admin' && userData?.role !== 'owner') ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
          <ShieldAlert className="w-12 h-12 mb-2" />
          <p>Admin or Owner access required.</p>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto space-y-4 bg-black/20 p-4 rounded-xl border border-white/5">
            {posts.map((post) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={post.id} 
                className="bg-brand-800/50 p-4 rounded-lg border border-white/10 relative group"
              >
                {canDelete && (
                  <button onClick={() => handleDelete(post.id)} className="absolute top-4 right-4 text-red-500 hover:bg-red-500/20 p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-brand-400" style={post.authorNameColor ? { color: post.authorNameColor } : undefined}>{post.authorName}</span>
                  <span className="text-xs text-gray-500">
                    {post.createdAt?.toDate().toLocaleDateString() || 'Just now'}
                  </span>
                </div>
                <p className="text-gray-200">{post.content}</p>
                {post.reference && (
                  <div className="mt-3 p-3 bg-black/40 rounded border border-white/5 flex items-start space-x-2">
                    <BookOpen className="w-4 h-4 text-brand-400 mt-1 flex-shrink-0" />
                    <p className="text-sm text-gray-400">Ref: {post.reference}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="bg-brand-800/50 p-4 rounded-xl border border-white/10">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-400 h-24 resize-none mb-2"
            />
            {category === 'debate' && (
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Include logical reference / source URL..."
                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-400 mb-2"
              />
            )}
            <div className="flex justify-end">
              <button 
                type="submit"
                className="bg-brand-600 hover:bg-brand-400 text-white px-6 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>Post</span>
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
