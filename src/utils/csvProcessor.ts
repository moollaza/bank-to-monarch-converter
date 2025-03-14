import { parse } from "date-fns";
import Papa from "papaparse";

import {
  BalanceHistory,
  BankTransaction,
  ColumnMapping,
  ProcessedTransaction,
} from "../types";

export const processBankCSV = (file: File): Promise<string[][]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: (results) => {
        resolve(results.data as string[][]);
      },
      error: (error) => reject(error),
    });
  });
};

export const detectColumnMapping = (
  headers: string[],
): ColumnMapping | null => {
  const mapping: ColumnMapping = {
    balance: -1,
    credit: -1,
    date: -1,
    debit: -1,
    transaction: -1,
  };

  headers.forEach((header, index) => {
    const lowerHeader = header.toLowerCase();
    if (lowerHeader.includes("date")) mapping.date = index;
    if (
      lowerHeader.includes("description") ||
      lowerHeader.includes("transaction")
    )
      mapping.transaction = index;
    if (lowerHeader.includes("debit") || lowerHeader.includes("withdrawal"))
      mapping.debit = index;
    if (lowerHeader.includes("credit") || lowerHeader.includes("deposit"))
      mapping.credit = index;
    if (lowerHeader.includes("balance")) mapping.balance = index;
  });

  // Return null if we couldn't find all required columns
  return Object.values(mapping).includes(-1) ? null : mapping;
};

export const parseTransactions = (
  data: string[][],
  mapping: ColumnMapping,
  skipHeader: boolean = true,
): BankTransaction[] => {
  const startIndex = skipHeader ? 1 : 0;
  return data
    .slice(startIndex)
    .filter((row) => row.length >= 5)
    .map((row) => ({
      balance: parseFloat(row[mapping.balance]) || 0,
      credit: row[mapping.credit] ? parseFloat(row[mapping.credit]) : null,
      date: row[mapping.date],
      debit: row[mapping.debit] ? parseFloat(row[mapping.debit]) : null,
      rawData: row,
      transaction: row[mapping.transaction],
    }));
};

export const convertToMonarchFormat = (
  transactions: BankTransaction[],
  accountName: string,
): {
  balanceHistory: BalanceHistory[];
  transactions: ProcessedTransaction[];
} => {
  const processedTransactions: ProcessedTransaction[] = [];
  const balanceHistory: BalanceHistory[] = [];

  transactions.forEach((trans) => {
    // Convert date to consistent format
    let formattedDate = trans.date;
    try {
      // Try common date formats
      const dateFormats = ["MM/dd/yyyy", "yyyy-MM-dd", "dd/MM/yyyy"];
      for (const format of dateFormats) {
        try {
          const parsedDate = parse(trans.date, format, new Date());
          formattedDate = format(parsedDate, "yyyy-MM-dd");
          break;
        } catch (e) {
          continue;
        }
      }
    } catch (e) {
      console.warn("Could not parse date:", trans.date);
    }

    // Calculate amount (convert debit to negative)
    const amount = trans.debit ? -Math.abs(trans.debit) : trans.credit || 0;

    processedTransactions.push({
      account: accountName,
      amount: amount,
      category: "", // To be filled by user
      date: formattedDate,
      merchant: trans.transaction,
      notes: "",
      originalStatement: trans.transaction,
      tags: "",
    });

    balanceHistory.push({
      account: accountName,
      balance: trans.balance,
      date: formattedDate,
    });
  });

  return {
    balanceHistory: balanceHistory.sort((a, b) => a.date.localeCompare(b.date)),
    transactions: processedTransactions,
  };
};

export const exportToCSV = (data: any[], filename: string) => {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  if (navigator.msSaveBlob) {
    navigator.msSaveBlob(blob, filename);
  } else {
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
