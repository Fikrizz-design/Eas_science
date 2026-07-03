import { useState, useEffect, useRef } from 'react';
import { collection, query, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../db/firebase';
import { uploadLibraryFile, mirror } from '../db/supabase';
import { useStore } from '../store/useStore';
import { Library as LibraryIcon, Upload, CheckCircle, Clock, Link as LinkIcon, FileAudio, FileImage, FileText, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export function Library() {
  const { userData, user } = useStore();
  const [items, setItems] = useState<any[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Upload form
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [source, setSource] = useState('');
  const [category, setCategory] = useState('astrophysics'); 
  const [type, setType] = useState('journal'); // journal, audio, image
  const [file, setFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [cameraSettings, setCameraSettings] = useState('');
  
  const [filterType, setFilterType] = useState('all'); // all, journal, audio, image

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = query(collection(db, 'library'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(data);
    }, (error) => {
      console.warn("Firestore error in Library:", error);
    });
    return () => unsub();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };
  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPdfFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (type === 'journal' && (!file || !pdfFile)) {
      alert('Photo and PDF are required for Journal.');
      return;
    }
    if (type === 'image' && !file) {
      alert('Image is required.');
      return;
    }
    if (type === 'audio' && !file) {
      alert('Audio file is required.');
      return;
    }

    setUploading(true);
    try {
      const fileUrl = file ? await uploadLibraryFile(file, type) : null;
      const pdfUrl = pdfFile ? await uploadLibraryFile(pdfFile, 'journal-pdf') : null;

      const libraryDoc = {
        title,
        abstract: type === 'audio' ? '' : abstract,
        cameraSettings: type === 'image' ? cameraSettings : null,
        category,
        type,
        fileName: file?.name || '',
        fileUrl,
        pdfFileName: type === 'journal' ? (pdfFile?.name || '') : null,
        pdfUrl: type === 'journal' ? pdfUrl : null,
        authorId: user?.uid,
        authorName: userData?.name,
        status: 'pending',
      };

      const ref = await addDoc(collection(db, 'library'), {
        ...libraryDoc,
        createdAt: serverTimestamp(),
      });
      mirror('library_items', ref.id, { ...libraryDoc, created_at: new Date().toISOString() });

      setShowUpload(false);
      resetForm();
    } catch (err: any) {
      console.error(err);
      alert('Failed to upload. ' + (err.message || 'Permissions might be denied.'));
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setAbstract('');
    setSource('');
    setFile(null);
    setPdfFile(null);
    setCameraSettings('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (pdfInputRef.current) pdfInputRef.current.value = '';
  };

  const getIconForType = (itemType: string) => {
    switch (itemType) {
      case 'audio': return <FileAudio className="w-4 h-4 text-purple-400" />;
      case 'image': return <FileImage className="w-4 h-4 text-pink-400" />;
      default: return <FileText className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold">Research Library</h1>
          <p className="text-gray-400">Professional database of journals, articles, and media.</p>
        </div>
        <button 
          onClick={() => setShowUpload(!showUpload)}
          className="bg-brand-600 hover:bg-brand-400 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Contribution</span>
        </button>
      </header>

      {showUpload && (
        <motion.form 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          onSubmit={handleUpload} 
          className="bg-brand-800/50 p-6 rounded-2xl border border-white/10 space-y-4 overflow-hidden"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
              <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 focus:ring-1 focus:ring-brand-400 outline-none transition-shadow" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 focus:ring-1 focus:ring-brand-400 outline-none">
                <option value="astrophysics">Astrophysics</option>
                <option value="cosmology">Cosmology</option>
                <option value="planetary">Planetary Science</option>
                <option value="observational">Observational Astronomy</option>
                <option value="spacecraft">Spacecraft & Missions</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Format Type</label>
            <div className="flex space-x-4">
              {['journal', 'image', 'audio'].map((t) => (
                <label key={t} className="flex items-center space-x-2 cursor-pointer">
                  <input type="radio" name="type" value={t} checked={type === t} onChange={e => { setType(e.target.value); setFileName(''); setPdfFileName(''); }} className="text-brand-500 bg-black/20 border-white/10" />
                  <span className="capitalize text-gray-300">{t}</span>
                </label>
              ))}
            </div>
          </div>

          {type !== 'audio' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Abstract / Description</label>
              <textarea required value={abstract} onChange={e => setAbstract(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 h-20 focus:ring-1 focus:ring-brand-400 outline-none resize-none" />
            </div>
          )}

          {type === 'image' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Camera Settings (Optional)</label>
              <input type="text" value={cameraSettings} onChange={e => setCameraSettings(e.target.value)} placeholder="e.g. ISO 800, f/2.8, 30s" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 focus:ring-1 focus:ring-brand-400 outline-none" />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {type === 'journal' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Upload PDF</label>
                <input 
                  type="file" 
                  ref={pdfInputRef}
                  accept="application/pdf"
                  onChange={handlePdfChange}
                  required
                  className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-600/20 file:text-brand-400 hover:file:bg-brand-600/30 transition-colors" 
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                {type === 'audio' ? 'Upload Audio File' : type === 'journal' ? 'Upload Cover Photo' : 'Upload Image'}
              </label>
              <input 
                type="file" 
                ref={fileInputRef}
                accept={type === 'audio' ? 'audio/*' : 'image/*'}
                onChange={handleFileChange}
                required
                className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-600/20 file:text-brand-400 hover:file:bg-brand-600/30 transition-colors" 
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={uploading} className="bg-brand-400 hover:bg-brand-500 disabled:opacity-50 text-gray-900 px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2">
              {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{uploading ? 'Uploading...' : 'Submit for Review'}</span>
            </button>
          </div>
        </motion.form>
      )}

      {/* Filter Options */}
      <div className="flex space-x-2 pb-2 overflow-x-auto custom-scrollbar">
        {['all', 'journal', 'image', 'audio'].map((f) => (
          <button
            key={f}
            onClick={() => setFilterType(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${filterType === f ? 'bg-brand-500 text-white' : 'bg-brand-900/50 text-gray-400 hover:text-white border border-white/10'}`}
          >
            {f === 'all' ? 'All Items' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.filter(item => filterType === 'all' || item.type === filterType).map((item) => (
          <div key={item.id} className="bg-brand-800/50 p-5 rounded-2xl border border-white/10 flex flex-col hover:border-white/20 transition-colors">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center space-x-2">
                {getIconForType(item.type)}
                <span className="px-2 py-0.5 bg-brand-900/50 rounded-md text-[10px] font-mono uppercase tracking-wider text-brand-300">{item.category}</span>
              </div>
              {item.status === 'verified' ? (
                <span title="Verified"><CheckCircle className="w-4 h-4 text-green-400" /></span>
              ) : (
                <span title="Pending Review"><Clock className="w-4 h-4 text-yellow-400" /></span>
              )}
            </div>
            <h3 className="font-bold text-lg mb-2 leading-tight">{item.title}</h3>
            {item.abstract && <p className="text-sm text-gray-400 mb-4 flex-1 line-clamp-3">{item.abstract}</p>}
            {item.cameraSettings && <p className="text-xs text-brand-300 font-mono mb-4 bg-brand-900/50 p-2 rounded">📸 {item.cameraSettings}</p>}
            
            {(item.pdfFileName || item.fileName) && (
              <div className="flex flex-col space-y-2 mb-4 bg-black/20 p-3 rounded-lg text-xs">
                {item.pdfFileName && (
                  <a href={item.pdfUrl} target="_blank" rel="noreferrer" className="flex items-center space-x-2 text-brand-400 hover:text-brand-300 transition-colors">
                    <FileText className="w-3 h-3" />
                    <span className="truncate">{item.pdfFileName}</span>
                  </a>
                )}
                {item.fileName && (
                  <a href={item.fileUrl} target="_blank" rel="noreferrer" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                    {item.type === 'audio' ? <FileAudio className="w-3 h-3" /> : <FileImage className="w-3 h-3" />}
                    <span className="truncate">{item.fileName}</span>
                  </a>
                )}
              </div>
            )}

            <div className="flex justify-between items-center text-xs text-gray-500 pt-3 border-t border-white/5">
              <span>Submitted by <strong className="text-gray-300">{item.authorName}</strong></span>
              <span className="capitalize">{item.type}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
