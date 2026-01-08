// ==============================================
// ADMIN AI ASİSTANI - AKILLI ÜRÜN YÖNETİM BOTU
// Doğal dil komutlarıyla ürün ekleme, düzenleme
// ==============================================

const AdminAIAssistant = {
    isOpen: false,
    isProcessing: false,
    pendingCommand: null,
    conversationHistory: [],
    uploadedImages: [], // Yüklenen görseller

    // Gelişmiş Endüstriyel Teknik Sözlük
    technicalTerms: {
        'offset': 'Ofset (Açılı)',
        'hexagon key wrenches': 'Alyen Anahtar Seti',
        'high torque': 'Yüksek Torklu',
        'handles': 'Saplı / Tutamaklı',
        'support': 'Stand / Askı Aparatı',
        'set of': 'Parçalı',
        'wrenches': 'Anahtarlar',
        'pliers': 'Penseler',
        'screwdrivers': 'Tornavidalar',
        'drive': 'Lokma Girişi',
        'socket': 'Lokma',
        'ratchet': 'Cırcır',
        'set': 'Seti',
        'with': 'ile',
        'mm': 'mm'
    },

    // Başlat
    init() {
        this.renderUI();
        this.bindEvents();
        this.showWelcomeMessage();
        console.log('🤖 Admin AI Asistanı başlatıldı');
    },

    // UI Oluştur
    renderUI() {
        // Floating Action Button (FAB)
        const fab = document.createElement('button');
        fab.className = 'ai-assistant-fab';
        fab.id = 'aiAssistantFab';
        fab.innerHTML = `
            <i class="fa-solid fa-robot"></i>
            <span class="badge" style="display: none;">!</span>
        `;
        document.body.appendChild(fab);

        // Chat Window
        const chatWindow = document.createElement('div');
        chatWindow.className = 'ai-chat-window';
        chatWindow.id = 'aiChatWindow';
        chatWindow.innerHTML = `
            <div class="ai-chat-header">
                <div class="ai-avatar">
                    <i class="fa-solid fa-wand-magic-sparkles"></i>
                </div>
                <div class="ai-chat-title">
                    <h3>
                        Galata Asistan
                        <span class="online-dot"></span>
                    </h3>
                    <p>Akıllı Ürün Yönetimi</p>
                </div>
                <button class="ai-chat-close" id="aiChatClose">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div class="ai-chat-messages" id="aiChatMessages"></div>
            <div class="ai-image-preview-container" id="aiImagePreviewContainer" style="display: none;"></div>
            <div class="ai-chat-input-container">
                <div class="ai-upload-btn" id="aiUploadBtn" title="Görsel Yükle">
                    <i class="fa-solid fa-image"></i>
                    <input type="file" id="aiImageInput" accept="image/*" multiple />
                </div>
                <input type="text" class="ai-chat-input" id="aiChatInput" 
                       placeholder="Örn: 5 tane Aksesuarlar kategorisine ürün ekle..." />
                <button class="ai-send-btn" id="aiSendBtn">
                    <i class="fa-solid fa-paper-plane"></i>
                </button>
            </div>
        `;
        document.body.appendChild(chatWindow);

        // Lightbox for image preview
        const lightbox = document.createElement('div');
        lightbox.className = 'ai-lightbox';
        lightbox.id = 'aiLightbox';
        lightbox.innerHTML = `
            <button class="ai-lightbox-close" id="aiLightboxClose">
                <i class="fa-solid fa-xmark"></i>
            </button>
            <img src="" alt="Preview" id="aiLightboxImage" />
        `;
        document.body.appendChild(lightbox);
    },

    // Event Listeners
    bindEvents() {
        const fab = document.getElementById('aiAssistantFab');
        const closeBtn = document.getElementById('aiChatClose');
        const sendBtn = document.getElementById('aiSendBtn');
        const input = document.getElementById('aiChatInput');
        const imageInput = document.getElementById('aiImageInput');
        const lightbox = document.getElementById('aiLightbox');
        const lightboxClose = document.getElementById('aiLightboxClose');

        fab.addEventListener('click', () => this.toggleChat());
        closeBtn.addEventListener('click', () => this.toggleChat());
        sendBtn.addEventListener('click', () => this.sendMessage());
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Image upload events
        imageInput.addEventListener('change', (e) => this.handleImageUpload(e));

        // Lightbox events
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) this.closeLightbox();
        });
        lightboxClose.addEventListener('click', () => this.closeLightbox());

        // Keyboard shortcut for lightbox
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                this.closeLightbox();
            }
        });
    },

    // Chat aç/kapat
    toggleChat() {
        const chatWindow = document.getElementById('aiChatWindow');
        const fab = document.getElementById('aiAssistantFab');
        this.isOpen = !this.isOpen;

        if (this.isOpen) {
            chatWindow.classList.add('active');
            fab.innerHTML = '<i class="fa-solid fa-xmark"></i>';
            document.getElementById('aiChatInput').focus();

            // Badge'i gizle
            const badge = fab.querySelector('.badge');
            if (badge) badge.style.display = 'none';
        } else {
            chatWindow.classList.remove('active');
            fab.innerHTML = '<i class="fa-solid fa-robot"></i><span class="badge" style="display: none;">!</span>';
        }
    },

    // Hoş geldin mesajı
    showWelcomeMessage() {
        setTimeout(() => {
            this.addBotMessage(`
                Merhaba! 👋 Ben Galata Asistan, yapay zeka destekli yardımcınız.
                <br><br>
                Size nasıl yardımcı olabilirim?
                <br><br>
                <small style="color: rgba(255,255,255,0.6);"><i class="fa-solid fa-image"></i> Görsel yüklemek için sol alttaki resim ikonuna tıklayın!</small>
            `, [
                { text: '🛒 Ürün Ekle', action: 'addProduct' },
                { text: '📦 Toplu Ürün Ekle', action: 'bulkAdd' },
                { text: '📷 Görsel Yükle', action: 'imageUpload' },
                { text: '💰 Fiyat Güncelle', action: 'updatePrice' },
                { text: '📊 Stok Durumu', action: 'checkStock' }
            ]);
        }, 500);
    },

    // Görsel yükleme işlemi
    async handleImageUpload(e) {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const previewContainer = document.getElementById('aiImagePreviewContainer');
        previewContainer.style.display = 'flex';

        for (const file of files) {
            try {
                const compressed = await this.compressImage(file);
                this.uploadedImages.push(compressed);
                this.updateImagePreviews();
            } catch (error) {
                console.error('Görsel yükleme hatası:', error);
            }
        }

        // Input'u temizle (aynı dosya tekrar seçilebilsin diye)
        e.target.value = '';
    },

    // Sıkıştırma
    compressImage(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Max 800x800
                    if (width > 800 || height > 800) {
                        if (width > height) {
                            height = (height / width) * 800;
                            width = 800;
                        } else {
                            width = (width / height) * 800;
                            height = 800;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.7));
                };
            };
        });
    },

    // Önizleme güncelle
    updateImagePreviews() {
        const container = document.getElementById('aiImagePreviewContainer');
        if (this.uploadedImages.length === 0) {
            container.style.display = 'none';
            return;
        }

        container.style.display = 'flex';
        container.innerHTML = this.uploadedImages.map((src, index) => `
            <div class="ai-image-preview">
                <img src="${src}" onclick="AdminAIAssistant.openLightbox('${src}')" />
                <button class="remove-btn" onclick="AdminAIAssistant.removeImage(${index})">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
        `).join('');
    },

    removeImage(index) {
        this.uploadedImages.splice(index, 1);
        this.updateImagePreviews();
    },

    openLightbox(src) {
        const lightbox = document.getElementById('aiLightbox');
        const img = document.getElementById('aiLightboxImage');
        img.src = src;
        lightbox.classList.add('active');
    },

    closeLightbox() {
        document.getElementById('aiLightbox').classList.remove('active');
    },

    // Mesaj gönder
    sendMessage() {
        const input = document.getElementById('aiChatInput');
        const message = input.value.trim();
        const hasImages = this.uploadedImages.length > 0;

        if (!message && !hasImages || this.isProcessing) return;

        // Kullanıcı mesajını ekle
        this.addUserMessage(message, [...this.uploadedImages]);

        // State'i temizle
        input.value = '';
        const imagesToProcess = [...this.uploadedImages];
        this.uploadedImages = [];
        this.updateImagePreviews();

        // İşle
        this.processUserMessage(message, imagesToProcess);
    },

    // Teknik Çeviri ve İsim Güzelleştirme
    enhanceProductData(input) {
        let text = input.toLowerCase();

        // 1. Teknik Çeviri
        let translated = input;
        Object.entries(this.technicalTerms).forEach(([eng, tr]) => {
            const regex = new RegExp(`\\b${eng}\\b`, 'gi');
            translated = translated.replace(regex, tr);
        });

        // 2. Özel Temizlik (Örn: "set of 11" -> "11 Parçalı")
        translated = translated.replace(/set\s+of\s+(\d+)/gi, '$1 Parçalı');

        // 3. İsim Oluşturma (Ahenkli)
        let name = translated.split(',')[0].trim();
        if (name.length < 10) name = translated.substring(0, 50);

        // Marka tespiti (Beta, Bosch vs.)
        const brands = ['Beta', 'Bosch', 'Makita', 'DeWalt', 'Knipex', 'Stanley'];
        const foundBrand = brands.find(b => input.toUpperCase().includes(b.toUpperCase())) || 'Beta';

        return {
            translatedDesc: translated,
            suggestedName: `${foundBrand} ${name.toUpperCase()}`,
            brand: foundBrand
        };
    },

    // Anahtar:Değer çiftlerini çıkar
    extractKeyValuePairs(message) {
        const result = {
            name: null,
            price: null,
            stock: 20, // varsayılan
            sku: null,
            brand: null,
            category: null,
            description: null
        };

        // Bilinen tüm anahtarlar
        const keysPattern = "(?:isim|ürün\\s*adı|ad|sku|stok\\s*kodu|barkod|marka|fiyat|stok|adet|miktar|açıklama|kategori)";

        // Regex oluşturucu fonksiyon
        const getValue = (keyPattern) => {
            // Anahtar kelime ile başla, bir sonraki anahtar kelimeye veya satır sonuna kadar al
            // [^]*? lazy match ile her şeyi al (newline dahil)
            // Ama bir sonraki anahtar kelimenin başında dur
            const regex = new RegExp(`${keyPattern}\\s*:\\s*([^]*?)(?=\\s*(?:,|\\n|\\s+${keysPattern}\\s*:|$))`, "i");
            const match = message.match(regex);
            if (match) {
                let val = match[1].trim();
                // Sondaki virgülü temizle (varsa)
                if (val.endsWith(',')) val = val.slice(0, -1).trim();
                // Tırnakları temizle
                if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                    val = val.slice(1, -1).trim();
                }
                return val;
            }
            return null;
        };

        result.name = getValue("(?:isim|ürün\\s*adı|ad)");
        result.sku = getValue("(?:sku|stok\\s*kodu|barkod)");
        result.brand = getValue("marka");
        result.description = getValue("açıklama");

        const priceStr = getValue("fiyat");
        if (priceStr) {
            result.price = parseFloat(priceStr.replace(',', '.'));
        }

        const stockStr = getValue("(?:stok|adet|miktar)");
        if (stockStr) {
            result.stock = parseInt(stockStr);
        }

        const catStr = getValue("kategori");
        if (catStr) {
            result.category = this.findCategory(catStr);
        }

        console.log('🤖 AI: Extracted data:', result);
        return result;
    },

    // Kullanıcı mesajını ekle
    addUserMessage(text, images = []) {
        const container = document.getElementById('aiChatMessages');
        const messageEl = document.createElement('div');
        messageEl.className = 'ai-message user';

        let imagesHtml = '';
        if (images.length > 0) {
            imagesHtml = `
                <div class="ai-image-gallery">
                    ${images.map(img => `<img src="${img}" onclick="AdminAIAssistant.openLightbox('${img}')" />`).join('')}
                </div>
            `;
        }

        messageEl.innerHTML = `
            <div class="avatar"><i class="fa-solid fa-user"></i></div>
            <div class="bubble">
                ${text ? this.escapeHtml(text) : ''}
                ${imagesHtml}
            </div>
        `;
        container.appendChild(messageEl);
        this.scrollToBottom();
    },

    // Bot mesajını ekle
    addBotMessage(html, quickActions = []) {
        const container = document.getElementById('aiChatMessages');
        const messageEl = document.createElement('div');
        messageEl.className = 'ai-message bot';

        let actionsHtml = '';
        if (quickActions.length > 0) {
            actionsHtml = `
                <div class="ai-quick-actions">
                    ${quickActions.map(a => `
                        <button class="ai-quick-btn" data-action="${a.action}">${a.text}</button>
                    `).join('')}
                </div>
            `;
        }

        messageEl.innerHTML = `
            <div class="avatar"><i class="fa-solid fa-robot"></i></div>
            <div class="bubble">${html}${actionsHtml}</div>
        `;

        // Quick action event'leri
        container.appendChild(messageEl);
        messageEl.querySelectorAll('.ai-quick-btn').forEach(btn => {
            btn.addEventListener('click', () => this.handleQuickAction(btn.dataset.action));
        });

        this.scrollToBottom();
        return messageEl;
    },

    // Yazıyor animasyonu
    showTyping() {
        const container = document.getElementById('aiChatMessages');
        const typingEl = document.createElement('div');
        typingEl.className = 'ai-message bot';
        typingEl.id = 'aiTypingIndicator';
        typingEl.innerHTML = `
            <div class="avatar"><i class="fa-solid fa-robot"></i></div>
            <div class="ai-typing">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        container.appendChild(typingEl);
        this.scrollToBottom();
    },

    hideTyping() {
        const typing = document.getElementById('aiTypingIndicator');
        if (typing) typing.remove();
    },

    // Sohbeti aşağı kaydır
    scrollToBottom() {
        const container = document.getElementById('aiChatMessages');
        container.scrollTop = container.scrollHeight;
    },

    // Kullanıcı mesajını işle
    async processUserMessage(message, images = []) {
        this.isProcessing = true;
        this.showTyping();

        // Görsel yüklendiyse ama komut yoksa toplu ekleme varsayalım
        if (images.length > 0 && !message) {
            message = `${images.length} tane ürün ekle`;
        }

        // Doğal dil analizi
        const command = this.parseCommand(message);
        command.attachedImages = images; // Görselleri komuta bağla

        await this.delay(500); // Gerçekçi gecikme
        this.hideTyping();

        if (command.type === 'direct_product_entry') {
            this.handleDirectProductEntry(command);
        } else if (message.toLowerCase().includes('beta zımbaları yükle') || message.toLowerCase().includes('beta centre punches')) {
            // ÖZEL KOMUT: Beta Zımbaları Yükle
            const productsToAdd = [
                {
                    name: 'Beta 32 Serisi Nokta Zımbası Ø3mm',
                    sku: '32/3',
                    price: 290,
                    stock: 20,
                    brand: 'Beta',
                    category: 'hirdavat-el-aletleri',
                    description: 'Beta 32 Serisi Nokta Zımbası (Centre Punch). Ø3 mm'
                },
                {
                    name: 'Beta 32 Serisi Nokta Zımbası Ø4mm',
                    sku: '32/4',
                    price: 275, // Müşteri isteği: 275 TL
                    stock: 20,
                    brand: 'Beta',
                    category: 'hirdavat-el-aletleri',
                    description: 'Beta 32 Serisi Nokta Zımbası (Centre Punch). Ø4 mm'
                },
                {
                    name: 'Beta 32 Serisi Nokta Zımbası Ø5mm',
                    sku: '32/5',
                    price: 435,
                    stock: 20,
                    brand: 'Beta',
                    category: 'hirdavat-el-aletleri',
                    description: 'Beta 32 Serisi Nokta Zımbası (Centre Punch). Ø5 mm'
                }
            ];

            const imageUrl = 'https://www.beta-tools.com/resources/products/img_large/000320100.jpg'; // Beta 32 serisi görseli

            this.addBotMessage('🚀 <strong>Beta Zımba Seti Yükleniyor...</strong><br>3 adet ürün sırayla işleniyor.');

            let delay = 0;
            productsToAdd.forEach((prod, index) => {
                setTimeout(() => {
                    const cmd = {
                        type: 'direct_product_entry',
                        directData: prod,
                        attachedImages: [imageUrl]
                    };
                    // Otomatik kaydet
                    this.saveProductDirectly(cmd.directData, cmd.attachedImages);
                }, delay);
                delay += 1500; // Her ürün arası 1.5 sn bekle
            });

        } else if (command.type === 'bulk_add_products' || command.type === 'advanced_add') {
            this.showProductAddConfirmation(command);
        } else if (command.type === 'smart_product_entry') {
            this.showSmartProductEntry(command);
        } else if (command.type === 'add_product') {
            this.showSingleProductForm(command);
        } else if (command.type === 'update_price') {
            this.showPriceUpdateOptions(command);
        } else if (command.type === 'check_stock') {
            this.showStockStatus();
        } else if (command.type === 'help') {
            this.showHelpMessage();
        } else {
            this.handleUnknownCommand(message);
        }

        this.isProcessing = false;
    },

    // Komutu analiz et (Gelişmiş NLP ve Mantık Sorgulama)
    parseCommand(message) {
        const lowerMsg = message.toLowerCase();
        const command = { type: 'unknown', count: 1, category: null, subCategory: null, rules: {}, raw: message };

        // ========== ANAHTAR:DEĞER FORMATI TESPİTİ ==========
        // "isim:Beta Destekli Set, sku:31/SP6, marka:beta fiyat:3400" gibi komutları algıla
        const hasKeyValueFormat = message.includes(':') && (
            lowerMsg.includes('isim:') ||
            lowerMsg.includes('isim :') ||
            lowerMsg.includes('ürün adı:') ||
            lowerMsg.includes('ad:') ||
            lowerMsg.includes('fiyat:') ||
            lowerMsg.includes('marka:') ||
            lowerMsg.includes('sku:') ||
            lowerMsg.includes('stok:')
        );

        if (hasKeyValueFormat) {
            // Anahtar:Değer çiftlerini çıkar
            const extractedData = this.extractKeyValuePairs(message);

            if (extractedData.name || extractedData.price || extractedData.sku) {
                command.type = 'direct_product_entry';
                command.directData = extractedData;
                console.log('🤖 AI: Parsed key-value format:', extractedData);
                return command;
            }
        }

        // ========== DOĞRUDAN ÜRÜN GİRİŞİ TESPİTİ ==========
        // "bu ürünü gir stok adedi 20 fiyat 2500" gibi komutları algıla
        const hasDirectEntry = lowerMsg.includes('gir') || lowerMsg.includes('ekle') || lowerMsg.includes('kaydet');
        const stockMatch = message.match(/stok\s*(?:adedi|sayısı|miktarı)?[:\s]*(\d+)/i);
        const priceMatch = message.match(/fiyat[ıi]?[:\s]*(\d+(?:[.,]\d+)?)/i);
        const nameMatch = message.match(/(?:ürün\s*)?(?:adı|ismi|isim)[:\s]*["']?([^"'\n,]+)["']?/i);
        const skuMatch = message.match(/(?:sku|stok\s*kodu|barkod)[:\s]*["']?([^\s"',]+)["']?/i);
        const brandMatch = message.match(/marka[:\s]*["']?([^\s"',]+)["']?/i);
        const categoryMatch = message.match(/kategori[:\s]*["']?([^\s"',]+)["']?/i);
        const descMatch = message.match(/açıklama[:\s]*["']?([^"']+)["']?/i);

        // Eğer isim, stok veya fiyat bilgisi varsa ve "gir/ekle" komutu varsa
        if (hasDirectEntry && (stockMatch || priceMatch || nameMatch)) {
            command.type = 'direct_product_entry';
            command.directData = {
                stock: stockMatch ? parseInt(stockMatch[1]) : 20, // varsayılan 20
                price: priceMatch ? parseFloat(priceMatch[1].replace(',', '.')) : null,
                name: nameMatch ? nameMatch[1].trim() : null,
                sku: skuMatch ? skuMatch[1].trim() : null,
                brand: brandMatch ? brandMatch[1].trim() : null,
                category: categoryMatch ? this.findCategory(categoryMatch[1]) : null,
                description: descMatch ? descMatch[1].trim() : null
            };
            return command;
        }

        // 0. SMART PRODUCT DETECT - Artık direct_product_entry'e yönlendir
        const hasSku = message.match(/sku[:\s]*([^\s,]+)/i);
        const hasPrice = message.match(/(?:fiyat|price|tutarı)[:\s]*(\d+)/i);
        const hasDesc = (lowerMsg.includes('açıklama') || lowerMsg.includes('description') || lowerMsg.includes('set of') || lowerMsg.includes('wrench') || lowerMsg.includes('mm'));
        const hasName = message.match(/isim[:\s]*([^,\n]+)/i);

        // SKU, fiyat ve isim varsa direct entry olarak işle
        if ((hasSku || hasPrice || hasName) && hasDirectEntry) {
            command.type = 'direct_product_entry';
            command.directData = {
                stock: 20,
                price: hasPrice ? parseFloat(hasPrice[1]) : null,
                name: hasName ? hasName[1].trim().replace(/['"]/g, '') : null,
                sku: hasSku ? hasSku[1].trim() : null,
                brand: brandMatch ? brandMatch[1].trim() : null,
                description: descMatch ? descMatch[1].trim() : null
            };
            return command;
        }

        // Teknik giriş (eski smart_product_entry - geriye uyumluluk)
        const isTechnicalEntry = hasSku || (hasPrice && hasDesc);
        if (isTechnicalEntry && !hasDirectEntry) {
            command.type = 'smart_product_entry';
            command.sku = hasSku ? hasSku[1] : null;
            command.price = hasPrice ? hasPrice[1] : null;

            // Açıklamayı ayıkla
            let desc = message;
            if (hasSku) desc = desc.replace(hasSku[0], '');
            if (hasPrice) desc = desc.replace(hasPrice[0], '');

            const refined = this.enhanceProductData(desc);
            command.refined = refined;
            return command;
        }

        // 1. Gelişmiş Matematik ve Döviz Tespiti
        if (lowerMsg.includes('euro') || lowerMsg.includes('€') || lowerMsg.includes('dolar') || lowerMsg.includes('$')) {
            const multiplierMatch = lowerMsg.match(/(?:(?:\*|x|çarp)\s*)(\d+)/i);
            if (multiplierMatch) {
                command.rules.currencyMultiplier = parseInt(multiplierMatch[1]);
                command.type = 'advanced_add';
            }
        }

        // 2. Özel SKU ve Twist Kuralları
        if (lowerMsg.includes('sku') || lowerMsg.includes('stok kodu')) {
            if (lowerMsg.includes('olmadan') || lowerMsg.includes('temizle') || lowerMsg.includes('twist')) {
                command.rules.cleanSku = true;
            }
        }

        // 3. İsimlendirme Kuralları
        const prefixMatch = lowerMsg.match(/başına\s+["']?(.+?)["']?\s+yaz/i);
        if (prefixMatch) {
            command.rules.namePrefix = prefixMatch[1];
        }

        // 4. Miktar Tespiti (GELİŞTİRİLDİ: Sadece peşinde "tane/adet" olan bağımsız sayıları miktar say)
        const countMatch = lowerMsg.match(/\b(\d+)\s+(?:tane|adet|ürün)\b/i);
        if (countMatch) command.count = parseInt(countMatch[1]);

        // 5. Kategori ve Alt Kategori Tespiti
        command.category = this.findCategory(lowerMsg);
        command.subCategory = this.findSubCategory(lowerMsg);

        // Mevcut Regex Yakalamaları (GELİŞTİRİLDİ: "tane/adet" zorunlu hale getirildi)
        const bulkMatch = lowerMsg.match(
            /\b(\d+)\s+(?:tane|adet|ürün)\b\s*(.+?)\s*(?:üst\s*)?kategori(?:si)?(?:ne|sine)?\s*(.+?)\s*alt\s*kategori(?:si)?(?:ne|sine)?/i
        );

        if (bulkMatch && command.type === 'unknown') {
            command.type = 'bulk_add_products';
            command.count = parseInt(bulkMatch[1]);
            command.category = this.findCategory(bulkMatch[2]);
            command.subCategory = this.findSubCategory(bulkMatch[3]);
        } else if (command.type === 'unknown') {
            if (lowerMsg.includes('ürün ekle') || lowerMsg.includes('yeni ürün') || lowerMsg.includes('gir')) {
                command.type = (command.count > 1) ? 'bulk_add_products' : 'add_product';
            }
        }

        // Fiyat güncelleme
        if (lowerMsg.includes('fiyat') && (lowerMsg.includes('güncelle') || lowerMsg.includes('zam') || lowerMsg.includes('indirim'))) {
            const percentMatch = lowerMsg.match(/%?\s*(\d+)\s*%?/);
            const brandMatch2 = lowerMsg.match(/(bosch|makita|dewalt|beta|knipex|black\s*decker|stanley|ingco|rtrmax|wilke)/i);
            return {
                type: 'update_price',
                percent: percentMatch ? parseInt(percentMatch[1]) : null,
                brand: brandMatch2 ? brandMatch2[1] : null,
                isDiscount: lowerMsg.includes('indirim')
            };
        }

        // Diğer basit komutlar
        if (lowerMsg.includes('stok') && (lowerMsg.includes('kontrol') || lowerMsg.includes('durum'))) return { type: 'check_stock' };
        if (lowerMsg.includes('yardım') || lowerMsg.includes('help')) return { type: 'help' };

        return command;
    },

    // Kategori bul
    findCategory(text) {
        const categories = {
            'akülü aletler': 'akulu-aletler',
            'akulu aletler': 'akulu-aletler',
            'jeneratörler': 'jeneratorler',
            'jeneratorler': 'jeneratorler',
            'hobi aletleri': 'hobi-aletleri',
            'aksesuarlar': 'aksesuarlar',
            'aksesuar': 'aksesuarlar',
            'elektrikli el aletleri': 'elektrikli-el-aletleri',
            'elektrikli aletler': 'elektrikli-el-aletleri',
            'ölçme ve kontrol': 'olcme-ve-kontrol-aletleri',
            'ölçme aletleri': 'olcme-ve-kontrol-aletleri',
            'aşındırıcı': 'asindirici-kesici',
            'kesici uçlar': 'asindirici-kesici',
            'yapıştırıcı': 'yapi-kimyasallari',
            'kimyasal': 'yapi-kimyasallari',
            'kaynak': 'kaynak-malzemeleri',
            'kaynak malzemeleri': 'kaynak-malzemeleri',
            'hırdavat': 'hirdavat-el-aletleri',
            'el aletleri': 'hirdavat-el-aletleri',
            'iş güvenliği': 'is-guvenligi-ve-calisma-ekipmanlari',
            'bahçe': 'bahce-aletleri',
            'bahçe aletleri': 'bahce-aletleri'
        };

        const cleanText = text.toLowerCase().trim();
        for (const [key, value] of Object.entries(categories)) {
            if (cleanText.includes(key)) return value;
        }
        return null;
    },

    // Alt kategori bul
    findSubCategory(text) {
        const cleanText = text.toLowerCase().trim();

        // Elmas testere varyasyonları
        if (cleanText.includes('elmas') || cleanText.includes('testere')) {
            return 'Elmas Testereler';
        }

        // Diğer alt kategoriler
        const subCategories = [
            'Akülü Matkap', 'Akülü Vidalama', 'Avuç Taşlama', 'Dekupaj',
            'Matkap Uçları', 'Delik Testerleri', 'Vidalama Uçları',
            'Silikon', 'Epoksi', 'Kaynak Makinesi', 'Elektrot',
            'Tornavida', 'Anahtar Takımı', 'Pense', 'Çekiç',
            'Baret', 'Eldiven', 'Gözlük', 'Çit Kesme', 'Çim Biçme'
        ];

        for (const sub of subCategories) {
            if (cleanText.includes(sub.toLowerCase())) return sub;
        }

        return cleanText.charAt(0).toUpperCase() + cleanText.slice(1);
    },

    // Toplu ürün ekleme onay ekranı
    showProductAddConfirmation(command) {
        const categoryName = command.category
            ? this.getCategoryTitle(command.category)
            : 'Belirtilmedi';

        const subCategoryName = command.subCategory || command.rawSubCategory || 'Belirtilmedi';

        this.pendingCommand = command;

        const bubbleEl = this.addBotMessage(`
            Anladım! <strong>${command.count} adet ürün</strong> eklemek istiyorsunuz.
            
            <div class="ai-command-preview">
                <h4><i class="fa-solid fa-list-check"></i> İşlem Özeti</h4>
                <ul>
                    <li><strong>Miktar:</strong> ${command.count} adet</li>
                    <li><strong>Üst Kategori:</strong> ${categoryName}</li>
                    <li><strong>Alt Kategori:</strong> ${subCategoryName}</li>
                    ${command.rules.currencyMultiplier ? `<li><strong>Fiyat Hesabı:</strong> x${command.rules.currencyMultiplier} (Döviz Çevrimi)</li>` : ''}
                    ${command.rules.cleanSku ? `<li><strong>SKU Kuralı:</strong> Temiz Veri (Gelişmiş Twist)</li>` : ''}
                    ${command.rules.namePrefix ? `<li><strong>İsim Öneki:</strong> ${command.rules.namePrefix}</li>` : ''}
                    ${command.attachedImages?.length > 0 ? `<li><strong>Yüklenen Görsel:</strong> ${command.attachedImages.length} adet</li>` : ''}
                </ul>
                
                ${command.attachedImages?.length > 0 ? `
                    <div class="ai-image-gallery">
                        ${command.attachedImages.map(img => `<img src="${img}" />`).join('')}
                    </div>
                ` : ''}

                <div class="ai-confirm-btns">
                    <button class="ai-confirm-btn confirm action-confirm">
                        <i class="fa-solid fa-check"></i> Devam Et
                    </button>
                    <button class="ai-confirm-btn cancel action-cancel">
                        <i class="fa-solid fa-xmark"></i> İptal
                    </button>
                </div>
            </div>
        `);

        // Buton eventleri (Scoped query ile - ID çakışması önlendi)
        bubbleEl.querySelector('.action-confirm')?.addEventListener('click', () => {
            this.startBulkProductAdd(command);
        });
        bubbleEl.querySelector('.action-cancel')?.addEventListener('click', () => {
            this.addBotMessage('İşlem iptal edildi. Başka bir şey yapmamı ister misiniz?');
            this.pendingCommand = null;
        });
    },

    // Toplu ürün ekleme başlat
    async startBulkProductAdd(command) {
        const categorySlug = command.category || 'aksesuarlar'; // Varsayılan
        const subCategory = command.subCategory || command.rawSubCategory || '';
        const count = command.count;

        this.addBotMessage(`
            <i class="fa-solid fa-rocket"></i> Ürünler ekleniyor...
            <div class="ai-progress-container">
                <div class="ai-progress-bar" id="aiProgressBar"></div>
            </div>
            <div class="ai-progress-text" id="aiProgressText">0 / ${count}</div>
        `);

        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < count; i++) {
            try {
                // Görsel belirle
                let imageToUse = null;
                if (command.attachedImages && command.attachedImages.length > 0) {
                    imageToUse = command.attachedImages[i % command.attachedImages.length];
                }

                // Ürün verisi oluştur (Kuralları uygula)
                const productData = this.generateProductData(categorySlug, subCategory, i + 1, imageToUse, command.rules);

                // API'ye gönder
                if (typeof ADMIN_API !== 'undefined') {
                    const response = await ADMIN_API.createProduct(productData);
                    if (response.success) {
                        successCount++;
                    } else {
                        failCount++;
                    }
                } else {
                    // ADMIN_API yoksa localStorage'a kaydet
                    this.saveProductLocally(productData);
                    successCount++;
                }

                // Progress güncelle
                const progress = Math.round(((i + 1) / count) * 100);
                document.getElementById('aiProgressBar').style.width = `${progress}%`;
                document.getElementById('aiProgressText').textContent = `${i + 1} / ${count}`;

                // Kısa gecikme (rate limit önleme)
                await this.delay(200);

            } catch (error) {
                console.error('Ürün ekleme hatası:', error);
                failCount++;
            }
        }

        // Sonuç
        if (failCount === 0) {
            this.addBotMessage(`
                <div class="ai-result-success">
                    <i class="fa-solid fa-circle-check"></i>
                    <strong>Tamamlandı!</strong>
                </div>
                ${successCount} ürün başarıyla eklendi.
                <br><br>
                Ürünleri görmek için sayfayı yenileyebilir veya ürün listesini kontrol edebilirsiniz.
            `, [
                { text: '🔄 Sayfayı Yenile', action: 'refresh' },
                { text: '➕ Daha Fazla Ekle', action: 'bulkAdd' }
            ]);
        } else {
            this.addBotMessage(`
                <div class="ai-result-error">
                    <i class="fa-solid fa-exclamation-triangle"></i>
                    <strong>Kısmen Tamamlandı</strong>
                </div>
                ${successCount} başarılı, ${failCount} başarısız.
                <br><br>
                Sunucu bağlantısını kontrol edin ve tekrar deneyin.
            `);
        }

        // Ürün listesini yenile (eğer loadProducts fonksiyonu varsa)
        if (typeof loadProducts === 'function') {
            setTimeout(() => loadProducts(), 1000);
        }
    },

    // Ürün verisi oluştur
    generateProductData(categorySlug, subCategory, index, manualImage = null, rules = {}) {
        const categoryTitle = this.getCategoryTitle(categorySlug);
        const brands = ['Wilke', 'Bosch', 'Makita', 'DeWalt', 'Stanley', 'Ingco', 'Rtrmax', 'Beta', 'Knipex'];
        const randomBrand = rules.namePrefix && rules.namePrefix.toLowerCase().includes('wilke') ? 'Wilke' : brands[Math.floor(Math.random() * brands.length)];

        let basePrice = Math.floor(Math.random() * 900) + 100;

        // Kural: Döviz Çevrimi
        if (rules.currencyMultiplier) {
            basePrice = basePrice * rules.currencyMultiplier;
        }

        let sku = `SKU-${Date.now()}-${index}`;
        // Kural: SKU Temizleme (Twist)
        if (rules.cleanSku) {
            sku = sku.replace(/[^0-9]/g, '');
        }

        let pName = `${subCategory || categoryTitle} Ürün ${index}`;
        // Kural: İsim Öneki
        if (rules.namePrefix) {
            pName = `${rules.namePrefix} ${pName}`;
        }

        return {
            name: pName,
            brand: randomBrand,
            category: categoryTitle,
            categorySlug: categorySlug,
            allCategories: [categorySlug],
            subCategory: subCategory || '',
            price: basePrice,
            salePrice: null,
            stock: 20,
            unit: 'Adet',
            description: `${randomBrand} marka ${subCategory || categoryTitle}. Profesyonel kalite, Galata Çarşı güvencesiyle.`,
            sku: sku,
            barcode: sku,
            isActive: true,
            isNew: true,
            isPopular: false,
            mainImage: manualImage || `https://placehold.co/400x400/6366f1/fff?text=${encodeURIComponent(randomBrand.charAt(0))}`
        };
    },

    // LocalStorage'a kaydet
    saveProductLocally(product) {
        const localProduct = {
            ...product,
            _id: 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            id: 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString()
        };

        let products = [];
        try {
            products = JSON.parse(localStorage.getItem('galatacarsi_products') || '[]');
        } catch (e) {
            products = [];
        }

        products.push(localProduct);
        localStorage.setItem('galatacarsi_products', JSON.stringify(products));
    },

    // Akıllı Ürün Girişi Onay Ekranı
    showSmartProductEntry(command) {
        const refined = command.refined;

        const bubbleEl = this.addBotMessage(`
            🚀 <strong>Harika! Ürünü analiz ettim ve teknik çevirisini yaptım.</strong>
            <br><br>
            <div class="ai-command-preview">
                <h4><i class="fa-solid fa-microchip"></i> Akıllı Analiz Sonucu</h4>
                <ul style="font-size: 13px;">
                    <li><strong>Önerilen İsim:</strong> ${refined.suggestedName}</li>
                    <li><strong>SKU / Kod:</strong> ${command.sku || 'Otomatik'}</li>
                    <li><strong>Fiyat:</strong> ₺${command.price || '?'}</li>
                    <li><strong>Kategori:</strong> Hırdavat ve El Aletleri</li>
                    <li><strong>Marka:</strong> ${refined.brand}</li>
                </ul>
                
                <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; margin: 10px 0; font-size: 12px; border-left: 3px solid #6366f1;">
                    <strong>Teknik Çeviri / Açıklama:</strong><br>
                    ${refined.translatedDesc}
                </div>

                <div class="ai-confirm-btns">
                    <button class="ai-confirm-btn confirm action-confirm-smart">
                        <i class="fa-solid fa-file-export"></i> Formu Doldur ve Aç
                    </button>
                    <button class="ai-confirm-btn cancel action-cancel-smart">
                        <i class="fa-solid fa-xmark"></i> İptal
                    </button>
                </div>
            </div>
        `);

        // Buton eventleri (Scoped query)
        bubbleEl.querySelector('.action-confirm-smart')?.addEventListener('click', () => {
            this.fillProductForm(command);
        });
        bubbleEl.querySelector('.action-cancel-smart')?.addEventListener('click', () => {
            this.addBotMessage('İşlem iptal edildi.');
        });
    },

    // Formu doldur
    fillProductForm(command) {
        const refined = command.refined;

        // Modal aç
        if (typeof openModal === 'function') {
            openModal();
        } else {
            const modal = document.getElementById('productModal');
            if (modal) modal.classList.add('active');
        }

        // Verileri bas
        setTimeout(() => {
            const fields = {
                'productName': refined.suggestedName,
                'productSKU': command.sku || '',
                'productPrice': command.price || '',
                'productBrand': refined.brand || 'Beta',
                'productCategory': 'hirdavat-el-aletleri',
                'productDescription': refined.translatedDesc,
                'productStock': 50
            };

            for (const [id, value] of Object.entries(fields)) {
                const el = document.getElementById(id);
                if (el) el.value = value;
            }

            // Kategori seçimi için manual trigger
            const catSelect = document.getElementById('productCategory');
            if (catSelect) {
                catSelect.dispatchEvent(new Event('change'));
            }

            this.addBotMessage('✅ Tüm veriler forma aktarıldı. Kontrol edip kaydedebilirsiniz!');
            this.toggleChat(); // Chat'i kapat ki formu görsün
        }, 600);
    },

    // Kategori başlığı al
    getCategoryTitle(slug) {
        const titles = {
            'akulu-aletler': 'Akülü Aletler',
            'jeneratorler': 'Jeneratörler',
            'hobi-aletleri': 'Hobi Aletleri',
            'aksesuarlar': 'Aksesuarlar',
            'elektrikli-el-aletleri': 'Elektrikli El Aletleri',
            'olcme-ve-kontrol-aletleri': 'Ölçme ve Kontrol Aletleri',
            'asindirici-kesici': 'Aşındırıcı ve Kesici Uçlar',
            'yapi-kimyasallari': 'Yapıştırıcı, Dolgu ve Kimyasallar',
            'kaynak-malzemeleri': 'Kaynak Malzemeleri',
            'hirdavat-el-aletleri': 'Hırdavat ve El Aletleri',
            'is-guvenligi-ve-calisma-ekipmanlari': 'İş Güvenliği ve Çalışma Ekipmanları',
            'bahce-aletleri': 'Bahçe Aletleri'
        };
        return titles[slug] || slug;
    },

    // Tek ürün formu göster
    showSingleProductForm(command) {
        this.addBotMessage(`
            Yeni ürün eklemek için ürün ekleme panelini açıyorum...
        `);

        // Mevcut openModal fonksiyonunu çağır
        setTimeout(() => {
            if (typeof openModal === 'function') {
                openModal();
            } else {
                // Manuel açma
                const modal = document.getElementById('productModal');
                if (modal) modal.classList.add('active');
            }
        }, 500);
    },

    // ========== YENİ: DOĞRUDAN ÜRÜN GİRİŞİ ==========
    // "bu ürünü gir stok adedi 20 fiyat 2500" gibi komutları işle
    handleDirectProductEntry(command) {
        const data = command.directData;

        // Mevcut modal'daki değerleri al (eğer açıksa)
        const currentName = document.getElementById('productName')?.value || '';
        const currentBrand = document.getElementById('productBrand')?.value || '';
        const currentCategory = document.getElementById('productCategory')?.value || '';
        const currentImage = document.getElementById('productImagePreview')?.src || '';

        // Özet oluştur
        const summary = [];
        if (data.name) summary.push(`<li><strong>Ürün Adı:</strong> ${data.name}</li>`);
        else if (currentName) summary.push(`<li><strong>Ürün Adı:</strong> ${currentName} (mevcut)</li>`);

        if (data.price) summary.push(`<li><strong>Fiyat:</strong> ₺${data.price.toLocaleString('tr-TR')}</li>`);
        if (data.stock) summary.push(`<li><strong>Stok Adedi:</strong> ${data.stock}</li>`);
        if (data.brand) summary.push(`<li><strong>Marka:</strong> ${data.brand}</li>`);
        else if (currentBrand) summary.push(`<li><strong>Marka:</strong> ${currentBrand} (mevcut)</li>`);

        if (data.sku) summary.push(`<li><strong>SKU/Barkod:</strong> ${data.sku}</li>`);
        if (data.description) summary.push(`<li><strong>Açıklama:</strong> ${data.description.substring(0, 50)}${data.description.length > 50 ? '...' : ''}</li>`);
        if (data.category) summary.push(`<li><strong>Kategori:</strong> ${this.getCategoryTitle(data.category)}</li>`);
        else if (currentCategory) summary.push(`<li><strong>Kategori:</strong> ${this.getCategoryTitle(currentCategory)} (mevcut)</li>`);

        // Görsel varsa ekle
        if (command.attachedImages && command.attachedImages.length > 0) {
            summary.push(`<li><strong>Görsel:</strong> ${command.attachedImages.length} adet yüklendi</li>`);
        } else if (currentImage && !currentImage.includes('placeholder')) {
            summary.push(`<li><strong>Görsel:</strong> Mevcut görsel kullanılacak</li>`);
        }

        const bubbleEl = this.addBotMessage(`
            📝 <strong>Ürün bilgilerini algıladım!</strong>
            <br><br>
            <div class="ai-command-preview">
                <h4><i class="fa-solid fa-box"></i> Ürün Detayları</h4>
                <ul style="font-size: 13px;">
                    ${summary.join('')}
                </ul>
                
                ${command.attachedImages?.length > 0 ? `
                    <div class="ai-image-gallery" style="margin: 10px 0;">
                        ${command.attachedImages.map(img => `<img src="${img}" style="max-width: 60px; border-radius: 6px;" />`).join('')}
                    </div>
                ` : ''}

                <div class="ai-confirm-btns">
                    <button class="ai-confirm-btn confirm action-fill-form">
                        <i class="fa-solid fa-edit"></i> Formu Doldur
                    </button>
                    <button class="ai-confirm-btn confirm action-save-direct" style="background: linear-gradient(135deg, #22c55e, #16a34a);">
                        <i class="fa-solid fa-save"></i> Hemen Kaydet
                    </button>
                    <button class="ai-confirm-btn cancel action-cancel-direct">
                        <i class="fa-solid fa-xmark"></i> İptal
                    </button>
                </div>
            </div>
        `);

        // Formu Doldur butonu
        bubbleEl.querySelector('.action-fill-form')?.addEventListener('click', () => {
            this.fillFormWithDirectData(data, command.attachedImages);
        });

        // Hemen Kaydet butonu
        bubbleEl.querySelector('.action-save-direct')?.addEventListener('click', () => {
            this.saveProductDirectly(data, command.attachedImages);
        });

        // İptal butonu
        bubbleEl.querySelector('.action-cancel-direct')?.addEventListener('click', () => {
            this.addBotMessage('İşlem iptal edildi. Başka bir şey yapmamı ister misiniz?');
        });
    },

    // Formu doğrudan verilerle doldur
    fillFormWithDirectData(data, images = []) {
        // Modal'ı aç
        if (typeof openModal === 'function') {
            openModal();
        } else {
            const modal = document.getElementById('productModal');
            if (modal) modal.classList.add('active');
        }

        setTimeout(() => {
            // Mevcut değerleri kontrol et ve sadece yeni değerleri yaz
            if (data.name) {
                const el = document.getElementById('productName');
                if (el) el.value = data.name;
            }
            if (data.price) {
                const el = document.getElementById('productPrice');
                if (el) el.value = data.price;
            }
            if (data.stock !== null) {
                const el = document.getElementById('productStock');
                if (el) el.value = data.stock;
            }
            if (data.brand) {
                const el = document.getElementById('productBrand');
                if (el) el.value = data.brand;
            }
            if (data.sku) {
                const skuEl = document.getElementById('productSKU');
                const barcodeEl = document.getElementById('productBarcode');
                if (skuEl) skuEl.value = data.sku;
                if (barcodeEl) barcodeEl.value = data.sku;
            }
            if (data.category) {
                const el = document.getElementById('productCategory');
                if (el) {
                    el.value = data.category;
                    el.dispatchEvent(new Event('change'));
                }
            }
            if (data.description) {
                const el = document.getElementById('productDescription');
                if (el) el.value = data.description;
            }

            // Görsel varsa yükle
            if (images && images.length > 0) {
                const preview = document.getElementById('productImagePreview');
                const input = document.getElementById('productMainImage');
                if (preview) {
                    preview.src = images[0];
                    preview.style.display = 'block';
                }
                // Base64'ü hidden input'a kaydet
                const hiddenInput = document.getElementById('productMainImageBase64');
                if (hiddenInput) {
                    hiddenInput.value = images[0];
                }
            }

            this.addBotMessage('✅ Form dolduruldu! Diğer alanları kontrol edip kaydedebilirsiniz.');
            this.toggleChat(); // Chat'i kapat ki formu görsün
        }, 600);
    },

    // Ürünü doğrudan kaydet
    async saveProductDirectly(data, images = []) {
        this.showTyping();

        // Mevcut modal'daki değerleri al
        const currentName = document.getElementById('productName')?.value || '';
        const currentBrand = document.getElementById('productBrand')?.value || '';
        const currentCategory = document.getElementById('productCategory')?.value || 'aksesuarlar';
        const currentImage = document.getElementById('productImagePreview')?.src || '';

        // Ürün verisi oluştur
        const productData = {
            name: data.name || currentName || `Ürün ${Date.now()}`,
            brand: data.brand || currentBrand || 'Genel',
            category: this.getCategoryTitle(data.category || currentCategory),
            categorySlug: data.category || currentCategory,
            allCategories: [data.category || currentCategory],
            price: data.price || 0,
            salePrice: null,
            stock: data.stock || 20,
            unit: 'Adet',
            description: data.description || `${data.brand || currentBrand || 'Kaliteli'} marka ürün. Galata Çarşı güvencesiyle.`,
            sku: data.sku || `SKU-${Date.now()}`,
            barcode: data.sku || `${Date.now()}`,
            isActive: true,
            isNew: true,
            isPopular: false,
            mainImage: (images && images.length > 0) ? images[0] :
                (currentImage && !currentImage.includes('placeholder') ? currentImage :
                    `https://placehold.co/400x400/6366f1/fff?text=${encodeURIComponent((data.brand || 'G').charAt(0))}`)
        };

        try {
            let success = false;
            let response;
            let isUpdate = false;
            let productId = null;

            // ADMIN_API varsa kullan
            if (typeof ADMIN_API !== 'undefined') {

                // Önce mükerrer kontrolü yap (SKU veya İsim)
                if (typeof products !== 'undefined' && Array.isArray(products)) {
                    const existingProduct = products.find(p =>
                        (productData.sku && p.sku === productData.sku) ||
                        (p.name.toLowerCase() === productData.name.toLowerCase())
                    );

                    if (existingProduct) {
                        isUpdate = true;
                        productId = existingProduct._id || existingProduct.id;
                        console.log('🤖 AI: Mevcut ürün bulundu, güncelleniyor:', productId);
                    }
                }

                if (isUpdate && productId) {
                    response = await ADMIN_API.updateProduct(productId, productData);
                } else {
                    response = await ADMIN_API.createProduct(productData);
                }

                success = response && response.success;

                if (!success) {
                    // Backend hatasını yakala
                    throw new Error(response.error || response.message || 'API Hatası');
                }

            } else {
                // localStorage'a kaydet
                this.saveProductLocally(productData);
                success = true;
            }

            this.hideTyping();

            if (success) {
                const actionText = isUpdate ? 'Güncellendi' : 'Kaydedildi';
                this.addBotMessage(`
                    <div class="ai-result-success">
                        <i class="fa-solid fa-circle-check"></i>
                        <strong>Ürün Başarıyla ${actionText}!</strong>
                    </div>
                    <ul style="font-size: 13px; margin-top: 10px;">
                        <li><strong>Adı:</strong> ${productData.name}</li>
                        <li><strong>Fiyat:</strong> ₺${productData.price.toLocaleString('tr-TR')}</li>
                        <li><strong>Stok:</strong> ${productData.stock} adet</li>
                         ${isUpdate ? '<li><em>(Mevcut ürün güncellendi)</em></li>' : ''}
                    </ul>
                `, [
                    { text: '➕ Başka Ürün Ekle', action: 'addProduct' },
                    { text: '🔄 Listeyi Yenile', action: 'refresh' }
                ]);

                // Ürün listesini yenile
                if (typeof loadProducts === 'function') {
                    setTimeout(() => loadProducts(), 500);
                }

                // Modalı kapat (eğer açıksa)
                if (typeof closeModal === 'function') {
                    closeModal();
                } else {
                    const modal = document.getElementById('productModal');
                    if (modal) modal.classList.remove('active');
                }
            } else {
                throw new Error('Kayıt başarısız');
            }
        } catch (error) {
            this.hideTyping();
            this.addBotMessage(`
                <div class="ai-result-error">
                    <i class="fa-solid fa-exclamation-triangle"></i>
                    <strong>Kayıt Hatası</strong>
                </div>
                Ürün kaydedilemedi. Sunucu bağlantısını kontrol edin.
                <br><br>
                <small>Hata: ${error.message}</small>
            `, [
                { text: '🔄 Tekrar Dene', action: 'addProduct' }
            ]);
        }
    },

    // Fiyat güncelleme seçenekleri
    showPriceUpdateOptions(command) {
        if (command.brand && command.percent) {
            this.addBotMessage(`
                ${command.brand} markasına <strong>%${command.percent}</strong> ${command.isDiscount ? 'indirim' : 'zam'} uygulamak istiyorsunuz.
                <br><br>
                Fiyat güncelleme panelini açıyorum...
            `);

            setTimeout(() => {
                if (typeof openPriceIncreaseModal === 'function') {
                    openPriceIncreaseModal();
                }
            }, 500);
        } else {
            this.addBotMessage(`
                Fiyat güncellemesi için aşağıdaki formatta yazabilirsiniz:
                <br><br>
                <code>"Bosch markasına %10 zam yap"</code>
                <br>veya<br>
                <code>"Makita ürünlerine %15 indirim uygula"</code>
            `, [
                { text: '💰 Fiyat Panelini Aç', action: 'openPriceModal' }
            ]);
        }
    },

    // Stok durumu göster
    async showStockStatus() {
        this.showTyping();
        await this.delay(800);
        this.hideTyping();

        // Global products değişkeninden al
        let products = [];
        if (typeof window.products !== 'undefined') {
            products = window.products;
        } else {
            try {
                products = JSON.parse(localStorage.getItem('galatacarsi_products') || '[]');
            } catch (e) {
                products = [];
            }
        }

        const lowStock = products.filter(p => p.stock > 0 && p.stock < 10);
        const outOfStock = products.filter(p => p.stock === 0);

        this.addBotMessage(`
            <strong>📊 Stok Durumu Raporu</strong>
            <br><br>
            <div style="display: grid; gap: 8px;">
                <div style="background: rgba(239, 68, 68, 0.2); padding: 10px; border-radius: 8px;">
                    <strong style="color: #ef4444;">⚠️ Stok Tükendi:</strong> ${outOfStock.length} ürün
                </div>
                <div style="background: rgba(234, 179, 8, 0.2); padding: 10px; border-radius: 8px;">
                    <strong style="color: #eab308;">⚡ Kritik Stok:</strong> ${lowStock.length} ürün (10'dan az)
                </div>
                <div style="background: rgba(34, 197, 94, 0.2); padding: 10px; border-radius: 8px;">
                    <strong style="color: #22c55e;">✅ Toplam Ürün:</strong> ${products.length} adet
                </div>
            </div>
            ${lowStock.length > 0 ? `
                <br>
                <strong>Kritik stoktaki ürünler:</strong>
                <ul style="font-size: 12px; margin-top: 8px;">
                    ${lowStock.slice(0, 5).map(p => `<li>${p.name} (${p.stock} adet)</li>`).join('')}
                    ${lowStock.length > 5 ? `<li>... ve ${lowStock.length - 5} ürün daha</li>` : ''}
                </ul>
            ` : ''}
        `);
    },

    // Yardım mesajı
    showHelpMessage() {
        this.addBotMessage(`
            <strong>🤖 Yapabileceklerim:</strong>
            <br><br>
            <ul style="margin: 0; padding-left: 18px; font-size: 13px;">
                <li><strong>Toplu Ürün Ekleme:</strong><br>
                    <code>"10 tane aksesuarlar kategorisine elmas testereler alt kategorisine ürün ekle"</code>
                </li>
                <li style="margin-top: 8px;"><strong>Fiyat Güncelleme:</strong><br>
                    <code>"Bosch markasına %10 zam yap"</code>
                </li>
                <li style="margin-top: 8px;"><strong>Stok Kontrolü:</strong><br>
                    <code>"Stok durumunu göster"</code>
                </li>
                <li style="margin-top: 8px;"><strong>Tek Ürün Ekleme:</strong><br>
                    <code>"Yeni ürün ekle"</code>
                </li>
            </ul>
        `, [
            { text: '🛒 Ürün Ekle', action: 'addProduct' },
            { text: '📦 Toplu Ekle', action: 'bulkAdd' },
            { text: '📊 Stok Durumu', action: 'checkStock' }
        ]);
    },

    // Bilinmeyen komut
    handleUnknownCommand(message) {
        this.addBotMessage(`
            Üzgünüm, bu komutu tam anlayamadım. 🤔
            <br><br>
            Şunları deneyebilirsiniz:
        `, [
            { text: '❓ Yardım', action: 'help' },
            { text: '🛒 Ürün Ekle', action: 'addProduct' },
            { text: '📦 Toplu Ekle', action: 'bulkAdd' }
        ]);
    },

    // Quick Action Handler
    handleQuickAction(action) {
        switch (action) {
            case 'addProduct':
                this.addUserMessage('Yeni ürün ekle');
                this.showSingleProductForm({});
                break;
            case 'bulkAdd':
                this.addBotMessage(`
                    Toplu ürün eklemek için şu formatta yazabilirsiniz:
                    <br><br>
                    <code>"10 tane [kategori] kategorisine [alt kategori] alt kategorisine ürün ekle"</code>
                    <br><br>
                    Örnek: <code>"5 tane aksesuarlar kategorisine elmas testereler alt kategorisine ürün ekle"</code>
                `);
                break;
            case 'imageUpload':
                document.getElementById('aiImageInput').click();
                break;
            case 'updatePrice':
                this.addUserMessage('Fiyat güncelle');
                this.showPriceUpdateOptions({});
                break;
            case 'checkStock':
                this.addUserMessage('Stok durumu');
                this.showStockStatus();
                break;
            case 'help':
                this.addUserMessage('Yardım');
                this.showHelpMessage();
                break;
            case 'refresh':
                window.location.reload();
                break;
            case 'openPriceModal':
                if (typeof openPriceIncreaseModal === 'function') {
                    openPriceIncreaseModal();
                }
                break;
        }
    },

    // Yardımcı fonksiyonlar
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// Sayfa yüklendiğinde başlat
document.addEventListener('DOMContentLoaded', () => {
    // Sadece admin panelinde çalışsın
    if (window.location.pathname.includes('/admin/')) {
        AdminAIAssistant.init();
    }
});

// Global erişim için
window.AdminAIAssistant = AdminAIAssistant;
