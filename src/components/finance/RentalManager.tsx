import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Plus, 
  Trash2, 
  Edit, 
  AlertTriangle
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface RentalManagerProps {
  rentals: any[];
  onAddRental: (rental: any) => void;
  onUpdateRental: (id: string, updates: any) => void;
  onDeleteRental: (id: string) => void;
}

export function RentalManager({ rentals, onAddRental, onUpdateRental, onDeleteRental }: RentalManagerProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRental, setEditingRental] = useState<any>(null);
  
  const [form, setForm] = useState({
    propertyName: '',
    tenantName: '',
    tenantPhone: '',
    monthlyAmount: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notes: '',
  });

  const activeRentals = useMemo(() => rentals.filter(r => r.status === 'active'), [rentals]);
  
  const totalMonthlyIncome = useMemo(() => 
    activeRentals.reduce((sum, r) => sum + (r.monthlyAmount || 0), 0), [activeRentals]);

  const upcomingRentPayments = useMemo(() => {
    const today = new Date();
    const monthStart = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
    
    return activeRentals.filter(r => !r.lastPaymentDate || r.lastPaymentDate < monthStart);
  }, [activeRentals]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const rentalData = {
      propertyName: form.propertyName,
      tenantName: form.tenantName,
      tenantPhone: form.tenantPhone,
      monthlyAmount: parseFloat(form.monthlyAmount) || 0,
      startDate: form.startDate,
      endDate: form.endDate || undefined,
      status: form.endDate ? 'active' : 'active',
      notes: form.notes,
    };

    if (editingRental) {
      onUpdateRental(editingRental.id, rentalData);
    } else {
      onAddRental(rentalData);
    }
    
    resetForm();
    setIsFormOpen(false);
  };

  const handleDelete = (id: string) => {
    onDeleteRental(id);
  };

  const resetForm = () => {
    setForm({
      propertyName: '',
      tenantName: '',
      tenantPhone: '',
      monthlyAmount: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      notes: '',
    });
    setEditingRental(null);
  };

  const openEdit = (rental: any) => {
    setEditingRental(rental);
    setForm({
      propertyName: rental.propertyName,
      tenantName: rental.tenantName,
      tenantPhone: rental.tenantPhone,
      monthlyAmount: rental.monthlyAmount.toString(),
      startDate: rental.startDate,
      endDate: rental.endDate || '',
      notes: rental.notes || '',
    });
    setIsFormOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700">نشط</Badge>;
      case 'expired':
        return <Badge className="bg-gray-100 text-gray-700">منتهي</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-700">ملغى</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <Home className="w-6 h-6" />
          إدارة الأجارات
        </CardTitle>
        <Button onClick={() => { resetForm(); setIsFormOpen(true); }}>
          <Plus className="w-4 h-4 ml-2" />
          إضافة إيجار
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">إجمالي الأجارات</p>
            <p className="text-xl font-bold">{rentals.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">نشطة</p>
            <p className="text-xl font-bold text-green-600">{activeRentals.length}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">الدخل الشهري</p>
            <p className="text-xl font-bold text-purple-600">{formatCurrency(totalMonthlyIncome)}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">مستحقة هذا الشهر</p>
            <p className="text-xl font-bold text-yellow-600">{upcomingRentPayments.length}</p>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الممتلكات</TableHead>
                <TableHead className="text-right">المستأجر</TableHead>
                <TableHead className="text-right">الهاتف</TableHead>
                <TableHead className="text-right">الإيجار الشهري</TableHead>
                <TableHead className="text-right">تاريخ البداية</TableHead>
                <TableHead className="text-right">تاريخ النهاية</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rentals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    لا توجد أجارات
                  </TableCell>
                </TableRow>
              ) : (
                rentals.map((rental) => (
                  <TableRow key={rental.id}>
                    <TableCell className="font-medium">{rental.propertyName}</TableCell>
                    <TableCell>{rental.tenantName}</TableCell>
                    <TableCell dir="ltr">{rental.tenantPhone}</TableCell>
                    <TableCell className="font-bold">{formatCurrency(rental.monthlyAmount)}</TableCell>
                    <TableCell>{formatDate(rental.startDate)}</TableCell>
                    <TableCell>{rental.endDate ? formatDate(rental.endDate) : '-'}</TableCell>
                    <TableCell>{getStatusBadge(rental.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(rental)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(rental.id)} className="text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {upcomingRentPayments.length > 0 && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-bold text-yellow-800 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              مستحقات الإيجار لهذا الشهر
            </h4>
            <div className="space-y-2">
              {upcomingRentPayments.map(rental => (
                <div key={rental.id} className="flex justify-between items-center bg-white p-3 rounded-lg">
                  <div>
                    <p className="font-medium">{rental.propertyName}</p>
                    <p className="text-sm text-gray-600">{rental.tenantName}</p>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-yellow-700">{formatCurrency(rental.monthlyAmount)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <Dialog open={isFormOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsFormOpen(open); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingRental ? 'تعديل إيجار' : 'إضافة إيجار جديد'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>اسم العقار</Label>
              <Input value={form.propertyName} onChange={(e) => setForm({ ...form, propertyName: e.target.value })} placeholder="معرض المطابخ" required />
            </div>

            <div className="space-y-2">
              <Label>اسم المستأجر</Label>
              <Input value={form.tenantName} onChange={(e) => setForm({ ...form, tenantName: e.target.value })} placeholder="اسم المستأجر" required />
            </div>

            <div className="space-y-2">
              <Label>رقم الهاتف</Label>
              <Input value={form.tenantPhone} onChange={(e) => setForm({ ...form, tenantPhone: e.target.value })} placeholder="01XXXXXXXXX" dir="ltr" />
            </div>

            <div className="space-y-2">
              <Label>الإيجار الشهري</Label>
              <Input type="number" value={form.monthlyAmount} onChange={(e) => setForm({ ...form, monthlyAmount: e.target.value })} placeholder="0.00" required />
            </div>

            <div className="space-y-2">
              <Label>تاريخ البداية</Label>
              <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
            </div>

            <div className="space-y-2">
              <Label>تاريخ النهاية (اختياري)</Label>
              <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label>ملاحظات</Label>
              <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="ملاحظات" />
            </div>

            <Button type="submit" className="w-full">
              <Plus className="w-4 h-4 ml-2" />
              {editingRental ? 'تحديث' : 'إضافة'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}