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
  formatIDR,
  formatDateWIB
} from '@/lib/email-base';
import { getPrimaryDomain } from "@/lib/order-token";

function getServiceAmount(data: any): string {
  if (data.serviceType === "cryptocurrency") {
    // For both BUY and SELL crypto, amountInput is the crypto amount
    // BUY: amountInput = calculated crypto amount user will receive
    // SELL: amountInput = crypto amount user is selling
    const cryptoAmount = parseFloat(data.amountInput) || 0;
    return `${cryptoAmount.toFixed(8).replace(/\.?0+$/, '')} ${data.cryptoSymbol}`;
  }
  return `$${parseFloat(data.amountInput).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 2})}`;
}

function generateTransactionBadge(transactionType: string, transactionLabel: string): string {
  const isBuy = transactionType === 'buy';
  return `
    <tr class="detail-row" style="border-bottom: 1px solid #f3f4f6;">
      <td class="detail-label" style="padding: 10px 0; color: #6b7280; font-size: 13px;">Jenis Transaksi</td>
      <td style="padding: 10px 0; text-align: right;">
        <span style="display: inline-block; padding: 4px 10px; background-color: ${isBuy ? '#dcfce7' : '#fef3c7'}; color: ${isBuy ? '#166534' : '#92400e'}; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase;">${transactionLabel}</span>
      </td>
    </tr>
  `;
}

function generatePaymentDetails(data: any): string {
  let html = '';
  
  // For SELL PayPal/Skrill: show source email, IDR goes to Saldopedia account balance
  if (data.transactionType === 'sell' && (data.serviceType === 'paypal' || data.serviceType === 'skrill')) {
    // Section 1: Source (PayPal/Skrill email that user will send from)
    const sourceRows: string[] = [];
    if (data.paypalEmail) {
      sourceRows.push(generateDetailRow('Email PayPal Anda', data.paypalEmail));
    }
    if (data.skrillEmail) {
      sourceRows.push(generateDetailRow('Email Skrill Anda', data.skrillEmail));
    }
    
    if (sourceRows.length > 0) {
      const sourceTitle = data.serviceType === 'paypal' ? 'Sumber Saldo PayPal' : 'Sumber Saldo Skrill';
      html += `
        <div style="margin-top: 20px;">
          <p class="secondary-text" style="margin: 0 0 12px; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
            ${sourceTitle}
          </p>
          ${generateDetailTable(sourceRows)}
        </div>
      `;
    }
    
    // Section 2: Destination is Saldopedia account balance
    const destRows: string[] = [];
    destRows.push(generateDetailRow('Tujuan', 'Saldo Akun Saldopedia', { bold: true, color: '#10b981' }));
    
    html += `
      <div style="margin-top: 20px;">
        <p class="secondary-text" style="margin: 0 0 12px; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
          Penerimaan IDR
        </p>
        ${generateDetailTable(destRows)}
      </div>
    `;
    
    return html;
  }
  
  // For other transaction types, use the original logic
  const rows: string[] = [];
  
  if (data.paypalEmail) {
    rows.push(generateDetailRow('Email PayPal', data.paypalEmail));
  }
  if (data.skrillEmail) {
    rows.push(generateDetailRow('Email Skrill', data.skrillEmail));
  }
  if (data.cryptoNetwork) {
    rows.push(generateDetailRow('Network', data.cryptoNetwork));
  }
  if (data.walletAddress) {
    rows.push(generateDetailRow('Wallet Address', data.walletAddress, { mono: true, color: '#10b981' }));
  }
  if (data.xrpTag) {
    rows.push(generateDetailRow('XRP Tag', data.xrpTag, { mono: true }));
  }
  if (data.depositAddress) {
    rows.push(generateDetailRow('Deposit Address', data.depositAddress, { mono: true, color: '#10b981' }));
  }
  if (data.paymentMethod) {
    rows.push(generateDetailRow('Metode Pembayaran', data.paymentMethod));
  }
  if (data.paymentAccountName) {
    rows.push(generateDetailRow('Nama Pemilik', data.paymentAccountName, { bold: true }));
  }
  if (data.paymentAccountNumber) {
    rows.push(generateDetailRow('No. Rekening/HP', data.paymentAccountNumber, { mono: true }));
  }
  
  if (rows.length === 0) return '';
  
  let sectionTitle = 'Detail Pembayaran';
  if (data.transactionType === 'sell') {
    sectionTitle = 'Tujuan Penerimaan IDR';
  } else if (data.transactionType === 'buy') {
    if (data.serviceType === 'cryptocurrency') {
      sectionTitle = 'Tujuan Penerimaan Crypto';
    } else if (data.serviceType === 'paypal') {
      sectionTitle = 'Tujuan Penerimaan PayPal';
    } else if (data.serviceType === 'skrill') {
      sectionTitle = 'Tujuan Penerimaan Skrill';
    }
  }
  
  return `
    <div style="margin-top: 20px;">
      <p class="secondary-text" style="margin: 0 0 12px; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
        ${sectionTitle}
      </p>
      ${generateDetailTable(rows)}
    </div>
  `;
}

