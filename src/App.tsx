/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './db/firebase';
import { useStore } from './store/useStore';
import { AuthView } from './views/AuthView';
import { Dashboard } from './views/Dashboard';
import { Forum } from './views/Forum';
import { Library } from './views/Library';
import { Quiz } from './views/Quiz';
import { SolarSystem } from './views/SolarSystem';
import { AdminPanel } from './views/AdminPanel';
import { Arcade } from './views/Arcade';
import { Exoplanets } from './views/Exoplanets';
import { StarMap } from './views/StarMap';
import { SpaceWeather } from './views/SpaceWeather';
import { Missions } from './views/Missions';
import { DebateRoom } from './views/DebateRoom';
import { BlackMarket } from './views/BlackMarket';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function PendingApprovalView() {
  const { setUser, setUserData, userData } = useStore();
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'config'));
        if (snap.exists()) {
          setConfig(snap.data());
        }
      } catch (err) {}
    };
    fetchConfig();
  }, []);

  const handleSignOut = () => {
    auth.signOut();
    setUser(null);
    setUserData(null);
  };

  const groupLink = userData?.generation === 'Gen 1' ? config?.groupLinkGen1 : config?.groupLinkGen2;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-6 bg-brand-950 text-white relative">
      <div className="absolute inset-0 bg-brand-900/40" />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-black/40 backdrop-blur-md p-8 rounded-3xl border border-white/10 z-10 shadow-2xl"
      >
        <Loader2 className="w-12 h-12 text-brand-500 animate-spin mx-auto mb-6" />
        <h2 className="text-2xl font-bold font-display mb-4">Awaiting Command Center Approval</h2>
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
          Your explorer credentials for <strong className="text-brand-300">{userData?.generation || 'E.A.S'}</strong> have been received. Please wait until an Administrator grants you access to the Gateway.
        </p>
        
        {groupLink && (
          <div className="bg-brand-900/30 border border-brand-500/20 p-5 rounded-2xl mb-8">
            <h3 className="font-bold text-white mb-2 uppercase tracking-widest text-xs">Join {userData?.generation || 'Community'} Group</h3>
            <p className="text-xs text-gray-400 mb-4">While you wait for approval, join our official communication channel.</p>
            <a 
              href={groupLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full bg-brand-600 hover:bg-brand-500 text-white font-bold uppercase tracking-widest text-xs py-3 rounded-xl transition-colors shadow-[0_0_15px_rgba(139,92,246,0.3)]"
            >
              Connect to Comm-Link
            </a>
          </div>
        )}

        <button onClick={handleSignOut} className="bg-white/10 hover:bg-white/20 w-full py-3 rounded-xl text-xs font-bold tracking-widest uppercase transition-colors">
          Abort Sequence (Log Out)
        </button>
      </motion.div>
    </div>
  );
}

