import {
  generateEmailWrapper,
  generateEmailHeader,
  generateEmailFooter,
  generateInfoBox,
  generateButton
} from '../email-base';
import { getPrimaryDomain } from '@/lib/order-token';

export function generateVerificationEmailHTML(data: { name: string; email: string; verificationLink: string }): string {
  const currentYear = new Date().getFullYear();
  
  const content = `
    ${generateEmailHeader('Verifikasi Email', '#3b82f6')}
    
    <tr>
      <td class="content-area" style="padding: 28px 24px; background-color: #ffffff;">
        
        <h1 class="main-text" style="margin: 0 0 16px; font-size: 18px; font-weight: 700; color: #111827;">
          Halo, ${data.name}!
        </h1>
        
        <p class="secondary-text" style="margin: 0 0 20px; color: #374151; font-size: 14px; line-height: 1.7;">
          Terima kasih telah mendaftar di Saldopedia. Untuk mengaktifkan akun Anda, silakan verifikasi email dengan klik tombol di bawah ini:
        </p>

        ${generateButton('Verifikasi Email', data.verificationLink, 'primary')}

        <p class="secondary-text" style="margin: 20px 0 8px; color: #6b7280; font-size: 12px;">
          Atau copy dan paste link berikut ke browser Anda:
        </p>
        <p class="detail-box" style="margin: 0; padding: 10px 12px; background-color: #f3f4f6; border-radius: 6px; color: #3b82f6; font-size: 11px; word-break: break-all; font-family: ui-monospace, monospace;">
          ${data.verificationLink}
        </p>

        ${generateInfoBox('Perhatian', 'Link verifikasi ini berlaku selama 24 jam. Jika Anda tidak mendaftar di Saldopedia, abaikan email ini.', 'warning')}

      </td>
    </tr>

    ${generateEmailFooter(currentYear, false)}
  `;
  
  return generateEmailWrapper(content);
}

export function generateWelcomeEmailHTML(data: { name: string; email: string }): string {
  const currentYear = new Date().getFullYear();
  
  const content = `
    ${generateEmailHeader('Selamat Datang', '#10b981')}
    
    <tr>
      <td class="content-area" style="padding: 28px 24px; background-color: #ffffff;">
        
        <h1 class="main-text" style="margin: 0 0 16px; font-size: 18px; font-weight: 700; color: #111827;">
          Selamat Datang di Saldopedia, ${data.name}!
        </h1>
        
        <p class="secondary-text" style="margin: 0 0 20px; color: #374151; font-size: 14px; line-height: 1.7;">
          Akun Anda telah berhasil diverifikasi. Sekarang Anda dapat menikmati semua fitur Saldopedia:
        </p>

        <div class="detail-box" style="margin: 0 0 24px; padding: 16px 20px; background-color: #f9fafb; border-radius: 8px;">
          <ul class="secondary-text" style="margin: 0; padding-left: 18px; color: #374151; font-size: 14px; line-height: 2;">
            <li>Transaksi cepat dan aman</li>
            <li>History transaksi lengkap</li>
            <li>Top-up saldo mudah</li>
            <li>Notifikasi real-time</li>
            <li>Support 24/7</li>
          </ul>
        </div>

        ${generateButton('Login Sekarang', `https://${getPrimaryDomain()}/login`, 'success')}

        <p class="secondary-text" style="margin: 20px 0 0; color: #6b7280; font-size: 13px; line-height: 1.6;">
          Jika ada pertanyaan, jangan ragu untuk menghubungi kami melalui WhatsApp atau email.
        </p>

      </td>
    </tr>

    ${generateEmailFooter(currentYear, false)}
  `;
  
  return generateEmailWrapper(content);
}

export function generatePasswordResetEmailHTML(data: { name: string; email: string; resetLink: string }): string {
  const currentYear = new Date().getFullYear();
  
  const content = `
    ${generateEmailHeader('Reset Password', '#f59e0b')}
    
    <tr>
      <td class="content-area" style="padding: 28px 24px; background-color: #ffffff;">
        
        <h1 class="main-text" style="margin: 0 0 16px; font-size: 18px; font-weight: 700; color: #111827;">
          Reset Password
        </h1>
        
        <p class="secondary-text" style="margin: 0 0 20px; color: #374151; font-size: 14px; line-height: 1.7;">
          Halo, ${data.name}. Kami menerima permintaan untuk reset password akun Anda. Klik tombol di bawah ini untuk membuat password baru:
        </p>

        ${generateButton('Reset Password', data.resetLink, 'warning')}

        <p class="secondary-text" style="margin: 20px 0 8px; color: #6b7280; font-size: 12px;">
          Atau copy dan paste link berikut ke browser Anda:
        </p>
        <p class="detail-box" style="margin: 0; padding: 10px 12px; background-color: #f3f4f6; border-radius: 6px; color: #3b82f6; font-size: 11px; word-break: break-all; font-family: ui-monospace, monospace;">
          ${data.resetLink}
        </p>

        ${generateInfoBox('Perhatian', 'Link reset password ini berlaku selama 1 jam. Jika Anda tidak melakukan permintaan reset password, abaikan email ini dan password Anda tetap aman.', 'error')}

      </td>
    </tr>

    ${generateEmailFooter(currentYear, false)}
  `;
  
  return generateEmailWrapper(content);
}