export function generateCustomerEmailHTML(data: any, serviceLabel: string, transactionLabel: string): string {
  const currentYear = new Date().getFullYear();
  
  // Calculate network fee and crypto price for display
  const networkFee = parseFloat(data.networkFee) || 0;
  const totalIdr = parseFloat(data.amountIdr);
  const cryptoPrice = networkFee > 0 ? totalIdr - networkFee : totalIdr;
  
  const detailRows = [
    generateDetailRow('Layanan', `${serviceLabel}${data.serviceType === "cryptocurrency" && data.cryptoSymbol ? ` (${data.cryptoSymbol})` : ''}`, { bold: true }),
    generateTransactionBadge(data.transactionType, transactionLabel),
    generateDetailRow('Jumlah', getServiceAmount(data), { bold: true }),
    generateDetailRow('Rate', formatIDR(parseFloat(data.rate))),
    // Show network fee breakdown for crypto BUY orders
    ...(data.serviceType === "cryptocurrency" && data.transactionType === "buy" && networkFee > 0 ? [
      generateDetailRow('Harga Crypto', formatIDR(cryptoPrice)),
      generateDetailRow('Biaya Jaringan', formatIDR(networkFee)),
    ] : []),
    generateTotalRow('Total IDR', formatIDR(totalIdr), '#3b82f6')
  ];
  
  const flowDescription = data.paidWithSaldo 
    ? (data.serviceType === "cryptocurrency" 
      ? `Pembayaran via Saldo ${formatIDR(parseFloat(data.amountIdr))} → Terima ${data.cryptoSymbol}`
      : `Pembayaran via Saldo ${formatIDR(parseFloat(data.amountIdr))} → Terima saldo ${data.serviceType === "paypal" ? "PayPal" : "Skrill"}`)
    : (data.transactionType === "buy" 
      ? (data.serviceType === "cryptocurrency" 
        ? `Transfer ${formatIDR(parseFloat(data.amountIdr))} → Terima ${data.cryptoSymbol}`
        : `Transfer ${formatIDR(parseFloat(data.amountIdr))} → Terima saldo ${data.serviceType === "paypal" ? "PayPal" : "Skrill"}`)
      : (data.serviceType === "cryptocurrency"
        ? `Kirim ${data.cryptoSymbol} → Terima ${formatIDR(parseFloat(data.amountIdr))}`
        : `Kirim saldo ${data.serviceType === "paypal" ? "PayPal" : "Skrill"} → Terima ${formatIDR(parseFloat(data.amountIdr))}`));
  
  const content = `
    ${generateEmailHeader('Konfirmasi Order', '#3b82f6')}
    
    <tr>
      <td class="content-area" style="padding: 28px 24px; background-color: #ffffff;">
        
        ${generateInfoBox('Order Berhasil Diterima', `Order ID: ${data.orderId}`, 'success')}

        <p class="main-text" style="margin: 0 0 12px; color: #111827; font-size: 15px;">
          Halo <strong>${data.customerName}</strong>,
        </p>
        <p class="secondary-text" style="margin: 0 0 24px; color: #4b5563; font-size: 14px; line-height: 1.6;">
          Terima kasih telah mempercayai Saldopedia. Order Anda telah kami terima dan akan segera diproses.
        </p>

        ${generateSectionTitle('Detail Order')}
        ${generateDetailTable(detailRows)}
        
        ${generatePaymentDetails(data)}

        ${generateInfoBox('Alur Transaksi', flowDescription, data.paidWithSaldo ? 'success' : (data.transactionType === 'buy' ? 'info' : 'success'))}

        ${data.paidWithSaldo ? `
        ${generateInfoBox('Pembayaran dengan Saldo Berhasil', `Saldo Anda telah dipotong sebesar ${formatIDR(parseFloat(data.amountIdr))}. Order akan segera diproses tanpa perlu transfer manual.`, 'success')}
        ` : ''}

        ${data.transactionType === "buy" && data.serviceType === "cryptocurrency" ? `
        <div class="amount-display" style="text-align: center; margin-bottom: 24px; padding: 20px; background-color: #f0fdf4; border-radius: 8px;">
          <p style="margin: 0 0 12px; color: #166534; font-size: 13px; font-weight: 600;">
            Order Anda sedang diproses secara otomatis
          </p>
          <p style="margin: 0 0 16px; color: #15803d; font-size: 12px;">
            Estimasi waktu: 5-15 menit. Anda akan menerima notifikasi email saat selesai.
          </p>
          ${generateButton('Lihat Status di Dashboard', `https://${getPrimaryDomain()}/dashboard`, 'primary')}
        </div>
        ` : data.transactionType === "buy" ? `
        <div class="amount-display" style="text-align: center; margin-bottom: 24px; padding: 20px; background-color: #eff6ff; border-radius: 8px;">
          <p style="margin: 0 0 12px; color: #1e40af; font-size: 13px; font-weight: 600;">
            Order Anda sedang diproses oleh tim kami
          </p>
          <p style="margin: 0 0 16px; color: #3b82f6; font-size: 12px;">
            Saldo ${data.serviceType === "paypal" ? "PayPal" : "Skrill"} akan dikirim ke email Anda dalam waktu 1x24 jam kerja.
          </p>
          ${generateButton('Lihat Status di Dashboard', `https://${getPrimaryDomain()}/dashboard`, 'primary')}
        </div>
        ` : `
        <div class="amount-display" style="text-align: center; margin-bottom: 24px; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
          <p class="secondary-text" style="margin: 0 0 16px; color: #374151; font-size: 13px;">
            Lihat alamat deposit dan instruksi pengiriman
          </p>
          ${generateButton('Lihat Instruksi Pembayaran', `https://${getPrimaryDomain()}/order/instructions/${data.orderId}`, 'success')}
        </div>
        `}

      </td>
    </tr>

    ${generateEmailFooter(currentYear, true)}
  `;
  
  return generateEmailWrapper(content);
}

