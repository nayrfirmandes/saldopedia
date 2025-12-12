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

interface TransferSenderEmailData {
  transferId: string;
  senderName: string;
  receiverName: string;
  receiverEmail: string;
  amount: number;
  notes: string | null;
  newSaldo: number;
  createdAt: Date;
}

export function generateTransferSenderEmailHTML(data: TransferSenderEmailData): string {
  const currentYear = new Date().getFullYear();
  const formattedDate = formatDateWIB(data.createdAt);
  
  const detailRows = [
    generateDetailRow('ID Transfer', data.transferId, { mono: true }),
    generateDetailRow('Waktu', formattedDate),
    generateDetailRow('Penerima', data.receiverName, { bold: true }),
    generateDetailRow('Email Penerima', data.receiverEmail),
    ...(data.notes ? [generateDetailRow('Catatan', data.notes)] : []),
    generateTotalRow('Nominal Transfer', formatIDR(data.amount), '#10b981')
  ];
  
  const content = `
    ${generateEmailHeader('Transfer Berhasil', '#10b981')}
    
    <tr>
      <td class="content-area" style="padding: 28px 24px; background-color: #ffffff;">
        
        ${generateInfoBox('Transfer Saldo Berhasil', `ID: ${data.transferId}`, 'success')}

        <p class="main-text" style="margin: 0 0 12px; color: #111827; font-size: 15px;">
          Halo <strong>${data.senderName}</strong>,
        </p>
        <p class="secondary-text" style="margin: 0 0 24px; color: #4b5563; font-size: 14px; line-height: 1.6;">
          Transfer saldo Anda ke <strong class="main-text" style="color: #111827;">${data.receiverName}</strong> telah berhasil diproses.
        </p>

        ${generateSectionTitle('Detail Transfer')}
        ${generateDetailTable(detailRows)}

        ${generateAmountDisplay('Saldo Anda Saat Ini', formatIDR(data.newSaldo), '#10b981')}

        ${generateButton('Lihat Riwayat Transfer', `https://${getPrimaryDomain()}/dashboard/transfer`, 'primary')}

      </td>
    </tr>

    ${generateEmailFooter(currentYear, false)}
  `;
  
  return generateEmailWrapper(content);
}

interface TransferReceiverEmailData {
  transferId: string;
  senderName: string;
  senderEmail: string;
  receiverName: string;
  amount: number;
  notes: string | null;
  newSaldo: number;
  createdAt: Date;
}

export function generateTransferReceiverEmailHTML(data: TransferReceiverEmailData): string {
  const currentYear = new Date().getFullYear();
  const formattedDate = formatDateWIB(data.createdAt);
  
  const detailRows = [
    generateDetailRow('ID Transfer', data.transferId, { mono: true }),
    generateDetailRow('Waktu', formattedDate),
    generateDetailRow('Pengirim', data.senderName, { bold: true }),
    generateDetailRow('Email Pengirim', data.senderEmail),
    ...(data.notes ? [generateDetailRow('Catatan', data.notes)] : [])
  ];
  
  const content = `
    ${generateEmailHeader('Saldo Diterima', '#3b82f6')}
    
    <tr>
      <td class="content-area" style="padding: 28px 24px; background-color: #ffffff;">
        
        ${generateInfoBox('Anda Menerima Transfer Saldo', `ID: ${data.transferId}`, 'info')}

        <p class="main-text" style="margin: 0 0 12px; color: #111827; font-size: 15px;">
          Halo <strong>${data.receiverName}</strong>,
        </p>
        <p class="secondary-text" style="margin: 0 0 24px; color: #4b5563; font-size: 14px; line-height: 1.6;">
          Anda menerima transfer saldo dari <strong class="main-text" style="color: #111827;">${data.senderName}</strong>. Saldo Anda telah bertambah.
        </p>

        ${generateAmountDisplay('Anda Menerima', formatIDR(data.amount), '#3b82f6', 'large')}

        ${generateSectionTitle('Detail Transfer')}
        ${generateDetailTable(detailRows)}

        ${generateAmountDisplay('Saldo Anda Saat Ini', formatIDR(data.newSaldo), '#10b981')}

        ${generateButton('Buka Dashboard', `https://${getPrimaryDomain()}/dashboard`, 'primary')}

      </td>
    </tr>

    ${generateEmailFooter(currentYear, false)}
  `;
  
  return generateEmailWrapper(content);
}

export { formatIDR };
