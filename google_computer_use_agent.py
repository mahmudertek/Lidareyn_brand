"""
Google Gemini Computer Use Agent - Tarayıcı Otomasyon Scripti
=============================================================

Bu script, Google'ın yeni Gemini 2.5 Computer Use özelliğini kullanarak
tarayıcıyı otomatik kontrol eden bir agent oluşturur.

KURULUM:
--------
1. Terminalde şu komutları çalıştırın:
   pip install google-genai playwright
   playwright install chromium

2. Google AI API Key'inizi alın:
   https://aistudio.google.com/apikey

3. API Key'i ortam değişkeni olarak ayarlayın:
   Windows: set GOOGLE_API_KEY=your_api_key_here
   Linux/Mac: export GOOGLE_API_KEY=your_api_key_here

KULLANİM:
---------
python google_computer_use_agent.py
"""

import os
import time
import base64
from typing import Any, List, Tuple

# Playwright import (tarayıcı kontrolü için)
try:
    from playwright.sync_api import sync_playwright
except ImportError:
    print("❌ Playwright yüklü değil!")
    print("   Şu komutu çalıştırın: pip install playwright")
    print("   Ardından: playwright install chromium")
    exit(1)

# Google GenAI import
try:
    from google import genai
    from google.genai import types
    from google.genai.types import Content, Part
except ImportError:
    print("❌ Google GenAI yüklü değil!")
    print("   Şu komutu çalıştırın: pip install google-genai")
    exit(1)

# ============================================
# AYARLAR
# ============================================

# Ekran boyutları (önerilen: 1440x900)
SCREEN_WIDTH = 1440
SCREEN_HEIGHT = 900

# API Key kontrolü
API_KEY = os.environ.get("GOOGLE_API_KEY")
if not API_KEY:
    print("=" * 60)
    print("❌ GOOGLE_API_KEY ortam değişkeni ayarlanmamış!")
    print("")
    print("API Key almak için:")
    print("  1. https://aistudio.google.com/apikey adresine gidin")
    print("  2. 'Create API Key' butonuna tıklayın")
    print("  3. Oluşan key'i kopyalayın")
    print("")
    print("Key'i ayarlamak için (Windows):")
    print("  set GOOGLE_API_KEY=AIza...")
    print("")
    print("Key'i ayarlamak için (Linux/Mac):")
    print("  export GOOGLE_API_KEY=AIza...")
    print("=" * 60)
    
    # Manuel giriş seçeneği
    manual_key = input("\nAPI Key'inizi buraya yapıştırabilirsiniz (veya Enter'a basarak çıkın): ").strip()
    if manual_key:
        API_KEY = manual_key
    else:
        exit(1)

# Google Client oluştur
client = genai.Client(api_key=API_KEY)

# ============================================
# YARDIMCI FONKSİYONLAR
# ============================================

def denormalize_x(x: int, screen_width: int) -> int:
    """Normalize edilmiş X koordinatını (0-999) gerçek piksele çevir"""
    return int((x / 999) * screen_width)

def denormalize_y(y: int, screen_height: int) -> int:
    """Normalize edilmiş Y koordinatını (0-999) gerçek piksele çevir"""
    return int((y / 999) * screen_height)

def execute_function_calls(candidate, page, screen_width: int, screen_height: int) -> List[Tuple[str, Any]]:
    """Model tarafından önerilen işlemleri yürüt"""
    results = []
    
    for part in candidate.content.parts:
        if part.function_call:
            fc = part.function_call
            func_name = fc.name
            args = dict(fc.args) if fc.args else {}
            
            print(f"  🔧 İşlem: {func_name}")
            print(f"     Argümanlar: {args}")
            
            try:
                result = execute_action(page, func_name, args, screen_width, screen_height)
                results.append((func_name, {"success": True, "result": result}))
                print(f"     ✅ Başarılı")
            except Exception as e:
                results.append((func_name, {"success": False, "error": str(e)}))
                print(f"     ❌ Hata: {e}")
            
            # İşlemler arası kısa bekleme
            time.sleep(0.5)
    
    return results

