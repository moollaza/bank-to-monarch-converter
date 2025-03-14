import { AlertCircle, Download } from "lucide-react";
import React from "react";

import { BankTransaction } from "../types";

interface ExportPreviewProps {
  data: BankTransaction[];
  description: string;
  isExporting: boolean;
  onExport: () => void;
  title: string;
  type: "balance" | "transactions";
}

export const ExportPreview: React.FC<ExportPreviewProps> = ({
  data,
  description,
  isExporting,
  onExport,
  title,
  type,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          </div>
          <button
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors duration-200"
            disabled={isExporting}
            onClick={onExport}
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "Exporting..." : "Export"}
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
          {data.length > 0 ? (
            <div className="space-y-2">
              {data.slice(0, 3).map((item, index) => (
                <div
                  className="text-xs text-gray-600 font-mono bg-white p-2 rounded border border-gray-200"
                  key={index}
                >
                  {type === "transactions"
                    ? `${item.date},${item.transaction},${item.debit || item.credit}`
                    : `${item.date},${item.balance}`}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <AlertCircle className="h-4 w-4" />
              <span>No data to preview</span>
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500">
          <p className="font-medium mb-1">File Format:</p>
          <ul className="list-disc list-inside space-y-1">
            {type === "transactions" ? (
              <>
                <li>Date (YYYY-MM-DD)</li>
                <li>Transaction Description</li>
                <li>Amount (positive for credits, negative for debits)</li>
              </>
            ) : (
              <>
                <li>Date (YYYY-MM-DD)</li>
                <li>Account Name</li>
                <li>Balance Amount</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};
