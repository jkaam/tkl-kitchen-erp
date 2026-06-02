import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Package, AlertTriangle, Edit, Trash2, Truck, BarChart2, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface InventoryManagerProps {
  products: any[];
  onAdd: (product: any) => void;
  onUpdate: (id: string, product: any) => void;
  onDelete: (id: string) => void;
}

const categories = [
  { value: 'boards', label: 'الألواح الخشبية (Boards)' },
  { value: 'hpl', label: 'طبقات HPL' },
  { value: 'hinges', label: 'المفصلات (Hinges)' },
  { value: 'drawer_systems', label: 'أنظمة الأدراج (Drawer Systems)' },
  { value: 'handles', label: 'المقابض (Handles)' },
  { value: 'accessories', label: 'إكسسوارات ومستلزمات عامة' },
];

const units = [
  { value: 'sheet', label: 'لوح خشب' },
  { value: 'piece', label: 'قطعة مفردة' },
  { value: 'set', label: 'طقم كامل' },
  { value: 'meter', label: 'متر طولي' },
];

export function InventoryManager({ products = [], onAdd, onUpdate, onDelete }: InventoryManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'boards',
    unit: 'sheet',
    unitPrice: '',
    quantity: '',
    minQuantity: '',
    supplier: '',
    notes: '',
  });

  // Filter products by query
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Low stock products filter
  const lowStockProducts = products.filter(p => p.quantity <= (p.minQuantity || 5));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const productData = {
      ...formData,
      unitPrice: parseFloat(formData.unitPrice) || 0,
      quantity: parseFloat(formData.quantity) || 0,
      minQuantity: parseFloat(formData.minQuantity) || 0,
    };

    if (editingProduct) {
      onUpdate(editingProduct.id, productData);
    } else {
      onAdd(productData);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'boards',
      unit: 'sheet',
      unitPrice: '',
      quantity: '',
      minQuantity: '',
      supplier: '',
      notes: '',
    });
    setEditingProduct(null);
    setIsFormOpen(false);
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      category: product.category || 'boards',
      unit: product.unit || 'sheet',
      unitPrice: product.unitPrice?.toString() || '',
      quantity: product.quantity?.toString() || '',
      minQuantity: product.minQuantity?.toString() || '',
      supplier: product.supplier || '',
      notes: product.notes || '',
    });
    setIsFormOpen(true);
  };

  const getCategoryLabel = (value: string) => {
    return categories.find(c => c.value === value)?.label || value;
  };

  const getUnitLabel = (value: string) => {
    return units.find(u => u.value === value)?.label || value;
  };

  const getStockStatus = (product: any) => {
    const q = parseFloat(product.quantity) || 0;
    const m = parseFloat(product.minQuantity) || 5;
    if (q <= 0) return { label: 'نفذ تماماً', color: 'bg-rose-100 text-rose-800 border border-rose-300' };
    if (q <= m) return { label: 'مخزون منخفض جداً', color: 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse' };
    return { label: 'متوفر وآمن', color: 'bg-emerald-100 text-emerald-800 border border-emerald-300' };
  };

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <h2 className="text-2xl font-black text-neutral-900 flex items-center gap-2">
            مخزن خامات الإنتاج والأكسسوارات
            <Package className="w-5.5 h-5.5 text-[#B39367]" />
          </h2>
          <p className="text-xs text-stone-500 mt-1 font-semibold">تتبع كميات الألواح الخشبية وطبقات الـ HPL والمفصلات ومستلزمات التجميع الفاخرة</p>
        </div>
        <Button 
          className="bg-neutral-950 hover:bg-[#B39367] text-white hover:text-neutral-950 font-bold px-4 py-2 text-xs flex items-center gap-1.5 transition-all"
          onClick={() => setIsFormOpen(true)}
        >
          <Plus className="w-4 h-4" />
          إضافة صنف للمستودع
        </Button>
      </div>

      {/* Low Stock Alerts Banner */}
      {lowStockProducts.length > 0 && (
        <Card className="border-r-4 border-r-[#B39367] border-stone-200 bg-stone-50/50 shadow-xs">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="w-5.5 h-5.5 text-[#B39367] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-extrabold text-xs text-neutral-950">تنبيه مستويات المخزون منخفضة بالورشة!</h4>
              <p className="text-[11px] text-stone-500 mt-0.5 font-semibold">
                وصلت كميات {lowStockProducts.length} أصناف أساسية إلى الحد الحرج للمخزون. يرجى التنسيق مع الموردين لإعادة شحن الورشة.
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {lowStockProducts.map(p => (
                  <Badge key={p.id} className="bg-neutral-900 text-stone-100 text-[9px] font-bold">
                    {p.name} ({p.quantity} لوح/قطعة متبقية)
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white border border-stone-200 p-4 rounded-xl">
        <div className="relative w-full md:w-80">
          <Input 
            placeholder="ابحث عن خامة، كود، أو صنف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10 text-right text-xs font-semibold focus-visible:ring-[#B39367] border-stone-300"
          />
          <Search className="w-4 h-4 text-stone-400 absolute top-3 right-3" />
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-[240px] border-stone-300 text-xs font-bold">
            <SelectValue placeholder="تصفية حسب صنف الخام" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs font-semibold">كل فئات الخامات</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat.value} value={cat.value} className="text-xs font-semibold">{cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table of items */}
      <Card className="border border-stone-200 bg-white">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-stone-50 text-stone-500 border-b border-stone-200">
              <tr>
                <th className="p-4 font-bold">اسم صنف الخام / الإكسسوار</th>
                <th className="p-4 font-bold">التصنيف الرئيسي</th>
                <th className="p-4 font-bold">الرصيد المتاح</th>
                <th className="p-4 font-bold">الحد الأدنى الآمن</th>
                <th className="p-4 font-bold">سعر التكلفة للوحدة</th>
                <th className="p-4 font-bold">مورد الصنف</th>
                <th className="p-4 font-bold">حالة المخزون بالورشة</th>
                <th className="p-4 font-bold text-center">العمليات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 font-semibold text-neutral-800">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center p-12 text-stone-400">لا يوجد أصناف في مستودع المواد الأولية حالياً</td>
                </tr>
              ) : (
                filteredProducts.map(p => {
                  const status = getStockStatus(p);
                  return (
                    <tr key={p.id} className="hover:bg-stone-50/50">
                      <td className="p-4 font-bold text-neutral-950">{p.name}</td>
                      <td className="p-4 text-stone-500">{getCategoryLabel(p.category)}</td>
                      <td className="p-4 font-black">
                        {p.quantity} {getUnitLabel(p.unit)}
                      </td>
                      <td className="p-4 text-stone-400">{p.minQuantity || 5} {getUnitLabel(p.unit)}</td>
                      <td className="p-4 font-bold text-neutral-950">{formatCurrency(p.unitPrice)}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-[11px] text-stone-500">
                          <Truck className="w-3.5 h-3.5 text-[#B39367]" />
                          {p.supplier || '-'}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${status.color}`}>
                          {status.label}
                        </Badge>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(p)} className="hover:bg-stone-100">
                            <Edit className="w-4 h-4 text-stone-500" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setDeleteConfirm(p.id)}
                            className="text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border border-stone-200 bg-white">
          <CardContent className="p-4 flex items-center gap-3">
            <BarChart2 className="w-8 h-8 text-[#B39367] shrink-0" />
            <div>
              <p className="text-[10px] text-stone-400 font-bold">إجمالي أصناف المواد</p>
              <p className="text-lg font-black text-neutral-950 mt-0.5">{products.length} أصناف</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-stone-200 bg-white">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-emerald-600 shrink-0" />
            <div>
              <p className="text-[10px] text-stone-400 font-bold">أصناف كافية وآمنة</p>
              <p className="text-lg font-black text-neutral-950 mt-0.5">
                {products.filter(p => p.quantity > (p.minQuantity || 5)).length} أصناف
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-stone-200 bg-white">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-[#B39367] shrink-0 animate-pulse" />
            <div>
              <p className="text-[10px] text-stone-400 font-bold">أصناف منخفضة الرصيد</p>
              <p className="text-lg font-black text-[#B39367] mt-0.5">
                {products.filter(p => p.quantity > 0 && p.quantity <= (p.minQuantity || 5)).length} أصناف
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-stone-200 bg-white">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-rose-600 shrink-0" />
            <div>
              <p className="text-[10px] text-stone-400 font-bold">أصناف نفذت تماماً</p>
              <p className="text-lg font-black text-rose-600 mt-0.5">
                {products.filter(p => p.quantity <= 0).length} أصناف
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Model Form: Add/Edit Item */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md text-xs font-bold text-neutral-800" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-md font-black text-neutral-950">
              {editingProduct ? 'تعديل بيانات صنف المستودع' : 'إضافة صنف خامات/إكسسوار جديد'}
            </DialogTitle>
            <DialogDescription className="text-[10px] mt-1">تعبئة البيانات القياسية وحدود إعادة الطلب الآمنة</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-3">
            <div className="space-y-1.5">
              <Label>اسم الصنف الفني *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="لوح MDF إسباني 18 ملم"
                required
                className="border-stone-300 text-xs font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>التصنيف الفني للخامة</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="border-stone-300 text-xs font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value} className="text-xs font-semibold">{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>وحدة القياس والمخزون</Label>
                <Select 
                  value={formData.unit} 
                  onValueChange={(value) => setFormData({ ...formData, unit: value })}
                >
                  <SelectTrigger className="border-stone-300 text-xs font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map(unit => (
                      <SelectItem key={unit.value} value={unit.value} className="text-xs font-semibold">{unit.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>الرصيد المتاح</Label>
                <Input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="border-stone-300 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label>الحد الأدنى للتنبيه</Label>
                <Input
                  type="number"
                  value={formData.minQuantity}
                  onChange={(e) => setFormData({ ...formData, minQuantity: e.target.value })}
                  placeholder="5"
                  min="0"
                  step="0.01"
                  className="border-stone-300 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label>سعر الوحدة للتكلفة</Label>
                <Input
                  type="number"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="border-stone-300 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>المورد المعتمد للخامة</Label>
              <Input
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                placeholder="الشركة المتحدة للأخشاب ومستلزماتها"
                className="border-stone-300 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label>ملاحظات ومواصفات إضافية</Label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="سجل درجة اللون، معامل مقاومة الرطوبة..."
                className="border-stone-300 text-xs"
              />
            </div>

            <DialogFooter className="pt-4 gap-2 flex justify-end">
              <Button type="button" variant="outline" onClick={resetForm} className="border-stone-300 text-xs font-bold">
                إلغاء
              </Button>
              <Button type="submit" className="bg-neutral-950 text-white font-bold text-xs hover:bg-[#B39367] hover:text-neutral-950 transition-all">
                حفظ الصنف
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm deletion dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>تأكيد حذف الخامة</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-stone-600 font-bold">هل أنت متأكد من رغبتك في حذف هذا الصنف تماماً من مخزن الورشة؟</p>
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="border-stone-300 text-xs font-bold">
              إلغاء
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                if (deleteConfirm) {
                  onDelete(deleteConfirm);
                  setDeleteConfirm(null);
                }
              }}
              className="text-xs font-bold"
            >
              حذف الخامة
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
const DialogFooter = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className}`}>
    {children}
  </div>
);
