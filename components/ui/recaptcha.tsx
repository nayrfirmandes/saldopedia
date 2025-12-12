'use client';

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { useTheme } from '@/contexts/theme-context';

export interface ReCaptchaRef {
  getValue: () => string | null;
  reset: () => void;
}

interface ReCaptchaProps {
  onChange?: (value: string | null) => void;
  onExpired?: () => void;
  onError?: () => void;
}

const ReCaptchaComponent = forwardRef<ReCaptchaRef, ReCaptchaProps>(
  ({ onChange, onExpired, onError }, ref) => {
    const { theme } = useTheme();
    const recaptchaRef = useRef<ReCAPTCHA>(null);
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

    useImperativeHandle(ref, () => ({
      getValue: () => {
        return recaptchaRef.current?.getValue() || null;
      },
      reset: () => {
        recaptchaRef.current?.reset();
      },
    }));

    if (!siteKey) {
      console.warn('ReCAPTCHA site key not configured');
      return null;
    }

    return (
      <div className="flex justify-center">
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey={siteKey}
          onChange={onChange}
          onExpired={onExpired}
          onErrored={onError}
          theme={theme === 'dark' ? 'dark' : 'light'}
          size="normal"
        />
      </div>
    );
  }
);

ReCaptchaComponent.displayName = 'ReCaptcha';

export default ReCaptchaComponent;
