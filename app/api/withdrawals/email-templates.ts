import {
  generateEmailWrapper,
  generateEmailHeader,
  generateEmailFooter,
  generateInfoBox,
  generateButton,
  generateDetailRow,
  generateDetailTable,
  generateTotalRow,
  generateSectionTitle,
  generateAmountDisplay,
  formatIDR,
  formatDateWIB
} from '@/lib/email-base';
import { getPrimaryDomain } from '@/lib/order-token';

function getBankLabel(method: string, bankCode: string | null): string {
  if (method === 'bank_transfer') {
    const bankLabels: Record<string, string> = {
      'BCA': 'Bank BCA',
      'MANDIRI': 'Bank Mandiri',
      'BNI': 'Bank BNI',
      'BRI': 'Bank BRI',
      'CIMB': 'Bank CIMB Niaga',
      'PERMATA': 'Bank Permata'
    };
    return bankLabels[bankCode || ''] || `Bank ${bankCode}`;
  } else {
    const ewalletLabels: Record<string, string> = {
      'DANA': 'DANA',
      'OVO': 'OVO',
      'GOPAY': 'GoPay',
      'SHOPEEPAY': 'ShopeePay'
    };
    return ewalletLabels[bankCode || ''] || bankCode || 'E-Wallet';
  }
}

interface WithdrawalUserEmailData {
  withdrawalId: string;
  userName: string;
  amount: number;
  fee: number;
  netAmount: number;
  method: string;
  bankCode: string | null;
  accountName: string;
  accountNumber: string;
  createdAt: Date;
}

