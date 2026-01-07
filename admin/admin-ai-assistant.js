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

        if (command.type === 'bulk_add_products' || command.type === 'advanced_add') {
            this.showProductAddConfirmation(command);
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
        const command = { type: 'unknown', count: 1, category: null, subCategory: null, rules: {} };

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

        // 4. Miktar Tespiti
        const countMatch = lowerMsg.match(/(\d+)\s*(?:tane|adet|ürün)/i);
        if (countMatch) command.count = parseInt(countMatch[1]);

        // 5. Kategori ve Alt Kategori Tespiti
        command.category = this.findCategory(lowerMsg);
        command.subCategory = this.findSubCategory(lowerMsg);

        // Mevcut Regex Yakalamaları (Geriye Dönük Uyumluluk)
        const bulkMatch = lowerMsg.match(
            /(\d+)\s*(?:tane|adet)?\s*(.+?)\s*(?:üst\s*)?kategori(?:si)?(?:ne|sine)?\s*(.+?)\s*alt\s*kategori(?:si)?(?:ne|sine)?/i
        );

        if (bulkMatch && command.type === 'unknown') {
            command.type = 'bulk_add_products';
            command.count = parseInt(bulkMatch[1]);
            command.category = this.findCategory(bulkMatch[2]);
            command.subCategory = this.findSubCategory(bulkMatch[3]);
        } else if (command.type === 'unknown') {
            if (lowerMsg.includes('ürün ekle') || lowerMsg.includes('yeni ürün')) {
                command.type = (command.count > 1) ? 'bulk_add_products' : 'add_product';
            }
        }

        // Fiyat güncelleme
        if (lowerMsg.includes('fiyat') && (lowerMsg.includes('güncelle') || lowerMsg.includes('zam') || lowerMsg.includes('indirim'))) {
            const percentMatch = lowerMsg.match(/%?\s*(\d+)\s*%?/);
            const brandMatch = lowerMsg.match(/(bosch|makita|dewalt|beta|knipex|black\s*decker|stanley|ingco|rtrmax|wilke)/i);
            return {
                type: 'update_price',
                percent: percentMatch ? parseInt(percentMatch[1]) : null,
                brand: brandMatch ? brandMatch[1] : null,
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
                    <button class="ai-confirm-btn confirm" id="aiConfirmBulkAdd">
                        <i class="fa-solid fa-check"></i> Devam Et
                    </button>
                    <button class="ai-confirm-btn cancel" id="aiCancelBulkAdd">
                        <i class="fa-solid fa-xmark"></i> İptal
                    </button>
                </div>
            </div>
        `);

        // Buton eventleri
        setTimeout(() => {
            document.getElementById('aiConfirmBulkAdd')?.addEventListener('click', () => {
                this.startBulkProductAdd(command);
            });
            document.getElementById('aiCancelBulkAdd')?.addEventListener('click', () => {
                this.addBotMessage('İşlem iptal edildi. Başka bir şey yapmamı ister misiniz?');
                this.pendingCommand = null;
            });
        }, 100);
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
