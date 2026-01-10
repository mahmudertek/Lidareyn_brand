# 🤖 Google Gemini Computer Use Agent - Kurulum Kılavuzu

## Ne İşe Yarar?
Google'ın yeni **Gemini 2.5 Computer Use** özelliği, bir AI'ın:
- Ekran görüntülerini görmesini
- Fare ve klavye kontrolü yapmasını  
- Web sitelerini otomatik kullanmasını sağlar

## 📋 Kurulum Adımları

### 1️⃣ Python Bağımlılıklarını Yükle
Terminalde şu komutları çalıştırın:

```bash
pip install google-genai playwright
playwright install chromium
```

### 2️⃣ Google API Key Al
1. [Google AI Studio](https://aistudio.google.com/apikey) adresine gidin
2. "Create API Key" butonuna tıklayın
3. Oluşan key'i kopyalayın

### 3️⃣ API Key'i Ayarla

**Windows (CMD):**
```cmd
set GOOGLE_API_KEY=AIzaSy...your_key_here
```

**Windows (PowerShell):**
```powershell
$env:GOOGLE_API_KEY="AIzaSy...your_key_here"
```

**Linux/Mac:**
```bash
export GOOGLE_API_KEY=AIzaSy...your_key_here
```

### 4️⃣ Script'i Çalıştır
```bash
python google_computer_use_agent.py
```

## 🎯 Kullanım Örnekleri

Script açıldığında görev girebilirsiniz:

- "Google'da 'Python programming' ara"
- "Wikipedia'da 'Istanbul' sayfasını bul"
- "Hepsiburada'da laptop fiyatlarını ara"
- "X.com'da gündemdeki konuları listele"

## ⚠️ Önemli Notlar

1. **Güvenlik**: Bu araç bilgisayarınızı kontrol eder! Güvenli görevler için kullanın.
2. **Maliyet**: Google AI API kullandıkça ücretlendirilirsiniz.
3. **Deneysel**: Bu özellik "preview" aşamasındadır.

## 🔧 Desteklenen İşlemler

| İşlem | Açıklama |
|-------|----------|
| `click_at` | Belirtilen koordinata tıkla |
| `type_text_at` | Metin yaz |
| `navigate` | URL'ye git |
| `scroll_document` | Sayfayı kaydır |
| `key_combination` | Tuş kombinasyonu (Ctrl+C vb.) |
| `go_back` / `go_forward` | Geri/ileri git |
| `hover_at` | Üzerine gel |
| `drag_and_drop` | Sürükle bırak |

## 📚 Daha Fazla Bilgi

- [Resmi Dokümantasyon](https://ai.google.dev/gemini-api/docs/computer-use?hl=tr)
- [GitHub Referans Uygulama](https://github.com/google/computer-use-preview/)
- [Browserbase Demo](http://gemini.browserbase.com)
