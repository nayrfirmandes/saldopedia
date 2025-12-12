import { getPrimaryDomain } from "@/lib/order-token";

export function formatIDR(amount: number): string {
  return `Rp ${Math.round(amount).toLocaleString('id-ID')}`;
}

export function formatIDRDecimal(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDateWIB(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta'
  };
  
  return new Intl.DateTimeFormat('id-ID', options).format(dateObj) + ' WIB';
}

export function generateEmailHeader(subtitle: string, accentColor: string = '#3b82f6'): string {
  return `
    <tr>
      <td class="header-bg" style="padding: 32px 24px 24px; text-align: center; background-color: #ffffff;">
        <img src="https://${getPrimaryDomain()}/images/saldopedia-logo.png" alt="Saldopedia" width="56" height="56" style="display: block; margin: 0 auto 12px; border-radius: 12px;">
        <h1 style="margin: 0 0 4px; font-size: 20px; font-weight: 700; color: #3b82f6;">
          Saldopedia
        </h1>
        <p class="subtitle-text" style="margin: 0; color: #6b7280; font-size: 13px;">${subtitle}</p>
      </td>
    </tr>
    <tr>
      <td style="height: 3px; background: ${accentColor};"></td>
    </tr>
  `;
}

export function generateEmailFooter(currentYear: number, includeDisclaimer: boolean = true): string {
  return `
    <tr>
      <td class="footer-bg" style="padding: 24px; background-color: #f9fafb;">
        
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="text-align: center; padding-bottom: 16px;">
              <p class="footer-title" style="margin: 0 0 14px; color: #374151; font-size: 13px; font-weight: 500;">Butuh bantuan?</p>
              <p style="margin: 0 0 12px;">
                <a href="https://wa.me/628119666620?text=Halo%20Saldopedia" style="text-decoration: none; font-size: 14px;">
                  <!--[if mso]>
                  <span style="color: #25D366; font-weight: 500;">&#9742; WhatsApp</span>
                  <![endif]-->
                  <!--[if !mso]><!-->
                  <img src="https://cdn-icons-png.flaticon.com/512/3670/3670051.png" alt="" width="18" height="18" style="vertical-align: middle; margin-right: 6px; border: 0;"><!--<![endif]--><span style="color: #25D366; font-weight: 500; vertical-align: middle;">WhatsApp</span>
                </a>
              </p>
              <p style="margin: 0;">
                <a href="https://${getPrimaryDomain()}/dashboard" class="footer-link" style="text-decoration: none; font-size: 13px; color: #6b7280;">
                  <span style="vertical-align: middle; margin-right: 4px; font-size: 14px;">&#8962;</span><span style="vertical-align: middle;">Kembali ke Dashboard</span>
                </a>
              </p>
            </td>
          </tr>
        </table>

        ${includeDisclaimer ? `
        <div class="disclaimer-box" style="padding: 12px 16px; background-color: #ffffff; border-radius: 6px; margin-bottom: 16px;">
          <p class="disclaimer-text" style="margin: 0; color: #6b7280; font-size: 11px; line-height: 1.6;">
            <strong class="disclaimer-strong" style="color: #374151;">Disclaimer:</strong> Transaksi cryptocurrency memiliki risiko. Saldopedia tidak bertanggung jawab atas fluktuasi harga atau kerugian yang mungkin terjadi. Email ini dikirim secara otomatis, mohon tidak membalas langsung.
          </p>
        </div>
        ` : ''}

        <div class="footer-links" style="text-align: center; padding-top: 12px; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0 0 8px;">
            <a class="footer-link" href="https://${getPrimaryDomain()}/terms-of-service" style="color: #6b7280; text-decoration: none; font-size: 11px;">Syarat & Ketentuan</a>
            <span class="footer-divider" style="color: #d1d5db; margin: 0 8px;">|</span>
            <a class="footer-link" href="https://${getPrimaryDomain()}/privacy-policy" style="color: #6b7280; text-decoration: none; font-size: 11px;">Kebijakan Privasi</a>
          </p>
          <p class="copyright-text" style="margin: 0; color: #9ca3af; font-size: 11px;">
            ${currentYear} Saldopedia. All rights reserved.
          </p>
        </div>

      </td>
    </tr>
  `;
}

