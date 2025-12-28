const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create transporter
    const transporter = nodemailer.createTransporter({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    // Email templates
    const templates = {
        verification: (context) => `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa;">
                <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h1 style="color: #8b7bd8; text-align: center; margin-bottom: 20px;">Galata Çarşı</h1>
                    <h2 style="color: #333; margin-bottom: 20px;">Merhaba ${context.name},</h2>
                    <p style="color: #666; font-size: 16px; line-height: 1.6;">
                        Galata Çarşı'na hoş geldiniz! E-posta adresinizi doğrulamak için aşağıdaki kodu kullanın:
                    </p>
                    <div style="background: #8b7bd8; color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 8px; margin: 30px 0; letter-spacing: 8px;">
                        ${context.code}
                    </div>
                    <p style="color: #999; font-size: 14px; text-align: center;">
                        Bu kod 10 dakika geçerlidir.
                    </p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                    <p style="color: #999; font-size: 12px; text-align: center;">
                        Bu e-postayı siz talep etmediyseniz, lütfen dikkate almayın.
                    </p>
                </div>
            </div>
        `,
        'reset-password': (context) => `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa;">
                <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h1 style="color: #8b7bd8; text-align: center; margin-bottom: 20px;">Galata Çarşı</h1>
                    <h2 style="color: #333; margin-bottom: 20px;">Merhaba ${context.name},</h2>
                    <p style="color: #666; font-size: 16px; line-height: 1.6;">
                        Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${context.resetUrl}" style="background: #8b7bd8; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                            Şifremi Sıfırla
                        </a>
                    </div>
                    <p style="color: #999; font-size: 14px; text-align: center;">
                        Bu bağlantı 30 dakika geçerlidir.
                    </p>
                    <p style="color: #999; font-size: 12px; margin-top: 20px;">
                        Eğer buton çalışmıyorsa, aşağıdaki bağlantıyı kopyalayıp tarayıcınıza yapıştırın:<br>
                        <a href="${context.resetUrl}" style="color: #8b7bd8; word-break: break-all;">${context.resetUrl}</a>
                    </p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                    <p style="color: #999; font-size: 12px; text-align: center;">
                        Bu e-postayı siz talep etmediyseniz, lütfen dikkate almayın.
                    </p>
                </div>
            </div>
        `,
        'order-confirmation': (context) => `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa;">
                <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h1 style="color: #8b7bd8; text-align: center; margin-bottom: 20px;">Galata Çarşı</h1>
                    <h2 style="color: #333; margin-bottom: 20px;">Siparişiniz Alındı!</h2>
                    <p style="color: #666; font-size: 16px; line-height: 1.6;">
                        Merhaba ${context.name},<br>
                        Siparişiniz başarıyla oluşturuldu.
                    </p>
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 5px 0;"><strong>Sipariş No:</strong> ${context.orderNumber}</p>
                        <p style="margin: 5px 0;"><strong>Toplam:</strong> ${context.total} TL</p>
                        <p style="margin: 5px 0;"><strong>Tarih:</strong> ${context.date}</p>
                    </div>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.FRONTEND_URL}/profil.html#orders" style="background: #8b7bd8; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                            Siparişimi Görüntüle
                        </a>
                    </div>
                </div>
            </div>
        `
    };

    // Get template
    const htmlContent = templates[options.template]
        ? templates[options.template](options.context)
        : options.html || options.text;

    // Email options
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: options.to,
        subject: options.subject,
        html: htmlContent
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent: %s', info.messageId);
    return info;
};

module.exports = sendEmail;
