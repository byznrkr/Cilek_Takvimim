import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Sprout, Tractor } from 'lucide-react';
import type { AppState, CultivationType } from '../App';

interface SetupProps {
  onComplete: (state: AppState) => void;
}

export function Setup({ onComplete }: SetupProps) {
  const [location, setLocation] = useState('');
  const [type, setType] = useState<CultivationType | null>(null);
  const [potDiameter, setPotDiameter] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (location && type) {
      if (type === 'pot' && !potDiameter) return;
      onComplete({ location, type, potDiameter });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#FFFFFF] dark:bg-[#1E1E1E] p-8 rounded-3xl shadow-xl max-w-md w-full border border-stone-100 dark:border-[#333]"
      >
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🍓</div>
          <h1 className="text-2xl font-bold text-[#2D3436] dark:text-[#E0E0E0]">Akıllı Çilek Asistanı</h1>
          <p className="text-stone-500 dark:text-stone-400 mt-2">Ziraat Mühendisi tavsiyeleri için bilgilerinizi girin.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#2D3436] dark:text-[#E0E0E0] mb-2">Konum</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
              <input 
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Örn: Niğde, Antalya..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 dark:border-[#333] bg-transparent focus:ring-2 focus:ring-[#D63031] dark:focus:ring-[#FF4D4D] outline-none transition-all dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2D3436] dark:text-[#E0E0E0] mb-2">Yetiştirme Tipi</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setType('pot')}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                  type === 'pot' 
                    ? 'border-[#D63031] bg-[#D63031]/10 dark:bg-[#FF4D4D]/10 text-[#D63031] dark:text-[#FF4D4D]' 
                    : 'border-stone-200 dark:border-[#333] hover:border-[#D63031]/30 dark:hover:border-[#FF4D4D]/30 text-stone-600 dark:text-stone-400'
                }`}
              >
                <Sprout className="w-8 h-8" />
                <span className="font-medium">Saksı</span>
              </button>
              <button
                type="button"
                onClick={() => { setType('field'); setPotDiameter(null); }}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                  type === 'field' 
                    ? 'border-[#D63031] bg-[#D63031]/10 dark:bg-[#FF4D4D]/10 text-[#D63031] dark:text-[#FF4D4D]' 
                    : 'border-stone-200 dark:border-[#333] hover:border-[#D63031]/30 dark:hover:border-[#FF4D4D]/30 text-stone-600 dark:text-stone-400'
                }`}
              >
                <Tractor className="w-8 h-8" />
                <span className="font-medium">Tarla</span>
              </button>
            </div>
          </div>

          {type === 'pot' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
              <label className="block text-sm font-medium text-[#2D3436] dark:text-[#E0E0E0] mb-2 mt-4">Saksı Çapı (cm)</label>
              <input
                type="number"
                min="10"
                max="100"
                value={potDiameter || ''}
                onChange={(e) => setPotDiameter(Number(e.target.value))}
                placeholder="Örn: 20"
                className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-[#333] bg-transparent focus:ring-2 focus:ring-[#D63031] dark:focus:ring-[#FF4D4D] outline-none transition-all dark:text-white"
              />
            </motion.div>
          )}

          <button
            type="submit"
            disabled={!location || !type || (type === 'pot' && !potDiameter)}
            className="w-full bg-[#D63031] dark:bg-[#FF4D4D] hover:opacity-90 disabled:bg-stone-300 dark:disabled:bg-stone-700 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-opacity shadow-md"
          >
            Takvimimi Oluştur
          </button>
        </form>
      </motion.div>
    </div>
  );
}
