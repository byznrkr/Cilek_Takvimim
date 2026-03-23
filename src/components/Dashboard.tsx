import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Sprout, Tractor, MessageCircle, X, Send, Loader2, Settings, Moon, Sun, Monitor, Calendar, CalendarDays, Mail, AlertCircle, Camera, Upload } from 'lucide-react';
import type { AppState, ThemeType } from '../App';
import { generateCalendar, chatWithAdvisor } from '../services/gemini';
import ReactMarkdown from 'react-markdown';

interface DashboardProps {
  appState: AppState;
  onReset: () => void;
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

interface CalendarDay {
  date: string;
  dayOfWeek: string;
  taskName: string;
  detail: string;
  amount?: string;
}

interface CalendarData {
  calendar: CalendarDay[];
  secretOfTheDay: string;
}

export function Dashboard({ appState, onReset, theme, setTheme }: DashboardProps) {
  const [data, setData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const result = await generateCalendar(appState);
        setData(result);
      } catch (err: any) {
        console.error(err);
        const errorMessage = err?.message || String(err);
        if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
          setError('Yapay zeka asistanı günlük limitine ulaştı (Kota aşıldı). Lütfen daha sonra tekrar deneyin.');
        } else {
          setError('Takvim oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
        }
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [appState]);

  // 22 Mart 2026 is Sunday. If week starts on Monday, Sunday is index 6.
  const emptyCells = Array.from({ length: 6 }).map((_, i) => <div key={`empty-${i}`} className="aspect-square" />);

  const getEmoji = (taskName: string) => {
    const match = taskName.match(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu);
    return match ? match[0] : '🌱';
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#F9FBF9] dark:bg-[#121212] shadow-2xl relative overflow-hidden flex flex-col transition-colors duration-300 pt-20">
      {/* Header */}
      <header 
        className="fixed top-0 left-0 right-0 z-20 p-4 shadow-md flex items-center justify-between bg-gradient-to-r from-[#FF4D4D] to-rose-500"
      >
        <button onClick={() => setViewMode(v => v === 'month' ? 'week' : 'month')} className="text-white flex items-center gap-1.5 hover:bg-white/20 px-2 py-1.5 rounded-lg transition-colors z-10">
          {viewMode === 'month' ? <CalendarDays className="w-5 h-5 text-[#4CAF50]" /> : <Calendar className="w-5 h-5 text-[#4CAF50]" />}
          <span className="text-sm font-medium">{viewMode === 'month' ? 'Ay' : 'Hafta'}</span>
        </button>

        <div className="flex flex-col items-center absolute left-1/2 -translate-x-1/2 w-full max-w-[200px]">
          <h1 className="text-white font-bold text-base">Çilek Takvimim</h1>
          <div className="flex items-center justify-center gap-1 text-white text-[10px] font-medium bg-black/10 px-2 py-0.5 rounded-full mt-0.5 w-max">
            <MapPin className="w-3 h-3 text-[#4CAF50]" />
            <span className="truncate max-w-[80px]">{appState.location}</span>
            <span className="opacity-50">|</span>
            <span>{appState.type === 'pot' ? '🌱 Saksı' : '🚜 Tarla'}</span>
          </div>
        </div>

        <button onClick={() => setIsSettingsOpen(true)} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors z-10">
          <Settings className="w-5 h-5 text-[#4CAF50]" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 pb-40">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-stone-400 dark:text-stone-500">
            <Loader2 className="w-10 h-10 animate-spin text-[#D63031] dark:text-[#FF4D4D] mb-4" />
            <p className="font-medium animate-pulse">Ziraat Mühendisi takvimi hazırlıyor...</p>
            <p className="text-sm mt-2 text-center px-8">Sizin için en uygun sulama ve bakım programı oluşturuluyor.</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-4 rounded-2xl text-center">
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="mt-4 bg-red-100 dark:bg-red-500/20 px-4 py-2 rounded-lg font-medium">Tekrar Dene</button>
          </div>
        ) : data ? (
          <div className="space-y-4">
            {viewMode === 'month' ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#FFFFFF] dark:bg-[#1E1E1E] p-4 rounded-3xl shadow-sm border border-stone-100 dark:border-[#333]">
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(d => (
                    <div key={d} className="text-center text-[10px] font-bold text-stone-400 uppercase py-1">{d}</div>
                  ))}
                  {emptyCells}
                  {data.calendar.map((day, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setSelectedDay(day)}
                      className="aspect-square bg-[#F9FBF9] dark:bg-[#121212] rounded-xl border border-stone-100 dark:border-[#333] flex flex-col items-center justify-center p-1 hover:border-[#D63031] dark:hover:border-[#FF4D4D] transition-colors relative group"
                    >
                      <span className="text-xs font-bold text-[#2D3436] dark:text-[#E0E0E0] group-hover:text-[#D63031] dark:group-hover:text-[#FF4D4D]">{day.date.split(' ')[0]}</span>
                      <div className="text-sm mt-1">
                        {getEmoji(day.taskName)}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {data.calendar.slice(0, 7).map((day, idx) => (
                  <motion.button 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={idx}
                    onClick={() => setSelectedDay(day)}
                    className="w-full text-left bg-[#FFFFFF] dark:bg-[#1E1E1E] p-4 rounded-2xl shadow-sm border border-stone-100 dark:border-[#333] flex items-center gap-4 hover:border-[#D63031] dark:hover:border-[#FF4D4D] transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center min-w-[3rem] border-r border-stone-100 dark:border-[#333] pr-4">
                      <span className="text-[10px] font-bold text-stone-400 uppercase">{day.dayOfWeek.slice(0,3)}</span>
                      <span className="text-xl font-black text-[#2D3436] dark:text-[#E0E0E0]">{day.date.split(' ')[0]}</span>
                    </div>
                    <div className="flex-1 flex items-center gap-3">
                      <div className="text-2xl">{getEmoji(day.taskName)}</div>
                      <div className="font-medium text-[#2D3436] dark:text-[#E0E0E0]">{day.taskName.substring(2)}</div>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </main>

      {/* Secret of the Day (Fixed Bottom) */}
      <AnimatePresence>
        {data && !loading && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-[#FF4D4D] to-rose-500 text-white p-5 shadow-[0_-10px_40px_rgba(214,48,49,0.2)] rounded-t-[2rem] z-20"
          >
            <div className="flex items-start gap-3 max-w-md mx-auto relative">
              <div className="text-3xl">🍓</div>
              <div>
                <h3 className="font-bold text-white mb-1">Bugünün Çilek Sırrı</h3>
                <p className="text-sm text-white/90 leading-relaxed pr-12">{data.secretOfTheDay}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat FAB */}
      <button 
        onClick={() => setIsChatOpen(true)}
        className="absolute bottom-28 right-6 w-14 h-14 bg-[#D63031] dark:bg-[#FF4D4D] hover:opacity-90 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 z-30"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Day Detail Modal */}
      <AnimatePresence>
        {selectedDay && (
          <div className="absolute inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              className="bg-[#FFFFFF] dark:bg-[#1E1E1E] rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-md max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-black text-[#2D3436] dark:text-[#E0E0E0]">{selectedDay.date}</h2>
                  <p className="text-stone-500 dark:text-stone-400 font-medium">{selectedDay.dayOfWeek}</p>
                </div>
                <button onClick={() => setSelectedDay(null)} className="p-2 bg-[#F9FBF9] dark:bg-[#121212] hover:bg-stone-200 dark:hover:bg-[#333] rounded-full transition-colors">
                  <X className="w-5 h-5 text-stone-600 dark:text-[#E0E0E0]" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-4xl">{getEmoji(selectedDay.taskName)}</div>
                  <div>
                    <div className="text-xs font-bold text-[#D63031] dark:text-[#FF4D4D] uppercase tracking-wider">Görev</div>
                    <div className="text-lg font-bold text-[#2D3436] dark:text-[#E0E0E0]">{selectedDay.taskName.substring(2)}</div>
                  </div>
                </div>
                
                <div className="bg-[#F9FBF9] dark:bg-[#121212] p-4 rounded-2xl border border-stone-100 dark:border-[#333]">
                  <div className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase mb-1 tracking-wider">Detay</div>
                  <div className="text-sm font-medium text-[#2D3436] dark:text-[#E0E0E0] leading-relaxed">{selectedDay.detail}</div>
                </div>

                {selectedDay.amount && (
                  <div className="bg-[#F9FBF9] dark:bg-[#121212] p-4 rounded-2xl border border-stone-100 dark:border-[#333]">
                    <div className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase mb-1 tracking-wider">Miktar</div>
                    <div className="text-sm font-medium text-[#2D3436] dark:text-[#E0E0E0]">{selectedDay.amount}</div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#FFFFFF] dark:bg-[#1E1E1E] rounded-3xl p-6 w-full max-w-sm shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-[#2D3436] dark:text-[#E0E0E0]">Ayarlar</h2>
                <button onClick={() => setIsSettingsOpen(false)} className="p-2 hover:bg-stone-100 dark:hover:bg-[#333] rounded-full transition-colors">
                  <X className="w-5 h-5 text-stone-500" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Görünüm */}
                <div>
                  <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Görünüm</h3>
                  <div className="flex bg-[#F9FBF9] dark:bg-[#121212] p-1 rounded-xl border border-stone-100 dark:border-[#333]">
                    {(['light', 'dark', 'system'] as ThemeType[]).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={`flex-1 py-2 flex justify-center items-center rounded-lg text-sm font-medium transition-colors ${
                          theme === t 
                            ? 'bg-[#FFFFFF] dark:bg-[#1E1E1E] text-[#D63031] dark:text-[#FF4D4D] shadow-sm' 
                            : 'text-stone-500 hover:text-[#2D3436] dark:hover:text-[#E0E0E0]'
                        }`}
                      >
                        {t === 'light' ? <Sun className="w-4 h-4" /> : t === 'dark' ? <Moon className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Emoji Rehberi */}
                <div>
                  <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Emoji Rehberi</h3>
                  <div className="bg-[#F9FBF9] dark:bg-[#121212] p-4 rounded-2xl border border-stone-100 dark:border-[#333] space-y-3 text-sm text-[#2D3436] dark:text-[#E0E0E0]">
                    <div className="flex items-center gap-3"><span className="text-xl">💧</span> <span>Su: Sulama zamanı</span></div>
                    <div className="flex items-center gap-3"><span className="text-xl">🌱</span> <span>Ekim: Dikim günü</span></div>
                    <div className="flex items-center gap-3"><span className="text-xl">🧪</span> <span>Besin: Gübreleme</span></div>
                    <div className="flex items-center gap-3"><span className="text-xl">⛏️</span> <span>Çapa: Havalandırma</span></div>
                    <div className="flex items-center gap-3"><span className="text-xl">✂️</span> <span>Budama: Temizlik</span></div>
                    <div className="flex items-center gap-3"><span className="text-xl">🌞</span> <span>Işık: Güneşe çıkarma</span></div>
                    <div className="flex items-center gap-3"><span className="text-xl">🧤</span> <span>Hasat: Toplama zamanı</span></div>
                    <div className="flex items-center gap-3"><span className="text-xl">❄️</span> <span>Koruma: Don önlemi</span></div>
                  </div>
                </div>

                {/* Yardım */}
                <div>
                  <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Yardım</h3>
                  <div className="space-y-2">
                    <a href="mailto:destek@cilekasistani.com" className="flex items-center gap-3 w-full p-3 bg-[#F9FBF9] dark:bg-[#121212] hover:bg-stone-100 dark:hover:bg-[#333] rounded-xl border border-stone-100 dark:border-[#333] transition-colors text-sm font-medium text-[#2D3436] dark:text-[#E0E0E0]">
                      <Mail className="w-4 h-4 text-stone-400" />
                      Bize Yazın
                    </a>
                    <button className="flex items-center gap-3 w-full p-3 bg-[#F9FBF9] dark:bg-[#121212] hover:bg-stone-100 dark:hover:bg-[#333] rounded-xl border border-stone-100 dark:border-[#333] transition-colors text-sm font-medium text-[#2D3436] dark:text-[#E0E0E0]">
                      <AlertCircle className="w-4 h-4 text-stone-400" />
                      Hata Bildir
                    </button>
                  </div>
                </div>

                <button 
                  onClick={() => { setIsSettingsOpen(false); onReset(); }} 
                  className="w-full py-3 text-red-500 font-medium bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 rounded-xl transition-colors"
                >
                  Bilgileri Sıfırla
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Chat Modal */}
      <AnimatePresence>
        {isChatOpen && (
          <ChatModal 
            onClose={() => setIsChatOpen(false)} 
            appState={appState}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ChatModal Component
function ChatModal({ onClose, appState }: { onClose: () => void, appState: AppState }) {
  const [messages, setMessages] = useState<{role: 'user'|'model', text: string, image?: string, isAnalysis?: boolean}[]>([
    { role: 'model', text: `Merhaba! ${appState.location}'da ${appState.type === 'pot' ? `saksıda (${appState.potDiameter} cm çap)` : 'tarlada'} yetiştirdiğin çileklerle ilgili her türlü soruyu bana sorabilirsin. Çilek Ustası olarak buradayım!` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCameraMenu, setShowCameraMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const reply = await chatWithAdvisor(userMsg, messages, appState);
      setMessages(prev => [...prev, { role: 'model', text: reply }]);
    } catch (err: any) {
      console.error(err);
      const errorMessage = err?.message || String(err);
      if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
        setMessages(prev => [...prev, { role: 'model', text: 'Üzgünüm, günlük yapay zeka limitine ulaştık (Kota aşıldı). Lütfen daha sonra tekrar dene.' }]);
      } else {
        setMessages(prev => [...prev, { role: 'model', text: 'Üzgünüm, şu an bağlantı kuramıyorum. Lütfen tekrar dene.' }]);
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setShowCameraMenu(false);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      const mimeType = file.type;

      setMessages(prev => [...prev, { role: 'user', text: '', image: base64String }]);
      setIsTyping(true);

      try {
        const reply = await chatWithAdvisor('', messages, appState, base64Data, mimeType);
        setMessages(prev => [...prev, { role: 'model', text: reply, isAnalysis: true }]);
      } catch (err: any) {
        console.error(err);
        const errorMessage = err?.message || String(err);
        if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
          setMessages(prev => [...prev, { role: 'model', text: 'Üzgünüm, günlük yapay zeka limitine ulaştık (Kota aşıldı). Lütfen daha sonra tekrar dene.' }]);
        } else {
          setMessages(prev => [...prev, { role: 'model', text: 'Üzgünüm, şu an bağlantı kuramıyorum. Lütfen tekrar dene.' }]);
        }
      } finally {
        setIsTyping(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute inset-0 bg-[#F9FBF9] dark:bg-[#121212] z-50 flex flex-col"
    >
      <div className="bg-[#D63031] dark:bg-[#1E1E1E] text-white p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">👨‍🌾</div>
          <div>
            <h3 className="font-bold">Çilek Ustası</h3>
            <p className="text-xs text-white/80">Çevrimiçi</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl ${
              msg.role === 'user' 
                ? 'bg-[#D63031] dark:bg-[#FF4D4D] text-white rounded-tr-sm' 
                : msg.isAnalysis
                  ? 'bg-[#D63031] dark:bg-[#FF4D4D] text-white rounded-tl-sm shadow-md border-2 border-red-200 dark:border-red-900'
                  : 'bg-[#FFFFFF] dark:bg-[#1E1E1E] border border-stone-100 dark:border-[#333] text-[#2D3436] dark:text-[#E0E0E0] rounded-tl-sm shadow-sm'
            }`}>
              {msg.image && <img src={msg.image} alt="Upload" className="w-full rounded-lg mb-2 object-cover" />}
              {msg.text && (
                <div className={`prose prose-sm max-w-none prose-p:leading-relaxed ${msg.role === 'user' || msg.isAnalysis ? 'prose-invert text-white' : 'dark:prose-invert'}`}>
                  <ReactMarkdown>
                    {msg.text}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-[#FFFFFF] dark:bg-[#1E1E1E] border border-stone-100 dark:border-[#333] p-4 rounded-2xl rounded-tl-sm shadow-sm flex gap-1">
              <div className="w-2 h-2 bg-stone-300 dark:bg-stone-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-stone-300 dark:bg-stone-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-stone-300 dark:bg-stone-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 bg-[#FFFFFF] dark:bg-[#1E1E1E] border-t border-stone-100 dark:border-[#333] flex gap-2 items-center relative">
        {showCameraMenu && (
          <div className="absolute bottom-full right-4 mb-2 bg-white dark:bg-stone-800 p-2 rounded-xl shadow-xl flex flex-col gap-2 border border-stone-100 dark:border-stone-700 z-50">
            <label className="flex items-center gap-3 p-3 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg cursor-pointer text-sm font-medium text-stone-700 dark:text-stone-200 transition-colors">
              <Upload className="w-5 h-5 text-[#D63031] dark:text-[#FF4D4D]" /> Dosyadan Seç
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
            <label className="flex items-center gap-3 p-3 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg cursor-pointer text-sm font-medium text-stone-700 dark:text-stone-200 transition-colors">
              <Camera className="w-5 h-5 text-[#D63031] dark:text-[#FF4D4D]" /> Kamera Aç
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} />
            </label>
          </div>
        )}

        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Uzmana sor..."
          className="flex-1 bg-[#F9FBF9] dark:bg-[#121212] border-transparent focus:bg-white dark:focus:bg-[#1E1E1E] focus:border-[#D63031] dark:focus:border-[#FF4D4D] focus:ring-2 focus:ring-[#D63031]/20 dark:focus:ring-[#FF4D4D]/30 rounded-full px-5 py-3 outline-none transition-all dark:text-white"
        />
        
        {!input.trim() ? (
          <button
            type="button"
            onClick={() => setShowCameraMenu(!showCameraMenu)}
            className="w-12 h-12 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-[#D63031] dark:text-[#FF4D4D] rounded-full flex items-center justify-center transition-colors shrink-0"
          >
            <Camera className="w-5 h-5" />
          </button>
        ) : (
          <button 
            type="submit"
            disabled={isTyping}
            className="w-12 h-12 bg-[#D63031] dark:bg-[#FF4D4D] hover:opacity-90 disabled:bg-stone-300 dark:disabled:bg-[#333] text-white rounded-full flex items-center justify-center transition-opacity shrink-0"
          >
            <Send className="w-5 h-5 ml-1" />
          </button>
        )}
      </form>
    </motion.div>
  );
}
