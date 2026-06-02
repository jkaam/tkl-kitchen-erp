import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Plus, Check, X, Bell, AlertCircle } from 'lucide-react';
import { formatDate, getAppointmentType } from '@/lib/utils';

interface AppointmentManagerProps {
  appointments: any[];
  customers: any[];
  onAdd: (appointment: any) => void;
  onUpdate: (id: string, updates: any) => void;
  onDelete: (id: string) => void;
}

const appointmentTypes = [
  { value: 'measurement', label: 'رفع مقاسات' },
  { value: 'design', label: 'تصميم' },
  { value: 'delivery', label: 'تسليم' },
  { value: 'installation', label: 'تركيب' },
  { value: 'follow_up', label: 'متابعة' },
  { value: 'other', label: 'أخرى' },
];

export function AppointmentManager({ appointments, customers, onAdd, onUpdate, onDelete }: AppointmentManagerProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filter, setFilter] = useState('upcoming');
  
  const [formData, setFormData] = useState({
    customerId: '',
    projectId: '',
    type: 'measurement',
    date: '',
    time: '',
    location: '',
    notes: '',
  });

  // التنبيهات القادمة
  const upcomingAppointments = appointments.filter(a => {
    const today = new Date().toISOString().split('T')[0];
    return a.date >= today && !a.isCompleted;
  }).sort((a, b) => a.date.localeCompare(b.date));

  // المواعيد المتأخرة
  const overdueAppointments = appointments.filter(a => {
    const today = new Date().toISOString().split('T')[0];
    return a.date < today && !a.isCompleted;
  });

  // المواعيد المكتملة
  const completedAppointments = appointments.filter(a => a.isCompleted);

  const getFilteredAppointments = () => {
    switch (filter) {
      case 'upcoming': return upcomingAppointments;
      case 'overdue': return overdueAppointments;
      case 'completed': return completedAppointments;
      default: return appointments;
    }
  };

  const getCustomerName = (customerId: string) => {
    return customers.find(c => c.id === customerId)?.name || 'غير معروف';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...formData,
      customerName: getCustomerName(formData.customerId),
      isCompleted: false,
    });
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      customerId: '',
      projectId: '',
      type: 'measurement',
      date: '',
      time: '',
      location: '',
      notes: '',
    });
    setIsFormOpen(false);
  };

  const handleComplete = (id: string) => {
    onUpdate(id, { isCompleted: true });
  };

  // التنبيهات للمواعيد القادمة
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const todayAppointments = upcomingAppointments.filter(a => a.date === today);
  const tomorrowAppointments = upcomingAppointments.filter(a => a.date === tomorrow);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="w-6 h-6" />
          المواعيد والتنبيهات
        </CardTitle>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="w-4 h-4 ml-2" />
          موعد جديد
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* تنبيهات المواعيد */}
        {(todayAppointments.length > 0 || tomorrowAppointments.length > 0 || overdueAppointments.length > 0) && (
          <div className="space-y-2">
            {todayAppointments.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-bold text-red-800">مواعيد اليوم ({todayAppointments.length})</p>
                  <p className="text-sm text-red-600">
                    {todayAppointments.map(a => getAppointmentType(a.type)).join('، ')}
                  </p>
                </div>
              </div>
            )}
            
            {tomorrowAppointments.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-3">
                <Bell className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="font-bold text-yellow-800">مواعيد الغد ({tomorrowAppointments.length})</p>
                  <p className="text-sm text-yellow-600">
                    {tomorrowAppointments.map(a => getAppointmentType(a.type)).join('، ')}
                  </p>
                </div>
              </div>
            )}

            {overdueAppointments.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="font-bold text-orange-800">مواعيد متأخرة ({overdueAppointments.length})</p>
                  <p className="text-sm text-orange-600">يرجى المتابعة</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* تصفية */}
        <div className="flex gap-2">
          <Button 
            variant={filter === 'upcoming' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('upcoming')}
          >
            القادمة ({upcomingAppointments.length})
          </Button>
          <Button 
            variant={filter === 'overdue' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('overdue')}
            className={overdueAppointments.length > 0 ? 'text-red-600' : ''}
          >
            المتأخرة ({overdueAppointments.length})
          </Button>
          <Button 
            variant={filter === 'completed' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('completed')}
          >
            المكتملة ({completedAppointments.length})
          </Button>
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('all')}
          >
            الكل
          </Button>
        </div>

        {/* جدول المواعيد */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">الوقت</TableHead>
                <TableHead className="text-right">العميل</TableHead>
                <TableHead className="text-right">النوع</TableHead>
                <TableHead className="text-right">المكان</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getFilteredAppointments().length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    لا يوجد مواعيد
                  </TableCell>
                </TableRow>
              ) : (
                getFilteredAppointments().map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>{formatDate(appointment.date)}</TableCell>
                    <TableCell>{appointment.time || '-'}</TableCell>
                    <TableCell className="font-medium">{appointment.customerName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{getAppointmentType(appointment.type)}</Badge>
                    </TableCell>
                    <TableCell>{appointment.location || '-'}</TableCell>
                    <TableCell>
                      {appointment.isCompleted ? (
                        <Badge className="bg-green-100 text-green-800">مكتمل</Badge>
                      ) : appointment.date < today ? (
                        <Badge className="bg-red-100 text-red-800">متأخر</Badge>
                      ) : (
                        <Badge className="bg-blue-100 text-blue-800">قادم</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {!appointment.isCompleted && (
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleComplete(appointment.id)}
                            className="text-green-600"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => onDelete(appointment.id)}
                            className="text-red-600"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* نموذج إضافة موعد */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>إضافة موعد جديد</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>العميل *</Label>
              <Select 
                value={formData.customerId} 
                onValueChange={(value) => setFormData({ ...formData, customerId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر العميل" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map(customer => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>نوع الموعد</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {appointmentTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  التاريخ *
                </Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  الوقت
                </Label>
                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                المكان
              </Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="عنوان الموقع"
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label>ملاحظات</Label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="ملاحظات إضافية"
                className="text-right"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                <Plus className="w-4 h-4 ml-2" />
                إضافة الموعد
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                إلغاء
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
