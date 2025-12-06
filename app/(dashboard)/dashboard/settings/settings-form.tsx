'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';

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
}

export default function SettingsForm({ user, hasPassword, isGoogleUser, nameChanged }: SettingsFormProps) {
  const router = useRouter();
  const { refreshAuth } = useAuth();
  const { t } = useLanguage();
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
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              {t('dashboardPages.settings.email')}
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              {t('dashboardPages.settings.phone')}
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base"
              placeholder="08xxxxxxxxxx"
            />
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
    </div>
  );
}
