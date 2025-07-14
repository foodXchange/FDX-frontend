import { useState } from 'react';
import { CloudArrowUpIcon, DocumentTextIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface ImportResult {
  success: boolean;
  message: string;
  imported?: number;
  failed?: number;
}

export const DataImport: React.FC = () => {
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<string>('products');

  const importTypes = [
    { id: 'products', label: 'Products', endpoint: '/import/products' },
    { id: 'suppliers', label: 'Suppliers', endpoint: '/import/suppliers' },
    { id: 'categories', label: 'Categories', endpoint: '/import/categories' },
    { id: 'certifications', label: 'Certifications', endpoint: '/import/certifications' },
    { id: 'users', label: 'Users', endpoint: '/import/users' },
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setImporting(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('type', importType);

    try {
      const endpoint = importTypes.find(t => t.id === importType)?.endpoint || '/import/data';
      const response = await fetch(`${process.env.REACT_APP_API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      const result = await response.json();
      setResults([...results, result]);
    } catch (error) {
      setResults([...results, {
        success: false,
        message: `Import failed: ${(error as Error).message}`,
      }]);
    } finally {
      setImporting(false);
      setSelectedFile(null);
    }
  };

  const downloadTemplate = (type: string) => {
    const templates: Record<string, any> = {
      products: {
        headers: ['name', 'description', 'sku', 'category', 'price', 'moq', 'unit', 'supplier', 'certifications', 'leadTime'],
        example: [
          'Organic Quinoa Flour', 
          'High-quality organic quinoa flour', 
          'QF-001', 
          'Grains & Flours', 
          '4.50', 
          '500', 
          'kg', 
          'Global Grains Co.', 
          'Organic,Non-GMO,Gluten-Free', 
          '2-3 weeks'
        ]
      },
      suppliers: {
        headers: ['name', 'email', 'phone', 'country', 'city', 'certifications', 'verified', 'rating'],
        example: ['Global Grains Co.', 'contact@globalgrains.com', '+1234567890', 'USA', 'New York', 'ISO9001,HACCP', 'true', '4.5']
      },
      categories: {
        headers: ['name', 'parentCategory', 'description', 'isActive'],
        example: ['Grains & Flours', 'Food Ingredients', 'All types of grains and flours', 'true']
      },
      certifications: {
        headers: ['name', 'type', 'description', 'validityDays'],
        example: ['Organic', 'Product', 'USDA Organic Certification', '365']
      },
      users: {
        headers: ['email', 'firstName', 'lastName', 'company', 'role', 'phone'],
        example: ['buyer@company.com', 'John', 'Doe', 'ABC Foods Ltd', 'buyer', '+1234567890']
      }
    };

    const template = templates[type];
    if (!template) return;

    // Create CSV content
    const csvContent = [
      template.headers.join(','),
      template.example.join(','),
    ].join('\n');

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `foodxchange_${type}_template.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Data Import Center</h1>
        <p className="text-gray-600 mt-2">Import your data into FoodXchange platform</p>
      </div>

      {/* Import Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Import Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {importTypes.map((type) => (
              <div key={type.id}>
                <button
                  onClick={() => setImportType(type.id)}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    importType === type.id
                      ? 'border-[#1E4C8A] bg-[#1E4C8A]/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <DocumentTextIcon className={`w-8 h-8 mx-auto mb-2 ${
                    importType === type.id ? 'text-[#1E4C8A]' : 'text-gray-400'
                  }`} />
                  <span className={`text-sm font-medium ${
                    importType === type.id ? 'text-[#1E4C8A]' : 'text-gray-700'
                  }`}>
                    {type.label}
                  </span>
                </button>
                <button
                  onClick={() => downloadTemplate(type.id)}
                  className="w-full mt-2 text-xs text-[#1E4C8A] hover:underline"
                >
                  Download Template
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Upload File</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                Drag and drop your CSV or Excel file here, or click to browse
              </p>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer inline-flex items-center px-4 py-2 bg-[#1E4C8A] text-white rounded-lg hover:bg-[#16365F] transition-colors"
              >
                Choose File
              </label>
              {selectedFile && (
                <p className="mt-4 text-sm text-gray-600">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>

            <Button
              onClick={handleImport}
              disabled={!selectedFile || importing}
              className="w-full"
            >
              {importing ? 'Importing...' : 'Import Data'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Import Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Import Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg flex items-start gap-3 ${
                    result.success ? 'bg-green-50' : 'bg-red-50'
                  }`}
                >
                  {result.success ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className={`font-medium ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                      {result.message}
                    </p>
                    {result.imported !== undefined && (
                      <p className="text-sm text-gray-600">
                        Imported: {result.imported}, Failed: {result.failed || 0}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Import Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-gray-600">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">File Format Requirements:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>CSV files with comma separation</li>
                <li>Excel files (.xlsx or .xls)</li>
                <li>First row must contain column headers</li>
                <li>UTF-8 encoding for special characters</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Data Validation:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Email addresses must be valid format</li>
                <li>Prices must be numeric values</li>
                <li>Dates in YYYY-MM-DD format</li>
                <li>Boolean fields: true/false or yes/no</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Import Process:</h4>
              <ol className="list-decimal list-inside space-y-1">
                <li>Download the template for your data type</li>
                <li>Fill in your data following the format</li>
                <li>Save as CSV or Excel file</li>
                <li>Upload and import</li>
                <li>Review import results</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};