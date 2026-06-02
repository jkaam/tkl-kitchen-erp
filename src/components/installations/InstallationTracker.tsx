import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar, 
  Truck, 
  Camera, 
  CheckSquare, 
  Plus, 
  Search
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface InstallationTrackerProps {
  installations: any[];
  projects: any[];
  addInstallation: (inst: any) => any;
  updateInstallation: (id: string, updates: any) => void;
  deleteInstallation: (id: string) => void;
}

const TEAMS = [
  { id: 'alpha', label: 'فريق ألفا التركيبات الفاخرة' },
  { id: 'beta', label: 'فريق بيتا للتجهيز والرخام' },
  { id: 'gold', label: 'فريق جولدن للتشطيبات الخاصة' }
];

export function InstallationTracker({
  installations = [],
  projects = [],
  addInstallation,
  updateInstallation
}: InstallationTrackerProps) {
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedInst, setSelectedInst] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // New Installation Form State
  const [formProjectId, setFormProjectId] = useState('');
  const [formTeam, setFormTeam] = useState('alpha');
  const [formDate, setFormDate] = useState('');
  const [formNotes, setFormNotes] = useState('');
  
  // Detail Dialog Checklist State
  const [checklist, setChecklist] = useState({
    cabinetsMounted: false,
    hardwareAdjusted: false,
    marbleSecured: false,
    sinkPlumbed: false,
    siteCleaned: false
  });

  const [detailReport, setDetailReport] = useState('');

  // Handle Photo Upload
  const handlePhotoUpload = (type: 'before' | 'after', e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedInst) return;
    const files = e.target.files;
    if (!files) return;

    const fileList = Array.from(files);
    fileList.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const currentPhotos = type === 'before' 
          ? [...(selectedInst.beforePhotos || [])] 
          : [...(selectedInst.afterPhotos || [])];
        
        const updatedPhotos = [...currentPhotos, base64];
        
        updateInstallation(selectedInst.id, {
          [type === 'before' ? 'beforePhotos' : 'afterPhotos']: updatedPhotos
        });

        // Sync local dialog state
        setSelectedInst((prev: any) => ({
          ...prev,
          [type === 'before' ? 'beforePhotos' : 'afterPhotos']: updatedPhotos
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove Photo
  const handleRemovePhoto = (type: 'before' | 'after', index: number) => {
    if (!selectedInst) return;
    const currentPhotos = type === 'before' 
      ? [...(selectedInst.beforePhotos || [])] 
      : [...(selectedInst.afterPhotos || [])];
    
    const updatedPhotos = currentPhotos.filter((_, idx) => idx !== index);
    
    updateInstallation(selectedInst.id, {
      [type === 'before' ? 'beforePhotos' : 'afterPhotos']: updatedPhotos
    });

    setSelectedInst((prev: any) => ({
      ...prev,
      [type === 'before' ? 'beforePhotos' : 'afterPhotos']: updatedPhotos
    }));
  };

  // Add Installation
  const handleCreateInstallation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProjectId || !formDate) return;

    const project = projects.find(p => p.id === formProjectId);
    
    addInstallation({
      projectId: formProjectId,
      clientName: project?.customerName || 'عميل مجهول',
      projectCode: project?.projectCode || `TKL-2026-${project?.id?.slice(-4)}`,
      team: formTeam,
      date: formDate,
      notes: formNotes,
      status: 'scheduled',
      beforePhotos: [],
      afterPhotos: [],
      checklist: {
        cabinetsMounted: false,
        hardwareAdjusted: false,
        marbleSecured: false,
        sinkPlumbed: false,
        siteCleaned: false
      },
      completionReport: ''
    });

    setIsAddOpen(false);
    setFormProjectId('');
    setFormDate('');
    setFormNotes('');
  };

  // Filtered list
  const filteredInsts = useMemo(() => {
    return installations.filter(i => 
      i.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.projectCode?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [installations, searchTerm]);

  // Load selected installation in Dialog
  const openDetailDialog = (inst: any) => {
    setSelectedInst(inst);
    setChecklist(inst.checklist || {
      cabinetsMounted: false,
      hardwareAdjusted: false,
      marbleSecured: false,
      sinkPlumbed: false,
      siteCleaned: false
    });
    setDetailReport(inst.completionReport || '');
    setIsDetailOpen(true);
  };

  // Save detailed status & report
  const handleSaveDetails = () => {
    if (!selectedInst) return;

    // Check if all items in checklist are ticked -> complete status
    const allChecked = Object.values(checklist).every(v => v === true);
    const newStatus = allChecked ? 'completed' : 'in_progress';

    updateInstallation(selectedInst.id, {
      checklist,
      completionReport: detailReport,
      status: newStatus
    });

    setIsDetailOpen(false);
    alert('تم حفظ تقرير المعاينة وتحديث حالة التركيب بنجاح');
  };

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <h2 className="text-2xl font-black text-neutral-900 flex items-center gap-2">
            متابعة وجدولة عمليات التركيب بالموقع
            <Truck className="w-5.5 h-5.5 text-[#B39367]" />
          </h2>
          <p className="text-xs text-stone-500 mt-1 font-semibold">تخصيص الفنيين بالمواقع، إرسال تقارير التسليم، ومطابقة صور القبل والبعد</p>
        </div>
        <Button 
          className="bg-neutral-950 hover:bg-[#B39367] text-white hover:text-neutral-950 font-bold px-4 py-2 text-xs flex items-center gap-1.5 transition-all"
          onClick={() => setIsAddOpen(true)}
        >
          <Plus className="w-4 h-4" />
          جدولة موعد تركيب جديد
        </Button>
      </div>

      {/* Search and filter */}
      <div className="bg-white border border-stone-200 p-4 rounded-xl relative w-full md:w-80">
        <Input 
          placeholder="ابحث عن العميل أو كود المطبخ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-10 text-right text-xs font-semibold focus-visible:ring-[#B39367] border-stone-300"
        />
        <Search className="w-4 h-4 text-stone-400 absolute top-3 right-3" />
      </div>

      {/* Grid displays */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredInsts.length === 0 ? (
          <div className="md:col-span-3 text-center py-12 text-stone-400 bg-white border border-stone-200 rounded-xl font-bold text-xs">
            لا توجد مواعيد تركيب مجدولة حالياً بالموقع
          </div>
        ) : (
          filteredInsts.map(inst => {
            const isCompleted = inst.status === 'completed';
            const isProgress = inst.status === 'in_progress';
            return (
              <Card key={inst.id} className="border border-stone-200 bg-white relative hover:shadow-md transition-shadow">
                {/* Status Bar */}
                <div className={`absolute top-0 inset-x-0 h-1 ${
                  isCompleted ? 'bg-emerald-500' : isProgress ? 'bg-amber-500' : 'bg-neutral-900'
                }`}></div>
                
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-stone-400 font-bold">{inst.projectCode}</span>
                    <Badge className={`text-[9px] font-bold px-2 py-0.5 ${
                      isCompleted ? 'bg-emerald-100 text-emerald-800' : isProgress ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-700'
                    }`}>
                      {isCompleted ? 'تم التسليم والتشغيل' : isProgress ? 'قيد العمل بالموقع' : 'مجدول'}
                    </Badge>
                  </div>
                  <CardTitle className="text-sm font-bold text-neutral-950 pt-2">{inst.clientName}</CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4 text-xs font-semibold text-stone-600">
                  <div className="space-y-2 border-b border-stone-100 pb-3">
                    <p className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-[#B39367]" />
                      تاريخ التركيب: {formatDate(inst.date)}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-neutral-800" />
                      الفريق الفني: {TEAMS.find(t => t.id === inst.team)?.label || inst.team}
                    </p>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-stone-400 font-bold">مرفقات الصور: {((inst.beforePhotos?.length || 0) + (inst.afterPhotos?.length || 0))} صور</span>
                    <Button 
                      size="sm" 
                      onClick={() => openDetailDialog(inst)}
                      className="bg-neutral-900 text-white font-bold text-[10px] hover:bg-[#B39367] hover:text-neutral-950 transition-all h-8"
                    >
                      تقرير تسليم الموقع
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Dialog: Add Installation */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md text-xs font-bold text-neutral-800" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-md font-black text-neutral-950">جدولة وتعيين فريق لتركيب مطبخ</DialogTitle>
            <DialogDescription className="text-[10px] mt-1">تحديد الموعد والفريق الفني المسؤول عن التشطيب والتسليم</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateInstallation} className="space-y-4 mt-3">
            
            <div className="space-y-1.5">
              <Label>اختر المشروع المتعاقد المعتمد</Label>
              <Select value={formProjectId} onValueChange={setFormProjectId}>
                <SelectTrigger className="border-stone-300 text-xs font-semibold">
                  <SelectValue placeholder="اختر المشروع لتنفيذ تركيبه" />
                </SelectTrigger>
                <SelectContent>
                  {projects.filter(p => p.status !== 'completed').map(p => (
                    <SelectItem key={p.id} value={p.id} className="text-xs font-bold">
                      {p.customerName} ({p.projectCode || 'TKL-PROJECT'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>الفريق الفني المسؤول</Label>
                <Select value={formTeam} onValueChange={setFormTeam}>
                  <SelectTrigger className="border-stone-300 text-xs font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TEAMS.map(team => (
                      <SelectItem key={team.id} value={team.id} className="text-xs font-bold">{team.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>تاريخ التركيب بالموقع</Label>
                <Input 
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="border-stone-300 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>تعليمات وملاحظات التسليم الخاصة للفنيين</Label>
              <Textarea 
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="تفاصيل التنسيق مع العميل، تنبيهات الرخام أو الأجهزة..."
                className="border-stone-300 text-xs font-semibold resize-none h-16"
              />
            </div>

            <DialogFooter className="pt-4 gap-2 flex justify-end">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} className="border-stone-300 text-xs font-bold">
                إلغاء
              </Button>
              <Button type="submit" className="bg-neutral-950 text-white font-bold text-xs hover:bg-[#B39367] hover:text-neutral-950 transition-all">
                جدولة وحفظ الموعد
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Detail Checklist, Before/After Photo uploads, & report */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto" dir="rtl">
          {selectedInst && (
            <>
              <DialogHeader>
                <DialogTitle className="text-md font-bold text-neutral-950 flex items-center justify-between border-b pb-3">
                  <span>تقرير تسليم موقع العميل: {selectedInst.clientName}</span>
                  <Badge className="bg-[#B39367] text-neutral-950 font-bold px-2 py-0.5 text-[10px]">
                    فريق: {TEAMS.find(t => t.id === selectedInst.team)?.label}
                  </Badge>
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 text-xs font-bold text-neutral-800">
                
                {/* Right Panel: Upload before and after photos */}
                <div className="space-y-4 border-l border-stone-100 pl-4">
                  
                  {/* Before photos */}
                  <div className="border border-stone-200 p-3 rounded-lg space-y-2">
                    <Label className="flex items-center gap-1.5 text-neutral-950 font-black">
                      <Camera className="w-4 h-4 text-[#B39367]" />
                      صور الموقع قبل التركيب (Before)
                    </Label>
                    <Input 
                      type="file" 
                      accept="image/*"
                      multiple
                      onChange={(e) => handlePhotoUpload('before', e)}
                      className="border-stone-300 text-[10px] h-8"
                    />
                    
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {selectedInst.beforePhotos?.map((img: string, idx: number) => (
                        <div key={idx} className="relative rounded border overflow-hidden h-12 group">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => handleRemovePhoto('before', idx)}
                            className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full p-0.5 text-[7px]"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* After photos */}
                  <div className="border border-stone-200 p-3 rounded-lg space-y-2">
                    <Label className="flex items-center gap-1.5 text-neutral-950 font-black">
                      <Camera className="w-4 h-4 text-emerald-600" />
                      صور الموقع بعد التشطيب والتسليم (After)
                    </Label>
                    <Input 
                      type="file" 
                      accept="image/*"
                      multiple
                      onChange={(e) => handlePhotoUpload('after', e)}
                      className="border-stone-300 text-[10px] h-8"
                    />
                    
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {selectedInst.afterPhotos?.map((img: string, idx: number) => (
                        <div key={idx} className="relative rounded border overflow-hidden h-12 group">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => handleRemovePhoto('after', idx)}
                            className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full p-0.5 text-[7px]"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Left Panel: Checklist and final report */}
                <div className="space-y-4 text-xs font-semibold text-stone-700">
                  <h4 className="font-extrabold text-xs text-neutral-950 flex items-center gap-1.5 border-b pb-2">
                    <CheckSquare className="w-4 h-4 text-[#B39367]" />
                    قائمة معايير ضبط الجودة (QC Checklist)
                  </h4>
                  
                  <div className="space-y-2 font-bold text-neutral-800">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={checklist.cabinetsMounted} 
                        onChange={(e) => setChecklist({ ...checklist, cabinetsMounted: e.target.checked })}
                        className="rounded accent-[#B39367]"
                      />
                      <span>تثبيت جميع كبائن المطبخ ومطابقة الرأسيات بالليزر</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={checklist.hardwareAdjusted} 
                        onChange={(e) => setChecklist({ ...checklist, hardwareAdjusted: e.target.checked })}
                        className="rounded accent-[#B39367]"
                      />
                      <span>ضبط محاذاة الضلف ومرونة فتح أدراج Blum وسلاسل السحب</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={checklist.marbleSecured} 
                        onChange={(e) => setChecklist({ ...checklist, marbleSecured: e.target.checked })}
                        className="rounded accent-[#B39367]"
                      />
                      <span>تثبيت وتسكير رخام الكاونتر مع وزرة الحوائط وسد الفواصل</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={checklist.sinkPlumbed} 
                        onChange={(e) => setChecklist({ ...checklist, sinkPlumbed: e.target.checked })}
                        className="rounded accent-[#B39367]"
                      />
                      <span>توصيل وسباكة حوض المطبخ وتجربة تصريف وتغذية الخلاط</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={checklist.siteCleaned} 
                        onChange={(e) => setChecklist({ ...checklist, siteCleaned: e.target.checked })}
                        className="rounded accent-[#B39367]"
                      />
                      <span>تلميع خشب الكاونتر والضلف وتنظيف الموقع تماماً للتسليم</span>
                    </label>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <Label className="text-neutral-950 font-black">تقرير فحص الجودة والملاحظات النهائية:</Label>
                    <Textarea 
                      value={detailReport}
                      onChange={(e) => setDetailReport(e.target.value)}
                      placeholder="اكتب تقرير فني شامل عن حالة المطبخ وتوصيات الاستخدام للعميل..."
                      className="border-stone-300 text-xs font-semibold resize-none h-20"
                    />
                  </div>

                </div>

              </div>

              <DialogFooter className="pt-4 border-t gap-2 flex justify-end">
                <Button variant="outline" onClick={() => setIsDetailOpen(false)} className="border-stone-300 text-xs font-bold">
                  إلغاء
                </Button>
                <Button 
                  onClick={handleSaveDetails} 
                  className="bg-neutral-950 text-white font-bold text-xs hover:bg-[#B39367] hover:text-neutral-950 transition-all"
                >
                  حفظ تقرير التسليم والتشطيب
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
