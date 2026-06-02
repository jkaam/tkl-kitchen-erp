import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Plus, 
  MoreVertical, 
  Edit, 
  Eye, 
  User,
  Compass,
  Ruler,
  Paperclip,
  Clock,
  Briefcase,
  DollarSign
} from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';

interface ProjectListProps {
  projects: any[];
  customers: any[];
  onAdd: () => void;
  onEdit: (project: any) => void;
}

const statusColors: { [key: string]: string } = {
  design: 'bg-purple-100 text-purple-800 border-r-2 border-purple-500',
  approved: 'bg-blue-100 text-blue-800 border-r-2 border-blue-500',
  production: 'bg-amber-100 text-amber-800 border-r-2 border-amber-500',
  installation: 'bg-sky-100 text-sky-800 border-r-2 border-sky-500',
  completed: 'bg-emerald-100 text-emerald-800 border-r-2 border-emerald-500',
  // Backwards compatibility for old statuses
  pending: 'bg-gray-100 text-gray-800',
  measuring: 'bg-indigo-100 text-indigo-800',
  designing: 'bg-purple-100 text-purple-800',
  manufacturing: 'bg-amber-100 text-amber-800',
  ready: 'bg-green-100 text-green-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-rose-100 text-rose-800',
};

const statusLabels: { [key: string]: string } = {
  design: 'مرحلة التصميم',
  approved: 'معتمد ومؤكد',
  production: 'قيد التصنيع بالورشة',
  installation: 'قيد التركيب بالموقع',
  completed: 'مكتمل ومسلم',
  // Backwards compatibility
  pending: 'معلق',
  measuring: 'رفع مقاسات',
  designing: 'تصميم أولي',
  manufacturing: 'تصنيع',
  ready: 'جاهز',
  delivered: 'تم التسليم',
  cancelled: 'ملغي',
};

