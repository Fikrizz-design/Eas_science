import { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, getDocs, query, where, collection } from 'firebase/firestore';
import { auth, db } from '../db/firebase';
import { mirror } from '../db/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { differenceInYears } from 'date-fns';
import { Telescope, Loader2, Compass, ArrowRight, ShieldCheck, Check, MailCheck } from 'lucide-react';
import { useStore } from '../store/useStore';

function IntroAnimation({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // Sequence timing
    const t1 = setTimeout(() => setPhase(1), 2000); // Earth appears and moves
    const t2 = setTimeout(() => setPhase(2), 4000); // Collision/Explosion
    const t3 = setTimeout(() => setPhase(3), 5500); // Welcome text
    const t4 = setTimeout(() => onComplete(), 8500); // End
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden">
      <AnimatePresence>
        {phase < 3 && (
          <>
            {/* Blackhole */}
            <motion.div
              key="blackhole"
              initial={{ scale: 0 }}
              animate={{ scale: phase >= 2 ? 50 : 1, rotate: 360 * 10 }}
              transition={{ 
                scale: { duration: phase >= 2 ? 1 : 2, ease: phase >= 2 ? "easeIn" : "easeOut" }, 
                rotate: { duration: 20, repeat: Infinity, ease: "linear" } 
              }}
              className={`absolute w-32 h-32 rounded-full border-t-[10px] border-l-[5px] border-brand-500 shadow-[0_0_100px_rgba(139,92,246,0.8)] flex items-center justify-center bg-black z-10 ${phase >= 2 ? 'opacity-0' : 'opacity-100'}`}
            >
              {phase === 0 && <span className="font-bold text-brand-500 font-mono tracking-widest text-xs animate-pulse">EAS</span>}
            </motion.div>
            
            {/* Earth */}
            {phase >= 1 && phase < 2 && (
              <motion.div
                key="earth"
                initial={{ x: 300, y: -200, scale: 0.5 }}
                animate={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                transition={{ duration: 2, ease: "easeIn" }}
                className="absolute w-16 h-16 rounded-full bg-blue-500 shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.5)] z-20"
                style={{
                  backgroundImage: 'radial-gradient(circle at 30% 30%, #4facfe 0%, #00f2fe 50%, #000000 100%)'
                }}
              />
            )}
            
            {/* Flash Explosion */}
            {phase === 2 && (
              <motion.div
                key="flash"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute inset-0 bg-white z-50"
              />
            )}
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === 3 && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="text-center z-40"
          >
            <Telescope className="w-16 h-16 text-brand-400 mx-auto mb-6 animate-pulse" />
            <h1 className="text-5xl md:text-7xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-white to-brand-300 bg-[length:200%_auto] animate-[gradient_3s_linear_infinite]">
              Welcome to EAS
            </h1>
            <p className="text-brand-300 mt-4 tracking-widest uppercase text-sm font-mono">Education Astronomy Science</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TermsView({ onAccept }: { onAccept: () => void }) {
  const [scrolledToBottom, setScrolledToBottom] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const bottom = e.currentTarget.scrollHeight - e.currentTarget.scrollTop <= e.currentTarget.clientHeight + 50;
    if (bottom) setScrolledToBottom(true);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="min-h-screen bg-brand-950 flex flex-col items-center justify-center p-6 text-gray-200"
    >
      <div className="w-full max-w-3xl bg-brand-900/50 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[80vh]">
        <div className="p-6 border-b border-white/10 bg-black/40 flex items-center">
          <ShieldCheck className="w-8 h-8 text-brand-400 mr-4" />
          <div>
            <h2 className="text-2xl font-bold text-white font-display">Explorer Codex</h2>
            <p className="text-sm text-gray-400">Terms of Service & Rules of Exploration</p>
          </div>
        </div>
        
        <div 
          className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar font-light leading-relaxed text-gray-300"
          onScroll={handleScroll}
        >
          <p>
            Welcome to the Education Astronomy Science (E.A.S) Command Center. By initializing a session and joining our platform, you agree to the following protocols. Please scroll to the bottom to acknowledge.
          </p>
          
          <h3 className="font-bold text-white text-lg mt-6 mb-2">1. The Prime Directive</h3>
          <p>
            As an explorer, your primary mission is to learn, share, and expand humanity's understanding of the cosmos. Harassment, misinformation, or destructive behavior within the community forums or collaborative zones is strictly prohibited.
          </p>

          <h3 className="font-bold text-white text-lg mt-6 mb-2">2. Resource Management</h3>
          <p>
            Funding ($) and Diamonds are virtual resources utilized solely within the E.A.S ecosystem to unlock backgrounds, profiles, and educational modules. They hold no real-world monetary value and cannot be exchanged outside the platform.
          </p>

          <h3 className="font-bold text-white text-lg mt-6 mb-2">3. Age Restriction</h3>
          <p>
            Explorers must be at least 14 years of Earth age to access the E.A.S Command Center. If you are under 14, please ask a parent or guardian to assist you.
          </p>

          <h3 className="font-bold text-white text-lg mt-6 mb-2">4. Data Privacy</h3>
          <p>
            Your location (domicile) and birth date are used to tailor educational content and ensure compliance with COPPA protocols. We do not sell your personal telemetry to third-party advertisers.
          </p>
          
          <div className="h-20" /> {/* Spacer */}
        </div>

        <div className="p-6 border-t border-white/10 bg-black/40 flex items-center justify-between">
          <p className="text-xs text-gray-500 uppercase tracking-widest">
            {scrolledToBottom ? "Codex verified." : "Please read through to accept."}
          </p>
          <button
            disabled={!scrolledToBottom}
            onClick={onAccept}
            className={`flex items-center px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-sm transition-all ${
              scrolledToBottom 
                ? 'bg-brand-500 hover:bg-brand-400 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]' 
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            {scrolledToBottom && <Check className="w-5 h-5 mr-2" />}
            I Agree
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function OtpView({ email, uid, onVerified, onCancel }: { email: string; uid: string; onVerified: () => void; onCancel: () => void }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('A 6-digit verification code has been sent to your email.');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const handleResend = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send code');
      setInfo('A new code has been sent to your email.');
      setResendCooldown(30);
    } catch (err: any) {
      setError(err.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid or expired code.');
      onVerified();
    } catch (err: any) {
      setError(err.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md relative z-10">
      <div className="flex flex-col items-start mb-10">
        <div className="p-3 bg-brand-500/20 rounded-2xl mb-6 inline-flex border border-brand-500/30">
          <MailCheck className="w-8 h-8 text-brand-400" />
        </div>
        <h2 className="text-3xl font-display font-bold text-white">Verify Your Email</h2>
        <p className="text-gray-400 text-sm mt-2">
          Enter the 6-digit code sent to <strong className="text-brand-300">{email}</strong>.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-4 rounded-xl mb-6 text-sm">{error}</div>
      )}
      {!error && info && (
        <div className="bg-brand-500/10 border border-brand-500/30 text-brand-200 p-4 rounded-xl mb-6 text-sm">{info}</div>
      )}

      <form onSubmit={handleVerify} className="space-y-5">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          required
          autoFocus
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white text-center text-3xl tracking-[0.5em] focus:outline-none focus:border-brand-400 focus:bg-white/10 transition-all"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="------"
        />

        <button
          type="submit"
          disabled={loading || code.length !== 6}
          className="w-full bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-white font-bold tracking-widest uppercase text-sm py-4 rounded-xl transition-all flex items-center justify-center space-x-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Verify & Continue</span>}
        </button>

        <div className="flex items-center justify-between text-sm pt-2">
          <button type="button" onClick={onCancel} className="text-gray-400 hover:text-white transition-colors">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleResend}
            disabled={loading || resendCooldown > 0}
            className="text-brand-300 hover:text-brand-200 disabled:opacity-40 transition-colors"
          >
            {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

function OnboardingView({ generation, onContinue }: { generation: string; onContinue: () => void }) {
  const [rules, setRules] = useState('');
  const [groupLink, setGroupLink] = useState('');
  const [admins, setAdmins] = useState<{ name: string; role: string; profession?: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const configSnap = await getDoc(doc(db, 'settings', 'config'));
        if (configSnap.exists()) {
          const data = configSnap.data();
          setRules(data.communityRules || 'Belum ada aturan komunitas yang ditulis oleh admin.');
          setGroupLink(generation === 'Gen 2' ? (data.groupLinkGen2 || '') : (data.groupLinkGen1 || ''));
        }
        const usersSnap = await getDocs(query(collection(db, 'users'), where('role', 'in', ['owner', 'admin'])));
        setAdmins(usersSnap.docs.map(d => ({ name: d.data().name, role: d.data().role, profession: d.data().profession })).sort((a, b) => (a.role === 'owner' ? -1 : 1)));
      } catch (err) {
        console.warn('Failed to load onboarding info', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [generation]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-brand-950 relative overflow-hidden text-gray-200 p-6 py-12">
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-800/20 via-brand-950 to-brand-950" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl relative z-10">
        <div className="flex flex-col items-start mb-8">
          <div className="p-3 bg-brand-500/20 rounded-2xl mb-6 inline-flex border border-brand-500/30">
            <ShieldCheck className="w-8 h-8 text-brand-400" />
          </div>
          <h2 className="text-3xl font-display font-bold text-white">Welcome Aboard, Explorer</h2>
          <p className="text-gray-400 text-sm mt-2">Sebelum masuk ke Command Center, baca dulu aturan komunitas dan info berikut.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-brand-400 animate-spin" /></div>
        ) : (
          <div className="space-y-5">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-brand-300 mb-3">Aturan Komunitas</h3>
              <p className="text-sm text-gray-300 whitespace-pre-line leading-relaxed">{rules}</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-brand-300 mb-3">Struktur Admin</h3>
              {admins.length > 0 ? (
                <ul className="space-y-2">
                  {admins.map((a, i) => (
                    <li key={i} className="flex items-center justify-between text-sm">
                      <div>
                        <span className="text-white">{a.name}</span>
                        {a.profession && <span className="block text-[11px] text-gray-400">{a.profession}</span>}
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-widest ${a.role === 'owner' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}`}>{a.role}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">Belum ada data struktur admin.</p>
              )}
            </div>

            <div className="bg-brand-500/10 border border-brand-500/30 rounded-2xl p-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-brand-300 mb-2">Grup {generation}</h3>
              {groupLink ? (
                <a href={groupLink} target="_blank" rel="noreferrer" className="inline-flex items-center text-sm font-bold text-white bg-brand-600 hover:bg-brand-500 px-4 py-2 rounded-xl transition-colors">
                  Gabung Grup {generation} <ArrowRight className="w-4 h-4 ml-2" />
                </a>
              ) : (
                <p className="text-sm text-gray-400">Link grup untuk {generation} belum diatur oleh admin.</p>
              )}
            </div>
          </div>
        )}

        <button
          onClick={onContinue}
          className="w-full mt-8 bg-brand-500 hover:bg-brand-400 text-white font-bold tracking-widest uppercase text-sm py-4 rounded-xl transition-all flex items-center justify-center space-x-2"
        >
          <span>Enter Command Center</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
}

export function AuthView() {
  const [step, setStep] = useState<'intro' | 'terms' | 'auth' | 'otp' | 'onboarding'>('intro');
  const [pendingUid, setPendingUid] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [otpIsRegistration, setOtpIsRegistration] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [domicile, setDomicile] = useState('Jakarta');
  const [reason, setReason] = useState('');

  const [generation, setGeneration] = useState('Gen 1');
  const [profession, setProfession] = useState('Pelajar SMA');
  const [regStatus, setRegStatus] = useState<'open'|'closed'|'loading'>('loading');
  const [regLink, setRegLink] = useState('');

  useEffect(() => {
    import('firebase/firestore').then(({ doc, getDoc }) => {
      getDoc(doc(db, 'settings', 'config')).then(snap => {
        if (snap.exists()) {
          const data = snap.data();
          setRegStatus(data.isRegistrationOpen === false ? 'closed' : 'open');
          setRegLink(data.registrationLink || '');
        } else {
          setRegStatus('open');
        }
      }).catch(() => setRegStatus('open'));
    });
  }, []);

  const { setUser, setUserData } = useStore();
  const [showBlackHole, setShowBlackHole] = useState(false);

  const requestOtp = async (uid: string, targetEmail: string) => {
    const res = await fetch('/api/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, email: targetEmail }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send verification code.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const signedInUser = userCredential.user;
        if (!signedInUser.emailVerified) {
          setPendingUid(signedInUser.uid);
          setPendingEmail(signedInUser.email || email);
          setOtpIsRegistration(false);
          try {
            await requestOtp(signedInUser.uid, signedInUser.email || email);
          } catch (otpErr: any) {
            setError(otpErr.message);
            await auth.signOut();
            setLoading(false);
            return;
          }
          setStep('otp');
        } else {
          setShowBlackHole(true);
          await new Promise(resolve => setTimeout(resolve, 2500));
        }
      } else {
        const age = differenceInYears(new Date(), new Date(dob));
        if (age < 14) {
          setError('You must be at least 14 years old to join EAS.');
          setLoading(false);
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const newUserData = {
          name,
          email,
          dob,
          domicile,
          reason,
          generation,
          profession,
          professionChangedAt: new Date().toISOString(),
          role: 'member',
          coins: 0,
          diamonds: 0,
          createdAt: new Date().toISOString(),
          exp: 0,
          ipTimeout: false
        };

        await setDoc(doc(db, 'users', user.uid), newUserData);
        mirror('profiles', user.uid, newUserData);

        try {
          await requestOtp(user.uid, email);
        } catch (otpErr: any) {
          setError(otpErr.message);
          setLoading(false);
          return;
        }

        setPendingUid(user.uid);
        setPendingEmail(email);
        setOtpIsRegistration(true);
        setStep('otp');
      }
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError('⚠️ Authentication provider disabled. Please open Firebase Console -> Authentication -> Sign-in method, and enable "Email/Password".');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const completeLogin = async () => {
    const verifiedUser = auth.currentUser;
    if (verifiedUser) {
      setUser(verifiedUser);
      const docSnap = await getDoc(doc(db, 'users', verifiedUser.uid));
      if (docSnap.exists()) setUserData(docSnap.data());
    }
  };

  const handleOtpVerified = async () => {
    setShowBlackHole(true);
    await auth.currentUser?.reload();
    await auth.currentUser?.getIdToken(true); // refresh token so email_verified claim updates for security rules
    await new Promise(resolve => setTimeout(resolve, 2500));

    if (otpIsRegistration) {
      // New accounts see the rules/structure/group-link page before entering the app.
      setShowBlackHole(false);
      setStep('onboarding');
    } else {
      await completeLogin();
    }
  };

  const handleOtpCancel = async () => {
    await auth.signOut();
    setStep('auth');
    setIsLogin(true);
    setPendingUid('');
    setPendingEmail('');
  };

  if (step === 'intro') {
    return <IntroAnimation onComplete={() => setStep('terms')} />;
  }

  if (step === 'terms') {
    return <TermsView onAccept={() => setStep('auth')} />;
  }

  if (step === 'otp') {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-brand-950 relative overflow-hidden text-gray-200 p-6">
        <AnimatePresence>
          {showBlackHole && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 pointer-events-none"
            >
              <motion.div
                initial={{ scale: 0, rotate: 0 }}
                animate={{ scale: [0, 5, 20], rotate: 720 }}
                transition={{ duration: 2.5, ease: 'easeIn' }}
                className="w-32 h-32 rounded-full border-t-[20px] border-l-[10px] border-brand-500/80 shadow-[0_0_200px_rgba(139,92,246,1)]"
              />
            </motion.div>
          )}
        </AnimatePresence>
        <OtpView email={pendingEmail} uid={pendingUid} onVerified={handleOtpVerified} onCancel={handleOtpCancel} />
      </div>
    );
  }

  if (step === 'onboarding') {
    return <OnboardingView generation={generation} onContinue={async () => { await completeLogin(); }} />;
  }

  return (
    <div className="min-h-screen w-full flex bg-brand-950 relative overflow-hidden text-gray-200">
      
      {/* Black Hole Transition Overlay for Login Success */}
      <AnimatePresence>
        {showBlackHole && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0, rotate: 0 }}
              animate={{ scale: [0, 5, 20], rotate: 720 }}
              transition={{ duration: 2.5, ease: "easeIn" }}
              className="w-32 h-32 rounded-full border-t-[20px] border-l-[10px] border-brand-500/80 shadow-[0_0_200px_rgba(139,92,246,1)]"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left Panel: Aesthetic Image & Brand */}
      <div className="hidden lg:flex w-1/2 relative bg-black items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1080" 
            alt="Space Earth"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-950/80 via-transparent to-brand-950/90 mix-blend-multiply" />
          <div className="absolute inset-0 bg-brand-900/40" />
        </div>
        
        <div className="relative z-10 p-12 max-w-lg">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 mb-8">
              <Compass className="w-4 h-4 text-brand-300" />
              <span className="text-xs font-bold tracking-widest uppercase text-white">E.A.S Gateway</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-display font-bold text-white leading-tight mb-6">
              Explore The <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-indigo-300">Cosmos</span>
            </h1>
            <p className="text-lg text-gray-300 font-light leading-relaxed">
              Join the Education Astronomy Science platform. Access missions, earn diamonds, explore star maps, and unravel the mysteries of the universe.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Panel: Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        {/* Mobile Background (Hidden on Desktop) */}
        <div className="absolute inset-0 z-0 lg:hidden">
          <img 
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1080" 
            alt="Space Earth Mobile"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-brand-950/90" />
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md relative z-10"
        >
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-start mb-10"
          >
            <div className="p-3 bg-brand-500/20 rounded-2xl mb-6 inline-flex border border-brand-500/30">
              <Telescope className="w-8 h-8 text-brand-400" />
            </div>
            <h2 className="text-3xl font-display font-bold text-white">{isLogin ? 'Welcome Back' : 'Begin Journey'}</h2>
            <p className="text-gray-400 text-sm mt-2">
              {isLogin ? 'Enter your credentials to access the command center.' : 'Create an account to start your exploration.'}
            </p>
          </motion.div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/30 text-red-300 p-4 rounded-xl mb-6 text-sm flex items-start space-x-3"
            >
              <span className="mt-0.5">⚠️</span>
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {!isLogin && regStatus === 'closed' ? (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-brand-900/50 p-6 rounded-2xl border border-brand-500/30 text-center mb-6 overflow-hidden"
                >
                  <ShieldCheck className="w-12 h-12 text-brand-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Registration Closed</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    New explorer intake is currently suspended by the Command Center.
                  </p>
                  {regLink && (
                    <a href={regLink} target="_blank" rel="noopener noreferrer" className="inline-block bg-brand-600 hover:bg-brand-500 text-white font-bold tracking-widest uppercase text-xs py-3 px-6 rounded-xl transition-all">
                      Alternative Gateway
                    </a>
                  )}
                </motion.div>
              ) : !isLogin && regStatus === 'open' ? (
                <motion.div
                  key="register-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5 overflow-hidden"
                >
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Full Name</label>
                      <input
                        type="text" required
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-400 focus:bg-white/10 transition-all"
                        value={name} onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Birth Date</label>
                      <input
                        type="date" required
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-400 focus:bg-white/10 transition-all [color-scheme:dark]"
                        value={dob} onChange={(e) => setDob(e.target.value)}
                      />
                    </div>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Domicile</label>
                      <select
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-400 focus:bg-white/10 transition-all appearance-none"
                        value={domicile} onChange={(e) => setDomicile(e.target.value)}
                      >
                        <option value="Jakarta" className="bg-brand-900">Jakarta</option>
                        <option value="Bandung" className="bg-brand-900">Bandung</option>
                        <option value="Surabaya" className="bg-brand-900">Surabaya</option>
                        <option value="Other" className="bg-brand-900">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Generation</label>
                      <select
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-400 focus:bg-white/10 transition-all appearance-none"
                        value={generation} onChange={(e) => setGeneration(e.target.value)}
                      >
                        <option value="Gen 1" className="bg-brand-900">Gen 1</option>
                        <option value="Gen 2" className="bg-brand-900">Gen 2</option>
                      </select>
                    </div>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Profession / Status</label>
                    <select
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-400 focus:bg-white/10 transition-all appearance-none"
                      value={profession} onChange={(e) => setProfession(e.target.value)}
                    >
                      <option value="Pelajar SD" className="bg-brand-900">Pelajar SD</option>
                      <option value="Pelajar SMP" className="bg-brand-900">Pelajar SMP</option>
                      <option value="Pelajar SMA" className="bg-brand-900">Pelajar SMA</option>
                      <option value="Mahasiswa" className="bg-brand-900">Mahasiswa</option>
                      <option value="Guru/Dosen" className="bg-brand-900">Guru/Dosen</option>
                      <option value="Pekerja" className="bg-brand-900">Pekerja</option>
                      <option value="Lainnya" className="bg-brand-900">Lainnya</option>
                    </select>
                    <p className="text-[10px] text-gray-500 mt-2">Bisa diganti nanti di Profile Settings, tapi dibatasi 1x per 30 hari.</p>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Reason</label>
                    <textarea
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-400 focus:bg-white/10 transition-all h-24 resize-none"
                      value={reason} onChange={(e) => setReason(e.target.value)}
                      placeholder="Why do you want to explore the stars?"
                    />
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            {(!isLogin && regStatus === 'closed') ? null : (
              <>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: isLogin ? 0.2 : 0.4 }}>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Email Address</label>
              <input
                type="email" required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-400 focus:bg-white/10 transition-all"
                value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="explorer@eas.com"
              />
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: isLogin ? 0.3 : 0.5 }}>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Password</label>
              <input
                type="password" required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-400 focus:bg-white/10 transition-all"
                value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: isLogin ? 0.4 : 0.6 }}
              className="pt-4 space-y-4"
            >
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-500 hover:bg-brand-400 text-white font-bold tracking-widest uppercase text-sm py-4 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-brand-500/25 group"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>{isLogin ? 'Initialize Session' : 'Create Account'}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </motion.div>
              </>
            )}
          </form>

          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            className="mt-10 text-center"
          >
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-sm font-medium text-gray-400 hover:text-brand-300 transition-colors"
            >
              {isLogin ? "Don't have an account? Create one" : "Already registered? Sign in"}
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

