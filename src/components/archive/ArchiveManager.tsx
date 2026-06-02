import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Archive, 
  Search, 
  Download, 
  History
} from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { exportToExcel } from '@/lib/utils';

interface ArchiveManagerProps {
  projects: any[];
  expenses: any[];
  appointments: any[];
}

export function ArchiveManager({ projects, expenses, appointments }: ArchiveManagerProps) {
  const [activeTab, setActiveTab] = useState('projects');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState({ from: '', to: '' });
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [viewHistory, setViewHistory] = useState(false);

  // تصفية المشاريع
  const filteredProjects = projects.filter(p => {
    const matchesSearch = 
      p.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.projectType?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = 
      (!dateFilter.from || p.createdAt >= dateFilter.from) &&
      (!dateFilter.to || p.createdAt <= dateFilter.to);
    return matchesSearch && matchesDate;
  });

  // المشاريع المكتملة (أرشيف)
  const archivedProjects = projects.filter(p => p.status === 'delivered' || p.status === 'cancelled');
  
  // المشاريع النشطة
  const activeProjects = projects.filter(p => !['delivered', 'cancelled'].includes(p.status));

  // حساب إجمالي الأرشيف
  const archiveStats = {
    totalProjects: projects.length,
    archivedProjects: archivedProjects.length,
    totalValue: archivedProjects.reduce((sum, p) => sum + (p.totalPrice || 0), 0),
    totalProfit: archivedProjects.reduce((sum, p) => {
      const projectExpenses = expenses.filter(e => e.projectId === p.id).reduce((eSum, e) => eSum + (e.amount || 0), 0);
      return sum + ((p.totalPrice || 0) - projectExpenses);
    }, 0),
  };

  const handleExportArchive = () => {
    const data = archivedProjects.map(p => ({
      'العميل': p.customerName,
      'نوع المشروع': p.projectType,
      'السعر': p.totalPrice,
      'التاريخ': formatDate(p.createdAt),
      'تاريخ التسليم': formatDate(p.deliveryDate),
      'الحالة': p.status === 'delivered' ? 'تم التسليم' : 'ملغي',
    }));
    exportToExcel(data, 'أرشيف_المشاريع', 'الأرشيف');
  };

  const getProjectHistory = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    const projectExpenses = expenses.filter(e => e.projectId === projectId);
    const projectAppointments = appointments.filter(a => a.projectId === projectId);
    
    return {
      project,
      expenses: projectExpenses,
      appointments: projectAppointments,
      timeline: [
        { date: project?.createdAt, event: 'إنشاء المشروع', type: 'create' },
        { date: project?.measurementsDate, event: 'رفع المقاسات', type: 'measurement' },
        { date: project?.designDate, event: 'التصميم', type: 'design' },
        { date: project?.deliveryDate, event: 'التسليم', type: 'delivery' },
        ...projectExpenses.map(e => ({ date: e.date, event: `مصروف: ${e.category}`, amount: e.amount, type: 'expense' })),
        ...projectAppointments.map(a => ({ date: a.date, event: a.type, type: 'appointment' })),
      ].filter(item => item.date).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    };
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <Archive className="w-6 h-6" />
          الأرشيف الكامل
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* إحصائيات الأرشيف */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-600">إجمالي المشاريع</p>
            <p className="text-2xl font-bold text-blue-700">{archiveStats.totalProjects}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-600">المؤرشفة</p>
            <p className="text-2xl font-bold text-green-700">{archiveStats.archivedProjects}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-600">القيمة الإجمالية</p>
            <p className="text-2xl font-bold text-purple-700">{formatCurrency(archiveStats.totalValue)}</p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-600">إجمالي الأرباح</p>
            <p className="text-2xl font-bold text-emerald-700">{formatCurrency(archiveStats.totalProfit)}</p>
          </div>
        </div>

        {/* البحث والتصفية */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="البحث في الأرشيف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 text-right"
            />
          </div>
          <Input
            type="date"
            value={dateFilter.from}
            onChange={(e) => setDateFilter({ ...dateFilter, from: e.target.value })}
            placeholder="من"
            className="w-40"
          />
          <Input
            type="date"
            value={dateFilter.to}
            onChange={(e) => setDateFilter({ ...dateFilter, to: e.target.value })}
            placeholder="إلى"
            className="w-40"
          />
          <Button variant="outline" onClick={handleExportArchive}>
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </Button>
        </div>

        {/* التبويبات */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="projects">المشاريع</TabsTrigger>
            <TabsTrigger value="active">النشطة</TabsTrigger>
            <TabsTrigger value="archived">المؤرشفة</TabsTrigger>
          </TabsList>

          <TabsContent value="projects">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">العميل</TableHead>
                    <TableHead className="text-right">النوع</TableHead>
                    <TableHead className="text-right">السعر</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">{project.customerName}</TableCell>
                      <TableCell>{project.projectType}</TableCell>
                      <TableCell>{formatCurrency(project.totalPrice || 0)}</TableCell>
                      <TableCell>
                        <Badge className={project.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                          {project.status === 'delivered' ? 'تم التسليم' : project.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(project.createdAt)}</TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedItem(getProjectHistory(project.id));
                            setViewHistory(true);
                          }}
                        >
                          <History className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="active">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">العميل</TableHead>
                    <TableHead className="text-right">النوع</TableHead>
                    <TableHead className="text-right">السعر</TableHead>
                    <TableHead className="text-right">المتبقي</TableHead>
                    <TableHead className="text-right">التسليم</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeProjects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">{project.customerName}</TableCell>
                      <TableCell>{project.projectType}</TableCell>
                      <TableCell>{formatCurrency(project.totalPrice || 0)}</TableCell>
                      <TableCell className="text-red-600">
                        {formatCurrency(project.remainingAmount || 0)}
                      </TableCell>
                      <TableCell>{formatDate(project.deliveryDate)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="archived">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">العميل</TableHead>
                    <TableHead className="text-right">النوع</TableHead>
                    <TableHead className="text-right">السعر</TableHead>
                    <TableHead className="text-right">الربح</TableHead>
                    <TableHead className="text-right">تاريخ التسليم</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {archivedProjects.map((project) => {
                    const projectExpenses = expenses.filter(e => e.projectId === project.id).reduce((sum, e) => sum + (e.amount || 0), 0);
                    const profit = (project.totalPrice || 0) - projectExpenses;
                    return (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium">{project.customerName}</TableCell>
                        <TableCell>{project.projectType}</TableCell>
                        <TableCell>{formatCurrency(project.totalPrice || 0)}</TableCell>
                        <TableCell className={profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(profit)}
                        </TableCell>
                        <TableCell>{formatDate(project.deliveryDate)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>

        {/* عرض التاريخ */}
        <Dialog open={viewHistory} onOpenChange={setViewHistory}>
          <DialogContent className="max-w-2xl" dir="rtl">
            <DialogHeader>
              <DialogTitle>تاريخ المشروع</DialogTitle>
            </DialogHeader>
            {selectedItem && (
              <div className="space-y-4 mt-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-bold mb-2">{selectedItem.project?.customerName}</h4>
                  <p className="text-sm text-gray-600">{selectedItem.project?.projectType}</p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-bold">الخط الزمني</h4>
                  {selectedItem.timeline?.map((event: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 p-2 border-r-2 border-blue-500 pr-4">
                      <div className="text-sm text-gray-500">{formatDate(event.date)}</div>
                      <div className="flex-1">{event.event}</div>
                      {event.amount && (
                        <div className="text-red-600">{formatCurrency(event.amount)}</div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">إجمالي المصروفات</p>
                    <p className="font-bold text-red-600">
                      {formatCurrency(selectedItem.expenses?.reduce((sum: number, e: any) => sum + (e.amount || 0), 0) || 0)}
                    </p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">صافي الربح</p>
                    <p className="font-bold text-green-600">
                      {formatCurrency(
                        (selectedItem.project?.totalPrice || 0) - 
                        (selectedItem.expenses?.reduce((sum: number, e: any) => sum + (e.amount || 0), 0) || 0)
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