def execute_action(page, action_name: str, args: dict, screen_width: int, screen_height: int) -> Any:
    """Tek bir işlemi yürüt"""
    
    if action_name == "open_web_browser":
        # Tarayıcı zaten açık
        return "Browser already open"
    
    elif action_name == "navigate":
        url = args.get("url", "")
        page.goto(url)
        page.wait_for_load_state("domcontentloaded")
        return f"Navigated to {url}"
    
    elif action_name == "click_at":
        x = denormalize_x(args.get("x", 0), screen_width)
        y = denormalize_y(args.get("y", 0), screen_height)
        page.mouse.click(x, y)
        return f"Clicked at ({x}, {y})"
    
    elif action_name == "hover_at":
        x = denormalize_x(args.get("x", 0), screen_width)
        y = denormalize_y(args.get("y", 0), screen_height)
        page.mouse.move(x, y)
        return f"Hovered at ({x}, {y})"
    
    elif action_name == "type_text_at":
        x = denormalize_x(args.get("x", 0), screen_width)
        y = denormalize_y(args.get("y", 0), screen_height)
        text = args.get("text", "")
        press_enter = args.get("press_enter", False)
        clear_before = args.get("clear_before_typing", False)
        
        page.mouse.click(x, y)
        time.sleep(0.2)
        
        if clear_before:
            page.keyboard.press("Control+a")
            page.keyboard.press("Backspace")
        
        page.keyboard.type(text)
        
        if press_enter:
            page.keyboard.press("Enter")
        
        return f"Typed '{text}' at ({x}, {y})"
    
    elif action_name == "key_combination":
        keys = args.get("keys", "")
        page.keyboard.press(keys)
        return f"Pressed {keys}"
    
    elif action_name == "scroll_document":
        direction = args.get("direction", "down")
        scroll_amount = 500 if direction == "down" else -500
        page.mouse.wheel(0, scroll_amount)
        return f"Scrolled {direction}"
    
    elif action_name == "scroll_at":
        x = denormalize_x(args.get("x", 0), screen_width)
        y = denormalize_y(args.get("y", 0), screen_height)
        direction = args.get("direction", "down")
        magnitude = args.get("magnitude", 400)
        
        page.mouse.move(x, y)
        scroll_amount = magnitude if direction == "down" else -magnitude
        page.mouse.wheel(0, scroll_amount)
        return f"Scrolled {direction} at ({x}, {y})"
    
    elif action_name == "go_back":
        page.go_back()
        return "Went back"
    
    elif action_name == "go_forward":
        page.go_forward()
        return "Went forward"
    
    elif action_name == "wait_5_seconds":
        time.sleep(5)
        return "Waited 5 seconds"
    
    elif action_name == "drag_and_drop":
        x = denormalize_x(args.get("x", 0), screen_width)
        y = denormalize_y(args.get("y", 0), screen_height)
        dest_x = denormalize_x(args.get("destination_x", 0), screen_width)
        dest_y = denormalize_y(args.get("destination_y", 0), screen_height)
        
        page.mouse.move(x, y)
        page.mouse.down()
        page.mouse.move(dest_x, dest_y)
        page.mouse.up()
        return f"Dragged from ({x}, {y}) to ({dest_x}, {dest_y})"
    
    else:
        raise NotImplementedError(f"Unknown action: {action_name}")

def get_function_responses(page, results: List[Tuple[str, Any]]) -> List[types.FunctionResponse]:
    """İşlem sonuçlarını ve yeni ekran görüntüsünü hazırla"""
    responses = []
    
    # Sayfanın yüklenmesini bekle
    time.sleep(1)
    
    # Yeni ekran görüntüsü al
    screenshot = page.screenshot(type="png")
    current_url = page.url
    
    for func_name, result in results:
        response_data = {
            "success": result.get("success", False),
            "message": result.get("result", result.get("error", "")),
            "current_url": current_url,
            # Ekran görüntüsü base64 olarak
            "screenshot": base64.b64encode(screenshot).decode("utf-8")
        }
        
        responses.append(types.FunctionResponse(
            name=func_name,
            response=response_data
        ))
    
    return responses

# ============================================
# ANA AGENT DÖNGÜSÜ
# ============================================

