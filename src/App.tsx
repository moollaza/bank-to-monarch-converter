import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { DataPreview } from './components/DataPreview';
import { ExportPreview } from './components/ExportPreview';
import { processBankCSV, detectColumnMapping, parseTransactions, convertToMonarchFormat, exportToCSV } from './utils/csvProcessor';
import { ProcessedData, BankTransaction, ColumnMapping } from './types';
import { Upload, Download, AlertCircle } from 'lucide-react';

function App() {
  const [rawData, setRawData] = useState<string[][]>([]);
  const [processedData, setProcessedData] = useState<ProcessedData>({
    rawTransactions: [],
    columnMapping: null,
    accountName: ''
  });
  const [hasHeaderRow, setHasHeaderRow] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleFileSelect = async (file: File) => {
    try {
      const data = await processBankCSV(file);
      setRawData(data);
      
      const emptyMapping: ColumnMapping = {
        date: -1,
        transaction: -1,
        debit: -1,
        credit: -1,
        balance: -1
      };
      
      setProcessedData(prev => ({
        ...prev,
        columnMapping: emptyMapping
      }));
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file. Please check the format and try again.');
    }
  };

  const handleUpdateMapping = (mapping: ColumnMapping) => {
    const transactions = parseTransactions(rawData, mapping, hasHeaderRow);
    setProcessedData(prev => ({
      ...prev,
      rawTransactions: transactions,
      columnMapping: mapping
    }));
  };

  const handleExport = async (type: 'transactions' | 'balance') => {
    if (!processedData.columnMapping || !processedData.accountName) {
      alert('Please map all columns and provide an account name before exporting.');
      return;
    }

    const unmappedColumns = Object.entries(processedData.columnMapping)
      .filter(([_, value]) => value === -1)
      .map(([key]) => key);

    if (unmappedColumns.length > 0) {
      alert(`Please map the following columns: ${unmappedColumns.join(', ')}`);
      return;
    }

    setIsExporting(true);
    try {
      const { transactions, balanceHistory } = convertToMonarchFormat(
        processedData.rawTransactions,
        processedData.accountName
      );

      if (type === 'transactions') {
        exportToCSV(transactions, 'monarch_transactions.csv');
      } else {
        exportToCSV(balanceHistory, 'monarch_balance_history.csv');
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
            Convert your bank's CSV export into Monarch-compatible transaction and balance history files
          </p>
        </header>

        <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-12">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Bank CSV File</h2>
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
                        <h2 className="text-xl font-semibold text-gray-900">Data Preview & Column Mapping</h2>
                        <p className="text-sm text-gray-500 mt-1">Map your bank's columns to the required fields</p>
                      </div>
                      <div className="w-full sm:w-auto">
                        <input
                          type="text"
                          placeholder="Enter account name"
                          value={processedData.accountName}
                          onChange={(e) => setProcessedData(prev => ({ ...prev, accountName: e.target.value }))}
                          className="w-full sm:w-auto px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={hasHeaderRow}
                          onChange={(e) => {
                            setHasHeaderRow(e.target.checked);
                            if (processedData.columnMapping) {
                              handleUpdateMapping(processedData.columnMapping);
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <span className="text-sm font-medium text-gray-900">First row contains column headers</span>
                          <p className="text-xs text-gray-500 mt-0.5">Enable this if your CSV file includes column names in the first row</p>
                        </div>
                      </label>
                    </div>

                    <DataPreview
                      data={rawData}
                      transactions={processedData.rawTransactions}
                      columnMapping={processedData.columnMapping}
                      onUpdateMapping={handleUpdateMapping}
                      hasHeaderRow={hasHeaderRow}
                    />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-6">
                <ExportPreview
                  title="Transactions Export"
                  description="Export your mapped transactions in Monarch format"
                  onExport={() => handleExport('transactions')}
                  isExporting={isExporting}
                  data={processedData.rawTransactions.slice(0, 3)}
                  type="transactions"
                />

                <ExportPreview
                  title="Balance History Export"
                  description="Export your account balance history in Monarch format"
                  onExport={() => handleExport('balance')}
                  isExporting={isExporting}
                  data={processedData.rawTransactions.slice(0, 3)}
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