export function generateInvoiceEmailHTML(data: any, serviceLabel: string, transactionLabel: string): string {
  const currentYear = new Date().getFullYear();
  const formattedDate = formatDateWIB(data.completedAt);
  
  // Calculate network fee and crypto price for display
  const networkFee = parseFloat(data.networkFee) || 0;
  const totalIdr = parseFloat(data.amountIdr);
  const cryptoPrice = networkFee > 0 ? totalIdr - networkFee : totalIdr;
  
  const detailRows = [
    generateDetailRow('ID Invoice', data.orderId, { mono: true }),
    generateDetailRow('Tanggal', formattedDate),
    generateDetailRow('Layanan', `${serviceLabel}${data.serviceType === "cryptocurrency" && data.cryptoSymbol ? ` (${data.cryptoSymbol})` : ''}`, { bold: true }),
    generateTransactionBadge(data.transactionType, transactionLabel),
    ...(data.cryptoNetwork ? [generateDetailRow('Network', data.cryptoNetwork)] : []),
    generateDetailRow('Jumlah', getServiceAmount(data), { bold: true }),
    generateDetailRow('Rate', formatIDR(parseFloat(data.rate))),
    // Show network fee breakdown for crypto BUY orders
    ...(data.serviceType === "cryptocurrency" && data.transactionType === "buy" && networkFee > 0 ? [
      generateDetailRow('Harga Crypto', formatIDR(cryptoPrice)),
      generateDetailRow('Biaya Jaringan', formatIDR(networkFee)),
    ] : []),
    generateTotalRow('Total IDR', formatIDR(totalIdr), '#10b981')
  ];
  
  const content = `
    ${generateEmailHeader('Invoice - Transaksi Selesai', '#10b981')}
    
    <tr>
      <td class="content-area" style="padding: 28px 24px; background-color: #ffffff;">
        
        ${generateInfoBox('Transaksi Selesai', `Invoice: ${data.orderId}`, 'success')}

        <p class="secondary-text" style="margin: 0 0 24px; color: #4b5563; font-size: 14px;">
          Terima kasih, <strong class="main-text" style="color: #111827;">${data.customerName}</strong>! Transaksi Anda telah berhasil diselesaikan.
        </p>

        ${generateSectionTitle('Detail Invoice')}
        ${generateDetailTable(detailRows)}
        
        ${generatePaymentDetails(data)}

        ${data.transactionType === 'sell' ? `
        ${generateInfoBox('Saldo Dikreditkan', `Saldo akun Anda telah ditambah sebesar ${formatIDR(parseFloat(data.amountIdr))}. Anda dapat melihat saldo di Dashboard atau menggunakannya untuk transaksi berikutnya.`, 'success')}
        ` : ''}

        ${generateInfoBox('Terima Kasih', 'Terima kasih telah menggunakan layanan Saldopedia!', 'info')}

      </td>
    </tr>

    ${generateEmailFooter(currentYear, true)}
  `;
  
  return generateEmailWrapper(content);
}

