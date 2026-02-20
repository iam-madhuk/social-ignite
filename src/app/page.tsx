'use client';

import { useState, useRef } from 'react';
import { Send, Settings, CheckCircle, AlertCircle, Loader2, Image as ImageIcon, Video, FileText, BookOpen, X } from 'lucide-react';

export default function Home() {
  const [postText, setPostText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isArticle, setIsArticle] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });

  const handleSetupSession = async () => {
    setStatus({ type: null, message: 'Opening login window...' });
    try {
      const res = await fetch('/api/setup', { method: 'POST' });
      const data = await res.json();
      setStatus({ type: 'success', message: data.message });
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to open login window.' });
    }
  };

  const handleStartScheduler = async () => {
    setStatus({ type: null, message: 'Starting background scheduler...' });
    try {
      const res = await fetch('/api/schedule/start', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setStatus({ type: 'success', message: 'Daily 3 PM scheduler started!' });
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to start scheduler.' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'An error occurred while starting scheduler.' });
    }
  };

  const handlePost = async () => {
    if (!postText.trim() && !selectedFile) return;
    setLoading(true);
    setStatus({ type: null, message: 'Igniting your post...' });

    const formData = new FormData();
    formData.append('text', postText);
    formData.append('isArticle', String(isArticle));
    if (selectedFile) {
      formData.append('file', selectedFile);
    }

    try {
      const res = await fetch('/api/post', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setStatus({ type: 'success', message: 'Successfully ignited your post!' });
        setPostText('');
        setSelectedFile(null);
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to post.' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'An error occurred while posting.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
            Social-Ignite
          </h1>
          <p className="text-slate-400">Power your professional presence with AI automation.</p>
        </header>

        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={handleSetupSession}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm text-slate-300 transition-colors"
          >
            <Settings size={16} />
            Setup Session
          </button>
          <button
            onClick={handleStartScheduler}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-900/30 hover:bg-indigo-900/50 border border-indigo-800 rounded-lg text-sm text-indigo-400 transition-colors"
          >
            <CheckCircle size={16} />
            Auto-Schedule (3 PM Daily)
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-slate-300">
              {isArticle ? 'Article Body' : 'Post Content'}
            </label>
            <button
              onClick={() => setIsArticle(!isArticle)}
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs transition-colors ${isArticle ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-300'
                }`}
            >
              <BookOpen size={14} />
              {isArticle ? 'Article Mode' : 'Switch to Article'}
            </button>
          </div>

          <textarea
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            placeholder={isArticle ? "Write your article title and content here..." : "What's on your mind?..."}
            className="w-full h-48 bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all resize-none"
          />

          {!isArticle && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">ATTACH MEDIA</label>

              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setSelectedFile(file);
                }}
                className="hidden"
                accept="image/*,video/*,.pdf,.doc,.docx"
              />

              <div className="flex flex-col gap-3">
                {selectedFile ? (
                  <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-lg p-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2 bg-orange-950/20 rounded-lg text-orange-500">
                        {selectedFile.type.includes('image') ? <ImageIcon size={20} /> :
                          selectedFile.type.includes('video') ? <Video size={20} /> : <FileText size={20} />}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-medium text-slate-200 truncate">{selectedFile.name}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-tighter">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type.split('/')[1] || 'FILE'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="p-1.5 text-slate-600 hover:text-slate-400 hover:bg-slate-800 rounded-md transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-950 border border-slate-800 border-dashed rounded-xl text-slate-500 hover:text-orange-500 hover:border-orange-500/50 hover:bg-orange-950/5 transition-all group"
                    >
                      <ImageIcon size={24} className="group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-medium tracking-wide">IMAGE</span>
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-950 border border-slate-800 border-dashed rounded-xl text-slate-500 hover:text-orange-500 hover:border-orange-500/50 hover:bg-orange-950/5 transition-all group"
                    >
                      <Video size={24} className="group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-medium tracking-wide">VIDEO</span>
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-950 border border-slate-800 border-dashed rounded-xl text-slate-500 hover:text-orange-500 hover:border-orange-500/50 hover:bg-orange-950/5 transition-all group"
                    >
                      <FileText size={24} className="group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-medium tracking-wide">DOC / PDF</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          <button
            onClick={handlePost}
            disabled={loading || (!postText.trim() && !selectedFile)}
            className="w-full h-12 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-orange-950/20 mt-4"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Send size={20} />
            )}
            {loading ? 'Igniting...' : isArticle ? 'Publish Article' : 'Burn Post'}
          </button>
        </div>

        {status.message && (
          <div
            className={`flex items-center gap-3 p-4 rounded-xl border ${status.type === 'success'
              ? 'bg-emerald-950/30 border-emerald-900 text-emerald-400'
              : status.type === 'error'
                ? 'bg-rose-950/30 border-rose-900 text-rose-400'
                : 'bg-slate-800/50 border-slate-700 text-slate-300'
              }`}
          >
            {status.type === 'success' ? (
              <CheckCircle size={20} />
            ) : status.type === 'error' ? (
              <AlertCircle size={20} />
            ) : (
              <Loader2 className="animate-spin" size={20} />
            )}
            <p className="text-sm">{status.message}</p>
          </div>
        )}
      </div>

      <footer className="mt-8 text-slate-600 text-xs">
        <p>© 2026 Social-Ignite. All rights reserved.</p>
      </footer>
    </main>
  );
}
