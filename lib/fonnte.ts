const FONNTE_TOKEN = process.env.FONNTE_TOKEN;

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOTP(phoneNumber: string, otp: string): Promise<{ success: boolean; error?: string }> {
  if (!FONNTE_TOKEN) {
    console.error('Fonnte not configured');
    return { success: false, error: 'WhatsApp service not configured' };
  }

  let formattedPhone = phoneNumber.trim();
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '62' + formattedPhone.slice(1);
  } else if (formattedPhone.startsWith('+')) {
    formattedPhone = formattedPhone.slice(1);
  }

  try {
    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': FONNTE_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        target: formattedPhone,
        message: `Kode verifikasi Saldopedia Anda: ${otp}\n\nBerlaku 5 menit. Jangan berikan kode ini kepada siapapun.`,
      }),
    });

    const data = await response.json();
    
    if (data.status === true || data.status === 'true') {
      return { success: true };
    } else {
      console.error('Fonnte error:', data);
      return { success: false, error: data.reason || 'Failed to send WhatsApp message' };
    }
  } catch (error: any) {
    console.error('Error sending WhatsApp:', error.message);
    return { success: false, error: error.message || 'Failed to send WhatsApp message' };
  }
}
