import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Star, Target, Crown, Image as ImageIcon, Palette, Settings, X, Gamepad2, Sun, Map, Globe, CloudLightning, Rocket, Brain, MessageSquare, Book, Shield, ExternalLink, Search, Tv } from 'lucide-react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../db/firebase';
import { Link, useNavigate } from 'react-router-dom';

const navItems = [
  { path: '/arcade', name: 'Arcade', icon: Gamepad2, color: 'text-purple-400', bg: 'bg-purple-900/20' },
  { path: '/solar-system', name: 'Solar System', icon: Sun, color: 'text-yellow-400', bg: 'bg-yellow-900/20' },
  { path: '/starmap', name: 'Star Map', icon: Map, color: 'text-blue-400', bg: 'bg-blue-900/20' },
  { path: '/exoplanets', name: 'Exoplanets', icon: Globe, color: 'text-green-400', bg: 'bg-green-900/20' },
  { path: '/spaceweather', name: 'Space Weather', icon: CloudLightning, color: 'text-cyan-400', bg: 'bg-cyan-900/20' },
  { path: '/missions', name: 'Missions', icon: Rocket, color: 'text-pink-400', bg: 'bg-pink-900/20' },
  { path: '/quiz', name: 'Knowledge Quiz', icon: Brain, color: 'text-orange-400', bg: 'bg-orange-900/20' },
  { path: '/forum', name: 'Discussions', icon: MessageSquare, color: 'text-indigo-400', bg: 'bg-indigo-900/20' },
  { path: '/debate', name: 'Debate Room', icon: Target, color: 'text-red-400', bg: 'bg-red-900/20' },
  { path: '/library', name: 'Data Library', icon: Book, color: 'text-teal-400', bg: 'bg-teal-900/20' },
];

