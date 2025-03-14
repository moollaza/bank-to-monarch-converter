export interface BankTransaction {
  date: string;
  transaction: string;
  debit: number | null;
  credit: number | null;
  balance: number;
  rawData: string[];
}

export interface ProcessedTransaction {
  date: string;
  merchant: string;
  category: string;
  account: string;
  originalStatement: string;
  notes: string;
  amount: number;
  tags: string;
}

export interface BalanceHistory {
  date: string;
  account: string;
  balance: number;
}

export interface ColumnMapping {
  date: number;
  transaction: number;
  debit: number;
  credit: number;
  balance: number;
}

export interface ProcessedData {
  rawTransactions: BankTransaction[];
  columnMapping: ColumnMapping | null;
  accountName: string;
}