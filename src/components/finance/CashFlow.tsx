import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Wallet, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { formatCurrency, formatDate, exportToExcel } from '@/lib/utils';

interface CashFlowProps {
  projects: any[];
  expenses: any[];
}

interface CashFlowItem {
  date: string;
  description: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  balance: number;
}

export function CashFlow({ projects, expenses }: CashFlowProps) {
  const [period, setPeriod] = useState('month');

  // حساب التدفق النقدي
  const cashFlowData = useMemo(() => {
    const items: CashFlowItem[] = [];
    let balance = 0;

    // إضافة دفعات المشاريع
    projects.forEach(project => {
      if (project.paidAmount > 0) {
        items.push({
          date: project.createdAt,
          description: `دفعة - ${project.customerName}`,
          type: 'income',
          amount: project.paidAmount,
          category: 'مبيعات',
          balance: 0,
        });
      }
    });

    // إضافة المصروفات
    expenses.forEach(expense => {
      items.push({
        date: expense.date,
        description: expense.description || expense.category,
        type: 'expense',
        amount: expense.amount,
        category: expense.category,
        balance: 0,
      });
    });

    // ترتيب حسب التاريخ
    items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // حساب الرصيد التراكمي
    items.forEach(item => {
      if (item.type === 'income') {
        balance += item.amount;
      } else {
        balance -= item.amount;
      }
      item.balance = balance;
    });

    return items;
  }, [projects, expenses]);

  // تصفية حسب الفترة
  const filteredData = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    
    return cashFlowData.filter(item => {
      const itemDate = new Date(item.date);
      if (period === 'month') return itemDate >= startOfMonth;
      if (period === 'year') return itemDate >= startOfYear;
      return true;
    });
  }, [cashFlowData, period]);

  // حساب الإجماليات
  const totals = useMemo(() => {
    const income = filteredData
      .filter(item => item.type === 'income')
      .reduce((sum, item) => sum + item.amount, 0);
    
    const expense = filteredData
      .filter(item => item.type === 'expense')
      .reduce((sum, item) => sum + item.amount, 0);
    
    return {
      income,
      expense,
      net: income - expense,
    };
  }, [filteredData]);

  // تحليل التدفق النقدي
  const analysis = useMemo(() => {
    const incomeByCategory: { [key: string]: number } = {};
    const expenseByCategory: { [key: string]: number } = {};

    filteredData.forEach(item => {
      if (item.type === 'income') {
        incomeByCategory[item.category] = (incomeByCategory[item.category] || 0) + item.amount;
      } else {
        expenseByCategory[item.category] = (expenseByCategory[item.category] || 0) + item.amount;
      }
    });

    return { incomeByCategory, expenseByCategory };
  }, [filteredData]);

  const handleExport = () => {
    const data = filteredData.map(item => ({
      'التاريخ': formatDate(item.date),
      'الوصف': item.description,
      'النوع': item.type === 'income' ? 'وارد' : 'صادر',
      'المبلغ': item.amount,
      'الفئة': item.category,
      'الرصيد': item.balance,
    }));
    exportToExcel(data, 'تدفق_نقدي', 'التدفق النقدي');
  };

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      'materials': 'خامات',
      'labor': 'عمالة',
      'transport': 'نقل',
      'installation': 'تركيب',
      'design': 'تصميم',
      'waste': 'هالك',
      'rent': 'إيجار',
      'utilities': 'مرافق',
      'other': 'أخرى',
      'مبيعات': 'مبيعات',
    };
    return labels[category] || category;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <Wallet className="w-6 h-6" />
          تدفق الكاش (Cash Flow)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* ملخص التدفق النقدي */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <ArrowDownLeft className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600">إجمالي الوارد</span>
            </div>
            <p className="text-2xl font-bold text-green-700">{formatCurrency(totals.income)}</p>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpRight className="w-5 h-5 text-red-600" />
              <span className="text-sm text-gray-600">إجمالي الصادر</span>
            </div>
            <p className="text-2xl font-bold text-red-700">{formatCurrency(totals.expense)}</p>
          </div>

          <div className={`${totals.net >= 0 ? 'bg-blue-50' : 'bg-orange-50'} p-4 rounded-lg`}>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className={`w-5 h-5 ${totals.net >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
              <span className="text-sm text-gray-600">صافي التدفق</span>
            </div>
            <p className={`text-2xl font-bold ${totals.net >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
              {formatCurrency(totals.net)}
            </p>
          </div>
        </div>

        {/* التحكم */}
        <div className="flex gap-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">هذا الشهر</SelectItem>
              <SelectItem value="year">هذا العام</SelectItem>
              <SelectItem value="all">الكل</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={handleExport}>
            <FileSpreadsheet className="w-4 h-4 ml-2" />
            تصدير
          </Button>
        </div>

        {/* توزيع الوارد والصادر */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="font-bold mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              توزيع الوارد
            </h4>
            <div className="space-y-2">
              {Object.entries(analysis.incomeByCategory).map(([category, amount]) => (
                <div key={category} className="flex justify-between items-center p-2 bg-green-50 rounded">
                  <span>{getCategoryLabel(category)}</span>
                  <span className="font-bold text-green-700">{formatCurrency(amount)}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-3 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-600" />
              توزيع الصادر
            </h4>
            <div className="space-y-2">
              {Object.entries(analysis.expenseByCategory).map(([category, amount]) => (
                <div key={category} className="flex justify-between items-center p-2 bg-red-50 rounded">
                  <span>{getCategoryLabel(category)}</span>
                  <span className="font-bold text-red-700">{formatCurrency(amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* جدول التدفق النقدي */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">الوصف</TableHead>
                <TableHead className="text-right">النوع</TableHead>
                <TableHead className="text-right">المبلغ</TableHead>
                <TableHead className="text-right">الرصيد</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    لا يوجد بيانات
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{formatDate(item.date)}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>
                      <Badge className={item.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {item.type === 'income' ? 'وارد' : 'صادر'}
                      </Badge>
                    </TableCell>
                    <TableCell className={item.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                      {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                    </TableCell>
                    <TableCell className="font-bold">{formatCurrency(item.balance)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* تنبيهات */}
        {totals.net < 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <p className="font-bold text-red-800">تنبيه: التدفق النقدي سالب</p>
              <p className="text-sm text-red-600">صادراتك أكثر من وارداتك. راجع مصروفاتك.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
