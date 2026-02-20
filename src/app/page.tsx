'use client';

import { useState } from 'react';
import { Send, Settings, CheckCircle, AlertCircle, Loader2, Image as ImageIcon, Video, FileText, BookOpen, X } from 'lucide-react';

export default function Home() {
  const [postText, setPostText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isArticle, setIsArticle] = useState(false);
  const [mediaPath, setMediaPath] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'document' | null>(null);
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
    if (!postText.trim()) return;
    setLoading(true);
    setStatus({ type: null, message: 'Posting to LinkedIn...' });

    try {
      const res = await fetch('/api/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: postText,
          mediaPath: mediaPath || null,
          mediaType: mediaType,
          isArticle: isArticle
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus({ type: 'success', message: 'Successfully posted to LinkedIn!' });
        setPostText('');
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
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Add Media (Local Path)</label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={mediaPath}
                    onChange={(e) => setMediaPath(e.target.value)}
                    placeholder="C:\path\to\your\file.jpg"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-3 pr-10 text-sm text-slate-300 placeholder:text-slate-700 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                  {mediaPath && (
                    <button
                      onClick={() => { setMediaPath(''); setMediaType(null); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex gap-4 px-1">
                <button
                  onClick={() => setMediaType('image')}
                  className={`flex items-center gap-2 text-xs transition-colors ${mediaType === 'image' ? 'text-orange-500' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <ImageIcon size={14} /> Image
                </button>
                <button
                  onClick={() => setMediaType('video')}
                  className={`flex items-center gap-2 text-xs transition-colors ${mediaType === 'video' ? 'text-orange-500' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <Video size={14} /> Video
                </button>
                <button
                  onClick={() => setMediaType('document')}
                  className={`flex items-center gap-2 text-xs transition-colors ${mediaType === 'document' ? 'text-orange-500' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <FileText size={14} /> Doc/PDF
                </button>
              </div>
            </div>
          )}

          <button
            onClick={handlePost}
            disabled={loading || (!postText.trim() && !mediaPath)}
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
