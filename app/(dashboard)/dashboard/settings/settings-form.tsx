'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import { Wallet, ChevronRight, CheckCircle, X } from 'lucide-react';

interface User {
  email: string;
  name: string;
  phone: string | null;
  photoUrl: string | null;
}

interface SettingsFormProps {
  user: User;
  hasPassword: boolean;
  isGoogleUser: boolean;
  nameChanged: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  pendingPhone: string | null;
}

export default function SettingsForm({ user, hasPassword, isGoogleUser, nameChanged, emailVerified, phoneVerified, pendingPhone: initialPendingPhone }: SettingsFormProps) {
  const router = useRouter();
  const { refreshAuth } = useAuth();
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(user.photoUrl);

  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    photoUrl: user.photoUrl || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const messageRef = useRef<HTMLDivElement>(null);

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpSent, setOtpSent] = useState(!!initialPendingPhone);
  const [isPhoneVerified, setIsPhoneVerified] = useState(phoneVerified);
  const [phoneForVerification, setPhoneForVerification] = useState(initialPendingPhone || user.phone || '');
  const [serverPendingPhone, setServerPendingPhone] = useState<string | null>(initialPendingPhone);
  const [isEmailVerifiedState, setIsEmailVerifiedState] = useState(emailVerified);

  const hasPendingVerification = !!serverPendingPhone || otpSent;
  const phoneChanged = formData.phone !== (user.phone || '') && formData.phone !== '';
  const emailChanged = formData.email.toLowerCase() !== user.email.toLowerCase();
  const needsPhoneVerification = phoneChanged && !serverPendingPhone && !otpSent;
  const needsEmailVerification = emailChanged;

  useEffect(() => {
    if (message && messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [message]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: 'error', text: t('dashboardPages.settings.photoMaxSize') });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPhotoPreview(base64);
        setFormData({ ...formData, photoUrl: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (hasPendingVerification) {
      setMessage({ 
        type: 'error', 
        text: language === 'id' 
          ? 'Selesaikan verifikasi OTP terlebih dahulu' 
          : 'Complete OTP verification first' 
      });
      setShowOtpModal(true);
      return;
    }

    if (needsEmailVerification) {
      setMessage({ 
        type: 'error', 
        text: language === 'id' 
          ? 'Perubahan email memerlukan verifikasi. Hubungi support untuk bantuan.' 
          : 'Email changes require verification. Contact support for help.' 
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          photoUrl: formData.photoUrl,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: t('dashboardPages.settings.successUpdate') });
        await refreshAuth(true);
        router.refresh();
      } else {
        setMessage({ type: 'error', text: data.error || t('auth.register.errorGeneral') });
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('auth.register.errorGeneral') });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: t('auth.resetPassword.errorGeneral') });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: t('dashboardPages.settings.successUpdate') });
        setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setMessage({ type: 'error', text: data.error || t('auth.register.errorGeneral') });
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('auth.register.errorGeneral') });
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!phoneForVerification) {
      setOtpError(language === 'id' ? 'Masukkan nomor HP terlebih dahulu' : 'Enter phone number first');
      return;
    }
    
    setOtpLoading(true);
    setOtpError('');

    try {
      const response = await fetch('/api/auth/phone/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneForVerification }),
      });

      const data = await response.json();

      if (response.ok) {
        setOtpSent(true);
        setServerPendingPhone(phoneForVerification);
      } else {
        setOtpError(data.error || 'Gagal mengirim OTP');
      }
    } catch (error) {
      setOtpError('Terjadi kesalahan');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setOtpError(language === 'id' ? 'Masukkan 6 digit kode OTP' : 'Enter 6 digit OTP code');
      return;
    }

    setOtpLoading(true);
    setOtpError('');

    try {
      const response = await fetch('/api/auth/phone/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: otpCode }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsPhoneVerified(true);
        setShowOtpModal(false);
        setOtpCode('');
        setOtpSent(false);
        setServerPendingPhone(null);
        setFormData({ ...formData, phone: phoneForVerification });
        setMessage({ type: 'success', text: language === 'id' ? 'Nomor HP berhasil diverifikasi' : 'Phone number verified successfully' });
        router.refresh();
      } else {
        setOtpError(data.error || 'OTP tidak valid');
      }
    } catch (error) {
      setOtpError('Terjadi kesalahan');
    } finally {
      setOtpLoading(false);
    }
  };

  const openPhoneVerificationModal = () => {
    setPhoneForVerification(formData.phone || user.phone || '');
    setShowOtpModal(true);
    setOtpSent(false);
    setOtpCode('');
    setOtpError('');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {message && (
        <div ref={messageRef} className={`p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'}`}>
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">{t('dashboardPages.settings.profileSection')}</h2>
        <form onSubmit={handleUpdateProfile} className="space-y-5">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              {t('dashboardPages.settings.photoProfile')}
            </label>
            <div className="flex items-center gap-4">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="w-14 h-14 rounded-full object-cover" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-lg font-bold text-white">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              )}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="block text-sm text-gray-500 dark:text-gray-400
                    file:mr-3 file:py-2 file:px-3
                    file:rounded-lg file:border-0
                    file:text-sm file:font-medium
                    file:bg-gray-100 file:text-gray-700
                    hover:file:bg-gray-200
                    dark:file:bg-gray-700 dark:file:text-gray-300"
                />
                <p className="mt-1 text-xs text-gray-500">PNG, JPG maksimal 2MB</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              {t('dashboardPages.settings.name')}
            </label>
            {isGoogleUser && !nameChanged ? (
              <>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base"
                  required
                />
                <p className="mt-1.5 text-xs text-orange-600 dark:text-orange-400">
                  {t('dashboardPages.settings.nameGoogleOneTimeNote')}
                </p>
              </>
            ) : (
              <>
                <input
                  type="text"
                  value={formData.name}
                  disabled
                  className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-base cursor-not-allowed"
                />
                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                  {t('dashboardPages.settings.nameLockedNote')}
                </p>
              </>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm text-gray-600 dark:text-gray-400">
                {t('dashboardPages.settings.email')}
              </label>
              {emailVerified ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                  <CheckCircle className="h-3 w-3" />
                  {language === 'id' ? 'Terverifikasi' : 'Verified'}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full">
                  {language === 'id' ? 'Belum Terverifikasi' : 'Not Verified'}
                </span>
              )}
            </div>
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-base cursor-not-allowed"
              required
            />
            <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
              {language === 'id' 
                ? 'Email tidak dapat diubah. Hubungi support jika perlu.' 
                : 'Email cannot be changed. Contact support if needed.'}
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm text-gray-600 dark:text-gray-400">
                {t('dashboardPages.settings.phone')}
              </label>
              {isPhoneVerified && !hasPendingVerification ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                  <CheckCircle className="h-3 w-3" />
                  {language === 'id' ? 'Terverifikasi' : 'Verified'}
                </span>
              ) : hasPendingVerification ? (
                <button
                  type="button"
                  onClick={() => setShowOtpModal(true)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
                >
                  {language === 'id' ? 'Menunggu OTP' : 'Awaiting OTP'}
                </button>
              ) : formData.phone ? (
                <button
                  type="button"
                  onClick={openPhoneVerificationModal}
                  className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {language === 'id' ? 'Verifikasi' : 'Verify'}
                </button>
              ) : (
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {language === 'id' ? 'Isi nomor HP dulu' : 'Enter phone first'}
                </span>
              )}
            </div>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => {
                setFormData({ ...formData, phone: e.target.value });
                if (isPhoneVerified && e.target.value !== user.phone) {
                  setIsPhoneVerified(false);
                }
              }}
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base"
              placeholder={t('dashboardPages.settings.phonePlaceholder')}
            />
            {hasPendingVerification && (
              <p className="mt-1.5 text-xs text-orange-600 dark:text-orange-400">
                {language === 'id' 
                  ? `OTP sudah dikirim ke ${serverPendingPhone || phoneForVerification}. Masukkan kode untuk verifikasi.` 
                  : `OTP sent to ${serverPendingPhone || phoneForVerification}. Enter code to verify.`}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('dashboardPages.settings.saving') : t('dashboardPages.settings.saveChanges')}
          </button>
        </form>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {t('dashboardPages.settings.savedAddresses')}
        </h2>
        <Link
          href="/dashboard/settings/addresses"
          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {t('dashboardPages.settings.manageAddresses')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('dashboardPages.settings.manageAddressesDesc')}
              </p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
        </Link>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
          {hasPassword ? t('dashboardPages.settings.passwordSection') : 'Atur Password'}
        </h2>
        
        {isGoogleUser && !hasPassword && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Akun Anda terdaftar melalui Google. Atur password untuk bisa login dengan email dan password.
          </p>
        )}

        <form onSubmit={handleChangePassword} className="space-y-5">
          {hasPassword && (
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                {t('dashboardPages.settings.currentPassword')}
              </label>
              <input
                type="password"
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              {hasPassword ? t('dashboardPages.settings.newPassword') : 'Password Baru'}
            </label>
            <input
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base"
              required
              minLength={8}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              {hasPassword ? t('dashboardPages.settings.confirmPassword') : 'Konfirmasi Password'}
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base"
              required
              minLength={8}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('dashboardPages.settings.changing') : (hasPassword ? t('dashboardPages.settings.changePassword') : 'Simpan Password')}
          </button>
        </form>
      </div>

      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {language === 'id' ? 'Verifikasi Nomor HP' : 'Verify Phone Number'}
              </h3>
              <button
                onClick={() => setShowOtpModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {!otpSent ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {language === 'id' ? 'Nomor HP' : 'Phone Number'}
                  </label>
                  <input
                    type="tel"
                    value={phoneForVerification}
                    onChange={(e) => setPhoneForVerification(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base"
                    placeholder={t('dashboardPages.settings.phonePlaceholder')}
                  />
                </div>
                {otpError && (
                  <p className="text-sm text-red-600 dark:text-red-400">{otpError}</p>
                )}
                <button
                  onClick={handleSendOtp}
                  disabled={otpLoading || !phoneForVerification}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {otpLoading ? (language === 'id' ? 'Mengirim...' : 'Sending...') : (language === 'id' ? 'Kirim Kode OTP' : 'Send OTP Code')}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'id' 
                    ? `Kode OTP telah dikirim ke ${phoneForVerification}. Berlaku 5 menit.`
                    : `OTP code sent to ${phoneForVerification}. Valid for 5 minutes.`}
                </p>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {language === 'id' ? 'Kode OTP' : 'OTP Code'}
                  </label>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base text-center tracking-widest font-mono text-lg"
                    placeholder={t('dashboardPages.settings.otpPlaceholder')}
                    maxLength={6}
                  />
                </div>
                {otpError && (
                  <p className="text-sm text-red-600 dark:text-red-400">{otpError}</p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => setOtpSent(false)}
                    className="flex-1 py-2.5 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                  >
                    {language === 'id' ? 'Kirim Ulang' : 'Resend'}
                  </button>
                  <button
                    onClick={handleVerifyOtp}
                    disabled={otpLoading || otpCode.length !== 6}
                    className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {otpLoading ? (language === 'id' ? 'Memverifikasi...' : 'Verifying...') : (language === 'id' ? 'Verifikasi' : 'Verify')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
