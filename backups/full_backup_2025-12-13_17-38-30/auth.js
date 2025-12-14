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
    getUsers: () => JSON.parse(localStorage.getItem('karakoytuccari_users')) || [],
    saveUsers: (users) => localStorage.setItem('karakoytuccari_users', JSON.stringify(users)),
    getCurrentUser: () => JSON.parse(localStorage.getItem('karakoytuccari_current_user')),

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
        sessionStorage.setItem('karakoytuccari_temp_reg', JSON.stringify(tempUser));

        // SEND EMAIL (Real or Simulated)
        window.Auth.sendVerificationEmail(email, name, code);

        return { success: true };
    },

    verify: (inputCode) => {
        const tempUser = JSON.parse(sessionStorage.getItem('karakoytuccari_temp_reg'));
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

            sessionStorage.removeItem('karakoytuccari_temp_reg');
            return { success: true };
        } else {
            return { success: false, message: "Hatalı doğrulama kodu." };
        }
    },

    login: (email, password) => {
        const users = window.Auth.getUsers();
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            localStorage.setItem('karakoytuccari_current_user', JSON.stringify(user));
            window.Auth.updateUI();
            return { success: true };
        } else {
            return { success: false, message: "E-posta veya şifre hatalı." };
        }
    },

    logout: () => {
        localStorage.removeItem('karakoytuccari_current_user');
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
                // Giriş yapınca Hesabım yazsın
                btn.innerHTML = '<i class="fa-solid fa-user"></i><span class="icon-label">Hesabım</span>';
                // Remove any inline styles if they exist
                btn.style = "";
            });

            // Update Dropdown Content
            const dropdowns = document.querySelectorAll('.user-dropdown');
            dropdowns.forEach(dd => {
                dd.innerHTML = `
                    <div style="padding: 15px; border-bottom: 1px solid #eee; background: #f9f9f9; text-align: center;">
                        <div style="font-weight: 600; color: #333; margin-bottom: 5px;">${user.email}</div>
                    </div>
                    <a href="profil.html#account" class="dropdown-item compact"><i class="fa-solid fa-user"></i> Kullanıcı Bilgilerim</a>
                    <a href="profil.html#addresses" class="dropdown-item compact"><i class="fa-solid fa-location-dot"></i> Adres Bilgilerim</a>
                    <a href="profil.html#cards" class="dropdown-item compact"><i class="fa-solid fa-credit-card"></i> Kayıtlı Kartlarım</a>
                    <a href="profil.html#notifications" class="dropdown-item compact"><i class="fa-solid fa-bell"></i> Duyuru Tercihlerim</a>
                    <a href="profil.html#password" class="dropdown-item compact"><i class="fa-solid fa-lock"></i> Şifre Değişikliği</a>
                    <a href="profil.html#sessions" class="dropdown-item compact"><i class="fa-solid fa-laptop-code"></i> Aktif Oturumlarım</a>
                    <a href="iletisim.html" class="dropdown-item compact"><i class="fa-solid fa-circle-question"></i> Yardım</a>
                    <a href="profil.html#history" class="dropdown-item compact"><i class="fa-solid fa-clock-rotate-left"></i> Önceden Gezdiklerim</a>
                    <a href="profil.html#orders" class="dropdown-item compact"><i class="fa-solid fa-rotate-right"></i> Tekrar Satın Al</a>
                    <a href="profil.html#orders" class="dropdown-item compact"><i class="fa-solid fa-box"></i> Tüm Siparişlerim</a>
                    <a href="#" onclick="window.Auth.logout(); return false;" class="dropdown-item compact" style="color: #e74c3c;"><i class="fa-solid fa-power-off"></i> Çıkış Yap</a>
                `;
            });
        } else {
            userBtns.forEach(btn => {
                // Çıkış yapınca Giriş Yap yazsın
                btn.innerHTML = '<i class="fa-regular fa-user"></i><span class="icon-label">Giriş Yap</span>';
            });
            const dropdowns = document.querySelectorAll('.user-dropdown');
            dropdowns.forEach(dd => {
                dd.innerHTML = `
                    <a href="giris-yap.html" class="dropdown-item"><i class="fa-solid fa-right-to-bracket"></i> Giriş Yap</a>
                    <a href="giris-yap.html?tab=register" class="dropdown-item"><i class="fa-solid fa-user-plus"></i> Üye Ol</a>
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
                from_name: 'Karaköy Tüccarı',
                company_name: 'Karaköy Tüccarı',
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
