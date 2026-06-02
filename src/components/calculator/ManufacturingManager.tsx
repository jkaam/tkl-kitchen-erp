import { useState, useMemo, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Printer, 
  FileSpreadsheet, 
  FileDown, 
  Layers, 
  Lock, 
  Unlock,
  Scissors,
  Eye,
  Hammer
} from 'lucide-react';
import { exportToExcel, exportToPDF, formatDate } from '@/lib/utils';

interface ManufacturingManagerProps {
  projects: any[];
  savedCuts: any[];
  updateProjectStatus?: (id: string, status: string) => void;
}

// Wood sheet parameters
const SHEET_WIDTH = 2440; // mm
const SHEET_HEIGHT = 1220; // mm
const SHEET_AREA = (SHEET_WIDTH * SHEET_HEIGHT) / 1000000; // m2

export function ManufacturingManager({ 
  projects = [], 
  savedCuts = [],
  updateProjectStatus 
}: ManufacturingManagerProps) {
  
  const [searchTerm] = useState('');
  const [selectedRecordId, setSelectedRecordId] = useState<string>('');
  const [isFactoryMode, setIsFactoryMode] = useState<boolean>(true); // Factory Mode ON by default

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Default mock cut records if local storage is empty
  const defaultCuts = useMemo(() => {
    return [
      {
        id: 'preset-1',
        projectName: 'مطبخ فيلا 4 التجمع',
        cabinetType: 'base',
        typeName: 'مطبخ سفلي (Base Cabinet)',
        dimensions: '800W × 600D × 780H - 18mm',
        piecesCount: 7,
        totalArea: 2.1,
        pieces: [
          { name: 'قاطع جانبي 1', width: 600, height: 780, qty: 2, area: 0.936, material: 'Melamine 18mm' },
          { name: 'قاعدة سفلية', width: 564, height: 764, qty: 1, area: 0.43, material: 'Melamine 18mm' },
          { name: 'عارضة أمامية', width: 100, height: 764, qty: 1, area: 0.076, material: 'Melamine 18mm' },
          { name: 'عارضة خلفية', width: 100, height: 764, qty: 1, area: 0.076, material: 'Melamine 18mm' },
          { name: 'رف داخلي', width: 564, height: 764, qty: 2, area: 0.86, material: 'Melamine 18mm' }
        ]
      },
      ...savedCuts
    ];
  }, [savedCuts]);

  // Selected Cut Record
  const activeRecord = useMemo(() => {
    return defaultCuts.find(c => c.id === selectedRecordId) || defaultCuts[0];
  }, [defaultCuts, selectedRecordId]);

  // Nesting Optimization Algorithm (Row-Packing)
  const optimizationResults = useMemo(() => {
    if (!activeRecord || !activeRecord.pieces) return null;

    // Expand pieces by quantity
    const flatPieces: Array<{
      name: string;
      width: number;
      height: number;
      id: string;
    }> = [];

    activeRecord.pieces.forEach((p: any, idx: number) => {
      for (let i = 0; i < p.qty; i++) {
        flatPieces.push({
          name: `${p.name} (${i + 1})`,
          width: p.width,
          height: p.height,
          id: `${idx}-${i}`
        });
      }
    });

    // Sort pieces by height (descending) to optimize row packing
    flatPieces.sort((a, b) => b.height - a.height);

    const sheets: Array<{
      id: number;
      placedPieces: Array<{
        name: string;
        width: number;
        height: number;
        x: number;
        y: number;
      }>;
    }> = [];

    let currentSheetPieces: typeof sheets[0]['placedPieces'] = [];
    let currentX = 0;
    let currentY = 0;
    let currentRowHeight = 0;

    flatPieces.forEach(piece => {
      // Check if piece width or height exceeds sheet boundaries
      const pw = Math.min(piece.width, SHEET_WIDTH);
      const ph = Math.min(piece.height, SHEET_HEIGHT);

      // Does it fit in current row?
      if (currentX + pw <= SHEET_WIDTH && currentY + ph <= SHEET_HEIGHT) {
        currentSheetPieces.push({
          name: piece.name,
          width: pw,
          height: ph,
          x: currentX,
          y: currentY
        });
        currentX += pw;
        currentRowHeight = Math.max(currentRowHeight, ph);
      } else {
        // Move to next row
        currentX = 0;
        currentY += currentRowHeight;
        currentRowHeight = ph;

        // Does it fit on the current sheet in the new row?
        if (currentY + ph <= SHEET_HEIGHT) {
          currentSheetPieces.push({
            name: piece.name,
            width: pw,
            height: ph,
            x: currentX,
            y: currentY
          });
          currentX += pw;
        } else {
          // Push old sheet and initialize new one
          sheets.push({
            id: sheets.length + 1,
            placedPieces: currentSheetPieces
          });
          currentSheetPieces = [];
          currentX = 0;
          currentY = 0;
          currentRowHeight = ph;

          // Place on new sheet
          currentSheetPieces.push({
            name: piece.name,
            width: pw,
            height: ph,
            x: currentX,
            y: currentY
          });
          currentX += pw;
        }
      }
    });

    // Push the final sheet if it has elements
    if (currentSheetPieces.length > 0) {
      sheets.push({
        id: sheets.length + 1,
        placedPieces: currentSheetPieces
      });
    }

    // Totals calculations
    const totalSheets = sheets.length;
    const totalCapacityArea = totalSheets * SHEET_AREA;
    const piecesArea = flatPieces.reduce((sum, p) => sum + (p.width * p.height) / 1000000, 0);
    const wasteArea = Math.max(0, totalCapacityArea - piecesArea);
    const wastePercent = totalCapacityArea > 0 ? (wasteArea / totalCapacityArea) * 100 : 0;
    const usedPercent = totalCapacityArea > 0 ? (piecesArea / totalCapacityArea) * 100 : 0;

    return {
      sheets,
      totalSheets,
      piecesArea: parseFloat(piecesArea.toFixed(3)),
      wasteArea: parseFloat(wasteArea.toFixed(3)),
      wastePercent: Math.round(wastePercent),
      usedPercent: Math.round(usedPercent)
    };
  }, [activeRecord]);

  // Render Graphical nesting on Canvas
  useEffect(() => {
    if (!optimizationResults || !canvasRef.current || optimizationResults.sheets.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw the first sheet as a sample
    const sheet = optimizationResults.sheets[0];
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Canvas sizing setup
    const scale = canvas.width / SHEET_WIDTH;
    const displayHeight = SHEET_HEIGHT * scale;
    
    // Adjust canvas height to match scaled sheet
    canvas.height = displayHeight + 40;

    // Background sheet border
    ctx.fillStyle = '#FAF9F6'; // Warm White
    ctx.fillRect(0, 0, canvas.width, displayHeight);
    
    ctx.strokeStyle = '#222222'; // Matte Black
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, canvas.width, displayHeight);

    // Draw pieces
    sheet.placedPieces.forEach((p, idx) => {
      const px = p.x * scale;
      const py = p.y * scale;
      const pw = p.width * scale;
      const ph = p.height * scale;

      // Color coding panel boxes
      ctx.fillStyle = idx % 2 === 0 ? 'rgba(179, 147, 103, 0.25)' : 'rgba(26, 26, 26, 0.08)';
      ctx.fillRect(px, py, pw, ph);
      
      ctx.strokeStyle = '#B39367'; // Bronze outline
      ctx.lineWidth = 1;
      ctx.strokeRect(px, py, pw, ph);

      // Label names inside panels if they fit
      if (pw > 40 && ph > 20) {
        ctx.fillStyle = '#222';
        ctx.font = 'bold 9px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${p.width}×${p.height}`, px + pw/2, py + ph/2 - 4);
        ctx.font = '7px Arial';
        ctx.fillText(p.name.substring(0, 15), px + pw/2, py + ph/2 + 6);
      }
    });

    // Draw border labels
    ctx.fillStyle = '#666';
    ctx.font = '10px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`${SHEET_WIDTH} mm`, 10, displayHeight + 20);
    ctx.fillText(`${SHEET_HEIGHT} mm`, canvas.width - 60, displayHeight + 20);

  }, [optimizationResults]);

  // Export Cut list to Excel
  const handleExportExcel = () => {
    if (!activeRecord || !activeRecord.pieces) return;
    const excelData = activeRecord.pieces.map((p: any) => ({
      'اسم القطعة': p.name,
      'العرض (ملم)': p.width,
      'الارتفاع (ملم)': p.height,
      'الكمية': p.qty,
      'المساحة (م²)': p.area,
      'الخامة': p.material
    }));

    exportToExcel(excelData, `CutList_${activeRecord.projectName}`, 'تفصيل ألواح المطبخ');
  };

  // Export to PDF
  const handleExportPDF = () => {
    if (!activeRecord || !activeRecord.pieces) return;
    const headers = ['اسم القطعة', 'العرض (ملم)', 'الارتفاع (ملم)', 'الكمية', 'المساحة (م²)', 'الخامة'];
    const data = activeRecord.pieces.map((p: any) => [
      p.name,
      p.width.toString(),
      p.height.toString(),
      p.qty.toString(),
      p.area.toString(),
      p.material
    ]);

    exportToPDF(
      `قائمة تقطيع ألواح - ${activeRecord.projectName}`,
      headers,
      data,
      `CutList_${activeRecord.projectName}`,
      [
        { label: 'أبعاد الوحدة الكلية', value: activeRecord.dimensions },
        { label: 'نوع الوحدة', value: activeRecord.typeName },
        { label: 'عدد ألواح الخام المستهلكة (1220x2440)', value: optimizationResults?.totalSheets.toString() || '1' }
      ]
    );
  };

  // Filtered projects list under Factory Mode
  const activeProjectsToFactory = useMemo(() => {
    return projects.filter(p => {
      const matchSearch = p.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) || p.projectCode?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSearch;
    });
  }, [projects, searchTerm]);

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* Top Controller: Factory Mode Toggle */}
      <div className="bg-neutral-900 text-stone-100 border border-stone-800 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isFactoryMode ? 'bg-[#B39367] text-neutral-950' : 'bg-neutral-800 text-stone-300'}`}>
            {isFactoryMode ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-sm font-extrabold flex items-center gap-1.5">
              وضع المصنع والورشة الفني (Factory Safe Mode)
              {isFactoryMode && <Badge className="bg-[#B39367] text-neutral-900 font-extrabold text-[9px] px-1.5">نشط</Badge>}
            </h3>
            <p className="text-[10px] text-stone-400 mt-0.5">عند تفعيل وضع المصنع، يتم حجب أسعار العقود وهوامش الأرباح وجميع البيانات المالية عن الفنيين والعمال</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-stone-300">{isFactoryMode ? 'حجب المبيعات والماليات نشط' : 'إظهار البيانات المالية الكلية'}</span>
          <Switch 
            checked={isFactoryMode} 
            onCheckedChange={setIsFactoryMode}
            className="data-[state=checked]:bg-[#B39367]"
          />
        </div>
      </div>

      {/* Main layout split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: List of production cut lists & records */}
        <div className="space-y-6">
          
          {/* Active cut lists list */}
          <Card className="border border-stone-200 bg-white">
            <CardHeader>
              <CardTitle className="text-sm font-extrabold text-neutral-950 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#B39367]" />
                قوائم التقطيع النشطة للتنفيذ
              </CardTitle>
              <CardDescription className="text-[10px]">اختر قائمة تقطيع العميل لاستعراض المقاسات ورسم التوزيع</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              
              <Select value={selectedRecordId} onValueChange={setSelectedRecordId}>
                <SelectTrigger className="border-stone-300 text-xs font-semibold">
                  <SelectValue placeholder="اختر قائمة تفصيل" />
                </SelectTrigger>
                <SelectContent>
                  {defaultCuts.map(cut => (
                    <SelectItem key={cut.id} value={cut.id} className="text-xs font-bold">
                      {cut.projectName} - {cut.typeName.split(' ')[0]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {activeRecord && (
                <div className="p-3 bg-stone-50 border border-stone-200/80 rounded-lg text-xs leading-relaxed text-stone-600 font-semibold space-y-2">
                  <p><span className="text-stone-400">اسم العقد / المشروع:</span> <span className="text-neutral-900 font-bold">{activeRecord.projectName}</span></p>
                  <p><span className="text-stone-400">نوع الكابينة المفصلة:</span> {activeRecord.typeName}</p>
                  <p><span className="text-stone-400">المقاس الكلي المطلوب:</span> <span className="text-[#B39367]">{activeRecord.dimensions}</span></p>
                  <p><span className="text-stone-400">عدد القطع الإجمالية:</span> {activeRecord.piecesCount} قطع خشبية</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Slicing Actions & Exports */}
          <Card className="border border-stone-200 bg-white">
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-extrabold text-neutral-950 flex items-center gap-1">
                <Printer className="w-4 h-4 text-[#B39367]" />
                أوامر تصدير قوائم القص
              </CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleExportExcel}
                className="flex-1 border-stone-300 hover:bg-stone-50 text-xs font-bold gap-1.5"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                إكسيل Excel
              </Button>
              <Button 
                variant="outline" 
                onClick={handleExportPDF}
                className="flex-1 border-stone-300 hover:bg-stone-50 text-xs font-bold gap-1.5"
              >
                <FileDown className="w-4 h-4 text-[#B39367]" />
                تقرير PDF
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.print()}
                className="border-stone-300 hover:bg-stone-50 text-xs font-bold gap-1 h-9 px-3"
              >
                <Printer className="w-4 h-4 text-neutral-950" />
              </Button>
            </CardContent>
          </Card>

        </div>

        {/* Middle and Right columns: Nesting board graphics & tables */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Visual Sheet Nesting Canvas layout */}
          <Card className="border border-stone-200 bg-white">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <div>
                <CardTitle className="text-sm font-extrabold text-neutral-950 flex items-center gap-1.5">
                  <Scissors className="w-4.5 h-4.5 text-[#B39367]" />
                  مخطط قص الألواح ومعدل الهدر (Sheet Nesting)
                </CardTitle>
                <CardDescription className="text-[10px]">توزيع القطع على مقاس لوح خشب قياسي 1220×2440 ملم</CardDescription>
              </div>
              {optimizationResults && (
                <div className="flex gap-1.5">
                  <Badge className="bg-neutral-900 text-stone-100 font-extrabold text-[10px]">ألواح مطلوبة: {optimizationResults.totalSheets}</Badge>
                  <Badge className="bg-[#B39367] text-neutral-950 font-extrabold text-[10px]">نسبة الاستغلال: {optimizationResults.usedPercent}%</Badge>
                  <Badge variant="destructive" className="font-extrabold text-[10px]">نسبة الهدر: {optimizationResults.wastePercent}%</Badge>
                </div>
              )}
            </CardHeader>
            <CardContent className="pt-6 flex flex-col items-center justify-center">
              
              <div className="w-full flex justify-between text-[10px] text-stone-400 font-semibold mb-2">
                <span>معاينة لوح الخام رقم 1 (MDF / Melamine)</span>
                <span>المساحة المستغلة: {optimizationResults?.piecesArea} م² / {optimizationResults?.totalSheets && (optimizationResults.totalSheets * SHEET_AREA).toFixed(2)} م²</span>
              </div>
              
              {/* HTML5 Canvas Render */}
              <canvas 
                ref={canvasRef} 
                width={500} 
                height={290} 
                className="w-full max-w-[500px] border border-stone-200 rounded-lg shadow-inner bg-stone-50"
              />
            </CardContent>
          </Card>

          {/* Cut List page grid */}
          <Card className="border border-stone-200 bg-white">
            <CardHeader className="py-4 border-b">
              <CardTitle className="text-xs font-extrabold text-neutral-950 flex items-center gap-1">
                <Eye className="w-4 h-4 text-[#B39367]" />
                قائمة تفاصيل قطع العلبة (Cut List Specs)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-right text-xs font-semibold">
                <thead className="bg-stone-50 text-stone-500 border-b">
                  <tr>
                    <th className="p-3">اسم لوح التقطيع</th>
                    <th className="p-3">العرض (ملم)</th>
                    <th className="p-3">الارتفاع (ملم)</th>
                    <th className="p-3">الكمية المطلوبة</th>
                    <th className="p-3">خامة الألواح</th>
                    <th className="p-3">حالة القص والإنتاج</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-neutral-900">
                  {activeRecord?.pieces?.map((piece: any, idx: number) => (
                    <tr key={idx} className="hover:bg-stone-50/50">
                      <td className="p-3 font-bold text-neutral-950">{piece.name}</td>
                      <td className="p-3 font-bold text-neutral-950">{piece.width}</td>
                      <td className="p-3 font-bold text-neutral-950">{piece.height}</td>
                      <td className="p-3 text-amber-600 font-bold">× {piece.qty}</td>
                      <td className="p-3">
                        <Badge variant="outline" className="border-stone-200 text-stone-500 text-[10px]">{piece.material}</Badge>
                      </td>
                      <td className="p-3">
                        <Badge className="bg-stone-100 text-stone-600 border border-stone-300 text-[9px] font-bold">
                          انتظار لوح الخام
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

        </div>

      </div>

      {/* Production Projects Overview in Factory Mode */}
      <Card className="border border-stone-200 bg-white">
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-sm font-extrabold text-neutral-950 flex items-center gap-1.5">
            <Hammer className="w-5 h-5 text-[#B39367]" />
            متابعة مراحل التصنيع بالورشة (Production Floor)
          </CardTitle>
          <CardDescription className="text-[10px]">استعراض حالة المشاريع الحالية لعمال الفنيين بالمعمل</CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-stone-50 text-stone-500 border-b border-stone-200">
              <tr>
                <th className="p-4 font-bold">كود المشروع</th>
                <th className="p-4 font-bold">اسم الوحدة</th>
                <th className="p-4 font-bold">حالة التصنيع الحالية</th>
                <th className="p-4 font-bold">تاريخ التسليم المتوقع</th>
                {!isFactoryMode && <th className="p-4 font-bold">القيمة المالية للعقد</th>}
                <th className="p-4 font-bold text-center">أوامر التحديث</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 font-semibold text-neutral-900">
              {activeProjectsToFactory.length === 0 ? (
                <tr>
                  <td colSpan={isFactoryMode ? 5 : 6} className="text-center p-8 text-stone-400">لا يوجد مشاريع بالورشة حالياً</td>
                </tr>
              ) : (
                activeProjectsToFactory.map(p => (
                  <tr key={p.id} className="hover:bg-stone-50/50">
                    <td className="p-4 font-black text-neutral-950">{p.projectCode || `TKL-2026-${p.id.slice(-4)}`}</td>
                    <td className="p-4 text-neutral-800 font-bold">{p.customerName} - {p.projectType === 'kitchen' ? 'مطبخ كامل' : 'تصنيع خاص'}</td>
                    <td className="p-4">
                      <Badge className={`text-[10px] font-bold ${
                        p.status === 'production' 
                          ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                          : p.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-stone-100 text-stone-600'
                      }`}>
                        {p.status === 'production' ? 'قيد تقطيع الألواح بالورشة' : p.status === 'installation' ? 'خارج للموقع للتركيب' : p.status === 'design' ? 'معتمد بقسم التصميم' : p.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-stone-500">{p.deliveryDate ? formatDate(p.deliveryDate) : '-'}</td>
                    {!isFactoryMode && <td className="p-4 text-[#B39367] font-black">{parseFloat(p.totalPrice || 0).toLocaleString()} ج.م</td>}
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-[#B39367] text-[10px] font-bold"
                          onClick={() => {
                            if (updateProjectStatus) {
                              updateProjectStatus(p.id, 'production');
                              alert('تم نقل المشروع إلى مرحلة الإنتاج والتقطيع بالورشة');
                            }
                          }}
                        >
                          تأكيد بدء القص
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-emerald-600 text-[10px] font-bold"
                          onClick={() => {
                            if (updateProjectStatus) {
                              updateProjectStatus(p.id, 'installation');
                              alert('تم تجهيز القطع ونقل المشروع لقسم التركيبات');
                            }
                          }}
                        >
                          شحن للتركيب
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

    </div>
  );
}
