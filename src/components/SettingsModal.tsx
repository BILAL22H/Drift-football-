import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { X, Volume2, VolumeX, Globe, Trash2, Shield, Info, Smartphone } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { language, setLanguage, soundEnabled, setSoundEnabled, resetProgress, t, userStats } = useGame();
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  if (!isOpen) return null;

  const handleReset = () => {
    resetProgress();
    setShowConfirmReset(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#111828] to-[#0a0f19] border border-white/10 rounded-3xl p-6 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-5">
          <h3 className="font-teko text-2xl sm:text-3xl font-black text-white uppercase tracking-wider">
            {t.settings.title}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Language Selection */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-2.5">
              <Globe className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="text-sm font-bold text-white block">{t.settings.language}</span>
                <span className="text-xs text-slate-400">English / العربية (RTL)</span>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded-lg text-xs font-bold font-rajdhani transition ${
                  language === 'en' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('ar')}
                className={`px-3 py-1 rounded-lg text-xs font-bold font-rajdhani transition ${
                  language === 'ar' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                العربية
              </button>
            </div>
          </div>

          {/* Sound Effects Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-2.5">
              {soundEnabled ? (
                <Volume2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <VolumeX className="w-5 h-5 text-slate-500" />
              )}
              <div>
                <span className="text-sm font-bold text-white block">{t.settings.sound}</span>
                <span className="text-xs text-slate-400">Audio feedback & card effects</span>
              </div>
            </div>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                soundEnabled ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                  soundEnabled ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* About Game Info */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 text-xs text-slate-300">
            <div className="flex items-center gap-2 text-amber-300 font-bold mb-1">
              <Info className="w-4 h-4" />
              <span>{t.settings.about}</span>
            </div>
            <p className="leading-relaxed text-slate-400 mb-2">
              {t.settings.aboutText}
            </p>
            <div className="flex flex-wrap gap-1.5 text-[10px] text-slate-400 font-mono">
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">Premier League 🏴󠁧󠁢󠁥󠁮󠁧󠁿</span>
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">La Liga 🇪🇸</span>
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">Bundesliga 🇩🇪</span>
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">Serie A 🇮🇹</span>
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">Ligue 1 🇫🇷</span>
            </div>
          </div>

          {/* Reset Progress Section */}
          <div className="pt-2 border-t border-white/10">
            {!showConfirmReset ? (
              <button
                onClick={() => setShowConfirmReset(true)}
                className="w-full py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-rajdhani font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <Trash2 className="w-4 h-4" />
                <span>{t.settings.resetData}</span>
              </button>
            ) : (
              <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/50 text-center space-y-2">
                <p className="text-xs text-rose-200">
                  {t.settings.confirmReset}
                </p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={handleReset}
                    className="px-4 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs"
                  >
                    {language === 'ar' ? 'نعم، إعادة الضبط' : 'Yes, Reset Everything'}
                  </button>
                  <button
                    onClick={() => setShowConfirmReset(false)}
                    className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-300 font-bold text-xs"
                  >
                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full mt-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-rajdhani font-bold text-sm transition"
        >
          {t.settings.close}
        </button>

      </div>
    </div>
  );
};
