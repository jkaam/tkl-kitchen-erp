import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Edit, 
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  Bell,
  Calendar
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useCustomers } from '@/hooks/useLocalStorage';

interface InvoiceManagerProps {
  invoices: any[];
  onAddInvoice: (invoice: any) => void;
  onUpdateInvoice: (id: string, updates: any) => void;
  onDeleteInvoice: (id: string) => void;
}

const invoiceTypes = [
  { value: 'project', label: 'مشروع' },
  { value: 'rental', label: 'إيجار' },
  { value: 'salary', label: 'راتب' },
  { value: 'expense', label: 'مصروف' },
  { value: 'other', label: 'أخرى' },
];

export function InvoiceManager({ invoices, onAddInvoice, onUpdateInvoice, onDeleteInvoice }: InvoiceManagerProps) {
  const { customers } = useCustomers();
  const [activeTab, setActiveTab] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any>(null);
  const [showReminderModal, setShowReminderModal] = useState(false);
  
  const [form, setForm] = useState({
    customerId: '',
    projectId: '',
    type: 'project',
    amount: '',
    dueDate: new Date().toISOString().split('T')[0],
    description: '',
  });

  const overdueInvoices = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return invoices.filter(i => i.dueDate < today && i.status !== 'paid');
  }, [invoices]);

  const upcomingInvoices = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const weekLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return invoices.filter(i => i.dueDate >= today && i.dueDate <= weekLater && i.status !== 'paid');
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    switch (activeTab) {
      case 'pending':
        return invoices.filter(i => i.status === 'pending' || i.status === 'partial');
      case 'paid':
        return invoices.filter(i => i.status === 'paid');
      case 'overdue':
        return overdueInvoices;
      default:
        return invoices;
    }
  }, [activeTab, invoices, overdueInvoices]);

  const totalPending = useMemo(() => {
    return invoices
      .filter(i => i.status !== 'paid')
      .reduce((sum, i) => sum + (i.remainingAmount || i.amount), 0);
  }, [invoices]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const customer = customers.find(c => c.id === form.customerId);
    
    const invoiceData = {
      invoiceNumber: editingInvoice?.invoiceNumber || `INV-${Date.now()}`,
      customerId: form.customerId,
      customerName: customer?.name || 'غير محدد',
      projectId: form.projectId || undefined,
      type: form.type,
      amount: parseFloat(form.amount) || 0,
      paidAmount: editingInvoice?.paidAmount || 0,
      remainingAmount: editingInvoice ? 
        (parseFloat(form.amount) - editingInvoice.paidAmount) : 
        parseFloat(form.amount),
      dueDate: form.dueDate,
      status: editingInvoice?.status || 'pending',
      notes: form.description,
    };

    if (editingInvoice) {
      onUpdateInvoice(editingInvoice.id, invoiceData);
    } else {
      onAddInvoice(invoiceData);
    }
    
    resetForm();
    setIsFormOpen(false);
  };

  const handlePayment = (invoice: any, amount: number) => {
    const newPaidAmount = invoice.paidAmount + amount;
    const newStatus = newPaidAmount >= invoice.amount ? 'paid' : 'partial';
    onUpdateInvoice(invoice.id, {
      paidAmount: newPaidAmount,
      remainingAmount: invoice.amount - newPaidAmount,
      status: newStatus,
    });
  };

  const handleDelete = (id: string) => {
    onDeleteInvoice(id);
  };

  const resetForm = () => {
    setForm({
      customerId: '',
      projectId: '',
      type: 'project',
      amount: '',
      dueDate: new Date().toISOString().split('T')[0],
      description: '',
    });
    setEditingInvoice(null);
  };

  const openEdit = (invoice: any) => {
    setEditingInvoice(invoice);
    setForm({
      customerId: invoice.customerId,
      projectId: invoice.projectId || '',
      type: invoice.type,
      amount: invoice.amount.toString(),
      dueDate: invoice.dueDate,
      description: invoice.notes || '',
    });
    setIsFormOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="w-3 h-3 ml-1"/>مدفوعة</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-100 text-yellow-700"><Clock className="w-3 h-3 ml-1"/>مدفوعة جزئياً</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-700"><AlertTriangle className="w-3 h-3 ml-1"/>متأخرة</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-700">قيد الانتظار</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <FileText className="w-6 h-6" />
          إدارة الفواتير
        </CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowReminderModal(true)}>
            <Bell className="w-4 h-4 ml-2" />
            التنبيهات
            {overdueInvoices.length > 0 && (
              <span className="bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center ml-1">
                {overdueInvoices.length}
              </span>
            )}
          </Button>
          <Button onClick={() => { resetForm(); setIsFormOpen(true); }}>
            <Plus className="w-4 h-4 ml-2" />
            فاتورة جديدة
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">الكل ({invoices.length})</TabsTrigger>
            <TabsTrigger value="pending">قيد الانتظار ({invoices.filter(i => i.status !== 'paid').length})</TabsTrigger>
            <TabsTrigger value="paid">مدفوعة</TabsTrigger>
            <TabsTrigger value="overdue" className="text-red-600">متأخرة ({overdueInvoices.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">إجمالي الفواتير</p>
                <p className="text-xl font-bold">{formatCurrency(invoices.reduce((s, i) => s + i.amount, 0))}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">المدفوع</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(invoices.reduce((s, i) => s + i.paidAmount, 0))}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">المتبقي</p>
                <p className="text-xl font-bold text-red-600">{formatCurrency(totalPending)}</p>
              </div>
            </div>
          </TabsContent>

          <div className="mt-4 rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">رقم الفاتورة</TableHead>
                  <TableHead className="text-right">العميل</TableHead>
                  <TableHead className="text-right">النوع</TableHead>
                  <TableHead className="text-right">المبلغ</TableHead>
                  <TableHead className="text-right">المدفوع</TableHead>
                  <TableHead className="text-right">المتبقي</TableHead>
                  <TableHead className="text-right">تاريخ الاستحقاق</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      لا توجد فواتير
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.customerName}</TableCell>
                      <TableCell>{invoiceTypes.find(t => t.value === invoice.type)?.label}</TableCell>
                      <TableCell className="font-bold">{formatCurrency(invoice.amount)}</TableCell>
                      <TableCell className="text-green-600">{formatCurrency(invoice.paidAmount)}</TableCell>
                      <TableCell className={invoice.remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}>
                        {formatCurrency(invoice.remainingAmount || 0)}
                      </TableCell>
                      <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {invoice.status !== 'paid' && (
                            <Button variant="ghost" size="sm" onClick={() => handlePayment(invoice, invoice.remainingAmount || invoice.amount)}>
                              <DollarSign className="w-4 h-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => openEdit(invoice)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(invoice.id)} className="text-red-600">
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
        </Tabs>
      </CardContent>

      <Dialog open={isFormOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsFormOpen(open); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingInvoice ? 'تعديل فاتورة' : 'إضافة فاتورة جديدة'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>العميل</Label>
              <Select value={form.customerId} onValueChange={(v) => setForm({ ...form, customerId: v })}>
                <SelectTrigger><SelectValue placeholder="اختر العميل" /></SelectTrigger>
                <SelectContent>
                  {customers.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>نوع الفاتورة</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {invoiceTypes.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>المبلغ</Label>
              <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" required />
            </div>

            <div className="space-y-2">
              <Label>تاريخ الاستحقاق</Label>
              <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required />
            </div>

            <div className="space-y-2">
              <Label>ملاحظات</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="ملاحظات" />
            </div>

            <Button type="submit" className="w-full">
              <Plus className="w-4 h-4 ml-2" />
              {editingInvoice ? 'تحديث' : 'إضافة'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showReminderModal} onOpenChange={setShowReminderModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              تنبيهات الفواتير
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {overdueInvoices.length > 0 && (
              <div>
                <h4 className="font-bold text-red-600 mb-2 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  فواتير متأخرة ({overdueInvoices.length})
                </h4>
                {overdueInvoices.map(inv => (
                  <div key={inv.id} className="bg-red-50 p-3 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-medium">{inv.invoiceNumber}</p>
                      <p className="text-sm text-gray-600">{inv.customerName}</p>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-red-600">{formatCurrency(inv.remainingAmount || inv.amount)}</p>
                      <p className="text-xs text-red-500">متأخرة منذ {formatDate(inv.dueDate)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {upcomingInvoices.length > 0 && (
              <div>
                <h4 className="font-bold text-yellow-600 mb-2 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  تستحق قريباً ({upcomingInvoices.length})
                </h4>
                {upcomingInvoices.map(inv => (
                  <div key={inv.id} className="bg-yellow-50 p-3 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-medium">{inv.invoiceNumber}</p>
                      <p className="text-sm text-gray-600">{inv.customerName}</p>
                    </div>
                    <div className="text-left">
                      <p className="font-bold">{formatCurrency(inv.remainingAmount || inv.amount)}</p>
                      <p className="text-xs text-gray-500">تاريخ: {formatDate(inv.dueDate)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {overdueInvoices.length === 0 && upcomingInvoices.length === 0 && (
              <p className="text-center text-gray-500 py-8">لا توجد تنبيهات</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}