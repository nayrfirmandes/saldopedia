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
import { getPrimaryDomain } from "@/lib/order-token";

interface SellCompletionEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  cryptoSymbol: string;
  cryptoAmount: number;
  amountIdr: number;
  paymentNote: 'exact' | 'overpaid' | 'underpaid';
  expectedAmount: number;
  actuallyPaid: number;
}

export function generateSellCompletionEmailHTML(data: SellCompletionEmailData): string {
  const currentYear = new Date().getFullYear();
  const domain = getPrimaryDomain();
  
  const detailRows = [
    generateDetailRow('ID Order', data.orderId, { mono: true }),
    generateDetailRow('Jenis Transaksi', `Jual ${data.cryptoSymbol}`, { bold: true }),
    generateDetailRow('Jumlah Crypto', `${data.cryptoAmount} ${data.cryptoSymbol}`),
    generateTotalRow('Saldo Ditambahkan', `+${formatIDR(data.amountIdr)}`, '#10b981')
  ];
  
  let paymentNoteBox = '';
  if (data.paymentNote === 'overpaid') {
    paymentNoteBox = generateInfoBox(
      'Catatan Pembayaran',
      `Anda mengirim lebih dari yang diminta (${data.expectedAmount} -> ${data.actuallyPaid} ${data.cryptoSymbol}). Saldo dihitung berdasarkan jumlah yang diterima.`,
      'info'
    );
  } else if (data.paymentNote === 'underpaid') {
    paymentNoteBox = generateInfoBox(
      'Catatan Pembayaran',
      `Anda mengirim kurang dari yang diminta (${data.expectedAmount} -> ${data.actuallyPaid} ${data.cryptoSymbol}). Saldo dihitung berdasarkan jumlah yang diterima.`,
      'warning'
    );
  }
  
  const content = `
    ${generateEmailHeader('Transaksi Selesai', '#10b981')}
    
    <tr>
      <td class="content-area" style="padding: 28px 24px; background-color: #ffffff;">
        
        ${generateInfoBox('Transaksi Berhasil', `Order ID: ${data.orderId}`, 'success')}

        <p class="main-text" style="margin: 0 0 12px; color: #111827; font-size: 15px;">
          Halo <strong>${data.customerName}</strong>,
        </p>
        <p class="secondary-text" style="margin: 0 0 24px; color: #4b5563; font-size: 14px; line-height: 1.6;">
          Pembayaran cryptocurrency Anda telah diterima dan diproses secara otomatis oleh sistem. Saldo akun Anda telah ditambahkan.
        </p>

        ${paymentNoteBox}

        ${generateSectionTitle('Detail Transaksi')}
        ${generateDetailTable(detailRows)}

        ${generateButton('Lihat Dashboard', `https://${domain}/dashboard`, 'primary')}

        <p class="secondary-text" style="margin: 0; color: #6b7280; font-size: 12px; text-align: center;">
          Transaksi ini diproses secara otomatis oleh sistem Saldopedia.
        </p>

      </td>
    </tr>

    ${generateEmailFooter(currentYear, true)}
  `;
  
  return generateEmailWrapper(content);
}

interface AdminSellNotificationData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  userId: number;
  cryptoSymbol: string;
  expectedAmount: number;
  actuallyPaid: number;
  amountIdr: number;
  newSaldo: number;
  paymentNote: 'exact' | 'overpaid' | 'underpaid';
  completedAt: Date;
}

export function generateAdminSellNotificationHTML(data: AdminSellNotificationData): string {
  const currentYear = new Date().getFullYear();
  const domain = getPrimaryDomain();
  const formattedDate = formatDateWIB(data.completedAt);
  
  const customerRows = [
    generateDetailRow('Nama', data.customerName, { bold: true }),
    generateDetailRow('Email', data.customerEmail),
    generateDetailRow('User ID', `#${data.userId}`)
  ];
  
  const transactionRows = [
    generateDetailRow('Jenis', `JUAL ${data.cryptoSymbol}`, { bold: true }),
    generateDetailRow('Jumlah Expected', `${data.expectedAmount} ${data.cryptoSymbol}`),
    generateDetailRow('Actually Paid', `${data.actuallyPaid} ${data.cryptoSymbol}`, { color: '#10b981', bold: true })
  ];
  
  const saldoRows = [
    generateDetailRow('Saldo Ditambahkan', `+${formatIDR(data.amountIdr)}`, { color: '#10b981', bold: true }),
    generateDetailRow('Saldo Sekarang', formatIDR(data.newSaldo))
  ];
  
  let paymentNoteBox = '';
  if (data.paymentNote === 'overpaid') {
    paymentNoteBox = generateInfoBox(
      'OVERPAYMENT',
      `Customer mengirim lebih dari yang diminta (${data.expectedAmount} -> ${data.actuallyPaid} ${data.cryptoSymbol}). Saldo dihitung berdasarkan jumlah yang diterima.`,
      'info'
    );
  } else if (data.paymentNote === 'underpaid') {
    paymentNoteBox = generateInfoBox(
      'UNDERPAYMENT',
      `Customer mengirim kurang dari yang diminta (${data.expectedAmount} -> ${data.actuallyPaid} ${data.cryptoSymbol}). Saldo dihitung berdasarkan jumlah yang diterima.`,
      'warning'
    );
  }
  
  const content = `
    ${generateEmailHeader('JUAL Crypto Sukses', '#10b981')}
    
    <tr>
      <td class="content-area" style="padding: 28px 24px; background-color: #ffffff;">
        
        ${generateInfoBox('Transaksi JUAL Crypto Berhasil', `Order ID: ${data.orderId} | Waktu: ${formattedDate}`, 'success')}

        <p class="secondary-text" style="margin: 0 0 20px; color: #4b5563; font-size: 14px;">
          Saldo otomatis ditambahkan via NOWPayments IPN callback.
        </p>

        ${paymentNoteBox}

        ${generateSectionTitle('Detail Customer')}
        ${generateDetailTable(customerRows)}

        ${generateSectionTitle('Detail Transaksi')}
        ${generateDetailTable(transactionRows)}

        ${generateSectionTitle('Saldo Update')}
        ${generateDetailTable(saldoRows)}

        ${generateButton('Lihat Detail Order', `https://${domain}/dashboard/orders`, 'primary')}

      </td>
    </tr>

    ${generateEmailFooter(currentYear, false)}
  `;
  
  return generateEmailWrapper(content);
}

interface BuyCompletionEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  cryptoSymbol: string;
  cryptoAmount: number;
  walletAddress: string;
  txHash?: string;
}

export function generateBuyCompletionEmailHTML(data: BuyCompletionEmailData): string {
  const currentYear = new Date().getFullYear();
  const domain = getPrimaryDomain();
  
  const truncatedWallet = data.walletAddress.length > 30 
    ? `${data.walletAddress.substring(0, 15)}...${data.walletAddress.substring(data.walletAddress.length - 10)}`
    : data.walletAddress;
  
  const truncatedHash = data.txHash && data.txHash.length > 30
    ? `${data.txHash.substring(0, 15)}...${data.txHash.substring(data.txHash.length - 10)}`
    : data.txHash;
  
  const detailRows = [
    generateDetailRow('ID Order', data.orderId, { mono: true }),
    generateDetailRow('Cryptocurrency', data.cryptoSymbol, { bold: true }),
    generateDetailRow('Jumlah Terkirim', `${data.cryptoAmount} ${data.cryptoSymbol}`, { color: '#10b981', bold: true }),
    generateDetailRow('Wallet Tujuan', truncatedWallet, { mono: true }),
    ...(data.txHash ? [generateDetailRow('TX Hash', truncatedHash || '', { mono: true, color: '#3b82f6' })] : [])
  ];
  
  const content = `
    ${generateEmailHeader('Cryptocurrency Terkirim', '#10b981')}
    
    <tr>
      <td class="content-area" style="padding: 28px 24px; background-color: #ffffff;">
        
        ${generateInfoBox('Transaksi Berhasil', `Order ID: ${data.orderId}`, 'success')}

        <p class="main-text" style="margin: 0 0 12px; color: #111827; font-size: 15px;">
          Halo <strong>${data.customerName}</strong>,
        </p>
        <p class="secondary-text" style="margin: 0 0 24px; color: #4b5563; font-size: 14px; line-height: 1.6;">
          Cryptocurrency Anda telah dikirim secara otomatis ke wallet yang Anda tentukan.
        </p>

        ${generateSectionTitle('Detail Pengiriman')}
        ${generateDetailTable(detailRows)}

        ${generateButton('Lihat Detail Order', `https://${domain}/order/${data.orderId}`, 'primary')}

        <p class="secondary-text" style="margin: 0; color: #6b7280; font-size: 12px; text-align: center;">
          Transaksi ini diproses secara otomatis oleh sistem Saldopedia.
        </p>

      </td>
    </tr>

    ${generateEmailFooter(currentYear, true)}
  `;
  
  return generateEmailWrapper(content);
}

interface AdminBuyNotificationData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  userId: number | null;
  cryptoSymbol: string;
  cryptoAmount: number;
  amountIdr: number;
  walletAddress: string;
  txHash?: string;
  payoutAmount?: string;
  payoutCurrency?: string;
  completedAt: Date;
}

export function generateAdminBuyNotificationHTML(data: AdminBuyNotificationData): string {
  const currentYear = new Date().getFullYear();
  const domain = getPrimaryDomain();
  const formattedDate = formatDateWIB(data.completedAt);
  
  const truncatedWallet = data.walletAddress.length > 30 
    ? `${data.walletAddress.substring(0, 15)}...${data.walletAddress.substring(data.walletAddress.length - 10)}`
    : data.walletAddress;
  
  const truncatedHash = data.txHash && data.txHash.length > 30
    ? `${data.txHash.substring(0, 15)}...${data.txHash.substring(data.txHash.length - 10)}`
    : data.txHash;
  
  const customerRows = [
    generateDetailRow('Nama', data.customerName, { bold: true }),
    generateDetailRow('Email', data.customerEmail),
    generateDetailRow('User ID', `#${data.userId || 'N/A'}`)
  ];
  
  const transactionRows = [
    generateDetailRow('Jenis', `BELI ${data.cryptoSymbol}`, { bold: true }),
    generateDetailRow('Saldo Digunakan', `-${formatIDR(data.amountIdr)}`, { color: '#ef4444', bold: true }),
    generateDetailRow('Crypto Dikirim', `${data.payoutAmount || data.cryptoAmount} ${data.payoutCurrency || data.cryptoSymbol}`, { color: '#10b981', bold: true })
  ];
  
  const payoutRows = [
    generateDetailRow('Wallet Tujuan', truncatedWallet, { mono: true }),
    ...(data.txHash ? [generateDetailRow('TX Hash', truncatedHash || '', { mono: true, color: '#3b82f6' })] : [])
  ];
  
  const content = `
    ${generateEmailHeader('BELI Crypto Sukses', '#3b82f6')}
    
    <tr>
      <td class="content-area" style="padding: 28px 24px; background-color: #ffffff;">
        
        ${generateInfoBox('Transaksi BELI Crypto Berhasil', `Order ID: ${data.orderId} | Waktu: ${formattedDate}`, 'info')}

        <p class="secondary-text" style="margin: 0 0 20px; color: #4b5563; font-size: 14px;">
          Payout otomatis dikirim via NOWPayments.
        </p>

        ${generateSectionTitle('Detail Customer')}
        ${generateDetailTable(customerRows)}

        ${generateSectionTitle('Detail Transaksi')}
        ${generateDetailTable(transactionRows)}

        ${generateSectionTitle('Detail Payout')}
        ${generateDetailTable(payoutRows)}

        ${generateButton('Lihat Detail Order', `https://${domain}/order/${data.orderId}`, 'primary')}

      </td>
    </tr>

    ${generateEmailFooter(currentYear, false)}
  `;
  
  return generateEmailWrapper(content);
}

export { formatIDR, formatDateWIB };
