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
      bankName: "Habib Bank Limited",
      accountTitle: "Sikander",
      accountNumber: "23127900016103",
      iban: "PK02HABB0023127900016103",
      raastId: "PK02HABB0023127900016103",
      logo: "/images/hbl-logo.png",
      notes: "Instant 0-fee transfer via HBL app, internet banking, or Raast IBAN"
    }
  ]
};
