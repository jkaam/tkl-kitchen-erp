import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Plus, 
  Trash2, 
  Edit, 
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface SalaryManagerProps {
  salaries: any[];
  onAddSalary: (salary: any) => void;
  onUpdateSalary: (id: string, updates: any) => void;
  onDeleteSalary: (id: string) => void;
}

const positions = [
  { value: 'designer', label: 'مصمم' },
  { value: 'technician', label: 'فني' },
  { value: 'installer', label: 'مركب' },
  { value: 'accountant', label: 'محاسب' },
  { value: 'sales', label: 'مبيعات' },
  { value: 'admin', label: 'إداري' },
  { value: 'driver', label: 'سائق' },
  { value: 'other', label: 'أخرى' },
];

export function SalaryManager({ salaries, onAddSalary, onUpdateSalary, onDeleteSalary }: SalaryManagerProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSalary, setEditingSalary] = useState<any>(null);
  
  const [form, setForm] = useState({
    employeeName: '',
    employeePhone: '',
    position: 'technician',
    baseSalary: '',
    allowances: '',
    deductions: '',
    paymentDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const netSalary = (parseFloat(form.baseSalary) || 0) + (parseFloat(form.allowances) || 0) - (parseFloat(form.deductions) || 0);

  const pendingSalaries = useMemo(() => salaries.filter(s => s.status !== 'paid'), [salaries]);
  const paidSalaries = useMemo(() => salaries.filter(s => s.status === 'paid'), [salaries]);
  
  const totalMonthlyPayroll = useMemo(() => {
    const uniqueEmployees = [...new Set(salaries.map(s => s.employeeName))];
    let total = 0;
    uniqueEmployees.forEach(emp => {
      const empSalaries = salaries.filter(s => s.employeeName === emp);
      if (empSalaries.length > 0) {
        const latest = empSalaries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
        total += latest.netSalary || 0;
      }
    });
    return total;
  }, [salaries]);

  const dueThisMonth = useMemo(() => {
    const today = new Date();
    const monthStart = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
    
    return pendingSalaries.filter(s => s.paymentDate <= monthStart);
  }, [pendingSalaries]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const salaryData = {
      employeeName: form.employeeName,
      employeePhone: form.employeePhone,
      position: form.position,
      baseSalary: parseFloat(form.baseSalary) || 0,
      allowances: parseFloat(form.allowances) || 0,
      deductions: parseFloat(form.deductions) || 0,
      netSalary: netSalary,
      paymentDate: form.paymentDate,
      status: 'pending',
      notes: form.notes,
    };

    if (editingSalary) {
      onUpdateSalary(editingSalary.id, salaryData);
    } else {
      onAddSalary(salaryData);
    }
    
    resetForm();
    setIsFormOpen(false);
  };

  const handlePayment = (id: string) => {
    onUpdateSalary(id, { status: 'paid' });
  };

  const handleDelete = (id: string) => {
    onDeleteSalary(id);
  };

  const resetForm = () => {
    setForm({
      employeeName: '',
      employeePhone: '',
      position: 'technician',
      baseSalary: '',
      allowances: '',
      deductions: '',
      paymentDate: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setEditingSalary(null);
  };

  const openEdit = (salary: any) => {
    setEditingSalary(salary);
    setForm({
      employeeName: salary.employeeName,
      employeePhone: salary.employeePhone || '',
      position: salary.position,
      baseSalary: salary.baseSalary?.toString() || '',
      allowances: salary.allowances?.toString() || '',
      deductions: salary.deductions?.toString() || '',
      paymentDate: salary.paymentDate,
      notes: salary.notes || '',
    });
    setIsFormOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-700">مدفوع</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700">قيد الانتظار</Badge>;
      case 'delayed':
        return <Badge className="bg-red-100 text-red-700">متأخر</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const displayedSalaries = salaries;

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6" />
          إدارة الرواتب
        </CardTitle>
        <Button onClick={() => { resetForm(); setIsFormOpen(true); }}>
          <Plus className="w-4 h-4 ml-2" />
          إضافة راتب
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">إجمالي السجلات</p>
            <p className="text-xl font-bold">{salaries.length}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">قيد الانتظار</p>
            <p className="text-xl font-bold text-yellow-600">{pendingSalaries.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">مدفوع</p>
            <p className="text-xl font-bold text-green-600">{paidSalaries.length}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">إجمالي الرواتب</p>
            <p className="text-xl font-bold text-purple-600">{formatCurrency(totalMonthlyPayroll)}</p>
          </div>
        </div>

        {dueThisMonth.length > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-bold text-red-800 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              رواتب مستحقة هذا الشهر
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {dueThisMonth.slice(0, 6).map(salary => (
                <div key={salary.id} className="bg-white p-3 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-medium">{salary.employeeName}</p>
                    <p className="text-sm text-gray-600">{positions.find(p => p.value === salary.position)?.label}</p>
                  </div>
                  <p className="font-bold text-red-600">{formatCurrency(salary.netSalary)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الموظف</TableHead>
                <TableHead className="text-right">الوظيفة</TableHead>
                <TableHead className="text-right">الراتب الأساسي</TableHead>
                <TableHead className="text-right">البدلات</TableHead>
                <TableHead className="text-right">الخصومات</TableHead>
                <TableHead className="text-right">الصافي</TableHead>
                <TableHead className="text-right">تاريخ الدفع</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedSalaries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    لا توجد رواتب
                  </TableCell>
                </TableRow>
              ) : (
                displayedSalaries.map((salary) => (
                  <TableRow key={salary.id}>
                    <TableCell className="font-medium">{salary.employeeName}</TableCell>
                    <TableCell>{positions.find(p => p.value === salary.position)?.label}</TableCell>
                    <TableCell>{formatCurrency(salary.baseSalary || 0)}</TableCell>
                    <TableCell className="text-green-600">+{formatCurrency(salary.allowances || 0)}</TableCell>
                    <TableCell className="text-red-600">-{formatCurrency(salary.deductions || 0)}</TableCell>
                    <TableCell className="font-bold">{formatCurrency(salary.netSalary)}</TableCell>
                    <TableCell>{formatDate(salary.paymentDate)}</TableCell>
                    <TableCell>{getStatusBadge(salary.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {salary.status !== 'paid' && (
                          <Button variant="ghost" size="sm" onClick={() => handlePayment(salary.id)}>
                            <DollarSign className="w-4 h-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => openEdit(salary)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(salary.id)} className="text-red-600">
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
      </CardContent>

      <Dialog open={isFormOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsFormOpen(open); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingSalary ? 'تعديل راتب' : 'إضافة راتب جديد'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>اسم الموظف</Label>
              <Input value={form.employeeName} onChange={(e) => setForm({ ...form, employeeName: e.target.value })} placeholder="اسم ا��مو��ف" required />
            </div>

            <div className="space-y-2">
              <Label>رقم الهاتف</Label>
              <Input value={form.employeePhone} onChange={(e) => setForm({ ...form, employeePhone: e.target.value })} placeholder="01XXXXXXXXX" dir="ltr" />
            </div>

            <div className="space-y-2">
              <Label>الوظيفة</Label>
              <select
                className="w-full p-2 border rounded-md"
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
              >
                {positions.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-2">
                <Label>الراتب</Label>
                <Input type="number" value={form.baseSalary} onChange={(e) => setForm({ ...form, baseSalary: e.target.value })} placeholder="0" required />
              </div>
              <div className="space-y-2">
                <Label>البدلات</Label>
                <Input type="number" value={form.allowances} onChange={(e) => setForm({ ...form, allowances: e.target.value })} placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label>الخصومات</Label>
                <Input type="number" value={form.deductions} onChange={(e) => setForm({ ...form, deductions: e.target.value })} placeholder="0" />
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-bold">الصافي:</span>
                <span className="text-xl font-bold text-green-600">{formatCurrency(netSalary)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>تاريخ الدفع</Label>
              <Input type="date" value={form.paymentDate} onChange={(e) => setForm({ ...form, paymentDate: e.target.value })} required />
            </div>

            <div className="space-y-2">
              <Label>ملاحظات</Label>
              <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="ملاحظات" />
            </div>

            <Button type="submit" className="w-full">
              <Plus className="w-4 h-4 ml-2" />
              {editingSalary ? 'تحديث' : 'إضافة'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}