export function generateAdminEmailHTML(data: any, serviceLabel: string, transactionLabel: string): string {
  const currentYear = new Date().getFullYear();
  
  // Calculate network fee and crypto price for display
  const networkFee = parseFloat(data.networkFee) || 0;
  const totalIdr = parseFloat(data.amountIdr);
  const cryptoPrice = networkFee > 0 ? totalIdr - networkFee : totalIdr;
  
  const customerRows = [
    generateDetailRow('Nama', data.customerName, { bold: true }),
    generateDetailRow('Email', data.customerEmail),
    `<tr class="detail-row" style="border-bottom: 1px solid #f3f4f6;">
      <td class="detail-label" style="padding: 10px 0; color: #6b7280; font-size: 13px;">WhatsApp</td>
      <td style="padding: 10px 0; text-align: right;">
        <a href="https://wa.me/${data.customerPhone.replace(/^0/, '62')}" style="color: #10b981; text-decoration: none; font-size: 13px; font-weight: 600;">${data.customerPhone}</a>
      </td>
    </tr>`
  ];
  
  const orderRows = [
    generateDetailRow('Layanan', `${serviceLabel}${data.serviceType === "cryptocurrency" && data.cryptoSymbol ? ` (${data.cryptoSymbol})` : ''}`, { bold: true }),
    generateTransactionBadge(data.transactionType, transactionLabel),
    generateDetailRow('Jumlah', getServiceAmount(data), { bold: true }),
    generateDetailRow('Rate', formatIDR(parseFloat(data.rate))),
    // Show network fee breakdown for crypto BUY orders
    ...(data.serviceType === "cryptocurrency" && data.transactionType === "buy" && networkFee > 0 ? [
      generateDetailRow('Harga Crypto', formatIDR(cryptoPrice)),
      generateDetailRow('Biaya Jaringan', formatIDR(networkFee)),
    ] : []),
    generateTotalRow('Total IDR', formatIDR(totalIdr), '#f59e0b')
  ];
  
  const content = `
    ${generateEmailHeader('Admin - Order Baru', '#f59e0b')}
    
    <tr>
      <td class="content-area" style="padding: 28px 24px; background-color: #ffffff;">
        
        ${generateInfoBox(
          `Order Baru Diterima ${data.paidWithSaldo ? '(DIBAYAR SALDO)' : ''}`,
          `Order ID: ${data.orderId}${data.paidWithSaldo ? ' | Status: CONFIRMED - Saldo sudah dipotong otomatis' : ''}`,
          data.paidWithSaldo ? 'success' : 'warning'
        )}

        ${generateSectionTitle('Info Customer')}
        ${generateDetailTable(customerRows)}

        ${generateSectionTitle('Detail Order')}
        ${generateDetailTable(orderRows)}
        
        ${generatePaymentDetails(data)}

        <div class="amount-display" style="text-align: center; margin: 24px 0; padding: 20px; background-color: #fffbeb; border-radius: 8px;">
          <p style="margin: 0 0 16px; color: #78350f; font-size: 13px; font-weight: 600;">
            Proses order ini sekarang
          </p>
          <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="width: 100%; margin: 0 0 16px 0;">
            <tr>
              <td style="padding: 0 4px; width: 50%;">
                ${generateButton('Complete Order', data.completionUrl, 'success')}
              </td>
              <td style="padding: 0 4px; width: 50%;">
                ${generateButton('Tolak Order', data.rejectUrl, 'danger')}
              </td>
            </tr>
          </table>
          <p class="secondary-text" style="margin: 0; color: #9ca3af; font-size: 11px;">
            Klik tombol hijau untuk selesaikan atau tombol merah untuk menolak
          </p>
        </div>

      </td>
    </tr>

    ${generateEmailFooter(currentYear, false)}
  `;
  
  return generateEmailWrapper(content);
}

