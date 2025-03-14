import { useState } from "react";

import { DataPreview } from "./components/DataPreview";
import { ExportPreview } from "./components/ExportPreview";
import { FileUpload } from "./components/FileUpload";
import { ColumnMapping, ProcessedData } from "./types";
import {
  convertToMonarchFormat,
  exportToCSV,
  parseTransactions,
  processBankCSV,
} from "./utils/csvProcessor";

function App() {
  const [rawData, setRawData] = useState<string[][]>([]);
  const [processedData, setProcessedData] = useState<ProcessedData>({
    accountName: "",
    columnMapping: null,
    rawTransactions: [],
  });
  const [hasHeaderRow, setHasHeaderRow] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleFileSelect = async (file: File) => {
    try {
      const data = await processBankCSV(file);
      setRawData(data);

      const emptyMapping: ColumnMapping = {
        balance: -1,
        credit: -1,
        date: -1,
        debit: -1,
        transaction: -1,
      };

      setProcessedData((prev) => ({
        ...prev,
        columnMapping: emptyMapping,
      }));
    } catch (error) {
      console.error("Error processing file:", error);
      alert("Error processing file. Please check the format and try again.");
    }
  };

  const handleUpdateMapping = (mapping: ColumnMapping) => {
    const transactions = parseTransactions(rawData, mapping, hasHeaderRow);
    setProcessedData((prev) => ({
      ...prev,
      columnMapping: mapping,
      rawTransactions: transactions,
    }));
  };

  const handleExport = async (type: "balance" | "transactions") => {
    if (!processedData.columnMapping || !processedData.accountName) {
      alert(
        "Please map all columns and provide an account name before exporting.",
      );
      return;
    }

    const unmappedColumns = Object.entries(processedData.columnMapping)
      .filter(([_, value]) => value === -1)
      .map(([key]) => key);

    if (unmappedColumns.length > 0) {
      alert(`Please map the following columns: ${unmappedColumns.join(", ")}`);
      return;
    }

    setIsExporting(true);
    try {
      const { balanceHistory, transactions } = convertToMonarchFormat(
        processedData.rawTransactions,
        processedData.accountName,
      );

      if (type === "transactions") {
        exportToCSV(transactions, "monarch_transactions.csv");
      } else {
        exportToCSV(balanceHistory, "monarch_balance_history.csv");
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Bank CSV to Monarch Converter
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Convert your bank's CSV export into Monarch-compatible transaction
            and balance history files
          </p>
        </header>

        <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-12">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Upload Bank CSV File
                </h2>
                <FileUpload onFileSelect={handleFileSelect} />
              </div>
            </div>
          </div>

          {rawData.length > 0 && (
            <>
              <div className="lg:col-span-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                          Data Preview & Column Mapping
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                          Map your bank's columns to the required fields
                        </p>
                      </div>
                      <div className="w-full sm:w-auto">
                        <input
                          className="w-full sm:w-auto px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          onChange={(e) =>
                            setProcessedData((prev) => ({
                              ...prev,
                              accountName: e.target.value,
                            }))
                          }
                          placeholder="Enter account name"
                          type="text"
                          value={processedData.accountName}
                        />
                      </div>
                    </div>

                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <label className="flex items-center gap-3">
                        <input
                          checked={hasHeaderRow}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          onChange={(e) => {
                            setHasHeaderRow(e.target.checked);
                            if (processedData.columnMapping) {
                              handleUpdateMapping(processedData.columnMapping);
                            }
                          }}
                          type="checkbox"
                        />
                        <div>
                          <span className="text-sm font-medium text-gray-900">
                            First row contains column headers
                          </span>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Enable this if your CSV file includes column names
                            in the first row
                          </p>
                        </div>
                      </label>
                    </div>

                    <DataPreview
                      columnMapping={processedData.columnMapping}
                      data={rawData}
                      hasHeaderRow={hasHeaderRow}
                      onUpdateMapping={handleUpdateMapping}
                      transactions={processedData.rawTransactions}
                    />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-6">
                <ExportPreview
                  data={processedData.rawTransactions.slice(0, 3)}
                  description="Export your mapped transactions in Monarch format"
                  isExporting={isExporting}
                  onExport={() => handleExport("transactions")}
                  title="Transactions Export"
                  type="transactions"
                />

                <ExportPreview
                  data={processedData.rawTransactions.slice(0, 3)}
                  description="Export your account balance history in Monarch format"
                  isExporting={isExporting}
                  onExport={() => handleExport("balance")}
                  title="Balance History Export"
                  type="balance"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
