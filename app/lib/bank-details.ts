export type BankAccountDetail = {
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  iban?: string;
  branchName?: string;
  raastId?: string;
  logo?: string;
  notes?: string;
};

export type BankTransferConfig = {
  enabled: boolean;
  title: string;
  instructions: string[];
  accounts: BankAccountDetail[];
};

export const BANK_TRANSFER_CONFIG: BankTransferConfig = {
  enabled: true,
  title: "Direct Bank & Raast Instant Transfer",
  instructions: [
    "Transfer the exact total order amount using any Pakistan banking app, Raast, Nayapay, or SadaPay.",
    "Take a screenshot or download the payment receipt showing the Transaction ID.",
    "Upload the screenshot below during checkout.",
    "Our Safa Concierge will verify your payment and dispatch your luxury fragrance immediately."
  ],
  accounts: [
    {
      bankName: process.env.NEXT_PUBLIC_BANK_NAME || "Meezan Bank Ltd",
      accountTitle: process.env.NEXT_PUBLIC_BANK_ACCOUNT_TITLE || "Safa Fragrance",
      accountNumber: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUM || "01020102938475",
      iban: process.env.NEXT_PUBLIC_BANK_IBAN || "PK64MEZN0001020102938475",
      branchName: process.env.NEXT_PUBLIC_BANK_BRANCH || "Clifton Branch, Karachi",
      raastId: process.env.NEXT_PUBLIC_BANK_RAAST_ID || "+92 300 1234567",
      logo: "/images/Mashreq-Bank-Logo.png",
      notes: "Instant 0-fee transfer via Raast ID or IBAN"
    }
  ]
};