export function generateExpiredEmailHTML(data: any, serviceLabel: string, transactionLabel: string): string {
  const currentYear = new Date().getFullYear();
  
  const summaryRows = [
    generateDetailRow('Layanan', `${serviceLabel}${data.serviceType === "cryptocurrency" && data.cryptoSymbol ? ` (${data.cryptoSymbol})` : ''}`),
    generateTransactionBadge(data.transactionType, transactionLabel),
    generateDetailRow('Total', formatIDR(parseFloat(data.amountIdr)), { bold: true })
  ];
  
  const content = `
    ${generateEmailHeader('Order Expired', '#ef4444')}
    
    <tr>
      <td class="content-area" style="padding: 28px 24px; background-color: #ffffff;">
        
        ${generateInfoBox('Order Telah Expired', `Order ID: ${data.orderId}`, 'error')}

        <p class="main-text" style="margin: 0 0 12px; color: #111827; font-size: 15px;">
          Halo <strong>${data.customerName}</strong>,
        </p>
        <p class="secondary-text" style="margin: 0 0 24px; color: #4b5563; font-size: 14px; line-height: 1.6;">
          Order Anda telah melewati batas waktu 1 jam dan otomatis expired. Silakan buat order baru jika masih membutuhkan.
        </p>

        ${generateInfoBox('Informasi', 'Order memiliki batas waktu 1 jam untuk menjaga ketersediaan rate.', 'warning')}

        ${generateSectionTitle('Ringkasan Order yang Expired')}
        ${generateDetailTable(summaryRows)}

        <div class="amount-display" style="text-align: center; margin: 24px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
          <p class="secondary-text" style="margin: 0 0 16px; color: #374151; font-size: 13px;">
            Buat order baru dengan rate terbaru
          </p>
          ${generateButton('Buat Order Baru', `https://${getPrimaryDomain()}/order`, 'primary')}
        </div>

      </td>
    </tr>

    ${generateEmailFooter(currentYear, true)}
  `;
  
  return generateEmailWrapper(content);
}

export function generateOrderProofAdminEmailHTML(data: {
  orderId: string;
  userName: string;
  userEmail: string;
  userPhone: string | null;
  serviceType: string;
  amountInput: string;
  amountIdr: string;
  rate: string;
  paypalEmail?: string | null;
  skrillEmail?: string | null;
  confirmUrl: string;
  rejectUrl: string;
  createdAt: Date;
}): string {
  const currentYear = new Date().getFullYear();
  const formattedDate = formatDateWIB(data.createdAt);
  const serviceLabel = data.serviceType === 'paypal' ? 'PayPal' : 'Skrill';
  const amountUSD = `$${parseFloat(data.amountInput).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 2})}`;
  
  const userRows = [
    generateDetailRow('Nama', data.userName, { bold: true }),
    generateDetailRow('Email', data.userEmail),
    ...(data.userPhone ? [generateDetailRow('Telepon', data.userPhone)] : [])
  ];
  
  const detailRows = [
    generateDetailRow('Order ID', data.orderId, { mono: true }),
    generateDetailRow('Waktu', formattedDate),
    generateDetailRow('Layanan', `Jual ${serviceLabel}`, { bold: true }),
    generateDetailRow(`Email ${serviceLabel} User`, data.serviceType === 'paypal' ? (data.paypalEmail || '-') : (data.skrillEmail || '-')),
    generateDetailRow('Jumlah USD', amountUSD, { bold: true }),
    generateDetailRow('Rate', formatIDR(parseFloat(data.rate))),
    generateTotalRow('Total IDR', formatIDR(parseFloat(data.amountIdr)), '#10b981')
  ];
  
  const content = `
    ${generateEmailHeader(`Jual ${serviceLabel} - Bukti Diterima`, '#10b981')}
    
    <tr>
      <td class="content-area" style="padding: 28px 24px; background-color: #ffffff;">
        
        ${generateInfoBox(`Bukti Pengiriman ${serviceLabel} Diterima`, `Order ID: ${data.orderId}`, 'success')}

        <p class="secondary-text" style="margin: 0 0 20px; color: #4b5563; font-size: 14px;">
          User telah mengirim bukti pengiriman saldo ${serviceLabel}. Cek bukti transfer di attachment email ini.
        </p>

        ${generateSectionTitle('Detail User')}
        ${generateDetailTable(userRows)}

        ${generateSectionTitle('Detail Order')}
        ${generateDetailTable(detailRows)}

        ${generateInfoBox('Bukti Pengiriman', `Lihat attachment email ini untuk bukti pengiriman saldo ${serviceLabel} dari user.`, 'warning')}

        <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="width: 100%; margin: 20px 0;">
          <tr>
            <td style="padding: 0 4px; width: 50%;">
              ${generateButton('Konfirmasi Order', data.confirmUrl, 'success')}
            </td>
            <td style="padding: 0 4px; width: 50%;">
              ${generateButton('Tolak Order', data.rejectUrl, 'danger')}
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

