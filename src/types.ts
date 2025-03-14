export interface BalanceHistory {
  account: string;
  balance: number;
  date: string;
}

export interface BankTransaction {
  balance: number;
  credit: null | number;
  date: string;
  debit: null | number;
  rawData: string[];
  transaction: string;
}

export interface ColumnMapping {
  balance: number;
  credit: number;
  date: number;
  debit: number;
  transaction: number;
}

export interface ProcessedData {
  accountName: string;
  columnMapping: ColumnMapping | null;
  rawTransactions: BankTransaction[];
}

export interface ProcessedTransaction {
  account: string;
  amount: number;
  category: string;
  date: string;
  merchant: string;
  notes: string;
  originalStatement: string;
  tags: string;
}
