import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, MoreVertical, Edit, Trash2, Eye, Phone, MapPin, FileSpreadsheet, Target } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { ExcelImporter } from './ExcelImporter';
import { ProfitPredictor } from './ProfitPredictor';

interface CustomerListProps {
  customers: any[];
  projects: any[];
  onAdd: () => void;
  onEdit: (customer: any) => void;
  onDelete: (id: string) => void;
  onViewProjects: (customerId: string) => void;
}

export function CustomerList({ customers, projects, onAdd, onEdit, onDelete, onViewProjects }: CustomerListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [viewCustomer, setViewCustomer] = useState<any>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm) ||
    customer.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCustomerProjectsCount = (customerId: string) => {
    return projects.filter(p => p.customerId === customerId).length;
  };

  const handleDelete = (id: string) => {
    onDelete(id);
    setDeleteConfirm(null);
  };

  const handleImportCustomers = (importedCustomers: any[]) => {
    importedCustomers.forEach(customer => {
      const existingCustomer = customers.find(c => c.phone === customer.phone && customer.phone !== '');
      if (!existingCustomer) {
        onAdd();
      }
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-bold">قائمة العملاء</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsImportOpen(true)}>
            <FileSpreadsheet className="w-4 h-4 ml-2" />
            استيراد Excel
          </Button>
          <Button onClick={onAdd}>
            <Plus className="w-4 h-4 ml-2" />
            إضافة عميل
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="list" className="flex gap-2">
              <Eye className="w-4 h-4" />
              القائمة
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex gap-2">
              <Target className="w-4 h-4" />
              تحليل الأرباح
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="list">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="البحث في العملاء..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 text-right"
                />
              </div>
            </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">العميل</TableHead>
                <TableHead className="text-right">رقم الهاتف</TableHead>
                <TableHead className="text-right">العنوان</TableHead>
                <TableHead className="text-right">المشاريع</TableHead>
                <TableHead className="text-right">تاريخ الإضافة</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    لا يوجد عملاء
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell dir="ltr" className="text-left">{customer.phone}</TableCell>
                    <TableCell>{customer.address || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {getCustomerProjectsCount(customer.id)} مشروع
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(customer.createdAt)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setViewCustomer(customer)}>
                            <Eye className="w-4 h-4 ml-2" />
                            عرض التفاصيل
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(customer)}>
                            <Edit className="w-4 h-4 ml-2" />
                            تعديل
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onViewProjects(customer.id)}>
                            <Phone className="w-4 h-4 ml-2" />
                            المشاريع
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => setDeleteConfirm(customer.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 ml-2" />
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        </TabsContent>
          
          <TabsContent value="analytics">
            <ProfitPredictor customers={customers} projects={projects} />
          </TabsContent>
        </Tabs>

        {/* نتائج البحث */}
        <div className="mt-4 text-sm text-gray-500 text-right">
          إجمالي العملاء: {filteredCustomers.length}
        </div>
      </CardContent>

      {/* تأكيد الحذف */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف هذا العميل؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              إلغاء
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              حذف
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* عرض تفاصيل العميل */}
      <Dialog open={!!viewCustomer} onOpenChange={() => setViewCustomer(null)}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>تفاصيل العميل</DialogTitle>
          </DialogHeader>
          {viewCustomer && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">
                    {viewCustomer.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-lg">{viewCustomer.name}</h3>
                  <p className="text-sm text-gray-500">عميل منذ {formatDate(viewCustomer.createdAt)}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span dir="ltr">{viewCustomer.phone}</span>
                </div>
                {viewCustomer.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{viewCustomer.address}</span>
                  </div>
                )}
                {viewCustomer.email && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">@</span>
                    <span dir="ltr">{viewCustomer.email}</span>
                  </div>
                )}
              </div>

              {viewCustomer.notes && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">{viewCustomer.notes}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button 
                  className="flex-1" 
                  onClick={() => {
                    setViewCustomer(null);
                    onEdit(viewCustomer);
                  }}
                >
                  <Edit className="w-4 h-4 ml-2" />
                  تعديل البيانات
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ExcelImporter
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportCustomers={handleImportCustomers}
        existingCustomers={customers}
      />
    </Card>
  );
}
