export async function verifyRecaptchaToken(token: string): Promise<{ success: boolean; error?: string }> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    console.error('RECAPTCHA_SECRET_KEY is not configured');
    return { success: false, error: 'CAPTCHA configuration error' };
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    });

    const data = await response.json();

    if (!data.success) {
      console.error('ReCAPTCHA verification failed:', data['error-codes']);
      return { success: false, error: 'CAPTCHA verification failed' };
    }

    return { success: true };
  } catch (error) {
    console.error('ReCAPTCHA verification error:', error);
    return { success: false, error: 'CAPTCHA verification error' };
  }
}
