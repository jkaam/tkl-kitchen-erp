import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, FileText, FileSpreadsheet, X, Printer } from 'lucide-react';
import { formatCurrency, exportToExcel } from '@/lib/utils';
import jsPDF from 'jspdf';

interface QuoteGeneratorProps {
  customers: any[];
}

interface QuoteItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

export function QuoteGenerator({ customers }: QuoteGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  const [quoteData, setQuoteData] = useState({
    customerId: '',
    projectType: 'kitchen',
    validUntil: '',
    notes: '',
    discount: 0,
    tax: 14,
  });

  const [currentItem, setCurrentItem] = useState<{
    name: string;
    description: string;
    quantity: number | '';
    unit: string;
    unitPrice: number | '';
  }>({
    name: '',
    description: '',
    quantity: 1,
    unit: 'متر',
    unitPrice: '',
  });

  const [items, setItems] = useState<QuoteItem[]>([]);

  const projectTypes = [
    { value: 'kitchen', label: 'مطبخ' },
    { value: 'dressing', label: 'دريسنج' },
    { value: 'furniture', label: 'أثاث' },
    { value: 'other', label: 'أخرى' },
  ];

  const units = ['متر', 'متر مربع', 'قطعة', 'طقم', 'لوح'];

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const discountAmount = (subtotal * quoteData.discount) / 100;
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = (afterDiscount * quoteData.tax) / 100;
  const total = afterDiscount + taxAmount;

  const handleAddItem = () => {
    if (!currentItem.name) return;
    
    const newItem: QuoteItem = {
      id: Date.now().toString(),
      name: currentItem.name || '',
      description: currentItem.description || '',
      quantity: currentItem.quantity || 1,
      unit: currentItem.unit || 'متر',
      unitPrice: currentItem.unitPrice || 0,
    };
    
    setItems([...items, newItem]);
    setCurrentItem({
      name: '',
      description: '',
      quantity: 1,
      unit: 'متر',
      unitPrice: 0,
    });
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleExportExcel = () => {
    const customer = customers.find(c => c.id === quoteData.customerId);
    const data = items.map((item, idx) => ({
      'م': idx + 1,
      'البند': item.name,
      'الوصف': item.description || '-',
      'الكمية': item.quantity,
      'الوحدة': item.unit,
      'سعر الوحدة': item.unitPrice,
      'الإجمالي': item.quantity * item.unitPrice,
    }));
    
    data.push(
      { 'م': 0, 'البند': 'الإجمالي', 'الوصف': '', 'الكمية': 0, 'الوحدة': '', 'سعر الوحدة': 0, 'الإجمالي': subtotal },
      { 'م': 0, 'البند': `الخصم (${quoteData.discount}%)`, 'الوصف': '', 'الكمية': 0, 'الوحدة': '', 'سعر الوحدة': 0, 'الإجمالي': -discountAmount },
      { 'م': 0, 'البند': `الضريبة (${quoteData.tax}%)`, 'الوصف': '', 'الكمية': 0, 'الوحدة': '', 'سعر الوحدة': 0, 'الإجمالي': taxAmount },
      { 'م': 0, 'البند': 'الإجمالي النهائي', 'الوصف': '', 'الكمية': 0, 'الوحدة': '', 'سعر الوحدة': 0, 'الإجمالي': total }
    );
    
    exportToExcel(data, `عرض_سعر_${customer?.name || 'عميل'}`, 'عرض السعر');
  };

  const handleExportPDF = () => {
    const customer = customers.find(c => c.id === quoteData.customerId);
    const doc = new jsPDF();
    
    // العنوان
    doc.setFontSize(20);
    doc.text('عرض سعر', 105, 20, { align: 'center' });
    
    // معلومات العميل
    doc.setFontSize(12);
    doc.text(`العميل: ${customer?.name || ''}`, 20, 40);
    doc.text(`التاريخ: ${new Date().toLocaleDateString('ar-EG')}`, 20, 50);
    doc.text(`ساري حتى: ${quoteData.validUntil || '-'}`, 20, 60);
    
    // الجدول
    const headers = ['م', 'البند', 'الكمية', 'الوحدة', 'السعر', 'الإجمالي'];
    const data = items.map((item, idx) => [
      (idx + 1).toString(),
      item.name,
      item.quantity.toString(),
      item.unit,
      formatCurrency(item.unitPrice),
      formatCurrency(item.quantity * item.unitPrice),
    ]);
    
    (doc as any).autoTable({
      head: [headers],
      body: data,
      startY: 70,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
    });
    
    // الإجماليات
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.text(`الإجمالي: ${formatCurrency(subtotal)}`, 150, finalY, { align: 'right' });
    doc.text(`الخصم (${quoteData.discount}%): ${formatCurrency(discountAmount)}`, 150, finalY + 10, { align: 'right' });
    doc.text(`الضريبة (${quoteData.tax}%): ${formatCurrency(taxAmount)}`, 150, finalY + 20, { align: 'right' });
    doc.setFontSize(14);
    doc.text(`الإجمالي النهائي: ${formatCurrency(total)}`, 150, finalY + 35, { align: 'right' });
    
    doc.save(`عرض_سعر_${customer?.name || 'عميل'}.pdf`);
  };

  const getProjectTypeLabel = (value: string) => {
    return projectTypes.find(p => p.value === value)?.label || value;
  };

  const resetForm = () => {
    setQuoteData({
      customerId: '',
      projectType: 'kitchen',
      validUntil: '',
      notes: '',
      discount: 0,
      tax: 14,
    });
    setItems([]);
    setIsOpen(false);
    setPreviewMode(false);
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6" />
            عروض الأسعار
          </CardTitle>
          <Button onClick={() => setIsOpen(true)}>
            <Plus className="w-4 h-4 ml-2" />
            عرض سعر جديد
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>اضغط على "عرض سعر جديد" لإنشاء عرض سعر جديد</p>
          </div>
        </CardContent>
      </Card>

      {/* نموذج إنشاء عرض السعر */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>إنشاء عرض سعر جديد</DialogTitle>
          </DialogHeader>

          {!previewMode ? (
            <div className="space-y-6 mt-4">
              {/* معلومات أساسية */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>العميل *</Label>
                  <Select 
                    value={quoteData.customerId} 
                    onValueChange={(value) => setQuoteData({ ...quoteData, customerId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر العميل" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map(customer => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>نوع المشروع</Label>
                  <Select 
                    value={quoteData.projectType} 
                    onValueChange={(value) => setQuoteData({ ...quoteData, projectType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {projectTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>ساري حتى</Label>
                  <Input
                    type="date"
                    value={quoteData.validUntil}
                    onChange={(e) => setQuoteData({ ...quoteData, validUntil: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>نسبة الخصم (%)</Label>
                  <Input
                    type="number"
                    value={quoteData.discount}
                    onChange={(e) => setQuoteData({ ...quoteData, discount: parseFloat(e.target.value) || 0 })}
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              {/* إضافة بنود */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <h4 className="font-bold">إضافة بند</h4>
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-3">
                    <Input
                      value={currentItem.name}
                      onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
                      placeholder="اسم البند"
                      className="text-right"
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      value={currentItem.description}
                      onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
                      placeholder="الوصف"
                      className="text-right"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      value={currentItem.quantity}
                      onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseFloat(e.target.value) || 1 })}
                      placeholder="الكمية"
                      min="1"
                    />
                  </div>
                  <div className="col-span-2">
                    <Select 
                      value={currentItem.unit} 
                      onValueChange={(value) => setCurrentItem({ ...currentItem, unit: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map(unit => (
                          <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      value={currentItem.unitPrice}
                      onChange={(e) => setCurrentItem({ ...currentItem, unitPrice: parseFloat(e.target.value) || 0 })}
                      placeholder="السعر"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                <Button onClick={handleAddItem} className="w-full">
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة البند
                </Button>
              </div>

              {/* جدول البنود */}
              {items.length > 0 && (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">البند</TableHead>
                        <TableHead className="text-right">الوصف</TableHead>
                        <TableHead className="text-right">الكمية</TableHead>
                        <TableHead className="text-right">السعر</TableHead>
                        <TableHead className="text-right">الإجمالي</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.description || '-'}</TableCell>
                          <TableCell>{item.quantity} {item.unit}</TableCell>
                          <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                          <TableCell className="font-bold">
                            {formatCurrency(item.quantity * item.unitPrice)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* ملاحظات */}
              <div className="space-y-2">
                <Label>ملاحظات</Label>
                <Textarea
                  value={quoteData.notes}
                  onChange={(e) => setQuoteData({ ...quoteData, notes: e.target.value })}
                  placeholder="أي ملاحظات إضافية..."
                  className="text-right"
                />
              </div>

              {/* الإجماليات */}
              {items.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span>الإجمالي:</span>
                    <span className="font-bold">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>الخصم ({quoteData.discount}%):</span>
                    <span className="font-bold">-{formatCurrency(discountAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الضريبة ({quoteData.tax}%):</span>
                    <span className="font-bold">{formatCurrency(taxAmount)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>الإجمالي النهائي:</span>
                    <span className="text-blue-700">{formatCurrency(total)}</span>
                  </div>
                </div>
              )}

              {/* أزرار */}
              <div className="flex gap-2">
                <Button 
                  onClick={() => setPreviewMode(true)} 
                  className="flex-1"
                  disabled={items.length === 0 || !quoteData.customerId}
                >
                  <Printer className="w-4 h-4 ml-2" />
                  معاينة وطباعة
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  <X className="w-4 h-4 ml-2" />
                  إلغاء
                </Button>
              </div>
            </div>
          ) : (
            /* معاينة عرض السعر */
            <div className="space-y-6 mt-4">
              <div className="border p-6 rounded-lg">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold">عرض سعر</h2>
                  <p className="text-gray-500">{getProjectTypeLabel(quoteData.projectType)}</p>
                </div>

                <div className="mb-6">
                  <p><strong>العميل:</strong> {customers.find(c => c.id === quoteData.customerId)?.name}</p>
                  <p><strong>التاريخ:</strong> {new Date().toLocaleDateString('ar-EG')}</p>
                  <p><strong>ساري حتى:</strong> {quoteData.validUntil || '-'}</p>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">م</TableHead>
                      <TableHead className="text-right">البند</TableHead>
                      <TableHead className="text-right">الكمية</TableHead>
                      <TableHead className="text-right">الوحدة</TableHead>
                      <TableHead className="text-right">السعر</TableHead>
                      <TableHead className="text-right">الإجمالي</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, idx) => (
                      <TableRow key={item.id}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell>{formatCurrency(item.quantity * item.unitPrice)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-6 space-y-2 text-left">
                  <p><strong>الإجمالي:</strong> {formatCurrency(subtotal)}</p>
                  <p><strong>الخصم ({quoteData.discount}%):</strong> {formatCurrency(discountAmount)}</p>
                  <p><strong>الضريبة ({quoteData.tax}%):</strong> {formatCurrency(taxAmount)}</p>
                  <p className="text-xl font-bold text-blue-700">
                    <strong>الإجمالي النهائي:</strong> {formatCurrency(total)}
                  </p>
                </div>

                {quoteData.notes && (
                  <div className="mt-6 p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">ملاحظات: {quoteData.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button onClick={handleExportExcel} variant="outline" className="flex-1">
                  <FileSpreadsheet className="w-4 h-4 ml-2" />
                  تصدير Excel
                </Button>
                <Button onClick={handleExportPDF} variant="outline" className="flex-1">
                  <FileText className="w-4 h-4 ml-2" />
                  تصدير PDF
                </Button>
                <Button onClick={() => setPreviewMode(false)} variant="outline">
                  <X className="w-4 h-4 ml-2" />
                  رجوع
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