export default function App() {
  const { user, setUser, setUserData } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser && currentUser.emailVerified) {
        setUser(currentUser);
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setUserData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-900 relative overflow-hidden">
        {/* Black Hole Event Horizon */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.8, 0.3], rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-brand-800 via-purple-900/40 to-transparent blur-3xl absolute"
          />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="w-48 h-48 rounded-full bg-black shadow-[0_0_100px_rgba(139,92,246,0.8)] border border-brand-800/50 relative flex items-center justify-center"
          >
            {/* Accretion Disk */}
            <motion.div
               animate={{ rotate: -360, scale: [1, 1.05, 1] }}
               transition={{ rotate: { repeat: Infinity, duration: 3, ease: "linear" }, scale: { repeat: Infinity, duration: 2, ease: "easeInOut" } }}
               className="absolute inset-0 rounded-full border-t-[4px] border-r-[4px] border-brand-400/80 blur-[2px]"
            />
            <motion.div
               animate={{ rotate: 360, scale: [1, 1.1, 1] }}
               transition={{ rotate: { repeat: Infinity, duration: 5, ease: "linear" }, scale: { repeat: Infinity, duration: 3, ease: "easeInOut", delay: 0.5 } }}
               className="absolute -inset-4 rounded-full border-b-[2px] border-l-[2px] border-pink-500/60 blur-[1px]"
            />
            
            <motion.div
               animate={{ opacity: [0.5, 1, 0.5] }}
               transition={{ repeat: Infinity, duration: 2 }}
               className="absolute"
            >
               <Loader2 className="w-8 h-8 text-brand-300 animate-spin" />
            </motion.div>
          </motion.div>
        </div>

        {/* Particles getting sucked in */}
        <div className="absolute inset-0 z-0">
          {Array.from({ length: 40 }).map((_, i) => {
            const angle = Math.random() * Math.PI * 2;
            const distance = 300 + Math.random() * 500;
            const startX = Math.cos(angle) * distance;
            const startY = Math.sin(angle) * distance;
            
            return (
              <motion.div
                key={i}
                className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                initial={{ x: startX, y: startY, scale: 0, opacity: 0 }}
                animate={{ 
                  x: 0, 
                  y: 0, 
                  scale: [0, 1.5, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  ease: "circIn",
                  delay: Math.random() * 3,
                }}
              />
            );
          })}
        </div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="relative z-10 flex flex-col items-center mt-64 pointer-events-none"
        >
          <h1 className="text-3xl font-display font-bold tracking-[0.3em] text-white uppercase text-shadow">
            E.A.S
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-xs text-brand-300 mt-3 uppercase tracking-widest"
          >
            Entering Event Horizon...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {user ? (
        <div className="flex flex-col h-screen overflow-hidden bg-brand-900 selection:bg-brand-500/30 relative">
          {useStore.getState().userData?.status === 'pending' ? (
            <PendingApprovalView />
          ) : (
            <AnimatedRoutes />
          )}
        </div>
      ) : (
        <AuthView />
      )}
    </BrowserRouter>
  );
}

import { useLocation, useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

function AnimatedRoutes() {
  const location = useLocation();
  const navigate = useNavigate();
  const isDashboard = location.pathname === '/';

  return (
    <>
      {!isDashboard && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          onClick={() => navigate('/')}
          className="fixed top-6 left-6 z-50 p-3 bg-brand-950/80 backdrop-blur-md border border-white/10 text-brand-300 hover:text-white rounded-xl shadow-lg transition-colors"
          title="Back to Hub"
        >
          <Home className="w-6 h-6" />
        </motion.button>
      )}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 relative custom-scrollbar">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={
              <PageTransition><Dashboard /></PageTransition>
            } />
            <Route path="/forum" element={
              <PageTransition><Forum /></PageTransition>
            } />
            <Route path="/debate" element={
              <PageTransition><DebateRoom /></PageTransition>
            } />
            <Route path="/library" element={
              <PageTransition><Library /></PageTransition>
            } />
            <Route path="/quiz" element={
              <PageTransition><Quiz /></PageTransition>
            } />
            <Route path="/solar-system" element={
              <PageTransition><SolarSystem /></PageTransition>
            } />
            <Route path="/arcade" element={
              <PageTransition><Arcade /></PageTransition>
            } />
            <Route path="/exoplanets" element={
              <PageTransition><Exoplanets /></PageTransition>
            } />
            <Route path="/starmap" element={
              <PageTransition><StarMap /></PageTransition>
            } />
            <Route path="/spaceweather" element={
              <PageTransition><SpaceWeather /></PageTransition>
            } />
            <Route path="/missions" element={
              <PageTransition><Missions /></PageTransition>
            } />
            <Route path="/exclusive" element={
              <PageTransition><BlackMarket /></PageTransition>
            } />
            <Route path="/admin" element={
              <PageTransition><AdminPanel /></PageTransition>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </main>
    </>
  );
}

