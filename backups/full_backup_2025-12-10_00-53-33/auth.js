// Auth Logic & Simulation

window.Auth = {
    // Simulated Database
    getUsers: () => JSON.parse(localStorage.getItem('resels_users')) || [],
    saveUsers: (users) => localStorage.setItem('resels_users', JSON.stringify(users)),
    getCurrentUser: () => JSON.parse(localStorage.getItem('resels_current_user')),

    // Core Actions
    register: (email, password, name) => {
        const users = window.Auth.getUsers();
        if (users.find(u => u.email === email)) {
            return { success: false, message: "Bu e-posta adresi zaten kayıtlı." };
        }

        // Generate Verification Code
        const code = Math.floor(1000 + Math.random() * 9000).toString(); // 4 digit code

        const tempUser = { email, password, name, code, isVerified: false };

        // Save temp state (usually backend would handle this, we use session/temp storage)
        sessionStorage.setItem('resels_temp_reg', JSON.stringify(tempUser));

        // SIMULATE SENDING EMAIL
        window.Auth.simulateEmail(email, code);

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
                name: tempUser.name
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
                // Hide default icon, show initials
                const icon = btn.querySelector('i');
                if (icon) icon.style.display = 'none';

                let initials = btn.querySelector('.user-initials');
                if (!initials) {
                    initials = document.createElement('span');
                    initials.className = 'user-initials';
                    initials.style.fontWeight = '700';
                    initials.style.fontSize = '14px';
                    // Insert as first child or before dropdown
                    btn.insertBefore(initials, btn.firstChild);
                }
                initials.textContent = user.name.substring(0, 2).toUpperCase();
                initials.style.display = 'inline-block';
            });

            // Update Dropdown Content
            const dropdowns = document.querySelectorAll('.user-dropdown-content');
            dropdowns.forEach(dd => {
                dd.innerHTML = `
                    <div class="dropdown-header" style="padding:12px 16px; border-bottom:1px solid #eee;">
                        <strong style="font-size:16px;">Hesabım</strong><br>
                        <small style="color:#666;">${user.email}</small>
                    </div>
                    <a href="#" class="dropdown-item" onclick="if(window.openSidebar) window.openSidebar('favorites'); return false;">Favorilerim</a>
                    <a href="#" class="dropdown-item">Siparişlerim</a>
                    <a href="#" onclick="window.Auth.logout(); return false;" class="dropdown-item" style="color:red;">Çıkış Yap</a>
                `;
            });
        }
    },

    // Simulation Helper
    simulateEmail: (email, code) => {
        console.log(`%c[EMAIL SIMULATION] To: ${email} | Code: ${code}`, 'background: #222; color: #bada55; font-size: 14px; padding: 4px;');

        // Show Toast Notification
        const toast = document.createElement('div');
        toast.className = 'toast-simulation';
        toast.innerHTML = `
            <div class="toast-icon"><i class="fa-solid fa-envelope"></i></div>
            <div class="toast-content">
                <h4>E-Posta Gönderildi!</h4>
                <p>Doğrulama Kodunuz: <strong>${code}</strong></p>
            </div>
        `;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 500);
        }, 5000); // Show for 5 seconds so they can read it
    }
};

// Auto-run on load
document.addEventListener('DOMContentLoaded', window.Auth.updateUI);
