import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  Upload, 
  FileSpreadsheet, 
  Users, 
  CheckCircle, 
  Download,
  X
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

interface ExcelImporterProps {
  isOpen: boolean;
  onClose: () => void;
  onImportCustomers: (customers: any[]) => void;
  existingCustomers: any[];
}

interface ColumnMapping {
  name: string;
  phone: string;
  address: string;
  email: string;
  notes: string;
}

export function ExcelImporter({ isOpen, onClose, onImportCustomers, existingCustomers }: ExcelImporterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
    name: '',
    phone: '',
    address: '',
    email: '',
    notes: ''
  });
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [workbookData, setWorkbookData] = useState<any>(null);

  const processFile = async (selectedFile: File) => {
    setIsProcessing(true);
    try {
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      
      if (jsonData.length < 2) {
        toast.error('الملف فارغ أو لا يحتوي على بيانات');
        setIsProcessing(false);
        return;
      }

      const headers = jsonData[0].map((h, i) => {
        const header = String(h || `Column${i + 1}`);
        return header.toString().trim();
      });
      setAvailableColumns(headers);

      const rows = jsonData.slice(1).filter(row => row.some(cell => cell !== null && cell !== undefined && cell !== ''));
      setPreviewData(rows.slice(0, 5));

      const newMapping: ColumnMapping = {
        name: '',
        phone: '',
        address: '',
        email: '',
        notes: ''
      };
      
      headers.forEach((header) => {
        const lowerHeader = header.toLowerCase();
        if (lowerHeader.includes('اسم') || lowerHeader.includes('name') || lowerHeader.includes('customer')) {
          newMapping.name = header;
        } else if (lowerHeader.includes('telephone') || lowerHeader.includes('mobile') || lowerHeader.includes('phone') || lowerHeader.includes('تلفون') || lowerHeader.includes('موبايل')) {
          newMapping.phone = header;
        } else if (lowerHeader.includes('عنوان') || lowerHeader.includes('address') || lowerHeader.includes('location')) {
          newMapping.address = header;
        } else if (lowerHeader.includes('بريد') || lowerHeader.includes('email') || lowerHeader.includes('mail')) {
          newMapping.email = header;
        } else if (lowerHeader.includes('ملاحظ') || lowerHeader.includes('notes') || lowerHeader.includes('note') || lowerHeader.includes('وصف')) {
          newMapping.notes = header;
        }
      });

      setColumnMapping(newMapping);
      setFile(selectedFile);
      setWorkbookData({ workbook, headers: headers.slice() });
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('حدث خطأ في قراءة الملف');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
        toast.error('يرجى اختيار ملف Excel فقط');
        return;
      }
      processFile(selectedFile);
    }
  };

  useEffect(() => {
    if (isOpen && !file && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [isOpen]);

  const handleImport = () => {
    if (!workbookData || !file) return;
    
    const { workbook, headers } = workbookData;
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
    
    const dataRows = jsonData.slice(1).filter(row => row.some(cell => cell !== null && cell !== undefined && cell !== ''));
    
    const getColumnIndex = (mappingKey: keyof ColumnMapping) => {
      const mappedHeader = columnMapping[mappingKey];
      if (mappedHeader) {
        return headers.findIndex((h: string) => h === mappedHeader);
      }
      return -1;
    };

    const customers = dataRows.map((row, index) => {
      const nameIndex = getColumnIndex('name');
      const phoneIndex = getColumnIndex('phone');
      const addressIndex = getColumnIndex('address');
      const emailIndex = getColumnIndex('email');
      const notesIndex = getColumnIndex('notes');

      const name = nameIndex >= 0 ? String(row[nameIndex] || '').trim() : `عميل ${index + 1}`;
      const phone = phoneIndex >= 0 ? String(row[phoneIndex] || '').trim() : '';
      const address = addressIndex >= 0 ? String(row[addressIndex] || '').trim() : '';
      const email = emailIndex >= 0 ? String(row[emailIndex] || '').trim() : '';
      const notes = notesIndex >= 0 ? String(row[notesIndex] || '').trim() : '';

      if (!name && !phone) return null;

      return {
        id: `imported-${Date.now()}-${index}`,
        name: name || `عميل ${index + 1}`,
        phone: phone || '',
        address: address || '',
        email: email || undefined,
        notes: notes || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        importedFrom: file.name
      };
    }).filter((c): c is NonNullable<typeof c> => c !== null);

    if (customers.length === 0) {
      toast.error('لم يتم العثور على بيانات صحيحة');
      return;
    }

    const duplicateCount = customers.filter(newC => 
      existingCustomers.some(existingC => 
        existingC.phone === newC.phone && newC.phone !== ''
      )
    ).length;

    onImportCustomers(customers);
    
    toast.success(`تم استيراد ${customers.length} عميل${duplicateCount > 0 ? ` (${duplicateCount} مكرر)` : ''}`);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setFile(null);
    setPreviewData([]);
    setColumnMapping({ name: '', phone: '', address: '', email: '', notes: '' });
    setWorkbookData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const createSampleFile = () => {
    const sampleData = [
      ['الاسم', 'رقم الهاتف', 'العنوان', 'البريد الإلكتروني', 'ملاحظات'],
      ['أحمد محمد', '01012345678', 'القاهرة - مصر الجديدة', 'ahmed@example.com', 'مطبخ حديث'],
      ['سعيد علي', '01112345679', 'الجيزة - المهندسين', 'saeed@example.com', 'دريسنج'],
      ['خالد يوسف', '01234567890', 'الإسكندرية - سان استيفانو', 'khaled@example.com', ''],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'عملاء');
    
    XLSX.writeFile(workbook, 'نموذج_عملاء.xlsx');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        handleReset();
        onClose();
      }
    }}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            استيراد عملاء من Excel
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!file ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                id="excel-file-input"
              />
              <label htmlFor="excel-file-input" className="cursor-pointer">
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">انقر لاختيار ملف Excel</p>
                <p className="text-sm text-gray-400">يدعم .xlsx و .xls</p>
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-medium">{file.name}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div>
                <h4 className="font-medium mb-2">تعيين الأعمدة:</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-gray-600">اسم العميل:</label>
                    <select
                      className="w-full p-2 border rounded"
                      value={columnMapping.name}
                      onChange={(e) => setColumnMapping({ ...columnMapping, name: e.target.value })}
                    >
                      <option value="">اختر العمود</option>
                      {availableColumns.map((col) => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">رقم الهاتف:</label>
                    <select
                      className="w-full p-2 border rounded"
                      value={columnMapping.phone}
                      onChange={(e) => setColumnMapping({ ...columnMapping, phone: e.target.value })}
                    >
                      <option value="">اختر العمود</option>
                      {availableColumns.map((col) => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">العنوان:</label>
                    <select
                      className="w-full p-2 border rounded"
                      value={columnMapping.address}
                      onChange={(e) => setColumnMapping({ ...columnMapping, address: e.target.value })}
                    >
                      <option value="">اختر العمود</option>
                      {availableColumns.map((col) => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">البريد:</label>
                    <select
                      className="w-full p-2 border rounded"
                      value={columnMapping.email}
                      onChange={(e) => setColumnMapping({ ...columnMapping, email: e.target.value })}
                    >
                      <option value="">اختر العمود</option>
                      {availableColumns.map((col) => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm text-gray-600">ملاحظات:</label>
                    <select
                      className="w-full p-2 border rounded"
                      value={columnMapping.notes}
                      onChange={(e) => setColumnMapping({ ...columnMapping, notes: e.target.value })}
                    >
                      <option value="">اختر العمود</option>
                      {availableColumns.map((col) => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {previewData.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">معاينة البيانات:</h4>
                  <div className="border rounded-lg overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          {availableColumns.slice(0, 5).map((header, i) => (
                            <th key={i} className="p-2 text-right border">{header}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.map((row, i) => (
                          <tr key={i} className="border-t">
                            {availableColumns.slice(0, 5).map((_, j) => (
                              <td key={j} className="p-2 border">{String(row[j] || '')}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={createSampleFile} className="flex-1">
              <Download className="w-4 h-4 ml-2" />
              تحميل نموذج
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => { handleReset(); onClose(); }}>
            إلغاء
          </Button>
          <Button onClick={handleImport} disabled={!file || isProcessing}>
            <Users className="w-4 h-4 ml-2" />
            استيراد البيانات
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}