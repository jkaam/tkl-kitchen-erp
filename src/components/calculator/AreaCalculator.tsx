import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Calculator, FileSpreadsheet } from 'lucide-react';
import { exportToExcel, formatCurrency } from '@/lib/utils';

interface CalculatorItem {
  id: string;
  name: string;
  length: number;
  width: number;
  height: number;
  quantity: number;
  unitPrice: number;
}

export function AreaCalculator() {
  const [items, setItems] = useState<CalculatorItem[]>([]);
  const [currentItem, setCurrentItem] = useState<{
    name: string;
    length: number | '';
    width: number | '';
    height: number | '';
    quantity: number | '';
    unitPrice: number | '';
  }>({
    name: '',
    length: '',
    width: '',
    height: '',
    quantity: 1,
    unitPrice: '',
  });

  const calculateArea = (item: typeof currentItem) => {
    return (Number(item.length) || 0) * (Number(item.width) || 0) * (Number(item.quantity) || 1);
  };

  const calculateTotal = (item: typeof currentItem) => {
    const area = calculateArea(item);
    return area * (Number(item.unitPrice) || 0);
  };

  const handleAddItem = () => {
    if (!currentItem.name || !currentItem.length || !currentItem.width) return;
    
    const newItem: CalculatorItem = {
      id: Date.now().toString(),
      name: currentItem.name,
      length: Number(currentItem.length) || 0,
      width: Number(currentItem.width) || 0,
      height: Number(currentItem.height) || 0,
      quantity: Number(currentItem.quantity) || 1,
      unitPrice: Number(currentItem.unitPrice) || 0,
    };
    
    setItems([...items, newItem]);
    setCurrentItem({
      name: '',
      length: '',
      width: '',
      height: '',
      quantity: 1,
      unitPrice: '',
    });
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleExportExcel = () => {
    const data: any[] = items.map(item => ({
      'البند': item.name,
      'الطول (م)': item.length,
      'العرض (م)': item.width,
      'الارتفاع (م)': item.height || '-',
      'الكمية': item.quantity,
      'سعر المتر': item.unitPrice,
      'المساحة (م²)': (item.length * item.width * item.quantity).toFixed(2),
      'الإجمالي': (item.length * item.width * item.quantity * item.unitPrice).toFixed(2),
    }));
    
    data.push({
      'البند': 'الإجمالي',
      'الطول (م)': '',
      'العرض (م)': '',
      'الارتفاع (م)': '',
      'الكمية': '',
      'سعر المتر': '',
      'المساحة (م²)': totalArea.toFixed(2),
      'الإجمالي': totalPrice.toFixed(2),
    });
    
    exportToExcel(data, 'حساب_الأمتار', 'الحسابات');
  };

  const totalArea = items.reduce((sum, item) => sum + (item.length * item.width * item.quantity), 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.length * item.width * item.quantity * item.unitPrice), 0);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <Calculator className="w-6 h-6" />
          آلة حاسبة الأمتار والتسعير
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* إضافة بند جديد */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <h3 className="font-bold">إضافة بند جديد</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="col-span-2 md:col-span-4">
              <Label>اسم البند</Label>
              <Input
                value={currentItem.name}
                onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
                placeholder="مثال: كونتر مطبخ"
                className="text-right"
              />
            </div>
            <div>
              <Label>الطول (م)</Label>
              <Input
                type="number"
                value={currentItem.length || ''}
                onChange={(e) => setCurrentItem({ ...currentItem, length: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
            <div>
              <Label>العرض (م)</Label>
              <Input
                type="number"
                value={currentItem.width || ''}
                onChange={(e) => setCurrentItem({ ...currentItem, width: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
            <div>
              <Label>الارتفاع (م)</Label>
              <Input
                type="number"
                value={currentItem.height || ''}
                onChange={(e) => setCurrentItem({ ...currentItem, height: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
            <div>
              <Label>الكمية</Label>
              <Input
                type="number"
                value={currentItem.quantity || ''}
                onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) || 1 })}
                placeholder="1"
                min="1"
              />
            </div>
            <div>
              <Label>سعر المتر (ج.م)</Label>
              <Input
                type="number"
                value={currentItem.unitPrice || ''}
                onChange={(e) => setCurrentItem({ ...currentItem, unitPrice: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddItem} className="w-full">
                <Plus className="w-4 h-4 ml-2" />
                إضافة
              </Button>
            </div>
          </div>

          {/* معاينة البند الحالي */}
          {currentItem.name && currentItem.length && currentItem.width && (
            <div className="bg-blue-50 p-3 rounded-lg flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">المساحة: <span className="font-bold">{calculateArea(currentItem).toFixed(2)} م²</span></p>
                <p className="text-sm text-gray-600">الإجمالي: <span className="font-bold text-blue-600">{formatCurrency(calculateTotal(currentItem))}</span></p>
              </div>
            </div>
          )}
        </div>

        {/* جدول البنود */}
        {items.length > 0 && (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">البند</TableHead>
                    <TableHead className="text-right">الأبعاد (م)</TableHead>
                    <TableHead className="text-right">الكمية</TableHead>
                    <TableHead className="text-right">المساحة (م²)</TableHead>
                    <TableHead className="text-right">سعر المتر</TableHead>
                    <TableHead className="text-right">الإجمالي</TableHead>
                    <TableHead className="text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        {item.length} × {item.width}
                        {item.height > 0 && ` × ${item.height}`}
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{(item.length * item.width * item.quantity).toFixed(2)}</TableCell>
                      <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                      <TableCell className="font-bold">
                        {formatCurrency(item.length * item.width * item.quantity * item.unitPrice)}
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

            {/* الإجماليات */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-100 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">إجمالي المساحة</p>
                <p className="text-2xl font-bold text-blue-700">{totalArea.toFixed(2)} م²</p>
              </div>
              <div className="bg-green-100 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">إجمالي السعر</p>
                <p className="text-2xl font-bold text-green-700">{formatCurrency(totalPrice)}</p>
              </div>
            </div>

            {/* أزرار التصدير */}
            <div className="flex gap-2">
              <Button onClick={handleExportExcel} variant="outline" className="flex-1">
                <FileSpreadsheet className="w-4 h-4 ml-2" />
                تصدير Excel
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
