import {
  generateEmailWrapper,
  generateEmailHeader,
  generateEmailFooter,
  generateInfoBox,
  generateButton,
  generateDetailRow,
  generateDetailTable,
  generateTotalRow,
  generateAmountDisplay,
  generateSectionTitle,
  formatIDR,
  formatDateWIB
} from '@/lib/email-base';
import { getPrimaryDomain } from '@/lib/order-token';

interface DepositUserRequestEmailData {
  depositId: string;
  userName: string;
  amount: number;
  fee: number;
  uniqueCode: number;
  totalAmount: number;
  method: string;
  bankCode: string | null;
  targetAccount: {
    name: string;
    number: string;
  };
  createdAt: Date;
}

export function generateDepositUserRequestEmailHTML(data: DepositUserRequestEmailData): string {
  const currentYear = new Date().getFullYear();
  const formattedDate = formatDateWIB(data.createdAt);
  const methodLabel = data.method === 'bank_transfer' ? `Bank Transfer (${data.bankCode})` : `E-Wallet (${data.bankCode})`;
  
  const detailRows = [
    generateDetailRow('ID Deposit', data.depositId, { mono: true }),
    generateDetailRow('Waktu', formattedDate),
    generateDetailRow('Metode', methodLabel),
    generateDetailRow('Transfer ke', data.targetAccount.number, { mono: true }),
    generateDetailRow('Atas Nama', data.targetAccount.name, { bold: true }),
    generateDetailRow('Nominal Deposit', formatIDR(data.amount)),
    generateDetailRow('Biaya Admin', formatIDR(data.fee)),
    generateDetailRow('Kode Unik', `+${formatIDR(data.uniqueCode)}`, { color: '#f59e0b', bold: true }),
    generateTotalRow('Total Transfer', formatIDR(data.totalAmount), '#3b82f6')
  ];
  
  const content = `
    ${generateEmailHeader('Deposit Request', '#3b82f6')}
    
    <tr>
      <td class="content-area" style="padding: 28px 24px; background-color: #ffffff;">
        
        ${generateInfoBox('Deposit Request Diterima', `ID: ${data.depositId}`, 'info')}

        <p class="main-text" style="margin: 0 0 12px; color: #111827; font-size: 15px;">
          Halo <strong>${data.userName}</strong>,
        </p>
        <p class="secondary-text" style="margin: 0 0 24px; color: #4b5563; font-size: 14px; line-height: 1.6;">
          Deposit request Anda telah kami terima. Setelah kami verifikasi bukti transfer, saldo Anda akan otomatis bertambah.
        </p>

        ${generateSectionTitle('Detail Deposit')}
        ${generateDetailTable(detailRows)}

        ${generateInfoBox('Status', 'Menunggu verifikasi admin. Proses verifikasi biasanya memakan waktu 5-30 menit pada jam kerja.', 'warning')}

        ${generateButton('Cek Status di Dashboard', `https://${getPrimaryDomain()}/dashboard`, 'primary')}

      </td>
    </tr>

    ${generateEmailFooter(currentYear, false)}
  `;
  
  return generateEmailWrapper(content);
}

interface DepositAdminEmailData {
  depositId: string;
  userName: string;
  userEmail: string;
  userPhone: string | null;
  amount: number;
  fee: number;
  uniqueCode: number;
  totalAmount: number;
  method: string;
  bankCode: string | null;
  confirmUrl: string;
  rejectUrl: string;
  createdAt: Date;
}

export function generateDepositAdminEmailHTML(data: DepositAdminEmailData): string {
  const currentYear = new Date().getFullYear();
  const formattedDate = formatDateWIB(data.createdAt);
  const methodLabel = data.method === 'bank_transfer' ? `Bank Transfer (${data.bankCode})` : `E-Wallet (${data.bankCode})`;
  
  const userRows = [
    generateDetailRow('Nama', data.userName, { bold: true }),
    generateDetailRow('Email', data.userEmail),
    ...(data.userPhone ? [generateDetailRow('Telepon', data.userPhone)] : [])
  ];
  
  const detailRows = [
    generateDetailRow('ID Deposit', data.depositId, { mono: true }),
    generateDetailRow('Waktu', formattedDate),
    generateDetailRow('Metode', methodLabel),
    generateDetailRow('Nominal Deposit', formatIDR(data.amount)),
    generateDetailRow('Biaya Admin', formatIDR(data.fee)),
    generateDetailRow('Kode Unik', `+${formatIDR(data.uniqueCode)}`, { color: '#f59e0b', bold: true }),
    generateTotalRow('Total Transfer', formatIDR(data.totalAmount), '#10b981')
  ];
  
  const content = `
    ${generateEmailHeader('Deposit Request - Admin', '#10b981')}
    
    <tr>
      <td class="content-area" style="padding: 28px 24px; background-color: #ffffff;">
        
        ${generateInfoBox('Deposit Request Baru', `ID: ${data.depositId}`, 'success')}

        <p class="secondary-text" style="margin: 0 0 20px; color: #4b5563; font-size: 14px;">
          User telah membuat request deposit. Cek bukti transfer di attachment email ini.
        </p>

        ${generateSectionTitle('Detail User')}
        ${generateDetailTable(userRows)}

        ${generateSectionTitle('Detail Deposit')}
        ${generateDetailTable(detailRows)}

        ${generateInfoBox('Bukti Transfer', 'Lihat attachment email ini untuk bukti transfer dari user.', 'warning')}

        <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="width: 100%; margin: 20px 0;">
          <tr>
            <td style="padding: 0 4px; width: 50%;">
              ${generateButton('Konfirmasi Deposit', data.confirmUrl, 'success')}
            </td>
            <td style="padding: 0 4px; width: 50%;">
              ${generateButton('Tolak Deposit', data.rejectUrl, 'danger')}
            </td>
          </tr>
        </table>
        
        <p class="secondary-text" style="margin: 0; text-align: center; color: #9ca3af; font-size: 11px;">
          Klik tombol hijau untuk konfirmasi atau tombol merah untuk menolak
        </p>

      </td>
    </tr>

    ${generateEmailFooter(currentYear, false)}
  `;
  
  return generateEmailWrapper(content);
}

interface DepositUserConfirmEmailData {
  depositId: string;
  userName: string;
  amount: number;
  method: string;
  bankCode: string | null;
  completedAt: Date;
  newSaldo: number;
}

export function generateDepositUserConfirmEmailHTML(data: DepositUserConfirmEmailData): string {
  const currentYear = new Date().getFullYear();
  const formattedDate = formatDateWIB(data.completedAt);
  const methodLabel = data.method === 'bank_transfer' ? `Bank Transfer (${data.bankCode})` : `E-Wallet (${data.bankCode})`;
  
  const detailRows = [
    generateDetailRow('ID Deposit', data.depositId, { mono: true }),
    generateDetailRow('Waktu Konfirmasi', formattedDate),
    generateDetailRow('Metode', methodLabel),
    generateTotalRow('Nominal Deposit', formatIDR(data.amount), '#10b981')
  ];
  
  const content = `
    ${generateEmailHeader('Deposit Berhasil', '#10b981')}
    
    <tr>
      <td class="content-area" style="padding: 28px 24px; background-color: #ffffff;">
        
        ${generateInfoBox('Deposit Berhasil Dikonfirmasi', `ID: ${data.depositId}`, 'success')}

        <p class="main-text" style="margin: 0 0 12px; color: #111827; font-size: 15px;">
          Halo <strong>${data.userName}</strong>,
        </p>
        <p class="secondary-text" style="margin: 0 0 24px; color: #4b5563; font-size: 14px; line-height: 1.6;">
          Deposit Anda telah berhasil dikonfirmasi dan saldo akun Anda telah diperbarui.
        </p>

        ${generateSectionTitle('Detail Deposit')}
        ${generateDetailTable(detailRows)}

        ${generateAmountDisplay('Saldo Anda Saat Ini', formatIDR(data.newSaldo), '#10b981', 'large')}

        ${generateButton('Buka Dashboard', `https://${getPrimaryDomain()}/dashboard`, 'primary')}

      </td>
    </tr>

    ${generateEmailFooter(currentYear, false)}
  `;
  
  return generateEmailWrapper(content);
}

interface DepositExpiredEmailData {
  depositId: string;
  userName: string;
  amount: number;
  fee: number;
  uniqueCode: number;
  totalAmount: number;
  method: string;
  bankCode: string | null;
  createdAt: Date;
  expiredAt: Date;
}

export function generateDepositExpiredEmailHTML(data: DepositExpiredEmailData): string {
  const currentYear = new Date().getFullYear();
  const formattedCreatedDate = formatDateWIB(data.createdAt);
  const formattedExpiredDate = formatDateWIB(data.expiredAt);
  const methodLabel = data.method === 'bank_transfer' ? `Bank Transfer (${data.bankCode})` : `E-Wallet (${data.bankCode})`;
  
  const detailRows = [
    generateDetailRow('ID Deposit', data.depositId, { mono: true }),
    generateDetailRow('Waktu Request', formattedCreatedDate),
    generateDetailRow('Waktu Expired', formattedExpiredDate, { color: '#ef4444' }),
    generateDetailRow('Metode', methodLabel),
    generateDetailRow('Nominal Deposit', formatIDR(data.amount)),
    generateDetailRow('Biaya Admin', formatIDR(data.fee)),
    generateDetailRow('Kode Unik', `+${formatIDR(data.uniqueCode)}`, { color: '#f59e0b', bold: true }),
    generateTotalRow('Total Transfer', formatIDR(data.totalAmount), '#6b7280')
  ];
  
  const content = `
    ${generateEmailHeader('Deposit Expired', '#ef4444')}
    
    <tr>
      <td class="content-area" style="padding: 28px 24px; background-color: #ffffff;">
        
        ${generateInfoBox('Deposit Request Expired', `ID: ${data.depositId}`, 'error')}

        <p class="main-text" style="margin: 0 0 12px; color: #111827; font-size: 15px;">
          Halo <strong>${data.userName}</strong>,
        </p>
        <p class="secondary-text" style="margin: 0 0 24px; color: #4b5563; font-size: 14px; line-height: 1.6;">
          Deposit request Anda telah expired karena tidak ada bukti transfer yang diterima dalam waktu 1 jam.
        </p>

        ${generateSectionTitle('Detail Deposit yang Expired')}
        ${generateDetailTable(detailRows)}

        ${generateInfoBox('Catatan Penting', 'Jika Anda sudah melakukan transfer, silakan hubungi customer service kami untuk bantuan lebih lanjut.', 'warning')}

        ${generateButton('Buat Deposit Baru', `https://${getPrimaryDomain()}/dashboard/deposit`, 'primary')}

      </td>
    </tr>

    ${generateEmailFooter(currentYear, true)}
  `;
  
  return generateEmailWrapper(content);
}

interface DepositRejectedEmailData {
  depositId: string;
  userName: string;
  amount: number;
  method: string;
  bankCode: string | null;
  rejectedAt: Date;
}

export function generateDepositRejectedEmailHTML(data: DepositRejectedEmailData): string {
  const currentYear = new Date().getFullYear();
  const formattedDate = formatDateWIB(data.rejectedAt);
  const methodLabel = data.method === 'bank_transfer' ? `Bank Transfer (${data.bankCode})` : `E-Wallet (${data.bankCode})`;
  
  const detailRows = [
    generateDetailRow('ID Deposit', data.depositId, { mono: true }),
    generateDetailRow('Waktu Ditolak', formattedDate, { color: '#ef4444' }),
    generateDetailRow('Metode', methodLabel),
    generateTotalRow('Nominal Deposit', formatIDR(data.amount), '#6b7280')
  ];
  
  const content = `
    ${generateEmailHeader('Deposit Ditolak', '#ef4444')}
    
    <tr>
      <td class="content-area" style="padding: 28px 24px; background-color: #ffffff;">
        
        ${generateInfoBox('Deposit Ditolak', `ID: ${data.depositId}`, 'error')}

        <p class="main-text" style="margin: 0 0 12px; color: #111827; font-size: 15px;">
          Halo <strong>${data.userName}</strong>,
        </p>
        <p class="secondary-text" style="margin: 0 0 24px; color: #4b5563; font-size: 14px; line-height: 1.6;">
          Mohon maaf, deposit Anda tidak dapat kami proses. Hal ini mungkin terjadi karena bukti transfer tidak valid atau tidak sesuai dengan nominal yang diminta.
        </p>

        ${generateSectionTitle('Detail Deposit yang Ditolak')}
        ${generateDetailTable(detailRows)}

        ${generateInfoBox('Butuh Bantuan?', 'Jika Anda merasa ini adalah kesalahan atau membutuhkan klarifikasi, silakan hubungi customer service kami via WhatsApp.', 'warning')}

        ${generateButton('Hubungi Customer Service', 'https://wa.me/628119666620?text=Halo%20Saldopedia%2C%20deposit%20saya%20ditolak%20dengan%20ID%20' + data.depositId, 'primary')}

      </td>
    </tr>

    ${generateEmailFooter(currentYear, true)}
  `;
  
  return generateEmailWrapper(content);
}

export { formatIDR };
