import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wallet, 
  FileText, 
  Home, 
  Users, 
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { InvoiceManager } from './InvoiceManager';
import { RentalManager } from './RentalManager';
import { SalaryManager } from './SalaryManager';

interface AccountingDashboardProps {
  invoices: any[];
  rentals: any[];
  salaries: any[];
  onAddInvoice: (invoice: any) => void;
  onUpdateInvoice: (id: string, updates: any) => void;
  onDeleteInvoice: (id: string) => void;
  onAddRental: (rental: any) => void;
  onUpdateRental: (id: string, updates: any) => void;
  onDeleteRental: (id: string) => void;
  onAddSalary: (salary: any) => void;
  onUpdateSalary: (id: string, updates: any) => void;
  onDeleteSalary: (id: string) => void;
}

export function AccountingDashboard({
  invoices,
  rentals,
  salaries,
  onAddInvoice,
  onUpdateInvoice,
  onDeleteInvoice,
  onAddRental,
  onUpdateRental,
  onDeleteRental,
  onAddSalary,
  onUpdateSalary,
  onDeleteSalary,
}: AccountingDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const overviewStats = useMemo(() => {
    const pendingInvoices = invoices.filter(i => i.status !== 'paid');
    const overdueInvoices = invoices.filter(i => i.dueDate < new Date().toISOString().split('T')[0] && i.status !== 'paid');
    const activeRentals = rentals.filter(r => r.status === 'active');
    const pendingSalaries = salaries.filter(s => s.status !== 'paid');

    const totalReceivables = pendingInvoices.reduce((sum, i) => sum + (i.remainingAmount || i.amount), 0);
    const totalRentalIncome = activeRentals.reduce((sum, r) => sum + (r.monthlyAmount || 0), 0);
    const totalPayroll = pendingSalaries.reduce((sum, s) => sum + (s.netSalary || 0), 0);
    
    return {
      pendingInvoices: pendingInvoices.length,
      overdueInvoices: overdueInvoices.length,
      activeRentals: activeRentals.length,
      pendingSalaries: pendingSalaries.length,
      totalReceivables,
      totalRentalIncome,
      totalPayroll,
      netPosition: totalReceivables + totalRentalIncome - totalPayroll,
    };
  }, [invoices, rentals, salaries]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <Wallet className="w-6 h-6" />
          النظام المحاسبي الشامل
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex gap-2">
              <TrendingUp className="w-4 h-4" />
              نظرة عامة
            </TabsTrigger>
            <TabsTrigger value="invoices" className="flex gap-2">
              <FileText className="w-4 h-4" />
              الفواتير
              {overviewStats.overdueInvoices > 0 && (
                <span className="bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {overviewStats.overdueInvoices}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="rentals" className="flex gap-2">
              <Home className="w-4 h-4" />
              الأجارات
            </TabsTrigger>
            <TabsTrigger value="salaries" className="flex gap-2">
              <Users className="w-4 h-4" />
              الرواتب
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-600">فواتير قيد الانتظار</span>
                </div>
                <p className="text-xl font-bold text-blue-700">{overviewStats.pendingInvoices}</p>
                {overviewStats.overdueInvoices > 0 && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {overviewStats.overdueInvoices} متأخرة
                  </p>
                )}
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Home className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-600">أجارات نشطة</span>
                </div>
                <p className="text-xl font-bold text-green-700">{overviewStats.activeRentals}</p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm text-gray-600">رواتب مستحقة</span>
                </div>
                <p className="text-xl font-bold text-yellow-700">{overviewStats.pendingSalaries}</p>
              </div>

              <div className={`${overviewStats.netPosition >= 0 ? 'bg-emerald-50' : 'bg-red-50'} p-4 rounded-lg`}>
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className={`w-5 h-5 ${overviewStats.netPosition >= 0 ? 'text-emerald-600' : 'text-red-600'}`} />
                  <span className="text-sm text-gray-600">الرصيد الصافي</span>
                </div>
                <p className={`text-xl font-bold ${overviewStats.netPosition >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                  {formatCurrency(overviewStats.netPosition)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border rounded-lg p-4">
                <h4 className="font-bold mb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  المستحقات
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">فواتير غير مدفوعة</span>
                    <span className="font-bold">{formatCurrency(overviewStats.totalReceivables)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">دخل الإيجارات</span>
                    <span className="font-bold text-green-600">{formatCurrency(overviewStats.totalRentalIncome)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border rounded-lg p-4">
                <h4 className="font-bold mb-3 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5" />
                  المصروفات المتوقعة
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">رواتب الموظفين</span>
                    <span className="font-bold text-red-600">{formatCurrency(overviewStats.totalPayroll)}</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="invoices">
            <InvoiceManager
              invoices={invoices}
              onAddInvoice={onAddInvoice}
              onUpdateInvoice={onUpdateInvoice}
              onDeleteInvoice={onDeleteInvoice}
            />
          </TabsContent>

          <TabsContent value="rentals">
            <RentalManager
              rentals={rentals}
              onAddRental={onAddRental}
              onUpdateRental={onUpdateRental}
              onDeleteRental={onDeleteRental}
            />
          </TabsContent>

          <TabsContent value="salaries">
            <SalaryManager
              salaries={salaries}
              onAddSalary={onAddSalary}
              onUpdateSalary={onUpdateSalary}
              onDeleteSalary={onDeleteSalary}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}