export function generateOrderProofUserEmailHTML(data: {
  orderId: string;
  userName: string;
  serviceType: string;
  amountInput: string;
  amountIdr: string;
  createdAt: Date;
}): string {
  const currentYear = new Date().getFullYear();
  const serviceLabel = data.serviceType === 'paypal' ? 'PayPal' : 'Skrill';
  const amountUSD = `$${parseFloat(data.amountInput).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 2})}`;
  
  const detailRows = [
    generateDetailRow('Order ID', data.orderId, { mono: true }),
    generateDetailRow('Layanan', `Jual ${serviceLabel}`),
    generateDetailRow('Jumlah', amountUSD, { bold: true }),
    generateTotalRow('Akan Diterima', formatIDR(parseFloat(data.amountIdr)), '#10b981')
  ];
  
  const content = `
    ${generateEmailHeader('Bukti Pengiriman Diterima', '#3b82f6')}
    
    <tr>
      <td class="content-area" style="padding: 28px 24px; background-color: #ffffff;">
        
        ${generateInfoBox('Bukti Berhasil Diupload', `Order ID: ${data.orderId}`, 'info')}

        <p class="main-text" style="margin: 0 0 12px; color: #111827; font-size: 15px;">
          Halo <strong>${data.userName}</strong>,
        </p>
        <p class="secondary-text" style="margin: 0 0 24px; color: #4b5563; font-size: 14px; line-height: 1.6;">
          Bukti pengiriman saldo ${serviceLabel} Anda telah kami terima. Tim kami akan segera memverifikasi dan memproses order Anda.
        </p>

        ${generateSectionTitle('Detail Order')}
        ${generateDetailTable(detailRows)}

        ${generateInfoBox('Status', `Menunggu verifikasi admin. Proses verifikasi biasanya memakan waktu 5-30 menit pada jam kerja. Setelah dikonfirmasi, saldo Anda akan bertambah ${formatIDR(parseFloat(data.amountIdr))}.`, 'warning')}

        ${generateButton('Cek Status di Dashboard', `https://${getPrimaryDomain()}/dashboard`, 'primary')}

      </td>
    </tr>

    ${generateEmailFooter(currentYear, false)}
  `;
  
  return generateEmailWrapper(content);
}

export function generateOrderRejectedEmailHTML(data: {
  orderId: string;
  customerName: string;
  serviceType: string;
  cryptoSymbol: string | null;
  transactionType: string;
  amountInput: string;
  amountIdr: string;
  rate: string;
  rejectedAt: Date;
}, serviceLabel: string, transactionLabel: string): string {
  const currentYear = new Date().getFullYear();
  const formattedDate = formatDateWIB(data.rejectedAt);
  
  const detailRows = [
    generateDetailRow('Order ID', data.orderId, { mono: true }),
    generateDetailRow('Waktu Ditolak', formattedDate, { color: '#ef4444' }),
    generateDetailRow('Layanan', `${serviceLabel}${data.serviceType === "cryptocurrency" && data.cryptoSymbol ? ` (${data.cryptoSymbol})` : ''}`),
    generateTransactionBadge(data.transactionType, transactionLabel),
    generateDetailRow('Rate', formatIDR(parseFloat(data.rate))),
    generateTotalRow('Total IDR', formatIDR(parseFloat(data.amountIdr)), '#6b7280')
  ];
  
  const refundNote = data.transactionType === 'buy' 
    ? 'Saldo yang sudah dipotong untuk order ini telah dikembalikan ke akun Anda.'
    : '';
  
  const content = `
    ${generateEmailHeader('Order Ditolak', '#ef4444')}
    
    <tr>
      <td class="content-area" style="padding: 28px 24px; background-color: #ffffff;">
        
        ${generateInfoBox('Order Ditolak', `Order ID: ${data.orderId}`, 'error')}

        <p class="main-text" style="margin: 0 0 12px; color: #111827; font-size: 15px;">
          Halo <strong>${data.customerName}</strong>,
        </p>
        <p class="secondary-text" style="margin: 0 0 24px; color: #4b5563; font-size: 14px; line-height: 1.6;">
          Mohon maaf, order Anda tidak dapat kami proses. Hal ini mungkin terjadi karena bukti pembayaran/pengiriman tidak valid atau ada masalah teknis.
        </p>

        ${generateSectionTitle('Detail Order yang Ditolak')}
        ${generateDetailTable(detailRows)}

        ${refundNote ? generateInfoBox('Saldo Dikembalikan', refundNote, 'success') : ''}

        ${generateInfoBox('Butuh Bantuan?', 'Jika Anda merasa ini adalah kesalahan atau membutuhkan klarifikasi, silakan hubungi customer service kami via WhatsApp.', 'warning')}

        ${generateButton('Hubungi Customer Service', 'https://wa.me/628119666620?text=Halo%20Saldopedia%2C%20order%20saya%20ditolak%20dengan%20ID%20' + data.orderId, 'primary')}

      </td>
    </tr>

    ${generateEmailFooter(currentYear, true)}
  `;
  
  return generateEmailWrapper(content);
}

export { formatIDR };
