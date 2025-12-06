"use client";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div  className="w-full flex justify-center">
          {children}
        </div>
      </main>

      <footer className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-600 dark:text-gray-400">
          © {new Date().getFullYear()} {t('auth.copyrightText')}
        </div>
      </footer>
    </div>
  );
}
