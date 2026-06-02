import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, TrendingUp, TrendingDown, Wallet, Plus, Trash2, FileSpreadsheet } from 'lucide-react';
import { formatCurrency, formatDate, exportToExcel } from '@/lib/utils';

interface FinanceManagerProps {
  projects: any[];
  expenses: any[];
  onAddExpense: (expense: any) => void;
  onDeleteExpense: (id: string) => void;
}

const expenseCategories = [
  { value: 'materials', label: 'خامات' },
  { value: 'labor', label: 'عمالة' },
  { value: 'transport', label: 'نقل' },
  { value: 'installation', label: 'تركيب' },
  { value: 'design', label: 'تصميم' },
  { value: 'waste', label: 'هالك' },
  { value: 'rent', label: 'إيجار' },
  { value: 'utilities', label: 'مرافق' },
  { value: 'other', label: 'أخرى' },
];

export function FinanceManager({ projects, expenses, onAddExpense, onDeleteExpense }: FinanceManagerProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    category: 'materials',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  // حسابات مالية
  const totalIncome = useMemo(() => {
    return projects.reduce((sum, p) => sum + (p.totalPrice || 0), 0);
  }, [projects]);

  const totalPaid = useMemo(() => {
    return projects.reduce((sum, p) => sum + (p.paidAmount || 0), 0);
  }, [projects]);

  const totalRemaining = useMemo(() => {
    return projects.reduce((sum, p) => sum + (p.remainingAmount || 0), 0);
  }, [projects]);

  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [expenses]);

  const netProfit = totalPaid - totalExpenses;
  const profitMargin = totalPaid > 0 ? (netProfit / totalPaid) * 100 : 0;

  // مصروفات حسب الفئة
  const expensesByCategory = useMemo(() => {
    const grouped: { [key: string]: number } = {};
    expenses.forEach(expense => {
      grouped[expense.category] = (grouped[expense.category] || 0) + (expense.amount || 0);
    });
    return grouped;
  }, [expenses]);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    onAddExpense({
      category: expenseForm.category,
      amount: parseFloat(expenseForm.amount) || 0,
      date: expenseForm.date,
      description: expenseForm.description,
    });
    setExpenseForm({
      category: 'materials',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
    });
    setIsExpenseFormOpen(false);
  };

  const handleExportExpenses = () => {
    const data = expenses.map(e => ({
      'التاريخ': formatDate(e.date),
      'الفئة': expenseCategories.find(c => c.value === e.category)?.label || e.category,
      'المبلغ': e.amount,
      'الوصف': e.description || '-',
    }));
    exportToExcel(data, 'المصروفات', 'المصروفات');
  };

  const getCategoryLabel = (value: string) => {
    return expenseCategories.find(c => c.value === value)?.label || value;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <Wallet className="w-6 h-6" />
          إدارة الماليات والأرباح
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="expenses">المصروفات</TabsTrigger>
            <TabsTrigger value="projects">المشاريع</TabsTrigger>
          </TabsList>

          {/* نظرة عامة */}
          <TabsContent value="overview" className="space-y-6">
            {/* بطاقات الملخص المالي */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-100 p-4 rounded-lg text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-600">إجمالي المبيعات</span>
                </div>
                <p className="text-xl font-bold text-blue-700">{formatCurrency(totalIncome)}</p>
              </div>

              <div className="bg-green-100 p-4 rounded-lg text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-600">المدفوع</span>
                </div>
                <p className="text-xl font-bold text-green-700">{formatCurrency(totalPaid)}</p>
              </div>

              <div className="bg-red-100 p-4 rounded-lg text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                  <span className="text-sm text-gray-600">المصروفات</span>
                </div>
                <p className="text-xl font-bold text-red-700">{formatCurrency(totalExpenses)}</p>
              </div>

              <div className={`${netProfit >= 0 ? 'bg-emerald-100' : 'bg-orange-100'} p-4 rounded-lg text-center`}>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Wallet className={`w-5 h-5 ${netProfit >= 0 ? 'text-emerald-600' : 'text-orange-600'}`} />
                  <span className="text-sm text-gray-600">صافي الربح</span>
                </div>
                <p className={`text-xl font-bold ${netProfit >= 0 ? 'text-emerald-700' : 'text-orange-700'}`}>
                  {formatCurrency(netProfit)}
                </p>
                <p className="text-xs text-gray-500 mt-1">{profitMargin.toFixed(1)}%</p>
              </div>
            </div>

            {/* المبالغ المتبقية */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-yellow-800 font-medium">المبالغ المتبقية على العملاء:</span>
                <span className="text-xl font-bold text-yellow-700">{formatCurrency(totalRemaining)}</span>
              </div>
            </div>

            {/* المصروفات حسب الفئة */}
            <div>
              <h3 className="font-bold mb-3">توزيع المصروفات</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(expensesByCategory).map(([category, amount]) => (
                  <div key={category} className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">{getCategoryLabel(category)}</p>
                    <p className="font-bold">{formatCurrency(amount)}</p>
                    <p className="text-xs text-gray-500">
                      {((amount / totalExpenses) * 100).toFixed(1)}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* المصروفات */}
          <TabsContent value="expenses" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold">سجل المصروفات</h3>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleExportExpenses}>
                  <FileSpreadsheet className="w-4 h-4 ml-2" />
                  تصدير
                </Button>
                <Button onClick={() => setIsExpenseFormOpen(true)}>
                  <Plus className="w-4 h-4 ml-2" />
                  مصروف جديد
                </Button>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">الفئة</TableHead>
                    <TableHead className="text-right">المبلغ</TableHead>
                    <TableHead className="text-right">الوصف</TableHead>
                    <TableHead className="text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        لا يوجد مصروفات
                      </TableCell>
                    </TableRow>
                  ) : (
                    expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>{formatDate(expense.date)}</TableCell>
                        <TableCell>{getCategoryLabel(expense.category)}</TableCell>
                        <TableCell className="font-bold text-red-600">
                          {formatCurrency(expense.amount)}
                        </TableCell>
                        <TableCell>{expense.description || '-'}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteExpense(expense.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* المشاريع */}
          <TabsContent value="projects" className="space-y-4">
            <h3 className="font-bold">حالة المشاريع مالياً</h3>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">العميل</TableHead>
                    <TableHead className="text-right">النوع</TableHead>
                    <TableHead className="text-right">السعر</TableHead>
                    <TableHead className="text-right">المدفوع</TableHead>
                    <TableHead className="text-right">المتبقي</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">{project.customerName}</TableCell>
                      <TableCell>{project.projectType}</TableCell>
                      <TableCell>{formatCurrency(project.totalPrice || 0)}</TableCell>
                      <TableCell className="text-green-600">
                        {formatCurrency(project.paidAmount || 0)}
                      </TableCell>
                      <TableCell className={(project.remainingAmount || 0) > 0 ? 'text-red-600' : 'text-green-600'}>
                        {formatCurrency(project.remainingAmount || 0)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* نموذج إضافة مصروف */}
      <Dialog open={isExpenseFormOpen} onOpenChange={setIsExpenseFormOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>إضافة مصروف جديد</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddExpense} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>الفئة</Label>
              <Select 
                value={expenseForm.category} 
                onValueChange={(value) => setExpenseForm({ ...expenseForm, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>المبلغ</Label>
              <Input
                type="number"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                placeholder="0.00"
                required
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label>التاريخ</Label>
              <Input
                type="date"
                value={expenseForm.date}
                onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>الوصف</Label>
              <Input
                value={expenseForm.description}
                onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                placeholder="وصف المصروف (اختياري)"
                className="text-right"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                <Plus className="w-4 h-4 ml-2" />
                إضافة المصروف
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
