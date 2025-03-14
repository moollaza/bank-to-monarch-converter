import { ChevronDown } from "lucide-react";
import React from "react";

import { BankTransaction, ColumnMapping } from "../types";

interface DataPreviewProps {
  columnMapping: ColumnMapping | null;
  data: string[][];
  hasHeaderRow: boolean;
  onUpdateMapping: (mapping: ColumnMapping) => void;
  transactions: BankTransaction[];
}

export const DataPreview: React.FC<DataPreviewProps> = ({
  columnMapping,
  data,
  hasHeaderRow,
  onUpdateMapping,
  transactions,
}) => {
  const columns = [
    "date",
    "transaction",
    "debit",
    "credit",
    "balance",
  ] as const;

  const handleColumnSelect = (
    columnName: keyof ColumnMapping,
    index: number,
  ) => {
    if (!columnMapping) return;

    const newMapping = { ...columnMapping };
    Object.entries(newMapping).forEach(([key]) => {
      if (newMapping[key as keyof ColumnMapping] === index) {
        newMapping[key as keyof ColumnMapping] = -1;
      }
    });
    newMapping[columnName] = index;
    onUpdateMapping(newMapping);
  };

  const getColumnLabel = (index: number): string => {
    if (!columnMapping) return "";
    const entry = Object.entries(columnMapping).find(
      ([_, value]) => value === index,
    );
    return entry ? entry[0] : "";
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {columns.map((col) => (
          <div className="relative" key={col}>
            <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
              {col}
              <span className="ml-1 text-gray-400">(required)</span>
            </label>
            <div className="relative">
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-lg shadow-sm appearance-none bg-white"
                onChange={(e) =>
                  handleColumnSelect(col, parseInt(e.target.value))
                }
                value={columnMapping?.[col] ?? -1}
              >
                <option value={-1}>Select column</option>
                {data[0]?.map((_, index) => (
                  <option
                    disabled={
                      Object.values(columnMapping || {}).includes(index) &&
                      columnMapping?.[col] !== index
                    }
                    key={index}
                    value={index}
                  >
                    Column {index + 1}{" "}
                    {hasHeaderRow ? `(${data[0][index]})` : ""}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                scope="col"
              >
                Row
              </th>
              {data[0]?.map((_, index) => (
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  key={index}
                  scope="col"
                >
                  Column {index + 1}
                  {getColumnLabel(index) && (
                    <span className="ml-1 text-blue-500 normal-case">
                      ({getColumnLabel(index)})
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.slice(0, 5).map((row, rowIndex) => (
              <tr
                className={`${rowIndex === 0 && hasHeaderRow ? "bg-gray-50" : ""} hover:bg-gray-50 transition-colors`}
                key={rowIndex}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {rowIndex === 0 && hasHeaderRow
                    ? "Header"
                    : `Row ${rowIndex + 1}`}
                </td>
                {row.map((cell, cellIndex) => (
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono"
                    key={cellIndex}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {transactions.length > 0 && (
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">
              Processed Transactions Preview
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th
                    className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    scope="col"
                  >
                    Date
                  </th>
                  <th
                    className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    scope="col"
                  >
                    Transaction
                  </th>
                  <th
                    className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    scope="col"
                  >
                    Amount
                  </th>
                  <th
                    className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    scope="col"
                  >
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.slice(0, 5).map((trans, index) => (
                  <tr
                    className="hover:bg-gray-50 transition-colors"
                    key={index}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                      {trans.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                      {trans.transaction}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                      <span
                        className={
                          trans.debit ? "text-red-600" : "text-green-600"
                        }
                      >
                        {trans.debit ? `-${trans.debit}` : trans.credit}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                      {trans.balance}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