const BACKGROUNDS = [
  { id: 'bg_default', name: 'Deep Space', url: '' },
  { id: 'bg_nebula', name: 'Orion Nebula', url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80&w=1920&h=1080' },
  { id: 'bg_milkyway', name: 'Milky Way Core', url: 'https://images.unsplash.com/photo-1436891620584-47fd0e565afb?auto=format&fit=crop&q=80&w=1920&h=1080' },
  { id: 'bg_aurora', name: 'Aurora Borealis', url: 'https://images.unsplash.com/photo-1531366936337-77b55f1f0a20?auto=format&fit=crop&q=80&w=1920&h=1080' }
];

const FRAMES = [
  { id: 'frame_none', name: 'None', url: '', cost: 0 },
  { id: 'frame_neon', name: 'Neon Halo', url: 'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExMjM5MjQ1MjQzMjQ1MjQxMjQzMjQzMjQzMjQzMjQzMjQzMjQzMjQ1JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/xT9IgzoHls7B3M83V6/giphy.gif', cost: 0 },
  { id: 'frame_blackhole', name: 'Blackhole', url: 'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExMzlqanByOGZ2MWR4bzhwbXVxcGl5MWpzeXRlYjRxcHpzZDFxOWY1ayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26tP21xUQnOCIIoFi/giphy.gif', cost: 100 },
  { id: 'frame_earth', name: 'Earth Rotation', url: 'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExNGhscHhhM3R6cGFueWF2b2hjd2RyaDR3OXhzMmIzODV2dDlxdzhlaCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/9vE8lC7L1z8Y/giphy.gif', cost: 100 },
  { id: 'frame_einstein', name: 'Einstein Relativity', url: 'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExamhxazJwbTh3N2V0MzMydW51NWRpNjdsOHBvYjRxa2tndnUzaHhveSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/1xV8jA1zH3g6Opx33k/giphy.gif', cost: 100 }
];

function SpaceNews() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://api.spaceflightnewsapi.net/v4/articles?limit=3')
      .then(res => res.json())
      .then(data => {
        setNews(data.results || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="relative z-10 w-full mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-display font-bold text-white flex items-center">
          <Globe className="w-5 h-5 mr-3 text-brand-400" />
          Spaceflight News
        </h2>
        <a href="https://spaceflightnewsapi.net" target="_blank" rel="noreferrer" className="text-xs text-gray-400 hover:text-white transition-colors flex items-center">
          Powered by SNAPI <ExternalLink className="w-3 h-3 ml-1" />
        </a>
      </div>
      
      {loading ? (
        <div className="flex space-x-4 overflow-x-auto pb-4 custom-scrollbar">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex-none w-80 h-48 bg-white/5 animate-pulse rounded-2xl border border-white/10" />
          ))}
        </div>
      ) : news.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {news.map((article: any) => (
            <a 
              key={article.id} 
              href={article.url} 
              target="_blank" 
              rel="noreferrer"
              className="group block relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 hover:border-white/30 transition-colors h-48"
            >
              <img src={article.image_url} alt={article.title} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent p-5 flex flex-col justify-end">
                <span className="text-xs font-mono text-brand-400 mb-2 uppercase tracking-widest">{article.news_site}</span>
                <h3 className="font-bold text-white text-sm line-clamp-2 leading-snug group-hover:text-brand-200 transition-colors">{article.title}</h3>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="p-6 bg-white/5 rounded-2xl border border-white/10 text-center">
          <p className="text-gray-400">Failed to load news feed.</p>
        </div>
      )}
    </div>
  );
}

export function Dashboard() {
  const { userData, user } = useStore();
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [showTiktok, setShowTiktok] = useState(false);
  
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    
    const fetchConfig = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'config'));
        if (snap.exists() && snap.data().tiktokUrl) {
          setTiktokUrl(snap.data().tiktokUrl);
          setShowTiktok(true);
          setTimeout(() => setShowTiktok(false), 10000);
        }
      } catch (err) {}
    };
    fetchConfig();
  }, []);

  const isAdmin = userData?.role === 'admin';
  const isOwner = userData?.role === 'owner';
  const hasExclusive = isOwner || userData?.currentFrame === 'frame_custom';
  
  const baseNavItems = [...navItems];
  if (hasExclusive) {
    baseNavItems.push({ path: '/exclusive', name: 'Black Market', icon: Crown, color: 'text-yellow-400', bg: 'bg-yellow-900/20' });
  }

  const allNavItems = isAdmin || isOwner
    ? [...baseNavItems, { path: '/admin', name: 'Admin Panel', icon: Shield, color: 'text-red-400', bg: 'bg-red-900/20' }] 
    : baseNavItems;
    
  const filteredNavItems = allNavItems.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const currentBg = BACKGROUNDS.find(b => b.id === userData?.currentBackground)?.url || '';
  
  const handleUpdateAvatar = async () => {
    if (!user) return;
    const url = prompt('Enter image URL for Avatar:');
    if (!url) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), { avatarUrl: url });
      alert('Avatar updated!');
    } catch (e) {
      alert('Failed to update avatar.');
    }
  };

  const claimDaily = async () => {
    if (!user || !userData) return;
    const now = new Date();
    const lastClaim = userData.lastClaim ? new Date(userData.lastClaim) : null;
    
    if (lastClaim && lastClaim.getDate() === now.getDate() && lastClaim.getMonth() === now.getMonth()) {
      alert('Already claimed today!');
      return;
    }

    

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        coins: (userData.coins || 0) + 500,
        lastClaim: now.toISOString()
      });
      alert('Claimed 500 Funding!');
    } catch (err: any) {
      console.error(err);
      alert('Failed to claim funding.');
    }
  };

  const buyBackground = async (bgId: string) => {
    if (!user || !userData) return;
    
    const unlockedBgs = userData.unlockedBackgrounds || ['bg_default'];
    if (unlockedBgs.includes(bgId)) {
       // Just equip it
       
         await updateDoc(doc(db, 'users', user.uid), { currentBackground: bgId });
       
       return;
    }

    if ((userData.diamonds || 0) < 20) {
      alert('Not enough Diamonds! You need 20 Diamonds to buy a new background. Earn them by solving Arcade puzzles.');
      return;
    }

    const updatedData = {
      ...userData,
      diamonds: userData.diamonds - 20,
      unlockedBackgrounds: [...unlockedBgs, bgId],
      currentBackground: bgId
    };

    
      await updateDoc(doc(db, 'users', user.uid), {
        diamonds: userData.diamonds - 20,
        unlockedBackgrounds: [...unlockedBgs, bgId],
        currentBackground: bgId
      });
    
  };

  const buyFrame = async (frameId: string, cost: number) => {
    if (!user || !userData) return;
    
    const unlockedFrames = userData.unlockedFrames || ['frame_none'];
    if (unlockedFrames.includes(frameId)) {
       
         await updateDoc(doc(db, 'users', user.uid), { currentFrame: frameId });
       
       return;
    }

    if ((userData.diamonds || 0) < cost) {
      alert(`Not enough Diamonds! You need ${cost} Diamonds to buy this frame.`);
      return;
    }

    const updatedData = {
      ...userData,
      diamonds: userData.diamonds - cost,
      unlockedFrames: [...unlockedFrames, frameId],
      currentFrame: frameId
    };

    
      await updateDoc(doc(db, 'users', user.uid), updatedData);
    
  };

  const handleCustomFrame = async () => {
    if (!user || !userData) return;
    if ((userData.diamonds || 0) < 200000 && userData.role !== 'owner') {
      alert('You need 200,000 Diamonds to unlock Custom Frame! Or pay Rp 2,000 to owner to unlock Exclusive Role.');
      return;
    }
    const url = prompt('Enter your custom transparent GIF URL (Max 5MB):');
    if (!url) return;
    
    let cost = userData.role === 'owner' ? 0 : 200000;
    
    const updatedData = {
      ...userData,
      diamonds: userData.diamonds - cost,
      customFrame: url,
      currentFrame: 'frame_custom'
    };
    
      await updateDoc(doc(db, 'users', user.uid), updatedData);
    
    alert('Custom frame unlocked and equipped!');
  };

  return (
    <div className="relative min-h-full max-w-7xl mx-auto space-y-8">
      <AnimatePresence>
        {showTiktok && tiktokUrl && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-brand-900/90 backdrop-blur-xl border border-brand-500/50 p-4 rounded-2xl shadow-[0_0_50px_rgba(139,92,246,0.3)] flex items-center space-x-4 max-w-md w-full"
          >
            <div className="p-3 bg-brand-500/20 rounded-xl">
              <Tv className="w-6 h-6 text-brand-400 animate-pulse" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-brand-300 font-bold uppercase tracking-widest mb-1">Official E.A.S TikTok</p>
              <a href={tiktokUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-white hover:text-brand-300 line-clamp-1 transition-colors">
                {tiktokUrl}
              </a>
            </div>
            <button onClick={() => setShowTiktok(false)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Decorator */}
      <AnimatePresence mode="wait">
        {currentBg ? (
          <motion.div 
            key={currentBg}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="fixed inset-0 z-0 pointer-events-none"
            style={{
              backgroundImage: `url(${currentBg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-brand-950/50 via-brand-950/80 to-brand-950" />
          </motion.div>
        ) : (
          <motion.div 
            key="default"
            className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-800/20 via-brand-950 to-brand-950"
          />
        )}
      </AnimatePresence>

      {/* Top Bar / Profile */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <header className="flex items-center space-x-6">
          <div className="relative group cursor-pointer" onClick={handleUpdateAvatar}>
            <div className="w-20 h-20 rounded-full border-2 border-brand-500 overflow-hidden bg-brand-900 shadow-[0_0_20px_rgba(139,92,246,0.3)] relative z-10">
              {userData?.avatarUrl ? (
                <img src={userData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-display font-bold text-brand-300">
                  {userData?.name?.charAt(0)}
                </div>
              )}
            </div>
            {/* Frame Display */}
            {userData?.currentFrame && userData.currentFrame !== 'frame_none' && (
              <div className="absolute inset-0 z-20 pointer-events-none scale-125">
                {userData.currentFrame === 'frame_custom' && userData.customFrame ? (
                   <img src={userData.customFrame} className="w-full h-full object-contain" alt="Custom Frame" />
                ) : (
                   <img src={FRAMES.find(f => f.id === userData.currentFrame)?.url} className="w-full h-full object-contain mix-blend-screen" alt="Frame" />
                )}
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30">
              <ImageIcon className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center space-x-2 bg-brand-500/10 text-brand-300 border border-brand-500/20 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-widest mb-4 relative overflow-hidden"
            >
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
              />
              <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse relative z-10" />
              <span className="relative z-10">System Online</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-display font-bold tracking-tight text-white"
            >
              Welcome, <motion.span 
                className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-white"
              >{userData?.name}</motion.span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-gray-400 mt-2 text-lg"
            >
              Command Center Overview
            </motion.p>
          </div>
        </header>
        <motion.button 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setShowSettings(true)}
          className="flex items-center space-x-3 bg-white/5 hover:bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 transition-all group shadow-xl"
        >
          <div className="p-2 bg-brand-500/20 rounded-lg group-hover:bg-brand-500/30 transition-colors">
            <Settings className="w-5 h-5 text-brand-300" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-white">Profile Settings</p>
            <p className="text-xs text-gray-400">Stats & Decorations</p>
          </div>
        </motion.button>
      </div>

      <SpaceNews />

      {/* Navigation Grid */}
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-display font-bold text-white flex items-center">
            <Globe className="w-6 h-6 mr-3 text-brand-400" />
            Exploration Modules
          </h2>
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-brand-500 focus:bg-white/10 transition-all"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredNavItems.map((item, idx) => (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.05 }}
              onClick={() => navigate(item.path)}
              whileHover={{ scale: 1.03, y: -5 }}
              whileTap={{ scale: 0.97 }}
              className={`cursor-pointer ${item.bg} backdrop-blur-xl p-6 rounded-[2rem] border border-white/10 hover:border-white/30 transition-all flex flex-col justify-between group h-48 shadow-2xl relative overflow-hidden`}
            >
              <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity transform duration-500 pointer-events-none">
                <item.icon className="w-32 h-32" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className={`relative z-10 p-3 rounded-2xl w-max ${item.color.replace('text-', 'bg-').replace('-400', '-500/20')} backdrop-blur-md`}>
                <item.icon className={`w-8 h-8 ${item.color}`} />
              </div>
              <div className="relative z-10">
                <span className="font-bold text-lg text-white transition-colors">{item.name}</span>
                <div className="w-8 h-1 bg-white/20 mt-3 rounded-full overflow-hidden">
                  <div className={`h-full w-0 group-hover:w-full transition-all duration-500 ${item.color.replace('text-', 'bg-')}`} />
                </div>
              </div>
            </motion.div>
          ))}
          {filteredNavItems.length === 0 && (
            <div className="col-span-full py-8 text-center bg-white/5 rounded-2xl border border-white/10">
              <p className="text-gray-400 text-sm">No modules found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-brand-950 w-full max-w-3xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/40">
                <h2 className="text-2xl font-display font-bold flex items-center text-white">
                  <Settings className="w-6 h-6 mr-3 text-brand-400" />
                  Profile Settings & Stats
                </h2>
                <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">
                
                {/* Stats Grid */}
                <div>
                  <h3 className="font-bold text-lg mb-4 uppercase tracking-widest text-brand-300">Your Metrics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-brand-900/40 p-5 rounded-2xl border border-white/10">
                      <div className="flex items-center space-x-3 mb-2 text-gray-400">
                        <Star className="w-5 h-5 text-brand-300" />
                        <span className="text-xs uppercase tracking-widest font-bold">Funding</span>
                      </div>
                      <p className="text-2xl font-mono font-bold text-white">${(userData?.coins || 0).toLocaleString()}</p>
                    </div>

                    <div className="bg-brand-900/40 p-5 rounded-2xl border border-white/10">
                      <div className="flex items-center space-x-3 mb-2 text-gray-400">
                        <Target className="w-5 h-5 text-pink-400" />
                        <span className="text-xs uppercase tracking-widest font-bold">Diamonds</span>
                      </div>
                      <p className="text-2xl font-mono font-bold text-white">{userData?.diamonds || 0}</p>
                    </div>

                    <div className="bg-brand-900/40 p-5 rounded-2xl border border-white/10">
                      <div className="flex items-center space-x-3 mb-2 text-gray-400">
                        <Crown className="w-5 h-5 text-yellow-400" />
                        <span className="text-xs uppercase tracking-widest font-bold">Experience</span>
                      </div>
                      <p className="text-2xl font-mono font-bold text-white">{userData?.exp || 0} EXP</p>
                    </div>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={claimDaily}
                    className="mt-4 w-full bg-brand-600 hover:bg-brand-500 p-4 rounded-2xl border border-brand-500 flex items-center justify-center space-x-3 transition-colors shadow-lg shadow-brand-500/20"
                  >
                    <Trophy className="w-5 h-5 text-white" />
                    <span className="font-bold text-white uppercase tracking-widest text-sm">Claim Daily Funding (+ $500)</span>
                  </motion.button>
                </div>

                {/* Avatar Frames */}
                <div>
                  <h3 className="font-bold text-lg mb-4 uppercase tracking-widest text-brand-300">Avatar Frames</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {FRAMES.map((frame) => {
                      const unlockedFrames = userData?.unlockedFrames || ['frame_none'];
                      const isUnlocked = unlockedFrames.includes(frame.id) || frame.cost === 0;
                      const isEquipped = (userData?.currentFrame || 'frame_none') === frame.id;

                      return (
                        <div key={frame.id} className={`relative rounded-xl overflow-hidden border-2 transition-all ${isEquipped ? 'border-brand-400 ring-2 ring-brand-400/50' : 'border-white/10 hover:border-white/30'} group`}>
                          <div className="aspect-square bg-black/50 relative flex items-center justify-center p-4">
                            <div className="w-16 h-16 rounded-full bg-brand-900 border border-brand-500/50 flex items-center justify-center relative">
                               <span className="text-xl font-display font-bold text-brand-300">U</span>
                               {frame.url && <img src={frame.url} className="absolute inset-0 w-full h-full object-contain scale-125 pointer-events-none mix-blend-screen" alt={frame.name} />}
                            </div>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-3">
                            <span className="font-bold text-sm truncate text-white mb-1">{frame.name}</span>
                            {isEquipped ? (
                              <span className="text-[10px] uppercase font-mono text-brand-400 font-bold bg-brand-400/20 px-2 py-1 rounded w-max">Equipped</span>
                            ) : isUnlocked ? (
                              <button onClick={() => buyFrame(frame.id, frame.cost)} className="text-[10px] uppercase font-mono bg-white/20 hover:bg-white/30 text-white rounded px-2 py-1 w-max transition-colors">Equip</button>
                            ) : (
                              <button onClick={() => buyFrame(frame.id, frame.cost)} className="text-[10px] uppercase font-mono bg-pink-500/80 hover:bg-pink-500 text-white rounded px-2 py-1 flex items-center w-max transition-colors">
                                <Target className="w-3 h-3 mr-1" /> {frame.cost} Dia
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* Custom Frame */}
                  <div className="bg-brand-900/40 p-5 rounded-2xl border border-white/10 flex flex-col space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-white mb-1">Custom Frame (GIF)</h4>
                        <p className="text-xs text-gray-400">Unlock your own transparent GIF frame.</p>
                        <p className="text-[10px] text-pink-400 mt-1 uppercase tracking-widest font-mono">Cost: 200,000 Diamonds OR Exclusive Role (Rp 2k)</p>
                      </div>
                      <button onClick={handleCustomFrame} className="bg-brand-600 hover:bg-brand-500 text-white font-bold uppercase tracking-widest text-xs px-4 py-2 rounded-xl transition-colors shrink-0 ml-4">
                        {userData?.currentFrame === 'frame_custom' ? 'Change Custom Frame' : 'Unlock Custom'}
                      </button>
                    </div>
                    
                    <div className="border-t border-white/5 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-yellow-400 mb-1 flex items-center"><Crown className="w-4 h-4 mr-1" /> Get Exclusive Access</h4>
                        <p className="text-xs text-gray-400">Unlock Owner role, Custom Frames, and Black Market features.</p>
                      </div>
                      <a 
                        href="https://wa.me/6281283324109?text=Halo,%20saya%20ingin%20membeli%20fitur%20eksklusif%20/%20role%20Owner%20di%20EAS."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-green-600 hover:bg-green-500 text-white font-bold uppercase tracking-widest text-xs px-6 py-2 rounded-xl transition-colors shrink-0 text-center w-full sm:w-auto"
                      >
                        Contact Owner via WA
                      </a>
                    </div>
                  </div>
                </div>

                {/* Decorations */}
                <div>
                  <h3 className="font-bold text-lg mb-4 uppercase tracking-widest text-brand-300">Command Center Backgrounds</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {BACKGROUNDS.map((bg) => {
                      const unlockedBgs = userData?.unlockedBackgrounds || ['bg_default'];
                      const isUnlocked = unlockedBgs.includes(bg.id);
                      const isEquipped = (userData?.currentBackground || 'bg_default') === bg.id;

                      return (
                        <div key={bg.id} className={`relative rounded-xl overflow-hidden border-2 transition-all ${isEquipped ? 'border-brand-400 ring-2 ring-brand-400/50' : 'border-white/10 hover:border-white/30'} group`}>
                          <div className="aspect-square bg-black/50 relative">
                            {bg.url ? (
                              <img src={bg.url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt={bg.name} />
                            ) : (
                              <div className="w-full h-full bg-brand-900 flex items-center justify-center text-gray-500">
                                Default
                              </div>
                            )}
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-3">
                            <span className="font-bold text-sm truncate text-white mb-1">{bg.name}</span>
                            {isEquipped ? (
                              <span className="text-[10px] uppercase font-mono text-brand-400 font-bold bg-brand-400/20 px-2 py-1 rounded w-max">Equipped</span>
                            ) : isUnlocked ? (
                              <button onClick={() => buyBackground(bg.id)} className="text-[10px] uppercase font-mono bg-white/20 hover:bg-white/30 text-white rounded px-2 py-1 w-max transition-colors">Equip</button>
                            ) : (
                              <button onClick={() => buyBackground(bg.id)} className="text-[10px] uppercase font-mono bg-pink-500/80 hover:bg-pink-500 text-white rounded px-2 py-1 flex items-center w-max transition-colors">
                                <Target className="w-3 h-3 mr-1" /> 20 Dia
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