function PageTransition({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Simulate loading for unique animation
    const timer = setTimeout(() => setIsLoading(false), 1200); // slightly longer to show off animations
    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-brand-950 z-50 overflow-hidden">
        <LoadingAnimation path={location.pathname} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
}

function LoadingAnimation({ path }: { path: string }) {
  if (path === '/exoplanets') {
    return (
      <div className="relative w-40 h-40 flex items-center justify-center">
        {/* Earth */}
        <motion.div 
          className="absolute w-16 h-16 bg-blue-500 rounded-full shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.5),0_0_20px_rgba(59,130,246,0.6)]"
          animate={{ scale: [1, 1, 1, 1.2, 0], opacity: [1, 1, 1, 0, 0] }}
          transition={{ duration: 1.2, times: [0, 0.4, 0.6, 0.8, 1], ease: "easeInOut" }}
        />
        {/* Moon */}
        <motion.div 
          className="absolute w-6 h-6 bg-gray-400 rounded-full shadow-[inset_-4px_-4px_10px_rgba(0,0,0,0.5)]"
          initial={{ x: 100, y: -50 }}
          animate={{ x: 0, y: 0, opacity: [1, 1, 0] }}
          transition={{ duration: 0.6, ease: "easeIn" }}
        />
        {/* Explosion */}
        <motion.div
          className="absolute w-4 h-4 bg-orange-500 rounded-full"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 20], opacity: [0, 1, 0] }}
          transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
        />
        <motion.div
          className="absolute w-4 h-4 bg-yellow-300 rounded-full"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 15], opacity: [0, 1, 0] }}
          transition={{ duration: 0.5, delay: 0.65, ease: "easeOut" }}
        />
      </div>
    );
  }

  if (path === '/starmap') {
    return (
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* Wormhole */}
        {[1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-purple-500/30"
            style={{ width: i * 30, height: i * 30 }}
            animate={{ 
              rotate: 360, 
              scale: [1, 0.2, 1],
              opacity: [0.2, 1, 0.2] 
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              delay: i * 0.1,
              ease: "linear"
            }}
          />
        ))}
        <motion.div className="w-4 h-4 bg-white rounded-full shadow-[0_0_20px_#fff]" />
      </div>
    );
  }

  if (path === '/arcade') {
    return (
      <div className="flex space-x-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-6 h-6 bg-pink-500 rounded-sm shadow-[0_0_15px_rgba(236,72,153,0.6)]"
            animate={{ y: [0, -20, 0], rotate: [0, 90, 180] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    );
  }

  if (path === '/solar-system') {
    return (
      <div className="relative w-40 h-40 flex items-center justify-center">
        {/* Sun */}
        <motion.div 
          className="absolute w-12 h-12 bg-yellow-500 rounded-full shadow-[0_0_30px_rgba(234,179,8,0.8)]"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        {/* Planet 1 */}
        <motion.div
          className="absolute w-full h-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute top-0 left-1/2 w-4 h-4 bg-blue-400 rounded-full -translate-x-1/2" />
        </motion.div>
        {/* Planet 2 */}
        <motion.div
          className="absolute w-24 h-24"
          animate={{ rotate: -360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute top-0 left-1/2 w-3 h-3 bg-red-400 rounded-full -translate-x-1/2" />
        </motion.div>
      </div>
    );
  }

  if (path === '/missions') {
    return (
      <div className="relative w-20 h-40 flex flex-col items-center justify-center">
        <motion.div
          animate={{ y: [0, -100], opacity: [1, 0] }}
          transition={{ duration: 1, ease: "easeIn" }}
          className="flex flex-col items-center"
        >
          <div className="w-8 h-16 bg-white rounded-t-full relative">
            <div className="absolute top-4 left-1/2 w-4 h-4 bg-blue-900 rounded-full -translate-x-1/2" />
            <div className="absolute -left-2 bottom-0 w-2 h-6 bg-red-500 transform origin-bottom-right -skew-y-12" />
            <div className="absolute -right-2 bottom-0 w-2 h-6 bg-red-500 transform origin-bottom-left skew-y-12" />
          </div>
          <motion.div 
            className="w-4 h-12 bg-gradient-to-b from-orange-500 to-transparent mt-1 blur-sm"
            animate={{ scaleY: [1, 1.5, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 0.2, repeat: Infinity }}
          />
        </motion.div>
      </div>
    );
  }

  if (path === '/admin') {
    return (
      <div className="relative w-32 h-32 flex items-center justify-center">
        <motion.div 
          className="w-16 h-20 border-4 border-red-500 rounded-b-full rounded-t-lg relative overflow-hidden"
          animate={{ boxShadow: ["0 0 0px rgba(239,68,68,0)", "0 0 20px rgba(239,68,68,0.8)", "0 0 0px rgba(239,68,68,0)"] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div 
            className="absolute left-0 right-0 h-1 bg-red-400 shadow-[0_0_10px_red]"
            animate={{ top: ["0%", "100%", "0%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
      </div>
    );
  }

  if (path === '/quiz') {
    return (
      <div className="flex items-end space-x-2 w-24 h-24">
        {[0, 1, 2, 3].map(i => (
          <motion.div
            key={i}
            className="w-4 bg-orange-500 rounded-t-sm"
            animate={{ height: ["20%", "100%", "20%"] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    );
  }

  if (path === '/forum') {
    return (
      <div className="relative w-32 h-32 flex items-center justify-center">
        <motion.div
          className="absolute w-12 h-10 bg-indigo-500 rounded-2xl rounded-bl-sm -ml-12 mb-8 flex items-center justify-center space-x-1"
          animate={{ scale: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, times: [0, 0.2, 0.8, 1] }}
        >
           <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{animationDelay: "0ms"}} />
           <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{animationDelay: "150ms"}} />
           <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{animationDelay: "300ms"}} />
        </motion.div>
        <motion.div
          className="absolute w-12 h-10 bg-indigo-400 rounded-2xl rounded-br-sm ml-12 mt-8 flex items-center justify-center space-x-1"
          animate={{ scale: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1, times: [0, 0.2, 0.8, 1] }}
        >
           <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{animationDelay: "0ms"}} />
           <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{animationDelay: "150ms"}} />
           <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{animationDelay: "300ms"}} />
        </motion.div>
      </div>
    );
  }

  if (path === '/library') {
    return (
      <div className="relative w-24 h-24 flex items-center justify-center">
        <motion.div
          className="w-16 h-20 border-2 border-teal-500 rounded flex flex-col justify-between p-2"
          animate={{ rotateY: [0, 180, 360] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-full h-2 bg-teal-500/50 rounded-sm" />
          <div className="w-3/4 h-2 bg-teal-500/50 rounded-sm" />
          <div className="w-full h-2 bg-teal-500/50 rounded-sm" />
        </motion.div>
      </div>
    );
  }

  if (path === '/spaceweather') {
    return (
      <div className="relative w-32 h-32 flex flex-col items-center justify-center">
        <motion.div 
          className="w-16 h-8 bg-gray-600 rounded-full blur-sm absolute top-10"
          animate={{ scaleX: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.svg 
          width="40" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className="text-cyan-400 absolute top-14"
          animate={{ opacity: [0, 1, 0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, times: [0, 0.1, 0.2, 0.3, 1] }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor"/>
        </motion.svg>
      </div>
    );
  }

  // Default: Blackhole for everything else including /
  return (
    <div className="relative w-40 h-40 flex items-center justify-center">
      <motion.div
        className="absolute w-32 h-32 rounded-full border-4 border-t-brand-500 border-r-purple-500 border-b-transparent border-l-transparent"
        animate={{ rotate: 360, scale: [1, 1.1, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute w-24 h-24 rounded-full border-4 border-b-cyan-500 border-l-brand-400 border-t-transparent border-r-transparent"
        animate={{ rotate: -360, scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />
      <div className="absolute w-12 h-12 bg-black rounded-full shadow-[0_0_40px_rgba(0,0,0,1)] ring-2 ring-white/10" />
    </div>
  );
}

