import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  FileDown, 
  Plus, 
  Trash2, 
  Building,
  Scale
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import jsPDF from 'jspdf';

interface DocumentManagerProps {
  customers: any[];
  projects: any[];
}

const LUXURY_RENDERS = [
  { url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800', name: 'تصميم مطبخ Matte Black مودرن' },
  { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800', name: 'تصميم كلاسيكي بيج برونزي دافئ' },
  { url: 'https://images.unsplash.com/photo-1565183997392-2f6f122e5912?auto=format&fit=crop&q=80&w=800', name: 'تصميم جزيرة رخام برونزي فاخر' }
];

export function DocumentManager({ customers = [] }: DocumentManagerProps) {
  const [activeSubTab, setActiveSubTab] = useState<'quote' | 'contract'>('quote');
  
  // Quotation Builder State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedRenderUrl, setSelectedRenderUrl] = useState<string>(LUXURY_RENDERS[0].url);
  const [quoteItems, setQuoteItems] = useState<Array<{ name: string; qty: number; unitPrice: number }>>([
    { name: 'كابينة سفلية دريسيج خشب كونتر 18مم', qty: 4, unitPrice: 2800 },
    { name: 'كابينة معلقة علوية بضلفة زجاج فريم برونز', qty: 3, unitPrice: 3200 },
    { name: 'مجرى درج Blum تاندوم هيدروليك', qty: 6, unitPrice: 750 }
  ]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('1');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [quoteTerms, setQuoteTerms] = useState('الأسعار تشمل التوريد والتركيب والضمان لمدة 10 سنوات على الأخشاب والمفصلات.');

  // Contract State
  const [contractClient, setContractClient] = useState<string>('');
  const [contractAddress, setContractAddress] = useState('');
  const [contractPrice, setContractPrice] = useState('45000');
  
  // Editable payment terms (Default 70% advance, 30% before delivery)
  const [advancePercent, setAdvancePercent] = useState<number>(70);
  const [deliveryPercent, setDeliveryPercent] = useState<number>(30);
  const [termsText, setTermsText] = useState(
    'يلتزم الطرف الأول بتصنيع وتركيب المطبخ خلال 45 يوماً من توقيع العقد وسداد الدفعة الأولى. يضمن الطرف الأول جودة الخامات والتثبيت ومطابقة المخططات الهندسية المعتمدة.'
  );

  // Quote totals
  const quoteTotal = useMemo(() => {
    return quoteItems.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);
  }, [quoteItems]);

  const clientInfo = useMemo(() => {
    return customers.find(c => c.id === selectedCustomerId);
  }, [customers, selectedCustomerId]);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemPrice) return;
    setQuoteItems([...quoteItems, {
      name: newItemName,
      qty: parseInt(newItemQty) || 1,
      unitPrice: parseFloat(newItemPrice) || 0
    }]);
    setNewItemName('');
    setNewItemQty('1');
    setNewItemPrice('');
  };

  const handleRemoveItem = (index: number) => {
    setQuoteItems(quoteItems.filter((_, idx) => idx !== index));
  };

  // jsPDF Quotation Download
  const handleDownloadQuotePDF = () => {
    const doc = new jsPDF();
    
    // Header Style
    doc.setFillColor(18, 18, 18); // Matte Black
    doc.rect(0, 0, 220, 45, 'F');
    
    doc.setTextColor(179, 147, 103); // Bronze HSL/HEX style (#B39367)
    doc.setFontSize(22);
    doc.text('TKL - THE KITCHEN LAB', 14, 20);
    
    doc.setTextColor(250, 249, 246); // Warm White
    doc.setFontSize(10);
    doc.text('Luxury Kitchens, Furniture & Smart Sizing Systems', 14, 28);
    doc.text('Contact: info@thekitchenlab.com | +201000000', 14, 34);

    // Document Info
    doc.setTextColor(34, 34, 34);
    doc.setFontSize(14);
    doc.text('QUOTATION / FINANCIAL SPECIFICATION', 14, 60);
    doc.setFontSize(10);
    doc.text(`Date: ${new Date().toLocaleDateString('en-US')}`, 14, 68);
    doc.text(`Client Name: ${clientInfo?.name || 'General Quote'}`, 14, 74);
    doc.text(`Client Phone: ${clientInfo?.phone || '-'}`, 14, 80);

    // Pricing Table
    let yPos = 95;
    doc.setFillColor(240, 240, 240);
    doc.rect(14, yPos - 6, 182, 8, 'F');
    doc.setFontSize(9);
    doc.text('Description', 16, yPos - 1);
    doc.text('Qty', 120, yPos - 1);
    doc.text('Unit Price (EGP)', 140, yPos - 1);
    doc.text('Total (EGP)', 170, yPos - 1);
    
    yPos += 8;
    quoteItems.forEach(item => {
      doc.text(item.name.substring(0, 50), 16, yPos);
      doc.text(item.qty.toString(), 120, yPos);
      doc.text(item.unitPrice.toLocaleString(), 140, yPos);
      doc.text((item.qty * item.unitPrice).toLocaleString(), 170, yPos);
      yPos += 10;
    });

    // Total Price row
    doc.line(14, yPos - 4, 196, yPos - 4);
    doc.setFontSize(12);
    doc.text('Grand Total:', 120, yPos + 4);
    doc.text(`${quoteTotal.toLocaleString()} EGP`, 170, yPos + 4);

    // Terms
    doc.setFontSize(9);
    doc.text('Terms & Notes:', 14, yPos + 18);
    doc.text(quoteTerms.substring(0, 100), 14, yPos + 24);

    doc.save(`TKL_Quotation_${clientInfo?.name || 'General'}.pdf`);
  };

  // jsPDF Contract Download
  const handleDownloadContractPDF = () => {
    const doc = new jsPDF();
    
    // Header Banner
    doc.setFillColor(18, 18, 18);
    doc.rect(0, 0, 220, 40, 'F');
    
    doc.setTextColor(179, 147, 103);
    doc.setFontSize(22);
    doc.text('TKL - CONTRACT AGREEMENT', 14, 20);

    // Terms
    doc.setTextColor(34, 34, 34);
    doc.setFontSize(12);
    doc.text(`Contract Party: ${contractClient || 'Client Name'}`, 14, 55);
    doc.text(`Project Address: ${contractAddress || '-'}`, 14, 62);
    doc.text(`Total Agreement Sum: ${parseFloat(contractPrice).toLocaleString()} EGP`, 14, 69);
    
    doc.text('PAYMENT SCHEDULE (MILSTONES):', 14, 85);
    doc.setFontSize(10);
    const advanceAmount = (parseFloat(contractPrice) * advancePercent) / 100;
    const deliveryAmount = (parseFloat(contractPrice) * deliveryPercent) / 100;
    
    doc.text(`1. Advance Deposit Payment (${advancePercent}%): ${advanceAmount.toLocaleString()} EGP`, 18, 93);
    doc.text(`2. Before Delivery Final Payment (${deliveryPercent}%): ${deliveryAmount.toLocaleString()} EGP`, 18, 100);

    doc.setFontSize(11);
    doc.text('Terms of Execution:', 14, 115);
    doc.setFontSize(9);
    doc.text(termsText.substring(0, 100), 14, 122);
    doc.text(termsText.substring(100, 200), 14, 128);

    // Signatures
    doc.setFontSize(10);
    doc.text('First Party (TKL Representative)', 14, 160);
    doc.text('Second Party (The Client)', 130, 160);
    doc.line(14, 180, 70, 180);
    doc.line(130, 180, 186, 180);

    doc.save(`TKL_Contract_${contractClient || 'Client'}.pdf`);
  };

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* Tab toggle headers */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <h2 className="text-2xl font-black text-neutral-900 flex items-center gap-2">
            بوابة عقود وعروض أسعار المعرض (Document Center)
            <FileText className="w-5.5 h-5.5 text-[#B39367]" />
          </h2>
          <p className="text-xs text-stone-500 mt-1 font-semibold font-sans">توليد وثائق المبيعات والتسعير الفوري للمطابخ مع تخصيص شروط السداد</p>
        </div>
        
        <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-lg border border-stone-200">
          <Button
            variant={activeSubTab === 'quote' ? 'default' : 'ghost'}
            onClick={() => setActiveSubTab('quote')}
            className={`text-xs font-bold px-4 py-1.5 h-8 ${activeSubTab === 'quote' ? 'bg-neutral-900 text-white' : 'text-stone-600'}`}
          >
            مقايسة وعرض سعر (Quotation)
          </Button>
          <Button
            variant={activeSubTab === 'contract' ? 'default' : 'ghost'}
            onClick={() => setActiveSubTab('contract')}
            className={`text-xs font-bold px-4 py-1.5 h-8 ${activeSubTab === 'contract' ? 'bg-neutral-900 text-white' : 'text-stone-600'}`}
          >
            عقد بيع وتصنيع (Contract)
          </Button>
        </div>
      </div>

      {/* VIEW 1: Quotation Builder */}
      {activeSubTab === 'quote' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Builder Form Inputs */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border border-stone-200 bg-white">
              <CardHeader>
                <CardTitle className="text-sm font-extrabold text-neutral-950 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-[#B39367]" />
                  بناء بنود عرض السعر المالي
                </CardTitle>
                <CardDescription className="text-[10px]">ادخل البنود المصنعة والكميات والأسعار</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Client selector */}
                <div className="space-y-1.5 text-xs font-bold">
                  <Label>اختيار العميل المهتم</Label>
                  <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                    <SelectTrigger className="border-stone-300 font-semibold text-xs">
                      <SelectValue placeholder="اختر عميل لتسعير مشروعه" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map(c => (
                        <SelectItem key={c.id} value={c.id} className="text-xs font-bold">{c.name} - {c.phone}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Grid inputs for adding a single item */}
                <form onSubmit={handleAddItem} className="bg-stone-50 border border-stone-200 p-4 rounded-xl space-y-3 text-xs font-bold">
                  <span className="text-xs text-neutral-800 font-extrabold block">إدراج بند مالي جديد للمقايسة</span>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="md:col-span-2 space-y-1">
                      <Label>وصف البند المالي / الكابينة</Label>
                      <Input 
                        placeholder="مثال: علبة حوض مطبخ 80سم خشب كونتر"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        className="border-stone-300 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>الكمية (Qty)</Label>
                      <Input 
                        type="number"
                        min="1"
                        value={newItemQty}
                        onChange={(e) => setNewItemQty(e.target.value)}
                        className="border-stone-300 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>سعر الوحدة (ج.م)</Label>
                      <Input 
                        type="number"
                        placeholder="2200"
                        value={newItemPrice}
                        onChange={(e) => setNewItemPrice(e.target.value)}
                        className="border-stone-300 text-xs"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" size="sm" className="bg-[#B39367] hover:bg-neutral-900 hover:text-white text-neutral-950 font-bold text-[10px] transition-all">
                      إدراج البند بالجدول
                    </Button>
                  </div>
                </form>

                {/* Items pricing table */}
                <div className="rounded-lg border border-stone-200 overflow-hidden text-xs">
                  <table className="w-full text-right font-semibold">
                    <thead className="bg-stone-50 text-stone-500 border-b">
                      <tr>
                        <th className="p-3">مواصفات البند</th>
                        <th className="p-3">الكمية</th>
                        <th className="p-3">سعر الوحدة</th>
                        <th className="p-3">الإجمالي الفرعي</th>
                        <th className="p-3 text-center">العمليات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-neutral-900">
                      {quoteItems.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center p-6 text-stone-400">لا يوجد بنود تسعير مدرجة حالياً</td>
                        </tr>
                      ) : (
                        quoteItems.map((item, idx) => (
                          <tr key={idx}>
                            <td className="p-3 font-bold text-neutral-950">{item.name}</td>
                            <td className="p-3 text-amber-600">× {item.qty}</td>
                            <td className="p-3">{formatCurrency(item.unitPrice)}</td>
                            <td className="p-3 font-black text-neutral-950">{formatCurrency(item.qty * item.unitPrice)}</td>
                            <td className="p-3 text-center">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-rose-600 hover:bg-rose-50 px-2 h-7"
                                onClick={() => handleRemoveItem(idx)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-1.5 text-xs font-bold">
                  <Label>شروط وتفاصيل الضمان الفني</Label>
                  <Textarea 
                    value={quoteTerms}
                    onChange={(e) => setQuoteTerms(e.target.value)}
                    className="border-stone-300 text-xs font-semibold resize-none h-16"
                  />
                </div>

              </CardContent>
            </Card>
          </div>

          {/* Right column: Document preview with branding and download */}
          <div className="space-y-6">
            <Card className="border border-stone-200 bg-white relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-neutral-950"></div>
              
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">TKL - Spec Sheet</span>
                  <Badge className="bg-[#B39367] text-neutral-950 font-black text-[9px] px-1.5">PREVIEW</Badge>
                </div>
                
                {/* Company Branding */}
                <div className="pt-4 text-center">
                  <Building className="w-8 h-8 text-[#B39367] mx-auto mb-1" />
                  <h3 className="text-sm font-extrabold text-neutral-950 tracking-tight">TKL – The Kitchen LAB</h3>
                  <p className="text-[9px] text-stone-400">تصميم وتصنيع أرقى طرازات المطابخ وغرف الملابس</p>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4 pt-4 text-xs font-semibold text-stone-700">
                <div className="p-3 bg-stone-50 border rounded-lg space-y-1.5">
                  <p><span className="text-stone-400">العميل المستهدف:</span> <span className="text-neutral-950 font-bold">{clientInfo?.name || 'تفصيل عام'}</span></p>
                  <p><span className="text-stone-400">العنوان:</span> {clientInfo?.address || '-'}</p>
                </div>

                {/* Render Template preview */}
                <div className="space-y-2">
                  <span className="text-[10px] text-stone-400 font-bold block">مخطط رندر المطبخ المعتمد للعميل</span>
                  <div className="rounded-lg overflow-hidden border border-stone-200 h-28 relative">
                    <img src={selectedRenderUrl} alt="" className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 inset-x-0 bg-neutral-950/60 p-1.5 text-[8px] text-stone-100 font-bold text-center">
                      نموذج معمار المطبخ المرفق بالمقايسة
                    </div>
                  </div>
                  
                  {/* Select preset render */}
                  <div className="grid grid-cols-3 gap-2">
                    {LUXURY_RENDERS.map((r, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedRenderUrl(r.url)}
                        className={`h-9 border rounded overflow-hidden transition-all ${
                          selectedRenderUrl === r.url ? 'ring-2 ring-[#B39367]' : 'opacity-65 hover:opacity-100'
                        }`}
                      >
                        <img src={r.url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Aggregated price preview */}
                <div className="pt-3 border-t border-dashed">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-extrabold text-neutral-950">إجمالي المقايسة الكلي:</span>
                    <span className="font-black text-[#B39367] text-md">{formatCurrency(quoteTotal)}</span>
                  </div>
                </div>

                {/* PDF and print command */}
                <Button 
                  className="w-full bg-neutral-950 text-white hover:bg-[#B39367] hover:text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 py-5 transition-all mt-4"
                  onClick={handleDownloadQuotePDF}
                >
                  <FileDown className="w-4 h-4" />
                  تحميل مقايسة عرض السعر PDF
                </Button>

              </CardContent>
            </Card>
          </div>

        </div>
      )}

      {/* VIEW 2: Contract Generator */}
      {activeSubTab === 'contract' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Builder and terms inputs */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border border-stone-200 bg-white">
              <CardHeader>
                <CardTitle className="text-sm font-extrabold text-neutral-950 flex items-center gap-1.5">
                  <Scale className="w-4.5 h-4.5 text-[#B39367]" />
                  تحرير بنود عقد البيع القانوني الموحد
                </CardTitle>
                <CardDescription className="text-[10px]">ادخل قيم العقود والدفعة المئوية للتحصيل</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs font-bold text-neutral-800">
                
                <div className="space-y-1.5">
                  <Label>اسم العميل المتعاقد (الطرف الثاني)</Label>
                  <Input 
                    placeholder="مثال: الأستاذ هاني منصور"
                    value={contractClient}
                    onChange={(e) => setContractClient(e.target.value)}
                    className="border-stone-300 text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>موقع توريد المطبخ بالتفصيل</Label>
                  <Input 
                    placeholder="شقة 3، عمارة 9، حي البنفسج، التجمع"
                    value={contractAddress}
                    onChange={(e) => setContractAddress(e.target.value)}
                    className="border-stone-300 text-xs font-semibold"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label>قيمة العقد الكلية (ج.م)</Label>
                    <Input 
                      type="number"
                      value={contractPrice}
                      onChange={(e) => setContractPrice(e.target.value)}
                      className="border-stone-300 text-xs"
                    />
                  </div>
                  
                  {/* Editable Payment schedules */}
                  <div className="space-y-1.5">
                    <Label>الدفعة المقدمة (% Advance)</Label>
                    <Input 
                      type="number"
                      min="10"
                      max="90"
                      value={advancePercent}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setAdvancePercent(val);
                        setDeliveryPercent(Math.max(0, 100 - val));
                      }}
                      className="border-stone-300 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>دفعة قبل التسليم (% Delivery)</Label>
                    <Input 
                      type="number"
                      min="10"
                      max="90"
                      value={deliveryPercent}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setDeliveryPercent(val);
                        setAdvancePercent(Math.max(0, 100 - val));
                      }}
                      className="border-stone-300 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>شروط الالتزام وفترة التوريد والجزاءات</Label>
                  <Textarea 
                    value={termsText}
                    onChange={(e) => setTermsText(e.target.value)}
                    className="border-stone-300 text-xs font-semibold resize-none h-24"
                  />
                </div>

              </CardContent>
            </Card>
          </div>

          {/* Right column: Contract overview previews */}
          <div className="space-y-6">
            <Card className="border border-stone-200 bg-white relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#B39367]"></div>
              
              <CardHeader className="border-b pb-4">
                <CardTitle className="text-xs font-black text-neutral-950 uppercase tracking-wider flex items-center justify-between">
                  <span>جدولة سداد دفعات العقد</span>
                  <Badge className="bg-emerald-100 text-emerald-800 font-extrabold text-[9px]">جاهز للتوقيع</Badge>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4 pt-4 text-xs font-semibold text-stone-700">
                
                {/* Financial breakdown display based on payment milestones */}
                <div className="space-y-3">
                  <div className="p-3 bg-stone-50 border rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-bold text-neutral-950 text-xs">الدفعة الأولى التعاقدية ({advancePercent}%)</p>
                      <p className="text-[9px] text-stone-400 mt-0.5">تسدد فوراً عند إبرام العقد</p>
                    </div>
                    <span className="font-black text-[#B39367] text-xs">
                      {formatCurrency((parseFloat(contractPrice) || 0) * advancePercent / 100)}
                    </span>
                  </div>

                  <div className="p-3 bg-stone-50 border rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-bold text-neutral-950 text-xs">الدفعة الأخيرة قبل التسليم ({deliveryPercent}%)</p>
                      <p className="text-[9px] text-stone-400 mt-0.5">تسدد بمقر المصنع فور معاينة الجودة وقبل النقل</p>
                    </div>
                    <span className="font-black text-neutral-800 text-xs">
                      {formatCurrency((parseFloat(contractPrice) || 0) * deliveryPercent / 100)}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-xl text-stone-100 text-[10px] space-y-1.5 font-medium leading-relaxed">
                  <p className="text-stone-300 font-bold border-b border-stone-800 pb-1 flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5 text-[#B39367]" />
                    صيغة التزام الطرفين الرسمية
                  </p>
                  <p>الطرف الأول: شركة TKL – The Kitchen LAB ويمثلها المبيعات المعتمد.</p>
                  <p>الطرف الثاني: العميل السيد {contractClient || 'اسم العميل'}.</p>
                  <p>تعتبر المقايسة المالية والمخططات الهندسية جزءاً لا يتجزأ من بنود هذا العقد.</p>
                </div>

                <Button 
                  className="w-full bg-[#B39367] text-neutral-950 hover:bg-neutral-950 hover:text-stone-100 font-bold text-xs flex items-center justify-center gap-1.5 py-5 transition-all mt-4"
                  onClick={handleDownloadContractPDF}
                >
                  <FileDown className="w-4 h-4" />
                  تحميل وطباعة العقد المعتمد PDF
                </Button>

              </CardContent>
            </Card>
          </div>

        </div>
      )}

    </div>
  );
}
