import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Briefcase, 
  Package, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  AlertCircle,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';
import { formatCurrency, formatDate, getProjectStatus, getAppointmentType } from '@/lib/utils';

interface DashboardProps {
  customers: any[];
  projects: any[];
  products: any[];
  expenses: any[];
  appointments: any[];
  onNavigate: (page: string) => void;
}

export function Dashboard({ customers, projects, products, expenses, appointments, onNavigate }: DashboardProps) {
  // حسابات إحصائية
  const stats = useMemo(() => {
    const totalIncome = projects.reduce((sum, p) => sum + (p.totalPrice || 0), 0);
    const totalPaid = projects.reduce((sum, p) => sum + (p.paidAmount || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const netProfit = totalPaid - totalExpenses;
    
    const pendingProjects = projects.filter(p => p.status === 'pending').length;
    const inProgressProjects = projects.filter(p => ['measuring', 'designing', 'manufacturing'].includes(p.status)).length;
    const completedProjects = projects.filter(p => p.status === 'delivered').length;
    
    const lowStockProducts = products.filter(p => p.quantity <= p.minQuantity).length;
    
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(a => a.date === today && !a.isCompleted);
    
    return {
      totalIncome,
      totalPaid,
      totalExpenses,
      netProfit,
      pendingProjects,
      inProgressProjects,
      completedProjects,
      lowStockProducts,
      todayAppointments,
    };
  }, [projects, expenses, products, appointments]);

  // آخر المشاريع
  const recentProjects = useMemo(() => {
    return [...projects]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [projects]);

  // المواعيد القادمة
  const upcomingAppointments = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return appointments
      .filter(a => a.date >= today && !a.isCompleted)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);
  }, [appointments]);

  const statusColors: { [key: string]: string } = {
    pending: 'bg-gray-100 text-gray-800',
    measuring: 'bg-blue-100 text-blue-800',
    designing: 'bg-purple-100 text-purple-800',
    manufacturing: 'bg-yellow-100 text-yellow-800',
    ready: 'bg-green-100 text-green-800',
    delivered: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-6">
      {/* البطاقات الإحصائية */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate('customers')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">العملاء</p>
                <p className="text-2xl font-bold">{customers.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate('projects')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">المشاريع</p>
                <p className="text-2xl font-bold">{projects.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate('inventory')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">المنتجات</p>
                <p className="text-2xl font-bold">{products.length}</p>
                {stats.lowStockProducts > 0 && (
                  <p className="text-xs text-red-600">{stats.lowStockProducts} منخفض</p>
                )}
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate('finance')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">صافي الربح</p>
                <p className={`text-2xl font-bold ${stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(stats.netProfit)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ملخص مالي */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">إجمالي المبيعات</p>
                <p className="text-xl font-bold">{formatCurrency(stats.totalIncome)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">المدفوع</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(stats.totalPaid)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">المصروفات</p>
                <p className="text-xl font-bold text-red-600">{formatCurrency(stats.totalExpenses)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* حالة المشاريع */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-600">معلقة</p>
          <p className="text-2xl font-bold">{stats.pendingProjects}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-600">قيد التنفيذ</p>
          <p className="text-2xl font-bold text-blue-600">{stats.inProgressProjects}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-600">تم التسليم</p>
          <p className="text-2xl font-bold text-green-600">{stats.completedProjects}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-600">مواعيد اليوم</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.todayAppointments.length}</p>
        </div>
      </div>

      {/* آخر المشاريع والمواعيد */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* آخر المشاريع */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">آخر المشاريع</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('projects')}>
              عرض الكل
              <ArrowLeft className="w-4 h-4 mr-2" />
            </Button>
          </CardHeader>
          <CardContent>
            {recentProjects.length === 0 ? (
              <p className="text-center text-gray-500 py-4">لا يوجد مشاريع</p>
            ) : (
              <div className="space-y-3">
                {recentProjects.map(project => (
                  <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{project.customerName}</p>
                      <p className="text-sm text-gray-500">{formatDate(project.createdAt)}</p>
                    </div>
                    <div className="text-left">
                      <Badge className={statusColors[project.status]}>
                        {getProjectStatus(project.status)}
                      </Badge>
                      <p className="text-sm font-bold mt-1">{formatCurrency(project.totalPrice || 0)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* المواعيد القادمة */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              المواعيد القادمة
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('appointments')}>
              عرض الكل
              <ArrowLeft className="w-4 h-4 mr-2" />
            </Button>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length === 0 ? (
              <p className="text-center text-gray-500 py-4">لا يوجد مواعيد قادمة</p>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.map(appointment => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{appointment.customerName}</p>
                      <p className="text-sm text-gray-500">
                        {getAppointmentType(appointment.type)}
                        {appointment.time && ` - ${appointment.time}`}
                      </p>
                    </div>
                    <div className="text-left">
                      <Badge variant="outline">{formatDate(appointment.date)}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