export function generateWithdrawalUserEmailHTML(data: WithdrawalUserEmailData): string {
  const currentYear = new Date().getFullYear();
  const formattedDate = formatDateWIB(data.createdAt);
  const methodLabel = getBankLabel(data.method, data.bankCode);
  
  const detailRows = [
    generateDetailRow('ID Penarikan', data.withdrawalId, { mono: true }),
    generateDetailRow('Waktu', formattedDate),
    generateDetailRow('Metode', methodLabel),
    generateDetailRow('Rekening Tujuan', data.accountNumber, { mono: true }),
    generateDetailRow('Atas Nama', data.accountName, { bold: true }),
    generateDetailRow('Nominal Penarikan', formatIDR(data.amount)),
    ...(data.fee > 0 ? [generateDetailRow('Biaya Admin', `- ${formatIDR(data.fee)}`, { color: '#dc2626' })] : []),
    generateTotalRow('Yang Akan Diterima', formatIDR(data.netAmount), '#f59e0b')
  ];
  
  const content = `
    ${generateEmailHeader('Penarikan Saldo', '#f59e0b')}
    
    <tr>
      <td class="content-area" style="padding: 28px 24px; background-color: #ffffff;">
        
        ${generateInfoBox('Permintaan Penarikan Diterima', `ID: ${data.withdrawalId}`, 'warning')}

        <p class="main-text" style="margin: 0 0 12px; color: #111827; font-size: 15px;">
          Halo <strong>${data.userName}</strong>,
        </p>
        <p class="secondary-text" style="margin: 0 0 24px; color: #4b5563; font-size: 14px; line-height: 1.6;">
          Permintaan penarikan saldo Anda telah kami terima dan sedang diproses. Dana akan dikirim ke rekening tujuan dalam waktu 1x24 jam kerja.
        </p>

        ${generateSectionTitle('Detail Penarikan')}
        ${generateDetailTable(detailRows)}

        ${generateInfoBox('Status', 'Menunggu proses. Penarikan diproses dalam 1x24 jam kerja (Senin-Jumat, 09:00-17:00 WIB).', 'info')}

        ${generateButton('Cek Status di Dashboard', `https://${getPrimaryDomain()}/dashboard/withdraw`, 'primary')}

      </td>
    </tr>

    ${generateEmailFooter(currentYear, false)}
  `;
  
  return generateEmailWrapper(content);
}

interface WithdrawalAdminEmailData {
  withdrawalId: string;
  userName: string;
  userEmail: string;
  userPhone: string | null;
  amount: number;
  fee: number;
  netAmount: number;
  method: string;
  bankCode: string | null;
  accountName: string;
  accountNumber: string;
  createdAt: Date;
  completeUrl: string;
}

export function generateWithdrawalAdminEmailHTML(data: WithdrawalAdminEmailData): string {
  const currentYear = new Date().getFullYear();
  const formattedDate = formatDateWIB(data.createdAt);
  const methodLabel = getBankLabel(data.method, data.bankCode);
  
  const userRows = [
    generateDetailRow('Nama', data.userName, { bold: true }),
    generateDetailRow('Email', data.userEmail),
    ...(data.userPhone ? [generateDetailRow('Telepon', data.userPhone)] : [])
  ];
  
  const detailRows = [
    generateDetailRow('ID Penarikan', data.withdrawalId, { mono: true }),
    generateDetailRow('Waktu Request', formattedDate),
    generateDetailRow('Nominal Penarikan', formatIDR(data.amount)),
    ...(data.fee > 0 ? [generateDetailRow('Biaya Admin', `- ${formatIDR(data.fee)}`, { color: '#dc2626' })] : [])
  ];
  
  const content = `
    ${generateEmailHeader('Withdrawal Request - Admin', '#dc2626')}
    
    <tr>
      <td class="content-area" style="padding: 28px 24px; background-color: #ffffff;">
        
        ${generateInfoBox('Permintaan Penarikan Baru', `ID: ${data.withdrawalId}`, 'error')}

        <p class="secondary-text" style="margin: 0 0 20px; color: #4b5563; font-size: 14px;">
          User telah membuat permintaan penarikan saldo. Segera proses transfer ke rekening tujuan.
        </p>

        ${generateSectionTitle('Detail User')}
        ${generateDetailTable(userRows)}

        ${generateAmountDisplay(methodLabel, data.accountNumber, '#dc2626')}
        
        <div class="amount-display" style="text-align: center; margin-bottom: 20px; padding: 16px; background-color: #fef2f2; border-radius: 8px;">
          <p class="secondary-text" style="margin: 0 0 4px; color: #991b1b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Atas Nama</p>
          <p class="main-text" style="margin: 0 0 12px; color: #111827; font-size: 15px; font-weight: 700;">${data.accountName}</p>
          <p style="margin: 0 0 4px; color: #991b1b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Transfer Sebesar</p>
          <p style="margin: 0; color: #dc2626; font-size: 26px; font-weight: 700;">${formatIDR(data.netAmount)}</p>
        </div>

        ${generateSectionTitle('Detail Penarikan')}
        ${generateDetailTable(detailRows)}

        ${generateButton('Selesaikan Penarikan', data.completeUrl, 'success')}
        
        <p class="secondary-text" style="margin: 16px 0 0; text-align: center; color: #9ca3af; font-size: 11px;">
          Klik tombol di atas setelah transfer berhasil dilakukan
        </p>

      </td>
    </tr>

    ${generateEmailFooter(currentYear, false)}
  `;
  
  return generateEmailWrapper(content);
}

interface WithdrawalCompletedEmailData {
  withdrawalId: string;
  userName: string;
  netAmount: number;
  method: string;
  bankCode: string | null;
  accountName: string;
  accountNumber: string;
  completedAt: Date;
}

export function generateWithdrawalCompletedEmailHTML(data: WithdrawalCompletedEmailData): string {
  const currentYear = new Date().getFullYear();
  const formattedDate = formatDateWIB(data.completedAt);
  const methodLabel = getBankLabel(data.method, data.bankCode);
  
  const detailRows = [
    generateDetailRow('ID Penarikan', data.withdrawalId, { mono: true }),
    generateDetailRow('Waktu Selesai', formattedDate),
    generateDetailRow('Metode', methodLabel),
    generateDetailRow('Rekening Tujuan', data.accountNumber, { mono: true }),
    generateDetailRow('Atas Nama', data.accountName, { bold: true }),
    generateTotalRow('Nominal Diterima', formatIDR(data.netAmount), '#10b981')
  ];
  
  const content = `
    ${generateEmailHeader('Penarikan Berhasil', '#10b981')}
    
    <tr>
      <td class="content-area" style="padding: 28px 24px; background-color: #ffffff;">
        
        ${generateInfoBox('Penarikan Berhasil Diproses', `ID: ${data.withdrawalId}`, 'success')}

        <p class="main-text" style="margin: 0 0 12px; color: #111827; font-size: 15px;">
          Halo <strong>${data.userName}</strong>,
        </p>
        <p class="secondary-text" style="margin: 0 0 24px; color: #4b5563; font-size: 14px; line-height: 1.6;">
          Penarikan saldo Anda telah berhasil diproses. Dana telah dikirim ke rekening tujuan Anda.
        </p>

        ${generateSectionTitle('Detail Penarikan')}
        ${generateDetailTable(detailRows)}

        ${generateInfoBox('Informasi', `Dana telah dikirim ke rekening ${data.accountNumber} (${data.accountName}) via ${methodLabel}. Silakan cek mutasi rekening Anda.`, 'info')}

        ${generateButton('Buka Dashboard', `https://${getPrimaryDomain()}/dashboard`, 'primary')}

      </td>
    </tr>

    ${generateEmailFooter(currentYear, false)}
  `;
  
  return generateEmailWrapper(content);
}

export { formatIDR, formatDateWIB };