def run_agent(goal: str, start_url: str = "https://www.google.com", max_turns: int = 10):
    """
    Computer Use Agent'ı çalıştır
    
    Args:
        goal: Agent'ın yapmasını istediğiniz görev
        start_url: Başlangıç URL'si
        max_turns: Maksimum işlem adımı sayısı
    """
    
    print("=" * 60)
    print("🤖 Google Gemini Computer Use Agent")
    print("=" * 60)
    print(f"📋 Görev: {goal}")
    print(f"🌐 Başlangıç URL: {start_url}")
    print(f"⚙️  Maksimum adım: {max_turns}")
    print("=" * 60)
    
    # Playwright başlat
    print("\n🚀 Tarayıcı başlatılıyor...")
    playwright = sync_playwright().start()
    browser = playwright.chromium.launch(headless=False)  # headless=False ile tarayıcıyı görürsünüz
    context = browser.new_context(viewport={"width": SCREEN_WIDTH, "height": SCREEN_HEIGHT})
    page = context.new_page()
    
    try:
        # Başlangıç sayfasına git
        print(f"🌐 {start_url} adresine gidiliyor...")
        page.goto(start_url)
        page.wait_for_load_state("domcontentloaded")
        time.sleep(2)
        
        # Model konfigürasyonu
        config = types.GenerateContentConfig(
            tools=[
                types.Tool(
                    computer_use=types.ComputerUse(
                        environment=types.Environment.ENVIRONMENT_BROWSER
                    )
                )
            ],
            # Düşünme modunu etkinleştir (opsiyonel)
            thinking_config=types.ThinkingConfig(include_thoughts=True),
        )
        
        # İlk ekran görüntüsü
        initial_screenshot = page.screenshot(type="png")
        
        # Konuşma geçmişi
        contents = [
            Content(
                role="user",
                parts=[
                    Part(text=goal),
                    Part.from_bytes(data=initial_screenshot, mime_type="image/png")
                ]
            )
        ]
        
        # Agent döngüsü
        for turn in range(max_turns):
            print(f"\n{'='*40}")
            print(f"📍 Adım {turn + 1}/{max_turns}")
            print(f"{'='*40}")
            
            print("🤔 Model düşünüyor...")
            
            response = client.models.generate_content(
                model="gemini-2.5-computer-use-preview-10-2025",
                contents=contents,
                config=config,
            )
            
            candidate = response.candidates[0]
            contents.append(candidate.content)
            
            # Model'in metin yanıtını göster
            for part in candidate.content.parts:
                if part.text:
                    print(f"💭 Model: {part.text[:200]}...")  # İlk 200 karakter
            
            # İşlev çağrıları var mı kontrol et
            has_function_calls = any(part.function_call for part in candidate.content.parts)
            
            if not has_function_calls:
                # Görev tamamlandı
                text_response = " ".join([part.text for part in candidate.content.parts if part.text])
                print("\n" + "=" * 60)
                print("✅ GÖREV TAMAMLANDI!")
                print("=" * 60)
                print(f"📝 Sonuç:\n{text_response}")
                break
            
            # İşlemleri yürüt
            print("\n⚡ İşlemler yürütülüyor...")
            results = execute_function_calls(candidate, page, SCREEN_WIDTH, SCREEN_HEIGHT)
            
            # Yeni durumu yakala
            print("📸 Ekran durumu yakalanıyor...")
            function_responses = get_function_responses(page, results)
            
            contents.append(
                Content(
                    role="user",
                    parts=[Part(function_response=fr) for fr in function_responses]
                )
            )
        
        else:
            print("\n⚠️ Maksimum adım sayısına ulaşıldı!")
        
        # Kullanıcının sonucu görmesi için bekle
        input("\n🔎 Tarayıcıyı inceleyebilirsiniz. Kapatmak için Enter'a basın...")
        
    finally:
        print("\n🛑 Tarayıcı kapatılıyor...")
        browser.close()
        playwright.stop()

# ============================================
# ÖRNEK KULLANIM
# ============================================

if __name__ == "__main__":
    print("""
╔═══════════════════════════════════════════════════════════════╗
║     🤖 Google Gemini Computer Use Agent                       ║
║     Tarayıcı Otomasyon Aracı                                  ║
╚═══════════════════════════════════════════════════════════════╝
    """)
    
    # Örnek görevler
    example_tasks = [
        "Google'da 'Python programming' ara ve ilk 3 sonucun başlığını listele",
        "Wikipedia'da 'Artificial Intelligence' sayfasına git ve ilk paragrafı oku",
        "Google Haberler'de bugünün manşetlerini bul",
    ]
    
    print("📝 Örnek görevler:")
    for i, task in enumerate(example_tasks, 1):
        print(f"   {i}. {task}")
    
    print("\n" + "-" * 60)
    
    # Kullanıcıdan görev al
    user_goal = input("🎯 Görevi girin (veya örnek için 1-3 arası numara): ").strip()
    
    if user_goal in ["1", "2", "3"]:
        user_goal = example_tasks[int(user_goal) - 1]
    
    if not user_goal:
        user_goal = example_tasks[0]  # Varsayılan görev
    
    # Start URL
    start = input("🌐 Başlangıç URL'si (boş bırakın = google.com): ").strip()
    if not start:
        start = "https://www.google.com"
    
    print()
    
    # Agent'ı çalıştır
    run_agent(
        goal=user_goal,
        start_url=start,
        max_turns=15
    )
