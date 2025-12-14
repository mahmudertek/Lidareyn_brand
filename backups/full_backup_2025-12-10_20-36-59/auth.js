// Auth Logic & Simulation

// ==========================================
// EMAIL ENTEGRASYONU AYARLARI (EmailJS)
// Lütfen kendi EmailJS hesabınızdan aldığınız bilgileri buraya girin.
// Kayıt: https://www.emailjs.com/
// ==========================================
const EMAIL_CONFIG = {
    SERVICE_ID: "service_qunvapn",   // Örn: "service_xyz"
    TEMPLATE_ID: "template_2dgasbk", // Örn: "template_abc"
    PUBLIC_KEY: "YPleZsvzZcoiBvEIB"    // Örn: "user_123456"
};

// Auto Init EmailJS
if (window.emailjs) {
    emailjs.init(EMAIL_CONFIG.PUBLIC_KEY);
    console.log("EmailJS Initialized");
}

window.Auth = {
    // Simulated Database
    getUsers: () => JSON.parse(localStorage.getItem('resels_users')) || [],
    saveUsers: (users) => localStorage.setItem('resels_users', JSON.stringify(users)),
    getCurrentUser: () => JSON.parse(localStorage.getItem('resels_current_user')),

    // Core Actions
    register: (email, password, name, gender) => {
        const users = window.Auth.getUsers();
        if (users.find(u => u.email === email)) {
            return { success: false, message: "Bu e-posta adresi zaten kayıtlı." };
        }

        // Generate Verification Code
        const code = Math.floor(1000 + Math.random() * 9000).toString(); // 4 digit code

        const tempUser = { email, password, name, gender, code, isVerified: false };

        // Save temp state
        sessionStorage.setItem('resels_temp_reg', JSON.stringify(tempUser));

        // SEND EMAIL (Real or Simulated)
        window.Auth.sendVerificationEmail(email, name, code);

        return { success: true };
    },

    verify: (inputCode) => {
        const tempUser = JSON.parse(sessionStorage.getItem('resels_temp_reg'));
        if (!tempUser) return { success: false, message: "Oturum süresi doldu." };

        if (tempUser.code === inputCode) {
            // Success! Create real user
            const users = window.Auth.getUsers();
            const newUser = {
                id: Date.now(),
                email: tempUser.email,
                password: tempUser.password, // In real app, hash this!
                name: tempUser.name,
                gender: tempUser.gender
            };
            users.push(newUser);
            window.Auth.saveUsers(users);

            // Auto Login
            window.Auth.login(tempUser.email, tempUser.password);

            sessionStorage.removeItem('resels_temp_reg');
            return { success: true };
        } else {
            return { success: false, message: "Hatalı doğrulama kodu." };
        }
    },

    login: (email, password) => {
        const users = window.Auth.getUsers();
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            localStorage.setItem('resels_current_user', JSON.stringify(user));
            window.Auth.updateUI();
            return { success: true };
        } else {
            return { success: false, message: "E-posta veya şifre hatalı." };
        }
    },

    logout: () => {
        localStorage.removeItem('resels_current_user');
        window.location.reload();
    },

    // UI Updates
    updateUI: () => {
        const user = window.Auth.getCurrentUser();
        const userBtns = document.querySelectorAll('.user-btn');

        if (user) {
            userBtns.forEach(btn => {
                // Giriş yapınca sadece ikon görünsün (yazısız)
                btn.innerHTML = '<i class="fa-solid fa-user"></i>';

                // Varsa önceki inline stilleri temizle
                btn.style.width = '';
                btn.style.padding = '';
                btn.style.borderRadius = '';
                btn.style.border = '';
            });

            // Update Dropdown Content
            const dropdowns = document.querySelectorAll('.user-dropdown'); // Fixed selector was .user-dropdown-content in previous logic but html is .user-dropdown
            // Actually selector in HTML is .user-dropdown but it has static links. 
            // Better to dynamic update links if we want fully dynamic header.
            // For now let's stick to the previous logic which seemed to target a class user-dropdown-content? 
            // Wait, looking at index.html, it's <div class="user-dropdown">...</div>
            // Current code does `document.querySelectorAll('.user-dropdown-content')` which might be wrong based on provided index.html snippet.
            // Let's fix the selector to `.user-dropdown`

            const ddList = document.querySelectorAll('.user-dropdown');
            ddList.forEach(dd => {
                dd.innerHTML = `
                    <div style="padding:10px 12px; background:#f9f9f9; border-radius:12px 12px 0 0;">
                        <small style="color:#666; font-size:11px; word-break:break-all; display: block;">${user.email}</small>
                    </div>
                    
                    <div style="padding: 4px 0;">
                        <a href="profil.html?tab=account" class="dropdown-item compact"><i class="fa-solid fa-user"></i> Kullanıcı Bilgilerim</a>
                        <a href="profil.html?tab=addresses" class="dropdown-item compact"><i class="fa-solid fa-location-dot"></i> Adres Bilgilerim</a>
                        <a href="profil.html?tab=cards" class="dropdown-item compact"><i class="fa-solid fa-credit-card"></i> Kayıtlı Kartlarım</a>
                        <a href="profil.html?tab=notifications" class="dropdown-item compact"><i class="fa-solid fa-bell"></i> Duyuru Tercihlerim</a>
                        <a href="profil.html?tab=password" class="dropdown-item compact"><i class="fa-solid fa-lock"></i> Şifre Değişikliği</a>
                        <a href="profil.html?tab=sessions" class="dropdown-item compact"><i class="fa-solid fa-laptop-code"></i> Aktif Oturumlarım</a>
                        <a href="iletisim.html" class="dropdown-item compact"><i class="fa-solid fa-circle-question"></i> Yardım</a>
                        <a href="profil.html?tab=history" class="dropdown-item compact"><i class="fa-solid fa-clock-rotate-left"></i> Önceden Gezdiklerim</a>
                        <a href="profil.html?tab=orders" class="dropdown-item compact"><i class="fa-solid fa-rotate-right"></i> Tekrar Satın Al</a>
                        <a href="profil.html?tab=orders" class="dropdown-item compact"><i class="fa-solid fa-box"></i> Tüm Siparişlerim</a>
                        <a href="profil.html?tab=reviews" class="dropdown-item compact"><i class="fa-solid fa-star"></i> Değerlendirmelerim</a>
                        <a href="#" onclick="window.Auth.logout(); return false;" class="dropdown-item compact" style="color:#ef4444;"><i class="fa-solid fa-power-off"></i> Çıkış Yap</a>
                    </div>
                `;
            });
        }
    },

    // EMAIL SENDING LOGIC
    sendVerificationEmail: (email, name, code) => {
        // 1. Try Real Email if Configured
        if (window.emailjs) {
            console.log(`Sending real email via EmailJS to: ${email}`);

            emailjs.send(EMAIL_CONFIG.SERVICE_ID, EMAIL_CONFIG.TEMPLATE_ID, {
                to_email: email,
                to_name: name,
                verification_code: code
            })
                .then(function () {
                    console.log('SUCCESS! Email sent.');
                }, function (error) {
                    console.error('FAILED...', error);
                    alert("E-posta gönderilirken bir hata oluştu. Lütfen (varsa) EmailJS yapılandırmanızı kontrol edin.");
                });
        }
        // 2. Fallback
        else {
            console.warn("EmailJS not configured.");
            alert("Email servisi yapılandırılmamış.");
        }
    },

    // Simulation Helper
    simulateEmail: (email, code) => {
        console.log(`%c[EMAIL SIMULATION] To: ${email} | Code: ${code}`, 'background: #222; color: #bada55; font-size: 14px; padding: 4px;');

        const toast = document.createElement('div');
        toast.className = 'toast-simulation';
        toast.innerHTML = `
            <div class="toast-icon"><i class="fa-solid fa-envelope"></i></div>
            <div class="toast-content">
                <h4>[Simülasyon] E-Posta Gönderildi!</h4>
                <p>Doğrulama Kodunuz: <strong>${code}</strong></p>
                <small style="font-size:10px; color:#aaa;">Gerçek mail için auth.js içindeki ayarları yapın.</small>
            </div>
        `;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 500);
        }, 6000);
    }
};

// Auto-run on load
document.addEventListener('DOMContentLoaded', window.Auth.updateUI);
