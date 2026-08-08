import React, { useState, useRef } from 'react';
import { 
  Play, Download, Loader2, Volume2, Globe, Sparkles, 
  AlignLeft, Info, AlertCircle 
} from 'lucide-react';
import { base64ToWavBlob } from './utils/wav';

const VOICES = [
  { id: 'Aoede', name: 'Aoede', gender: 'Female', description: 'Calm, clear, and professional' },
  { id: 'Charon', name: 'Charon', gender: 'Male', description: 'Deep, authoritative, and resonant' },
  { id: 'Fenrir', name: 'Fenrir', gender: 'Male', description: 'Strong, dynamic, and engaging' },
  { id: 'Kore', name: 'Kore', gender: 'Female', description: 'Bright, energetic, and expressive' },
  { id: 'Puck', name: 'Puck', gender: 'Male', description: 'Warm, conversational, and friendly' },
  { id: 'Zephyr', name: 'Zephyr', gender: 'Female', description: 'Soft, natural, and soothing' },
];

const LANGUAGES = [
  'English', 'Nepali', 'Hindi', 'Spanish', 'French', 
  'German', 'Japanese', 'Korean', 'Chinese', 'Arabic'
];

const DEFAULT_TEXT = `Hello Everyone! सबैलाई स्वागत छ हाम्रो यस युट्युब च्यानलमा। आज मैले तपाईँहरूको लागि एकदमै महत्वपूर्ण जानकारी लिएर आएको छु।

The AI voice generation model can seamlessly switch between English, Nepali, and Hindi in a single generation. Try it out!`;

export default function App() {
  const [text, setText] = useState(DEFAULT_TEXT);
  const [voice, setVoice] = useState(VOICES[0].id);
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!text.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setAudioUrl(null);

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate audio');
      }

      if (data.audio) {
        const wavBlob = base64ToWavBlob(data.audio, 24000);
        const url = URL.createObjectURL(wavBlob);
        setAudioUrl(url);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `voice-${voice}-${Date.now()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-indigo-500/30 pb-12">
      {/* Top Navigation */}
      <header className="border-b border-zinc-800 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">StudioVoices</span>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-zinc-400">
            <span className="text-zinc-100 cursor-pointer">Speech Synthesis</span>
            <span className="hover:text-zinc-100 transition-colors cursor-pointer">Voice Library</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column - Settings (lg: 4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-5 space-y-6 shadow-xl">
            
            {/* Voice Selector */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
                <Volume2 className="w-4 h-4 text-indigo-400" />
                Select Voice
              </label>
              <div className="grid grid-cols-1 gap-2">
                {VOICES.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVoice(v.id)}
                    className={`flex flex-col text-left p-3.5 rounded-xl border transition-all duration-200 ${
                      voice === v.id 
                        ? 'border-indigo-500 bg-indigo-500/10' 
                        : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-medium text-sm text-zinc-100">{v.name}</span>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-full">
                        {v.gender}
                      </span>
                    </div>
                    <span className="text-xs text-zinc-400">{v.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Language Selector */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
                <Globe className="w-4 h-4 text-indigo-400" />
                Language Hint
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none cursor-pointer"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
              <p className="text-xs text-zinc-500 flex items-start gap-1.5 mt-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                The AI automatically detects languages (including Nepali & Hindi), but setting this helps guide the pronunciation.
              </p>
            </div>

          </div>
        </div>

        {/* Right Column - Editor & Player (lg: 8 cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
          
          <div className="flex-1 bg-[#18181b] border border-zinc-800 rounded-2xl flex flex-col shadow-xl overflow-hidden min-h-[450px]">
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/30">
              <div className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
                <AlignLeft className="w-4 h-4 text-zinc-400" />
                Text Editor
              </div>
              <div className="text-xs font-medium text-zinc-500 bg-zinc-800/50 px-2.5 py-1 rounded-full">
                {text.length} characters
              </div>
            </div>
            
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter your text here..."
              className="flex-1 w-full bg-transparent p-6 text-zinc-200 text-[15px] leading-relaxed resize-none focus:outline-none placeholder:text-zinc-600"
              spellCheck={false}
            />

            <div className="p-5 border-t border-zinc-800 bg-zinc-900/30 flex items-center justify-between">
              <button
                onClick={handleGenerate}
                disabled={isLoading || !text.trim()}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20 w-full sm:w-auto justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating Speech...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Speech
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3 text-red-400 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-sm font-medium">{error}</div>
            </div>
          )}

          {/* Audio Player Result */}
          {audioUrl && (
            <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex-1 w-full space-y-3">
                <div className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Audio Ready
                </div>
                <audio 
                  controls 
                  src={audioUrl} 
                  className="w-full h-10 rounded-lg outline-none custom-audio-player" 
                />
              </div>
              <button
                onClick={handleDownload}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-6 py-3 rounded-xl font-medium text-sm transition-all border border-zinc-700 shadow-sm"
              >
                <Download className="w-4 h-4" />
                Download Audio
              </button>
            </div>
          )}
          
        </div>
      </main>
    </div>
  );
}

