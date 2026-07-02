import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, updateDoc, addDoc, deleteDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../db/firebase';
import { Shield, UserX, UserCheck, CheckCircle, ImagePlus, Trash2, Settings } from 'lucide-react';
import { useStore } from '../store/useStore';

export function AdminPanel() {
  const [users, setUsers] = useState<any[]>([]);
  const [library, setLibrary] = useState<any[]>([]);
  const [puzzles, setPuzzles] = useState<any[]>([]);
  const [newPuzzleUrl, setNewPuzzleUrl] = useState('');
  const [genFilter, setGenFilter] = useState('All');
  
  const [isRegOpen, setIsRegOpen] = useState(true);
  const [regLink, setRegLink] = useState('');
  const [groupLinkGen1, setGroupLinkGen1] = useState('');
  const [groupLinkGen2, setGroupLinkGen2] = useState('');
  const [tiktokUrl, setTiktokUrl] = useState('');

  useEffect(() => {
    

    const fetchConfig = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'config'));
        if (snap.exists()) {
          const data = snap.data();
          setIsRegOpen(data.isRegistrationOpen !== false);
          setRegLink(data.registrationLink || '');
          setGroupLinkGen1(data.groupLinkGen1 || '');
          setGroupLinkGen2(data.groupLinkGen2 || '');
          setTiktokUrl(data.tiktokUrl || '');
        }
      } catch (err) {
        console.warn('Failed to fetch config', err);
      }
    };
    fetchConfig();

    const unsubUsers = onSnapshot(query(collection(db, 'users')), (snap) => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => {
      console.warn("Firestore error in AdminPanel (users):", error);
    });
    const unsubLibrary = onSnapshot(query(collection(db, 'library')), (snap) => {
      setLibrary(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => {
      console.warn("Firestore error in AdminPanel (library):", error);
    });
    const unsubPuzzles = onSnapshot(query(collection(db, 'puzzles')), (snap) => {
      setPuzzles(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => {
      console.warn("Firestore error in AdminPanel (puzzles):", error);
    });
    return () => {
      if (unsubUsers) unsubUsers();
      if (unsubLibrary) unsubLibrary();
      if (unsubPuzzles) unsubPuzzles();
    };
  }, []);

  const toggleBlacklist = async (userId: string, currentStatus: boolean) => {
    const reason = currentStatus ? '' : prompt('Reason for blacklisting?');
    if (!currentStatus && !reason) return;
    
    

    try {
      await updateDoc(doc(db, 'users', userId), {
        isBlacklisted: !currentStatus,
        blacklistReason: reason
      });
    } catch (err: any) {
      console.error(err);
      alert('Failed to update user. Permissions might be denied.');
    }
  };

  const verifyLibraryItem = async (itemId: string) => {
    

    try {
      await updateDoc(doc(db, 'library', itemId), {
        status: 'verified'
      });
    } catch (err: any) {
      console.error(err);
      alert('Failed to verify item. Permissions might be denied.');
    }
  };

  const addPuzzle = async () => {
    if (!newPuzzleUrl) return;
    
    
    
    try {
      await addDoc(collection(db, 'puzzles'), {
        imageUrl: newPuzzleUrl,
        createdAt: new Date().toISOString()
      });
      setNewPuzzleUrl('');
    } catch (err) {
      console.error(err);
    }
  };

  const resetPuzzles = async () => {
    if (!confirm('Are you sure you want to delete all puzzles?')) return;
    
    

    try {
      for (const p of puzzles) {
        await deleteDoc(doc(db, 'puzzles', p.id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const saveSettings = async () => {
    
    try {
      await setDoc(doc(db, 'settings', 'config'), {
        isRegistrationOpen: isRegOpen,
        registrationLink: regLink,
        groupLinkGen1: groupLinkGen1,
        groupLinkGen2: groupLinkGen2,
        tiktokUrl: tiktokUrl
      }, { merge: true });
      alert('Settings updated!');
    } catch (err) {
      console.error(err);
      alert('Failed to update settings.');
    }
  };

  const approveUser = async (userId: string) => {
    
    try {
      await updateDoc(doc(db, 'users', userId), { status: 'approved' });
    } catch (err) {
      alert('Failed to approve user.');
    }
  };

  const warnUser = async (userId: string) => {
    const reason = prompt('Reason for warning?');
    if (!reason) return;
    
    

    try {
      const userDoc = users.find(u => u.id === userId);
      const warnings = userDoc?.warnings || [];
      await updateDoc(doc(db, 'users', userId), { warnings: [...warnings, reason] });
      alert('User warned.');
    } catch (err) {
      alert('Failed to warn user.');
    }
  };

  const filteredUsers = genFilter === 'All' ? users : users.filter(u => u.generation === genFilter);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-display font-bold flex items-center space-x-3">
          <Shield className="w-8 h-8 text-brand-400" />
          <span>Admin Command Center</span>
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-brand-900/40 p-6 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl">
          <h2 className="text-xl font-bold flex items-center mb-6 text-white"><Settings className="w-5 h-5 mr-3 text-brand-400" /> Core Configurations</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-black/20 p-4 rounded-2xl border border-white/5">
              <div>
                <p className="font-medium text-white">Registration Gateway</p>
                <p className="text-xs text-gray-400 mt-1">Allow new explorers to join</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={isRegOpen} onChange={e => setIsRegOpen(e.target.checked)} />
                <div className="w-12 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
              </label>
            </div>
            
            <div className="space-y-4 bg-black/20 p-4 rounded-2xl border border-white/5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Fallback Form Link</label>
                <input 
                  type="url" 
                  placeholder="https://forms.gle/..."
                  value={regLink}
                  onChange={(e) => setRegLink(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-brand-400 mb-2">Gen 1 Group Link</label>
                  <input 
                    type="url" 
                    placeholder="https://chat.whatsapp.com/..."
                    value={groupLinkGen1}
                    onChange={(e) => setGroupLinkGen1(e.target.value)}
                    className="w-full bg-black/40 border border-brand-500/30 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-brand-400 mb-2">Gen 2 Group Link</label>
                  <input 
                    type="url" 
                    placeholder="https://chat.whatsapp.com/..."
                    value={groupLinkGen2}
                    onChange={(e) => setGroupLinkGen2(e.target.value)}
                    className="w-full bg-black/40 border border-brand-500/30 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">E.A.S Official TikTok Broadcast</label>
              <input 
                type="url" 
                placeholder="https://tiktok.com/@..."
                value={tiktokUrl}
                onChange={(e) => setTiktokUrl(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500 transition-colors"
              />
              <p className="text-xs text-gray-500 mt-2">Pushes a 10s priority broadcast to all active explorers.</p>
            </div>
            
            <button onClick={saveSettings} className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold uppercase tracking-widest text-sm py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)]">
              Commit Configuration
            </button>
          </div>
        </section>

        <section className="bg-brand-900/40 p-6 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center text-white"><ImagePlus className="w-5 h-5 mr-3 text-brand-400" /> Puzzle Engine</h2>
            <button onClick={resetPuzzles} className="flex items-center space-x-2 text-xs text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/30 px-3 py-1.5 rounded-lg border border-red-500/30 transition-colors">
              <Trash2 className="w-4 h-4" />
              <span>Purge</span>
            </button>
          </div>
          
          <div className="flex space-x-2 mb-6">
            <input 
              type="text" 
              placeholder="Image URL (Unsplash recommended)"
              value={newPuzzleUrl}
              onChange={(e) => setNewPuzzleUrl(e.target.value)}
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
            />
            <button onClick={addPuzzle} className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl text-sm font-bold text-white transition-colors">
              Deploy
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 flex-1 auto-rows-max overflow-y-auto custom-scrollbar">
            {puzzles.map(p => (
              <div key={p.id} className="aspect-square relative rounded-xl overflow-hidden border border-white/10 group">
                <img src={p.imageUrl} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="Puzzle" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-xs font-bold text-white uppercase tracking-widest">Active</span>
                </div>
              </div>
            ))}
            {puzzles.length === 0 && (
              <div className="col-span-full py-8 text-center bg-black/20 rounded-xl border border-white/5">
                <p className="text-gray-500 text-sm">No active visual puzzles.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <section className="bg-brand-900/40 p-6 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h2 className="text-xl font-bold text-white flex items-center">Explorer Manifest</h2>
            <select 
              className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
              value={genFilter}
              onChange={(e) => setGenFilter(e.target.value)}
            >
              <option value="All">All Generations</option>
              <option value="Gen 1">Generation 1</option>
              <option value="Gen 2">Generation 2</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map(u => (
              <div key={u.id} className="relative bg-black/20 p-5 rounded-2xl border border-white/5 hover:border-brand-500/30 transition-colors group">
                {u.status === 'pending' && <div className="absolute -top-2 -right-2 bg-yellow-500 text-black text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full shadow-lg">Pending</div>}
                {u.isBlacklisted && <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full shadow-lg">Banned</div>}
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-white flex items-center space-x-2">
                      <span>{u.name}</span>
                      {u.generation && <span className="text-[10px] bg-brand-500/20 text-brand-300 px-2 py-0.5 rounded-full border border-brand-500/30 uppercase tracking-widest">{u.generation}</span>}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">{u.email}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                   {u.isBlacklisted && <p className="text-[10px] text-red-400 bg-red-500/10 px-2 py-1 rounded">Reason: {u.blacklistReason}</p>}
                   {u.warnings?.length > 0 && <p className="text-[10px] text-orange-400 bg-orange-500/10 px-2 py-1 rounded">Warnings: {u.warnings.length}</p>}
                </div>

                <div className="flex space-x-2 border-t border-white/5 pt-4">
                  {u.status === 'pending' && (
                    <button onClick={() => approveUser(u.id)} className="flex-1 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 py-2 rounded-xl flex items-center justify-center transition-colors">
                      <CheckCircle className="w-4 h-4 mr-2" /> <span className="text-xs font-bold uppercase tracking-widest">Approve</span>
                    </button>
                  )}
                  <button onClick={() => warnUser(u.id)} className="flex-1 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 py-2 rounded-xl flex items-center justify-center transition-colors">
                    <span className="font-bold text-lg mr-1 leading-none">!</span> <span className="text-xs font-bold uppercase tracking-widest">Warn</span>
                  </button>
                  <button 
                    onClick={() => toggleBlacklist(u.id, !!u.isBlacklisted)}
                    className={`w-12 flex items-center justify-center rounded-xl border transition-colors ${u.isBlacklisted ? 'bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20' : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'}`}
                  >
                    {u.isBlacklisted ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-brand-900/40 p-6 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl">
          <h2 className="text-xl font-bold text-white mb-6">Library Clearances</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {library.filter(l => l.status === 'pending').map(item => (
              <div key={item.id} className="bg-black/20 p-5 rounded-2xl border border-white/5 flex flex-col">
                <div className="flex-1 mb-4">
                  <span className="text-[10px] uppercase tracking-widest text-brand-400 font-bold mb-2 block">{item.type}</span>
                  <p className="font-bold text-white text-lg">{item.title}</p>
                  <p className="text-sm text-gray-400 mt-1">Submitted by {item.authorName}</p>
                  {item.source && <a href={item.source} target="_blank" className="text-xs text-brand-400 hover:underline mt-2 inline-block truncate max-w-full">{item.source}</a>}
                </div>
                <button 
                  onClick={() => verifyLibraryItem(item.id)}
                  className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold uppercase tracking-widest text-xs py-3 rounded-xl transition-colors flex items-center justify-center"
                >
                  <CheckCircle className="w-4 h-4 mr-2" /> Grant Clearance
                </button>
              </div>
            ))}
            {library.filter(l => l.status === 'pending').length === 0 && (
              <div className="col-span-full py-8 text-center bg-black/20 rounded-2xl border border-white/5">
                <p className="text-gray-500 text-sm">No pending submissions.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
