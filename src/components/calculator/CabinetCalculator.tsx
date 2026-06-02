import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calculator, 
  Ruler, 
  Layers, 
  Maximize2
} from 'lucide-react';

interface CabinetCalculatorProps {
  onSaveCutList?: (cutList: any) => void;
  projects?: any[];
}

const CABINET_TYPES = [
  { value: 'base', label: 'خزانة سفلية (Base Cabinet)' },
  { value: 'wall', label: 'خزانة علوية معلقة (Wall Cabinet)' },
  { value: 'tall', label: 'خزانة طولية راسية (Tall Unit)' },
  { value: 'sink', label: 'خزانة حوض المطبخ (Sink Unit)' },
  { value: 'drawer', label: 'وحدة أدراج (Drawer Unit)' },
  { value: 'corner', label: 'خزانة زاوية (Corner Unit)' }
];

export function CabinetCalculator({ onSaveCutList, projects = [] }: CabinetCalculatorProps) {
  // Calculator Inputs
  const [cabinetType, setCabinetType] = useState<string>('base');
  const [width, setWidth] = useState<number>(800);
  const [depth, setDepth] = useState<number>(600);
  const [height, setHeight] = useState<number>(780);
  const [thickness, setThickness] = useState<number>(18);
  const [shelves, setShelves] = useState<number>(1);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  
  // Custom cutting presets list
  const [savedCuts, setSavedCuts] = useState<any[]>([]);

  // Sizing Engine
  const cutList = useMemo(() => {
    const w = width;
    const d = depth;
    const h = height;
    const t = thickness;
    const s = shelves;

    const innerWidth = w - (2 * t);
    const innerDepth = d - (2 * t); // Bottom plate depth

    const pieces: Array<{
      name: string;
      width: number;
      height: number;
      qty: number;
      area: number;
      material: string;
      description: string;
    }> = [];

    // Rule 1: Side Panels: Height x Depth, Qty = 2
    pieces.push({
      name: 'قواطع جانبية (Side Panels)',
      width: d,
      height: h,
      qty: 2,
      area: (d * h * 2) / 1000000,
      material: 'MDF Melamine 18mm',
      description: 'قطع الجوانب الرأسية لتثبيت الهيكل'
    });

    // Rule 2: Bottom Panel: (Width - 2*Thickness) x (Depth - 2*Thickness) [or Depth if no back overlay]
    // We strictly use: (Width - 2 * Thickness) x (Depth - 2 * Thickness) as per target rules
    pieces.push({
      name: 'قاعدة سفلية (Bottom Panel)',
      width: innerDepth,
      height: innerWidth,
      qty: 1,
      area: (innerWidth * innerDepth) / 1000000,
      material: 'MDF Melamine 18mm',
      description: 'اللوح السفلي الأفقي للعلبة'
    });

    // Rule 3 & 4: Back Rail and Front Rail
    // Back Rail: (Width - 2*Thickness) x 100 mm
    // Front Rail: (Width - 2*Thickness) x 100 mm
    pieces.push({
      name: 'عارضة أمامية (Front Rail)',
      width: 100,
      height: innerWidth,
      qty: 1,
      area: (innerWidth * 100) / 1000000,
      material: 'MDF Melamine 18mm',
      description: 'دعامة الربط الأمامية العلوية'
    });

    pieces.push({
      name: 'عارضة خلفية (Back Rail)',
      width: 100,
      height: innerWidth,
      qty: 1,
      area: (innerWidth * 100) / 1000000,
      material: 'MDF Melamine 18mm',
      description: 'دعامة التثبيت الخلفية لتعليق وضبط العلبة'
    });

    // Rule 5: Shelf: (Width - 2*Thickness) x (Depth - 2*Thickness) [usually smaller depth, but rules match bottom]
    if (s > 0) {
      pieces.push({
        name: 'أرفف داخلية (Shelves)',
        width: innerDepth,
        height: innerWidth,
        qty: s,
        area: (innerWidth * innerDepth * s) / 1000000,
        material: 'MDF Melamine 18mm',
        description: 'الأرفف الداخلية القابلة للحركة والضبط'
      });
    }

    // Additional cabinet type custom pieces
    if (cabinetType === 'tall') {
      // Add top cap
      pieces.push({
        name: 'غطاء علوي (Top Cap)',
        width: d,
        height: innerWidth,
        qty: 1,
        area: (innerWidth * d) / 1000000,
        material: 'MDF Melamine 18mm',
        description: 'سقف الخزانة الطولية'
      });
    }

    return pieces;
  }, [cabinetType, width, depth, height, thickness, shelves]);

  // Aggregate stats
  const aggregateStats = useMemo(() => {
    const totalPieces = cutList.reduce((sum, item) => sum + item.qty, 0);
    const totalArea = cutList.reduce((sum, item) => sum + item.area, 0);
    return {
      totalPieces,
      totalArea: parseFloat(totalArea.toFixed(3))
    };
  }, [cutList]);

  // Save cut presets to local storage
  const handleSaveCut = () => {
    const cutRecord = {
      id: Date.now().toString(),
      projectId: selectedProjectId,
      projectName: projects.find(p => p.id === selectedProjectId)?.customerName || 'عام / بدون مشروع',
      cabinetType,
      typeName: CABINET_TYPES.find(c => c.value === cabinetType)?.label || cabinetType,
      dimensions: `${width}W × ${depth}D × ${height}H - ${thickness}mm`,
      piecesCount: aggregateStats.totalPieces,
      totalArea: aggregateStats.totalArea,
      pieces: cutList
    };

    setSavedCuts([cutRecord, ...savedCuts]);
    if (onSaveCutList) {
      onSaveCutList(cutRecord);
    }
  };

  // Quick Preset Loader (Width = 800, Depth = 600, Height = 780, Thickness = 18)
  const loadDefaultPreset = () => {
    setWidth(800);
    setDepth(600);
    setHeight(780);
    setThickness(18);
    setShelves(1);
    setCabinetType('base');
  };

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* Top Welcome Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <h2 className="text-2xl font-black text-neutral-900 flex items-center gap-2">
            حاسبة مقاسات وتفصيل الوحدات (Cabinet Calculator)
            <Calculator className="w-5.5 h-5.5 text-[#B39367]" />
          </h2>
          <p className="text-xs text-stone-500 mt-1 font-semibold">توليد تفصيلي لألواح الميلامين والخشب وقوائم التقطيع الدقيقة للورشة والمصنع</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            className="border-stone-300 font-bold text-xs"
            onClick={loadDefaultPreset}
          >
            تحميل مثال مقاس (800×600×780)
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Input Form */}
        <Card className="border border-stone-200 bg-white">
          <CardHeader>
            <CardTitle className="text-sm font-extrabold text-neutral-950 flex items-center gap-1.5">
              <Ruler className="w-4 h-4 text-[#B39367]" />
              مدخلات أبعاد وحدة المطبخ
            </CardTitle>
            <CardDescription className="text-[10px]">ادخل المقاسات الكلية للهيكل الخارجي للعلبة</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs font-bold text-neutral-800">
            
            <div className="space-y-1.5">
              <Label>نوع الوحدة / الكابينة</Label>
              <Select value={cabinetType} onValueChange={setCabinetType}>
                <SelectTrigger className="border-stone-300 text-xs font-semibold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CABINET_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value} className="text-xs font-bold">{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>العرض الكلي (Width) ملم</Label>
                <Input 
                  type="number" 
                  value={width} 
                  onChange={(e) => setWidth(Math.max(100, parseInt(e.target.value) || 0))}
                  className="border-stone-300 text-xs" 
                />
              </div>
              <div className="space-y-1.5">
                <Label>العمق الكلي (Depth) ملم</Label>
                <Input 
                  type="number" 
                  value={depth} 
                  onChange={(e) => setDepth(Math.max(100, parseInt(e.target.value) || 0))}
                  className="border-stone-300 text-xs" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>الارتفاع الكلي (Height) ملم</Label>
                <Input 
                  type="number" 
                  value={height} 
                  onChange={(e) => setHeight(Math.max(100, parseInt(e.target.value) || 0))}
                  className="border-stone-300 text-xs" 
                />
              </div>
              <div className="space-y-1.5">
                <Label>سمك لوح الخشب (Thickness)</Label>
                <Select value={thickness.toString()} onValueChange={(val) => setThickness(parseInt(val))}>
                  <SelectTrigger className="border-stone-300 text-xs font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="16" className="text-xs font-bold">16 ملم</SelectItem>
                    <SelectItem value="18" className="text-xs font-bold">18 ملم (الافتراضي)</SelectItem>
                    <SelectItem value="22" className="text-xs font-bold">22 ملم</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>عدد الأرفف الداخلية</Label>
                <Input 
                  type="number" 
                  min="0"
                  max="10"
                  value={shelves} 
                  onChange={(e) => setShelves(Math.max(0, parseInt(e.target.value) || 0))}
                  className="border-stone-300 text-xs" 
                />
              </div>
              
              <div className="space-y-1.5">
                <Label>ارتباط بمشروع التنفيذ</Label>
                <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                  <SelectTrigger className="border-stone-300 text-xs font-semibold">
                    <SelectValue placeholder="اختياري: ربط بمشروع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" className="text-xs font-bold">بدون مشروع (تفصيل عام)</SelectItem>
                    {projects.map(p => (
                      <SelectItem key={p.id} value={p.id} className="text-xs font-bold">{p.customerName || p.projectCode}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              className="w-full bg-neutral-950 text-white font-bold hover:bg-[#B39367] hover:text-neutral-950 transition-all text-xs py-5 mt-2"
              onClick={handleSaveCut}
            >
              حفظ وتثبيت قائمة التقطيع الحالية
            </Button>
          </CardContent>
        </Card>

        {/* Right Side: Graphic Visual Scheme & Generated Table */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Cabinet Visual Representation Scheme */}
          <Card className="border border-stone-200 bg-white">
            <CardHeader className="py-4">
              <CardTitle className="text-xs font-extrabold text-neutral-950 flex items-center gap-1">
                <Maximize2 className="w-4 h-4 text-[#B39367]" />
                مخطط الهيكل الهندسي ثنائي الأبعاد
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center p-4 bg-stone-50 border-t border-stone-100 h-52">
              {/* Dynamic SVG layout schema drawing the front view with cabinet dimensions */}
              <svg className="w-72 h-44" viewBox="0 0 300 200">
                {/* Side Left Panel */}
                <rect x="30" y="20" width="15" height="150" fill="#222" rx="2" />
                {/* Side Right Panel */}
                <rect x="255" y="20" width="15" height="150" fill="#222" rx="2" />
                {/* Bottom Panel */}
                <rect x="45" y="152" width="210" height="15" fill="#B39367" rx="1" />
                {/* Front top rail */}
                <rect x="45" y="23" width="210" height="10" fill="#B39367" rx="1" />
                
                {/* Shelves inside cabinet */}
                {Array.from({ length: Math.min(3, shelves) }).map((_, idx) => (
                  <rect key={idx} x="45" y={60 + idx * 30} width="210" height="8" fill="#D4C5B9" rx="1" />
                ))}

                {/* Dimension Annotations */}
                {/* Width dimension indicator */}
                <line x1="30" y1="185" x2="270" y2="185" stroke="#B39367" strokeWidth="2" strokeDasharray="3,3" />
                <text x="150" y="196" fill="#222" fontSize="10" fontWeight="bold" textAnchor="middle">W = {width} mm</text>
                
                {/* Height indicator */}
                <line x1="15" y1="20" x2="15" y2="170" stroke="#B39367" strokeWidth="2" strokeDasharray="3,3" />
                <text x="10" y="95" fill="#222" fontSize="10" fontWeight="bold" textAnchor="middle" transform="rotate(-90 10 95)">H = {height} mm</text>

                {/* Depth annotation */}
                <text x="150" y="12" fill="#B39367" fontSize="9" fontWeight="bold" textAnchor="middle">سمك اللوح الأساسي (Thickness) = {thickness} ملم</text>
                <text x="150" y="105" fill="#888" fontSize="10" fontWeight="bold" textAnchor="middle">علبة عمق D = {depth} ملم</text>
              </svg>
            </CardContent>
          </Card>

          {/* Piece List Table */}
          <Card className="border border-stone-200 bg-white">
            <CardHeader className="py-4 border-b border-stone-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-extrabold text-neutral-950 flex items-center gap-1">
                  <Layers className="w-4 h-4 text-[#B39367]" />
                  جدول قطع التفصيل وجدول الأبعاد
                </CardTitle>
                <CardDescription className="text-[10px]">حساب تلقائي وفوري لمقاسات القص المنفردة</CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge className="bg-[#B39367] text-neutral-950 font-bold px-2 py-0.5">قطع: {aggregateStats.totalPieces}</Badge>
                <Badge variant="outline" className="border-stone-300 text-stone-600 font-bold px-2 py-0.5">المساحة: {aggregateStats.totalArea} م²</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-right text-xs font-semibold">
                <thead className="bg-stone-50 text-stone-500 border-b">
                  <tr>
                    <th className="p-3">اسم القطعة</th>
                    <th className="p-3">العرض (ملم)</th>
                    <th className="p-3">الارتفاع (ملم)</th>
                    <th className="p-3">الكمية</th>
                    <th className="p-3">المساحة</th>
                    <th className="p-3">الخامة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-neutral-900">
                  {cutList.map((piece, idx) => (
                    <tr key={idx} className="hover:bg-stone-50/50">
                      <td className="p-3 font-bold text-neutral-950">{piece.name}</td>
                      <td className="p-3 font-bold text-neutral-950">{piece.width}</td>
                      <td className="p-3 font-bold text-neutral-950">{piece.height}</td>
                      <td className="p-3 text-amber-600 font-bold">× {piece.qty}</td>
                      <td className="p-3 text-stone-500">{piece.area.toFixed(3)} م²</td>
                      <td className="p-3">
                        <Badge variant="outline" className="text-[9px] border-stone-200 text-stone-500">{piece.material}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

        </div>

      </div>

    </div>
  );
}
