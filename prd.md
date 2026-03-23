# 📝 Ürün Gereksinim Belgesi (PRD) - Akıllı Çilek Asistanı

## 1. Ürün Vizyonu
Kullanıcıyı yormayan, karmaşık ziraat terimlerinden uzak, günlük, "Emoji Tabanlı" görevler sunan akıllı bir tarım asistanı. Google Gemini AI gücünü kullanarak kişisel bir Ziraat Mühendisi gibi çalışır.

## 2. Temel Özellikler (MVP)

### A. Konum ve Ortam Seçimi
- Kullanıcıdan **Şehir/İlçe** bilgisi alınır.
- Yetiştirme Tipi Seçimi: **🪴 Saksı (Hobi)** veya **🚜 Tarla (Profesyonel)**.
- **Kritik İş Mantığı:** Saksı seçilirse AI hava durumundaki don uyarılarını görmezden gelir ve su miktarını "ml" cinsinden (`Çap * 10 * Sıcaklık Katsayısı`) verir. Tarla seçilirse don, UV ve aşırı yağış uyarıları merkeze alınır.

### B. Dinamik Takvim ve Emoji Standardı
Aylık tablo/JSON görünümünde her güne 1 ana görev atanır:
- 💧 Su, 🌱 Ekim, 🧪 Besin, ⛏️ Çapa, ✂️ Budama, 🌞 Işık, 🧤 Hasat, ❄️ Koruma.
- Ekranın altında her gün değişen mikro bir bilgi paneli: "🍓 Bugünün Çilek Sırrı".

### C. Bilgisayarlı Görü (Computer Vision)
- Kullanıcı ekrandaki yüzen 📷 simgesine tıklayıp fotoğraf yükler.
- AI (Gemini Vision) yaprak ve meyveyi analiz eder.
- Çıktı: Hastalık/Böcek teşhisi (% güven skoru), kısa neden açıklaması ve acil çözüm planı.

## 3. Kullanıcı Arayüzü (UI) ve Deneyimi (UX)
- **Sabit Çilek Header:** En üst bar temadan bağımsızdır. Canlı pembe-hafif pembe gradyan (`linear-gradient(to right, #FF4D4D, #FFC0CB)`). Yazılar beyaz, ikonlar yaprak yeşilidir (`#4CAF50`). Dinamik konum/tip bilgisi (Örn: "📍 Niğde | 🪴 Saksı") ve arayüzü sıfırlayan "🔙 Geri" butonu burada yer alır.
- **Çalışan Tema Sistemi (JS State):** Alt kısımlar kullanıcı seçimine göre dinamik değişir.
  - *Karanlık Mod:* Arka Plan `#121212`, Yazı `#E0E0E0`, Vurgu `#FF4D4D`.
  - *Aydınlık Mod:* Arka Plan `#F9FBF9`, Yazı `#2D3436`, Vurgu `#D63031`.

## 4. Teknoloji Yığını (Tech Stack)
- **Frontend/Backend:** Python (Streamlit veya Flask) / HTML-JS-CSS
- **Yapay Zeka:** Google Gemini 1.5 Pro/Flash API (Google AI Studio üzerinden)
- **Veri Kaynağı:** Hava durumu API entegrasyonu.