export function generateEmailWrapper(content: string): string {
  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <style>
    :root {
      color-scheme: light dark;
    }
    
    @media (prefers-color-scheme: dark) {
      .email-body {
        background-color: #1f2937 !important;
      }
      .email-container {
        background-color: #111827 !important;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3) !important;
      }
      .header-bg {
        background-color: #111827 !important;
      }
      .content-area {
        background-color: #111827 !important;
      }
      .footer-bg {
        background-color: #1f2937 !important;
      }
      .main-text {
        color: #f3f4f6 !important;
      }
      .secondary-text {
        color: #9ca3af !important;
      }
      .subtitle-text {
        color: #9ca3af !important;
      }
      .section-title {
        color: #f3f4f6 !important;
      }
      .detail-box {
        background-color: #1f2937 !important;
        border-color: #374151 !important;
      }
      .detail-label {
        color: #9ca3af !important;
      }
      .detail-value {
        color: #f3f4f6 !important;
      }
      .detail-row {
        border-color: #374151 !important;
      }
      .info-box-success {
        background-color: rgba(16, 185, 129, 0.15) !important;
      }
      .info-box-warning {
        background-color: rgba(245, 158, 11, 0.15) !important;
      }
      .info-box-error {
        background-color: rgba(239, 68, 68, 0.15) !important;
      }
      .info-box-info {
        background-color: rgba(59, 130, 246, 0.15) !important;
      }
      .amount-display {
        background-color: #1f2937 !important;
      }
      .disclaimer-box {
        background-color: #1f2937 !important;
      }
      .disclaimer-text {
        color: #9ca3af !important;
      }
      .disclaimer-strong {
        color: #d1d5db !important;
      }
      .footer-title {
        color: #d1d5db !important;
      }
      .footer-links {
        border-color: #374151 !important;
      }
      .footer-link {
        color: #9ca3af !important;
      }
      .footer-divider {
        color: #4b5563 !important;
      }
      .copyright-text {
        color: #6b7280 !important;
      }
    }
  </style>
</head>
<body class="email-body" style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6; -webkit-font-smoothing: antialiased;">
  
  <table role="presentation" class="email-body" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6;">
    <tr>
      <td style="padding: 24px 16px;">
        <table role="presentation" class="email-container" style="max-width: 560px; width: 100%; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1);">
          ${content}
        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `;
}

export function generateStatusBadge(status: string, type: 'success' | 'warning' | 'error' | 'info' = 'info'): string {
  const colors = {
    success: { bg: '#dcfce7', text: '#166534', border: '#86efac' },
    warning: { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
    error: { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
    info: { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' }
  };
  const c = colors[type];
  
  return `<span style="display: inline-block; padding: 4px 12px; background-color: ${c.bg}; color: ${c.text}; border: 1px solid ${c.border}; border-radius: 9999px; font-size: 12px; font-weight: 600;">${status}</span>`;
}

export function generateInfoBox(title: string, content: string, type: 'success' | 'warning' | 'error' | 'info' = 'info'): string {
  const colors = {
    success: { bg: '#f0fdf4', border: '#10b981', title: '#065f46', text: '#047857', darkBg: 'rgba(16, 185, 129, 0.15)' },
    warning: { bg: '#fffbeb', border: '#f59e0b', title: '#92400e', text: '#a16207', darkBg: 'rgba(245, 158, 11, 0.15)' },
    error: { bg: '#fef2f2', border: '#ef4444', title: '#991b1b', text: '#b91c1c', darkBg: 'rgba(239, 68, 68, 0.15)' },
    info: { bg: '#eff6ff', border: '#3b82f6', title: '#1e40af', text: '#1d4ed8', darkBg: 'rgba(59, 130, 246, 0.15)' }
  };
  const c = colors[type];
  
  return `
    <div class="info-box-${type}" style="border-left: 4px solid ${c.border}; padding: 14px 16px; margin-bottom: 20px; background-color: ${c.bg}; border-radius: 0 6px 6px 0;">
      <p style="margin: 0 0 4px; color: ${c.title}; font-size: 14px; font-weight: 600;">${title}</p>
      <p style="margin: 0; color: ${c.text}; font-size: 13px; line-height: 1.5;">${content}</p>
    </div>
  `;
}

export function generateButton(text: string, url: string, color: 'primary' | 'success' | 'warning' | 'danger' = 'primary'): string {
  const colors = {
    primary: { bg: '#3b82f6', hover: '#2563eb' },
    success: { bg: '#10b981', hover: '#059669' },
    warning: { bg: '#f59e0b', hover: '#d97706' },
    danger: { bg: '#ef4444', hover: '#dc2626' }
  };
  const c = colors[color];
  
  return `
    <div style="text-align: center; margin: 24px 0;">
      <a href="${url}" style="display: inline-block; background-color: ${c.bg}; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 14px; font-weight: 600; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        ${text}
      </a>
    </div>
  `;
}

export function generateDetailRow(label: string, value: string, options?: { mono?: boolean; bold?: boolean; color?: string }): string {
  const valueColor = options?.color || '#111827';
  
  return `
    <tr class="detail-row" style="border-bottom: 1px solid #f3f4f6;">
      <td class="detail-label" style="padding: 10px 0; color: #6b7280; font-size: 13px;">${label}</td>
      <td class="detail-value" style="padding: 10px 0; color: ${valueColor}; font-size: 13px; ${options?.bold ? 'font-weight: 600;' : ''} ${options?.mono ? 'font-family: ui-monospace, SFMono-Regular, monospace;' : ''} text-align: right;">${value}</td>
    </tr>
  `;
}

export function generateDetailTable(rows: string[]): string {
  return `
    <div class="detail-box" style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 20px; background-color: #ffffff;">
      <table style="width: 100%; border-collapse: collapse;">
        ${rows.join('')}
      </table>
    </div>
  `;
}

export function generateTotalRow(label: string, value: string, color: string = '#10b981'): string {
  return `
    <tr style="border-top: 2px solid ${color};">
      <td style="padding: 12px 0 0; color: ${color}; font-size: 14px; font-weight: 600;">${label}</td>
      <td style="padding: 12px 0 0; color: ${color}; font-size: 18px; font-weight: 700; text-align: right;">${value}</td>
    </tr>
  `;
}

export function generateSectionTitle(title: string): string {
  return `<h2 class="section-title" style="margin: 0 0 16px; color: #111827; font-size: 15px; font-weight: 600;">${title}</h2>`;
}

export function generateAmountDisplay(label: string, amount: string, color: string = '#10b981', size: 'normal' | 'large' = 'normal'): string {
  const fontSize = size === 'large' ? '28px' : '22px';
  return `
    <div class="amount-display" style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 20px; text-align: center;">
      <p class="secondary-text" style="margin: 0 0 6px; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">${label}</p>
      <p style="margin: 0; color: ${color}; font-size: ${fontSize}; font-weight: 700;">${amount}</p>
    </div>
  `;
}
