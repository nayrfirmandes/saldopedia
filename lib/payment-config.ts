// Admin Payment Configuration for Saldopedia
// All configuration can be overridden via environment variables

// Helper to parse JSON from env or use fallback
function parseEnvArray<T>(envVar: string | undefined, fallback: T[]): T[] {
  if (!envVar) return fallback;
  try {
    return JSON.parse(envVar);
  } catch (e) {
    console.error(`Failed to parse ${envVar}, using fallback`);
    return fallback;
  }
}

const defaultBankAccounts = [
  {
    bank: "BCA",
    accountNumber: "0322236059",
    accountName: "Ryan Firmandes",
  },
  {
    bank: "Mandiri",
    accountNumber: "1110007909555",
    accountName: "Ryan Firmandes",
  },
  {
    bank: "BNI",
    accountNumber: "1792303471",
    accountName: "Ryan Firmandes",
  },
  {
    bank: "BRI",
    accountNumber: "543101000007561",
    accountName: "Ryan Firmandes",
  },
];

const defaultEwallets = [
  {
    provider: "DANA",
    phoneNumber: "08119666620",
    accountName: "Ryan Firmandes",
  },
  {
    provider: "OVO",
    phoneNumber: "08119666620",
    accountName: "Ryan Firmandes",
  },
  {
    provider: "GoPay",
    phoneNumber: "08119666620",
    accountName: "Ryan Firmandes",
  },
];

export function getAdminPaymentConfig() {
  return {
    // Bank Accounts (for IDR transfers)
    // Override with: ADMIN_BANK_ACCOUNTS='[{"bank":"BCA","accountNumber":"123","accountName":"Name"}]'
    bankAccounts: parseEnvArray(process.env.ADMIN_BANK_ACCOUNTS, defaultBankAccounts),
    
    // E-Wallets (for IDR transfers)
    // Override with: ADMIN_EWALLETS='[{"provider":"GoPay","phoneNumber":"08119666620","accountName":"Name"}]'
    ewallets: parseEnvArray(process.env.ADMIN_EWALLETS, defaultEwallets),
    
    // PayPal Account (for receiving PayPal balance)
    paypal: {
      email: process.env.ADMIN_PAYPAL_EMAIL || "Saldopedia.co@gmail.com",
      name: "Saldopedia",
    },
    
    // Skrill Account (for receiving Skrill balance)
    skrill: {
      email: process.env.ADMIN_SKRILL_EMAIL || "nayrfirmandes@proton.me",
      name: "Ryan Firmandes",
    },
    
    // Contact
    whatsapp: "08119666620",
    supportEmail: "support@saldopedia.com",
  };
}

// For backward compatibility
export const adminPaymentConfig = getAdminPaymentConfig();

// Helper function to get admin email based on service type
export function getAdminEmail(serviceType: "paypal" | "skrill"): string {
  const config = getAdminPaymentConfig();
  return serviceType === "paypal" 
    ? config.paypal.email 
    : config.skrill.email;
}
