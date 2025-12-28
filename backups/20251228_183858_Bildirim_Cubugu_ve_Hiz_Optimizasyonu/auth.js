// Backend API Configuration (uses config.js for environment detection)
const API_URL = window.ENV ? window.ENV.API_URL : 'http://localhost:5000/api';

// Helper function for API calls
async function apiCall(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    // Add token if exists
    const token = localStorage.getItem('galatacarsi_token');
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    // Add body for POST/PUT requests
    if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, options);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'API Error');
        }

        return result;
    } catch (error) {
        console.error('API Call Error:', error);
        throw error;
    }
}

window.Auth = {
    // Register with backend
    register: async (email, password, name, gender) => {
        try {
            const result = await apiCall('/auth/register', 'POST', {
                email,
                password,
                name,
                gender: gender || 'other'
            });

            if (result.success) {
                // E-posta doğrulama gerekiyorsa email'i kaydet
                if (result.needsVerification) {
                    sessionStorage.setItem('galatacarsi_pending_email', email);
                    return { success: true, needsVerification: true };
                }

                // Eğer token döndüyse (doğrulama gerekmeyen durum)
                if (result.token) {
                    localStorage.setItem('galatacarsi_token', result.token);
                }
                if (result.user) {
                    localStorage.setItem('galatacarsi_current_user', JSON.stringify(result.user));
                    window.Auth.updateUI();
                }

                return { success: true, needsVerification: false };
            } else {
                return { success: false, message: result.message };
            }
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // Verify email with code
    verify: async (inputCode) => {
        try {
            const email = sessionStorage.getItem('galatacarsi_pending_email');
            if (!email) {
                return { success: false, message: 'Oturum süresi doldu.' };
            }

            const result = await apiCall('/auth/verify', 'POST', {
                email,
                code: inputCode
            });

            if (result.success) {
                // Doğrulama başarılı - pending email'i temizle
                // Token kaydetme! Kullanıcı giriş yaparak token alacak
                sessionStorage.removeItem('galatacarsi_pending_email');

                return { success: true };
            } else {
                return { success: false, message: result.message };
            }
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // Resend verification code
    resendCode: async () => {
        try {
            const email = sessionStorage.getItem('galatacarsi_pending_email');
            if (!email) {
                return { success: false, message: 'E-posta bulunamadı.' };
            }

            const result = await apiCall('/auth/resend-code', 'POST', { email });
            return result;
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // Login with backend
    login: async (email, password) => {
        try {
            const result = await apiCall('/auth/login', 'POST', {
                email,
                password
            });

            if (result.success) {
                // Store token and user
                localStorage.setItem('galatacarsi_token', result.token);
                localStorage.setItem('galatacarsi_current_user', JSON.stringify(result.user));

                // Update UI
                window.Auth.updateUI();

                return { success: true };
            } else {
                return { success: false, message: result.message, needsVerification: result.needsVerification };
            }
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // Logout
    logout: async () => {
        try {
            // Call backend logout (optional, just clears server-side if needed)
            await apiCall('/auth/logout', 'POST');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear local storage
            localStorage.removeItem('galatacarsi_token');
            localStorage.removeItem('galatacarsi_current_user');
            window.location.reload();
        }
    },

    // Get current user
    getCurrentUser: () => {
        const userStr = localStorage.getItem('galatacarsi_current_user');
        return userStr ? JSON.parse(userStr) : null;
    },

    // Get current user from backend
    getMe: async () => {
        try {
            const result = await apiCall('/auth/me', 'GET');
            if (result.success) {
                localStorage.setItem('galatacarsi_current_user', JSON.stringify(result.data));
                return result.data;
            }
            return null;
        } catch (error) {
            console.error('Get Me Error:', error);
            return null;
        }
    },

    // Forgot password
    forgotPassword: async (email) => {
        try {
            const result = await apiCall('/auth/forgot-password', 'POST', { email });
            return result;
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // Reset password
    resetPassword: async (token, password) => {
        try {
            const result = await apiCall('/auth/reset-password', 'POST', {
                token,
                password
            });
            return result;
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // Update password
    updatePassword: async (currentPassword, newPassword) => {
        try {
            const result = await apiCall('/auth/update-password', 'PUT', {
                currentPassword,
                newPassword
            });
            return result;
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // UI Updates (same as before)
    updateUI: () => {
        const user = window.Auth.getCurrentUser();
        const userBtns = document.querySelectorAll('.user-btn');

        if (user) {
            userBtns.forEach(btn => {
                btn.innerHTML = '<i class="fa-solid fa-user"></i><span class="icon-label">Hesabım</span>';
                btn.style = "";
            });

            const dropdowns = document.querySelectorAll('.user-dropdown');
            dropdowns.forEach(dd => {
                dd.innerHTML = `
                    <div style="padding: 15px; border-bottom: 1px solid #eee; background: #f9f9f9; text-align: center;">
                        <div style="font-weight: 600; color: #333; margin-bottom: 5px;">${user.email || 'E-posta bilgisi yok'}</div>
                        <div style="font-size: 12px; color: #666;">${user.name || 'İsim bilgisi yok'}</div>
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

    // Debug: Check backend connection
    checkBackend: async () => {
        try {
            const response = await fetch(`${API_URL}/health`);
            const data = await response.json();
            console.log('✅ Backend Status:', data);
            return data.status === 'OK';
        } catch (error) {
            console.error('❌ Backend Connection Failed:', error);
            return false;
        }
    }
};

// Auto-run on load
document.addEventListener('DOMContentLoaded', () => {
    window.Auth.updateUI();

    // Check backend connection (optional, for debugging)
    window.Auth.checkBackend().then(isConnected => {
        if (isConnected) {
            console.log('✅ Backend bağlantısı başarılı!');
        } else {
            console.warn('⚠️ Backend bağlantısı kurulamadı. Sunucunun çalıştığından emin olun.');
        }
    });
});
