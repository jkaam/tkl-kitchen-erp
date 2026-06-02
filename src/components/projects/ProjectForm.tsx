import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, X, Calendar, DollarSign, Camera, Upload, Ruler, User, Compass } from 'lucide-react';

interface ProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (project: any) => void;
  customers: any[];
  initialData?: any;
}

const projectTypes = [
  { value: 'kitchen', label: 'مطبخ كامل' },
  { value: 'dressing', label: 'دريسنج روم' },
  { value: 'furniture', label: 'أثاث منزلي' },
  { value: 'other', label: 'تصنيع خاص' },
];

const projectStatuses = [
  { value: 'design', label: 'مرحلة التصميم' },
  { value: 'approved', label: 'معتمد ومؤكد' },
  { value: 'production', label: 'قيد التصنيع بالورشة' },
  { value: 'installation', label: 'قيد التركيب بالموقع' },
  { value: 'completed', label: 'مكتمل ومسلم' },
];

export function ProjectForm({ isOpen, onClose, onSubmit, customers, initialData }: ProjectFormProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState<{
    projectCode: string;
    customerId: string;
    projectType: string;
    designerName: string;
    salesRep: string;
    status: string;
    totalPrice: string;
    paidAmount: string;
    measurementsWidth: string;
    measurementsHeight: string;
    measurementsDepth: string;
    measurementsDate: string;
    designDate: string;
    deliveryDate: string;
    notes: string;
    measurementsImages: string[];
    designImages: string[];
  }>({
    projectCode: '',
    customerId: '',
    projectType: 'kitchen',
    designerName: '',
    salesRep: '',
    status: 'design',
    totalPrice: '',
    paidAmount: '',
    measurementsWidth: '',
    measurementsHeight: '',
    measurementsDepth: '600',
    measurementsDate: '',
    designDate: '',
    deliveryDate: '',
    notes: '',
    measurementsImages: [],
    designImages: [],
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          projectCode: initialData.projectCode || '',
          customerId: initialData.customerId || '',
          projectType: initialData.projectType || 'kitchen',
          designerName: initialData.designerName || '',
          salesRep: initialData.salesRep || '',
          status: initialData.status || 'design',
          totalPrice: initialData.totalPrice?.toString() || '',
          paidAmount: initialData.paidAmount?.toString() || '',
          measurementsWidth: initialData.measurementsWidth?.toString() || '',
          measurementsHeight: initialData.measurementsHeight?.toString() || '',
          measurementsDepth: initialData.measurementsDepth?.toString() || '600',
          measurementsDate: initialData.measurementsDate || '',
          designDate: initialData.designDate || '',
          deliveryDate: initialData.deliveryDate || '',
          notes: initialData.notes || '',
          measurementsImages: initialData.measurementsImages || [],
          designImages: initialData.designImages || [],
        });
      } else {
        // Generate automatic premium project code
        const randId = Math.floor(1000 + Math.random() * 9000);
        const code = `TKL-${new Date().getFullYear()}-${randId}`;
        
        setFormData({
          projectCode: code,
          customerId: '',
          projectType: 'kitchen',
          designerName: '',
          salesRep: '',
          status: 'design',
          totalPrice: '',
          paidAmount: '',
          measurementsWidth: '',
          measurementsHeight: '',
          measurementsDepth: '600',
          measurementsDate: '',
          designDate: '',
          deliveryDate: '',
          notes: '',
          measurementsImages: [],
          designImages: [],
        });
      }
      setActiveTab('basic');
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerId) return;

    const customer = customers.find(c => c.id === formData.customerId);
    const totalPriceNum = parseFloat(formData.totalPrice) || 0;
    const paidAmountNum = parseFloat(formData.paidAmount) || 0;
    
    onSubmit({
      ...formData,
      totalPrice: totalPriceNum,
      paidAmount: paidAmountNum,
      remainingAmount: Math.max(0, totalPriceNum - paidAmountNum),
      customerName: customer?.name || '',
      measurementsWidth: formData.measurementsWidth ? parseFloat(formData.measurementsWidth) : '',
      measurementsHeight: formData.measurementsHeight ? parseFloat(formData.measurementsHeight) : '',
      measurementsDepth: formData.measurementsDepth ? parseFloat(formData.measurementsDepth) : '600',
    });
    onClose();
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (type: 'measurements' | 'design', e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (type === 'measurements') {
          setFormData(prev => ({
            ...prev,
            measurementsImages: [...prev.measurementsImages, base64],
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            designImages: [...prev.designImages, base64],
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (type: 'measurements' | 'design', index: number) => {
    if (type === 'measurements') {
      setFormData(prev => ({
        ...prev,
        measurementsImages: prev.measurementsImages.filter((_, idx) => idx !== index)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        designImages: prev.designImages.filter((_, idx) => idx !== index)
      }));
    }
  };

  const remainingAmount = Math.max(0, (parseFloat(formData.totalPrice) || 0) - (parseFloat(formData.paidAmount) || 0));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-neutral-950 text-right">
            {initialData ? `تعديل مشروع: ${formData.projectCode}` : 'إنشاء مشروع عقدي جديد'}
          </DialogTitle>
          <DialogDescription className="text-xs text-right mt-1">تعبئة البيانات الفنية والهندسية والتواريخ لجدولة الإنتاج بالورشة</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 text-xs font-bold text-neutral-800">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 bg-stone-100 p-1 rounded-lg">
              <TabsTrigger value="basic" className="text-xs font-bold py-1.5">البيانات الأساسية</TabsTrigger>
              <TabsTrigger value="sizing" className="text-xs font-bold py-1.5">المقاسات والموقع</TabsTrigger>
              <TabsTrigger value="dates" className="text-xs font-bold py-1.5">المواعيد</TabsTrigger>
              <TabsTrigger value="images" className="text-xs font-bold py-1.5">الرسومات المرفقة</TabsTrigger>
            </TabsList>

            {/* Basic Tab */}
            <TabsContent value="basic" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>العميل صاحب المطبخ *</Label>
                <Select 
                  value={formData.customerId} 
                  onValueChange={(value) => handleChange('customerId', value)}
                >
                  <SelectTrigger className="border-stone-300 font-semibold text-xs">
                    <SelectValue placeholder="اختر العميل" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(customer => (
                      <SelectItem key={customer.id} value={customer.id} className="text-xs font-bold">
                        {customer.name} - {customer.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>نوع التصنيع</Label>
                  <Select 
                    value={formData.projectType} 
                    onValueChange={(value) => handleChange('projectType', value)}
                  >
                    <SelectTrigger className="border-stone-300 font-semibold text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {projectTypes.map(type => (
                        <SelectItem key={type.value} value={type.value} className="text-xs font-bold">
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>حالة التنفيذ</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => handleChange('status', value)}
                  >
                    <SelectTrigger className="border-stone-300 font-semibold text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {projectStatuses.map(status => (
                        <SelectItem key={status.value} value={status.value} className="text-xs font-bold">
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-[#B39367]" />
                    اسم مهندس التصميم
                  </Label>
                  <Input
                    type="text"
                    value={formData.designerName}
                    onChange={(e) => handleChange('designerName', e.target.value)}
                    placeholder="م. أحمد سليم"
                    className="border-stone-300 text-xs font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-neutral-900" />
                    مندوب المبيعات المختص
                  </Label>
                  <Input
                    type="text"
                    value={formData.salesRep}
                    onChange={(e) => handleChange('salesRep', e.target.value)}
                    placeholder="أحمد سمير"
                    className="border-stone-300 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    سعر العقد الكلي
                  </Label>
                  <Input
                    type="number"
                    value={formData.totalPrice}
                    onChange={(e) => handleChange('totalPrice', e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="border-stone-300 text-xs font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-[#B39367]" />
                    المدفوع مقدماً
                  </Label>
                  <Input
                    type="number"
                    value={formData.paidAmount}
                    onChange={(e) => handleChange('paidAmount', e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="border-stone-300 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="bg-stone-50 border border-stone-200 p-3 rounded-lg flex justify-between items-center">
                <span className="text-stone-500">متبقي مطلوب سداده:</span>
                <span className={`font-black text-sm ${remainingAmount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {remainingAmount.toLocaleString()} ج.م
                </span>
              </div>
            </TabsContent>

            {/* Sizing Tab */}
            <TabsContent value="sizing" className="space-y-4 pt-4">
              <h4 className="font-bold text-xs text-[#B39367] flex items-center gap-1.5 border-b pb-2">
                <Ruler className="w-4 h-4" />
                تحديد أبعاد ومقاسات الفراغ بالملم (Dimensions)
              </h4>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>العرض الكلي (Width)</Label>
                  <Input
                    type="number"
                    value={formData.measurementsWidth}
                    onChange={(e) => handleChange('measurementsWidth', e.target.value)}
                    placeholder="ملم (مثال: 3200)"
                    className="border-stone-300 text-xs font-semibold"
                  />
                </div>
                <div className="space-y-2">
                  <Label>العمق (Depth)</Label>
                  <Input
                    type="number"
                    value={formData.measurementsDepth}
                    onChange={(e) => handleChange('measurementsDepth', e.target.value)}
                    placeholder="ملم (الافتراضي 600)"
                    className="border-stone-300 text-xs font-semibold"
                  />
                </div>
                <div className="space-y-2">
                  <Label>الارتفاع (Height)</Label>
                  <Input
                    type="number"
                    value={formData.measurementsHeight}
                    onChange={(e) => handleChange('measurementsHeight', e.target.value)}
                    placeholder="ملم (مثال: 2200)"
                    className="border-stone-300 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>ملاحظات فنية وهندسية للإنتاج</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="سجل نوع الرخام، التوزيع، التمديدات الصحية والكهربائية للمطبخ..."
                  className="min-h-[100px] border-stone-300 text-xs font-semibold"
                />
              </div>
            </TabsContent>

            {/* Schedule Tab */}
            <TabsContent value="dates" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#B39367]" />
                    موعد الرفع الفعلي للمقاسات بالموقع
                  </Label>
                  <Input
                    type="date"
                    value={formData.measurementsDate}
                    onChange={(e) => handleChange('measurementsDate', e.target.value)}
                    className="border-stone-300 text-xs font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#B39367]" />
                    تاريخ الانتهاء من لوحات التصميم
                  </Label>
                  <Input
                    type="date"
                    value={formData.designDate}
                    onChange={(e) => handleChange('designDate', e.target.value)}
                    className="border-stone-300 text-xs font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-neutral-900" />
                    تاريخ التسليم والتركيب النهائي المتفق عليه
                  </Label>
                  <Input
                    type="date"
                    value={formData.deliveryDate}
                    onChange={(e) => handleChange('deliveryDate', e.target.value)}
                    className="border-stone-300 text-xs font-semibold"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Renders Tab */}
            <TabsContent value="images" className="space-y-4 pt-4">
              <div className="space-y-4">
                <div className="border border-stone-200 p-4 rounded-xl">
                  <Label className="flex items-center gap-1.5 mb-2 text-neutral-950 font-bold">
                    <Camera className="w-4 h-4 text-[#B39367]" />
                    مخططات ورفع المقاسات اليدوي (Sketches)
                  </Label>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageUpload('measurements', e)}
                    className="border-stone-300 text-xs"
                  />
                  {formData.measurementsImages.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-3">
                      {formData.measurementsImages.map((img, idx) => (
                        <div key={idx} className="relative group rounded overflow-hidden border h-16">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          <button 
                            type="button" 
                            onClick={() => removeImage('measurements', idx)}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 text-[8px]"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border border-stone-200 p-4 rounded-xl">
                  <Label className="flex items-center gap-1.5 mb-2 text-neutral-950 font-bold">
                    <Upload className="w-4 h-4 text-[#B39367]" />
                    رسومات المطبخ ثلاثية الأبعاد (Renders)
                  </Label>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageUpload('design', e)}
                    className="border-stone-300 text-xs"
                  />
                  {formData.designImages.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-3">
                      {formData.designImages.map((img, idx) => (
                        <div key={idx} className="relative group rounded overflow-hidden border h-16">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          <button 
                            type="button" 
                            onClick={() => removeImage('design', idx)}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 text-[8px]"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-2 pt-6 mt-6 border-t">
            <Button type="submit" className="flex-1 bg-neutral-950 hover:bg-[#B39367] hover:text-neutral-950 font-bold text-xs text-white">
              <Save className="w-4 h-4 ml-1.5" />
              {initialData ? 'حفظ تعديلات العقد' : 'توقيع وتسجيل المشروع'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="border-stone-300 font-bold text-xs">
              <X className="w-4 h-4 ml-1.5" />
              إلغاء
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
