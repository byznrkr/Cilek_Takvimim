import { GoogleGenAI, Type } from '@google/genai';
import type { AppState } from '../App';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateCalendar(appState: AppState) {
  const prompt = `
Sen kıdemli bir Ziraat Mühendisi, Çilek Uzmanı ve Full-Stack Developer'sın.
Kullanıcı konumu: ${appState.location}
Yetiştirme Tipi: ${appState.type === 'pot' ? `Saksı (Çap: ${appState.potDiameter} cm)` : 'Tarla'}
Bugünün tarihi: 22 Mart 2026.

Görev: Bugünden itibaren 30 günlük (Aylık) bir çilek bakım takvimi oluştur.

MANTIK FİLTRESİ - KRİTİK:
- SAKSI İSE: Hava durumundaki "don" uyarısını yoksay. Saksı hacmi, iç mekan ışığı ve toprak kurumasına odaklan. Sulamayı "ml" cinsinden ver (Formül: Çap * 10 * Sıcaklık Katsayısı).
- TARLA İSE: Tamamen meteoroloji odaklı ol. Don, aşırı yağış, fırtına ve UV indeksini takip et.

DİNAMİK TAKVİM VE EMOJİ STANDARDI:
- HER GÜNE SADECE BİR ANA GÖREV/EMOJİ ATA.
- Emojiler: 💧 Su, 🌱 Ekim, 🧪 Besin, ⛏️ Çapa, ✂️ Budama, 🌞 Işık (Saksı), 🧤 Hasat, ❄️ Koruma (Tarla).
- Görev formatı: "[Emoji] + İsim" (Örn: "💧 Su", "🌞 Işık")
- Detay: Maksimum 2 cümlelik profesyonel püf noktası.
- Miktar: Saksıysa ve sulama/besin ise "Örn: 300ml su" gibi miktar belirt. Değilse boş bırak.

Lütfen JSON formatında dön.
`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          calendar: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                date: { type: Type.STRING, description: "Tarih (örn: 22 Mart)" },
                dayOfWeek: { type: Type.STRING, description: "Gün (örn: Pazar)" },
                taskName: { type: Type.STRING, description: "Görev: [Emoji] + İsim (örn: 💧 Su)" },
                detail: { type: Type.STRING, description: "Maksimum 2 cümlelik profesyonel püf noktası" },
                amount: { type: Type.STRING, description: "Saksıysa miktar (örn: 300ml su). Yoksa boş bırak." }
              },
              required: ["date", "dayOfWeek", "taskName", "detail"]
            }
          },
          secretOfTheDay: { type: Type.STRING, description: "🍓 Bugünün Çilek Sırrı" }
        },
        required: ["calendar", "secretOfTheDay"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
}

export async function chatWithAdvisor(message: string, history: any[], appState: AppState, imageBase64?: string, mimeType?: string) {
  let systemInstruction = `Sen "Çilek Ustası" adında, kıdemli bir Ziraat Mühendisi ve Bilgisayarlı Görü (Computer Vision) uzmanısın. Kullanıcı ${appState.location} konumunda, ${appState.type === 'pot' ? `saksıda (${appState.potDiameter} cm çap)` : 'tarlada'} çilek yetiştiriyor. Kısa, samimi, pratik ve usta işi cevaplar ver. Yanıtları telefon ekranına sığacak şekilde kısa, öz ve "scroll" dostu tut.`;
  
  const contents: any[] = history.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.text || "Fotoğraf gönderildi." }]
  }));
  
  const filteredContents = contents.filter((c: any) => !(c.role === 'model' && c.parts[0].text.includes('Merhaba!')));
  
  if (imageBase64) {
    systemInstruction += `\n\n[GÖRSEL ANALİZ GÖREVİ]
Kullanıcı bir fotoğraf yükledi. Şunları yap:
1. Sadece çilek bitkisiyle ilgili fotoğrafları analiz et. Başka bir bitki veya nesne varsa SADECE şu metni dön: "Bu asistan sadece çilekler için çalışır".
2. Çilekse, şu formatta kesin bir rapor ver (Markdown formatında):
**Hastalık/Böcek Teşhisi:** [Hastalık adı ve % güven skoru. Örn: Mantar hastalığı ihtimali %90]
**Sorun:** [Max 1 cümle]
**Neden:** [Max 1 cümle]
**Çözüm Planı:**
- [Madde 1]
- [Madde 2]
- [Madde 3]
${appState.type === 'pot' ? `**Önerilen Su:** [ml bazlı su miktarı]` : ''}`;

    filteredContents.push({
      role: 'user',
      parts: [
        { text: message || "Bu fotoğrafı analiz et." },
        { inlineData: { data: imageBase64, mimeType: mimeType || 'image/jpeg' } }
      ]
    });
  } else {
    filteredContents.push({ role: 'user', parts: [{ text: message }] });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: filteredContents,
    config: {
      systemInstruction,
    }
  });

  return response.text || '';
}
