'use client';

import { useState } from 'react';
import { Send, Settings, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function Home() {
  const [postText, setPostText] = useState('');
  const [loading, setLoading] = useState(false);
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
        body: JSON.stringify({ text: postText }),
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
            <label className="text-sm font-medium text-slate-300">New Post Content</label>
          </div>

          <textarea
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            placeholder="What's on your mind?..."
            className="w-full h-48 bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
          />

          <button
            onClick={handlePost}
            disabled={loading || !postText.trim()}
            className="w-full h-12 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-900/20"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Send size={20} />
            )}
            {loading ? 'Publishing...' : 'Post Now'}
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