export function ProjectList({ projects, customers, onAdd, onEdit }: ProjectListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewProject, setViewProject] = useState<any>(null);
  
  const filteredProjects = projects.filter(project => {
    const customer = customers.find(c => c.id === project.customerId);
    const matchesSearch = 
      customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.projectCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.designerName && project.designerName.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getCustomerName = (customerId: string, customerName?: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || customerName || 'غير معروف';
  };

  return (
    <Card className="w-full border border-stone-200 bg-white">
      <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-stone-100 pb-5">
        <div>
          <CardTitle className="text-2xl font-black text-neutral-900 flex items-center gap-2">
            إدارة المشاريع والتنفيذ
            <Badge className="bg-neutral-900 text-stone-100 font-bold px-2 py-0.5">ERP Pipeline</Badge>
          </CardTitle>
          <CardDescription className="text-xs mt-1">عرض ومتابعة مراحل قياس، اعتماد، تصنيع، وتركيب المطابخ الفاخرة</CardDescription>
        </div>
        <Button 
          className="bg-neutral-950 hover:bg-[#B39367] text-white hover:text-neutral-950 font-bold px-4 py-2 text-xs flex items-center gap-1.5 transition-all"
          onClick={onAdd}
        >
          <Plus className="w-4 h-4" />
          إنشاء مشروع تنفيذ
        </Button>
      </CardHeader>
      
      <CardContent className="pt-6">
        {/* Filters and search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
            <Input
              placeholder="ابحث برقم المشروع، اسم العميل، أو المصمم..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 text-right text-xs font-semibold focus-visible:ring-[#B39367] border-stone-300"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px] border-stone-300 text-xs font-bold">
              <SelectValue placeholder="جميع الحالات" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs font-semibold">جميع الحالات</SelectItem>
              <SelectItem value="design" className="text-xs font-semibold">مرحلة التصميم</SelectItem>
              <SelectItem value="approved" className="text-xs font-semibold">معتمد ومؤكد</SelectItem>
              <SelectItem value="production" className="text-xs font-semibold">قيد التصنيع بالورشة</SelectItem>
              <SelectItem value="installation" className="text-xs font-semibold">قيد التركيب بالموقع</SelectItem>
              <SelectItem value="completed" className="text-xs font-semibold">مكتمل ومسلم</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Projects Grid/Table */}
        <div className="rounded-xl border border-stone-200 overflow-x-auto">
          <Table className="text-right text-xs min-w-[48rem] table-fixed w-full">
            <TableHeader className="bg-stone-50 text-stone-500">
              <TableRow>
                <TableHead className="text-right font-bold w-[7rem]">كود المشروع</TableHead>
                <TableHead className="text-right font-bold w-[6.5rem]">العميل</TableHead>
                <TableHead className="text-right font-bold w-[7rem]">المصمم / البائع</TableHead>
                <TableHead className="text-right font-bold w-[6.5rem]">حالة التنفيذ</TableHead>
                <TableHead className="text-right font-bold w-[5.5rem]">إجمالي العقد</TableHead>
                <TableHead className="text-right font-bold w-[7rem]">الأبعاد (ملم)</TableHead>
                <TableHead className="text-right font-bold w-[5rem]">التسليم</TableHead>
                <TableHead className="text-center font-bold w-[4rem]">العمليات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="font-semibold text-neutral-800">
              {filteredProjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-stone-400">
                    لا توجد مشاريع مطابقة للبحث حالياً
                  </TableCell>
                </TableRow>
              ) : (
                filteredProjects.map((project) => (
                  <TableRow key={project.id} className="hover:bg-stone-50/50 align-top">
                    <TableCell className="font-black text-neutral-950 break-words leading-snug text-[10px]">
                      {project.projectCode || `TKL-${new Date(project.createdAt).getFullYear()}-${project.id.slice(-4)}`}
                    </TableCell>
                    <TableCell className="font-bold text-neutral-900 break-words leading-snug">
                      {getCustomerName(project.customerId, project.customerName)}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs space-y-0.5">
                        <p className="font-bold text-neutral-950 break-words leading-snug">{project.designerName || '-'}</p>
                        <p className="text-[10px] text-stone-400 font-semibold break-words">مندوب: {project.salesRep || '-'}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-[10px] font-bold px-2 py-0.5 rounded whitespace-normal leading-snug ${statusColors[project.status] || 'bg-stone-100'}`}>
                        {statusLabels[project.status] || project.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold text-neutral-950 whitespace-nowrap text-[10px]">
                      {formatCurrency(project.totalPrice || 0)}
                    </TableCell>
                    <TableCell className="text-stone-600 text-[10px] whitespace-nowrap tabular-nums">
                      {project.measurementsWidth && project.measurementsHeight ? (
                        <span>{project.measurementsWidth}×{project.measurementsDepth || 600}×{project.measurementsHeight}</span>
                      ) : (
                        <span className="text-stone-400">غير محدد</span>
                      )}
                    </TableCell>
                    <TableCell className="text-stone-500 whitespace-nowrap text-[10px]">
                      {project.deliveryDate ? formatDate(project.deliveryDate) : '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="hover:bg-stone-100 h-8 w-8 p-0">
                            <MoreVertical className="w-4 h-4 text-stone-500" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="text-right text-xs font-semibold">
                          <DropdownMenuItem onClick={() => setViewProject(project)} className="cursor-pointer gap-2 justify-end">
                            عرض التفاصيل والملفات
                            <Eye className="w-4 h-4 text-[#B39367]" />
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(project)} className="cursor-pointer gap-2 justify-end">
                            تعديل البيانات والمقاسات
                            <Edit className="w-4 h-4 text-neutral-800" />
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

        <div className="mt-4 text-xs font-bold text-stone-500 text-right">
          إجمالي عدد مشاريع التنفيذ الفعالة: {filteredProjects.length}
        </div>
      </CardContent>

      {/* Upgraded Project Details Modal */}
      <Dialog open={!!viewProject} onOpenChange={() => setViewProject(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto" dir="rtl">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-lg font-black text-neutral-950 flex items-center justify-between">
              <span>تفاصيل ملف مشروع التنفيذ</span>
              <Badge className="bg-neutral-900 text-stone-100 font-bold px-2 py-0.5">
                {viewProject && (viewProject.projectCode || 'TKL-PROJECT')}
              </Badge>
            </DialogTitle>
            <DialogDescription className="text-xs">المعلومات الهندسية والمالية وملفات التصميم المرفقة للمطبخ</DialogDescription>
          </DialogHeader>
          
          {viewProject && (
            <div className="space-y-6 mt-4">
              
              {/* Executive Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-stone-50/50 border border-stone-200/80 p-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#B39367]" />
                    <div>
                      <p className="text-[10px] text-stone-400 font-bold">العميل صاحب المطبخ</p>
                      <p className="font-extrabold text-neutral-900 text-xs">{getCustomerName(viewProject.customerId)}</p>
                    </div>
                  </div>
                </Card>
                <Card className="bg-stone-50/50 border border-stone-200/80 p-3">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[#B39367]" />
                    <div>
                      <p className="text-[10px] text-stone-400 font-bold">مصمم المطبخ المختص</p>
                      <p className="font-extrabold text-neutral-900 text-xs">{viewProject.designerName || 'غير معين'}</p>
                    </div>
                  </div>
                </Card>
                <Card className="bg-stone-50/50 border border-stone-200/80 p-3">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-[#B39367]" />
                    <div>
                      <p className="text-[10px] text-stone-400 font-bold">مسؤول المبيعات (Sales)</p>
                      <p className="font-extrabold text-neutral-900 text-xs">{viewProject.salesRep || 'غير معين'}</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Status and Milestones */}
              <div className="bg-stone-50 border border-stone-100 p-4 rounded-xl space-y-3">
                <h4 className="font-bold text-xs text-neutral-900 flex items-center gap-1.5 border-b pb-2">
                  <Clock className="w-4 h-4 text-[#B39367]" />
                  مراحل التنفيذ (Execution Status Tracker)
                </h4>
                
                {/* Visual workflow timeline bar */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-2">
                  {['design', 'approved', 'production', 'installation', 'completed'].map((stage, idx) => {
                    const stages = ['design', 'approved', 'production', 'installation', 'completed'];
                    const currentIdx = stages.indexOf(viewProject.status);
                    const isActive = stages.indexOf(stage) <= currentIdx;
                    return (
                      <div key={stage} className="flex flex-col items-center text-center gap-1">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 font-bold shrink-0 transition-colors ${
                          isActive 
                            ? 'bg-[#B39367] text-neutral-950 border-[#B39367]' 
                            : 'bg-white text-stone-400 border-stone-300'
                        }`}>
                          {idx + 1}
                        </div>
                        <span className={`text-[9px] font-extrabold leading-tight break-words max-w-[4.5rem] ${isActive ? 'text-neutral-900' : 'text-stone-400'}`}>
                          {statusLabels[stage]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sizing measurements */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-neutral-900 flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-[#B39367]" />
                  أبعاد مساحة المطبخ الهندسية (Measurements)
                </h4>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg">
                    <p className="text-[10px] text-stone-400 font-bold">العرض الكلي (Width)</p>
                    <p className="font-black text-neutral-950 text-sm mt-1">{viewProject.measurementsWidth || '-'} ملم</p>
                  </div>
                  <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg">
                    <p className="text-[10px] text-stone-400 font-bold">العمق الأقصى (Depth)</p>
                    <p className="font-black text-neutral-950 text-sm mt-1">{viewProject.measurementsDepth || '600'} ملم</p>
                  </div>
                  <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg">
                    <p className="text-[10px] text-stone-400 font-bold">الارتفاع المتاح (Height)</p>
                    <p className="font-black text-neutral-950 text-sm mt-1">{viewProject.measurementsHeight || '-'} ملم</p>
                  </div>
                </div>
              </div>

              {/* Financial status */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-neutral-900 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#B39367]" />
                  موقف التعاقد والتحصيل المالي
                </h4>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-stone-50/50 border border-stone-200 rounded-lg">
                    <p className="text-[10px] text-stone-400 font-bold">قيمة العقد الكلي</p>
                    <p className="font-black text-neutral-900 text-sm mt-1">{formatCurrency(viewProject.totalPrice || 0)}</p>
                  </div>
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                    <p className="text-[10px] text-emerald-800 font-bold">إجمالي التحصيل</p>
                    <p className="font-black text-emerald-600 text-sm mt-1">{formatCurrency(viewProject.paidAmount || 0)}</p>
                  </div>
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg">
                    <p className="text-[10px] text-rose-800 font-bold">المتبقي المطلوب تحصيله</p>
                    <p className="font-black text-rose-600 text-sm mt-1">{formatCurrency(viewProject.remainingAmount || 0)}</p>
                  </div>
                </div>
              </div>

              {/* Image Previews & Attachments */}
              {(viewProject.measurementsImages?.length > 0 || viewProject.designImages?.length > 0) && (
                <div className="space-y-4">
                  <h4 className="font-bold text-xs text-neutral-900 flex items-center gap-2 border-b pb-2 border-stone-100">
                    <Paperclip className="w-4 h-4 text-[#B39367]" />
                    مخططات الرفع وصور الموقع
                  </h4>
                  
                  {viewProject.measurementsImages?.length > 0 && (
                    <div>
                      <p className="text-xs text-stone-500 font-bold mb-2">صور ومخططات الرفع الهندسي بالكركي:</p>
                      <div className="grid grid-cols-4 gap-3">
                        {viewProject.measurementsImages.map((img: string, idx: number) => (
                          <div key={idx} className="relative group border rounded-lg overflow-hidden h-24">
                            <img src={img} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {viewProject.designImages?.length > 0 && (
                    <div>
                      <p className="text-xs text-stone-500 font-bold mb-2">الرندرات ثلاثية الأبعاد المعتمدة للمطبخ (Render):</p>
                      <div className="grid grid-cols-4 gap-3">
                        {viewProject.designImages.map((img: string, idx: number) => (
                          <div key={idx} className="relative group border rounded-lg overflow-hidden h-24">
                            <img src={img} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              {viewProject.notes && (
                <div className="bg-stone-50 border border-stone-200 p-4 rounded-xl">
                  <p className="text-xs text-stone-400 font-bold">ملاحظات فنية وهندسية:</p>
                  <p className="text-xs mt-1.5 leading-relaxed text-neutral-800 font-semibold">{viewProject.notes}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  className="flex-1 bg-neutral-950 text-white font-bold hover:bg-[#B39367] hover:text-neutral-950 transition-all text-xs" 
                  onClick={() => {
                    setViewProject(null);
                    onEdit(viewProject);
                  }}
                >
                  تعديل كود ومقاسات ومرفقات المشروع
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
