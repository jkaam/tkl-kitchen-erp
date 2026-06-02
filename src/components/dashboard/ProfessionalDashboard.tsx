import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Briefcase, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  ChevronRight,
  Hammer,
  ClipboardCheck,
  Sparkles
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CRM_PIPELINE_STAGES } from '@/lib/crmPipeline';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
} from 'recharts';

interface ProfessionalDashboardProps {
  customers: any[];
  projects: any[];
  products: any[];
  expenses: any[];
  appointments: any[];
  leads: any[];
  installations: any[];
  onNavigate: (page: string) => void;
}

export function ProfessionalDashboard({ 
  projects, 
  expenses, 
  leads = [],
  installations = [],
  onNavigate 
}: ProfessionalDashboardProps) {
  
  // Executive Financial & Pipeline Calculations
  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Revenue & Costs
    const totalRevenue = projects.reduce((sum, p) => sum + (p.totalPrice || 0), 0);
    const totalCollected = projects.reduce((sum, p) => sum + (p.paidAmount || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const monthlyRevenue = projects
      .filter(p => {
        const d = new Date(p.createdAt);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, p) => sum + (p.totalPrice || 0), 0);

    const monthlyExpenses = expenses
      .filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, e) => sum + (e.amount || 0), 0);

    const monthlyProfit = monthlyRevenue - monthlyExpenses;
    
    // CRM Funnel stages counts
    const activeProjects = projects.filter(p => !['delivered', 'cancelled'].includes(p.status));
    const inProduction = projects.filter(p => p.status === 'manufacturing').length;
    const activeInstallations = installations.filter(i => i.status !== 'completed').length;
    
    return {
      totalLeads: leads.length,
      activeProjectsCount: activeProjects.length,
      inProductionCount: inProduction,
      installationsCount: activeInstallations,
      monthlyRevenue,
      monthlyProfit,
      totalRevenue,
      totalExpenses,
      netProfit: totalCollected - totalExpenses
    };
  }, [projects, expenses, leads, installations]);

  // Chart Data: Revenue vs Expenses Trends
  const financialTrendData = useMemo(() => {
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    const currentYear = new Date().getFullYear();
    
    return months.map((mName, index) => {
      const monthIncome = projects
        .filter(p => {
          const d = new Date(p.createdAt);
          return d.getMonth() === index && d.getFullYear() === currentYear;
        })
        .reduce((sum, p) => sum + (p.totalPrice || 0), 0);

      const monthOutgoings = expenses
        .filter(e => {
          const d = new Date(e.date);
          return d.getMonth() === index && d.getFullYear() === currentYear;
        })
        .reduce((sum, e) => sum + (e.amount || 0), 0);

      return {
        name: mName,
        revenue: monthIncome,
        expenses: monthOutgoings,
        profit: monthIncome - monthOutgoings
      };
    }).slice(0, new Date().getMonth() + 1); // Only show months up to current
  }, [projects, expenses]);

  // Chart Data: Production Status counts
  const productionStatusData = useMemo(() => {
    const statuses = [
      { name: 'تصميم', key: 'designing', color: '#B39367' }, // Bronze
      { name: 'مقاسات', key: 'measuring', color: '#D4C5B9' }, // Light Beige
      { name: 'تصنيع', key: 'manufacturing', color: '#1A1A1A' }, // Matte Black / Dark Grey
      { name: 'جاهز للتسليم', key: 'ready', color: '#8FBC8F' }, 
      { name: 'تركيب', key: 'delivered', color: '#A98C64' }
    ];

    return statuses.map(st => {
      const count = projects.filter(p => p.status === st.key).length;
      return {
        name: st.name,
        value: count || 0,
        color: st.color
      };
    }).filter(item => item.value > 0);
  }, [projects]);

  // Chart Data: Lead Stages (CRM Pipeline conversion) — aligned with CRM stages
  const funnelData = useMemo(() => {
    const counts = CRM_PIPELINE_STAGES.map((st) => ({
      id: st.id,
      label: st.label,
      shortLabel: st.shortLabel,
      count: leads.filter((l) => l.stage === st.id).length,
    }));
    const maxCount = Math.max(...counts.map((c) => c.count), 1);
    return counts.map((c) => ({
      ...c,
      barWidth: c.count > 0 ? Math.max((c.count / maxCount) * 100, 12) : 0,
    }));
  }, [leads]);

  const funnelTotal = useMemo(
    () => funnelData.reduce((sum, s) => sum + s.count, 0),
    [funnelData]
  );

  // Recent Activities Feed (mock log for executive feel)
  const recentActivities = useMemo(() => {
    const logs: any[] = [];
    const now = new Date();
    
    // Pull from projects
    projects.forEach(p => {
      logs.push({
        id: `p-${p.id}`,
        title: `تم إنشاء مشروع جديد للعميل ${p.customerName || 'مجهول'}`,
        time: new Date(p.createdAt),
        badge: 'مشروع',
        color: 'bg-amber-600 text-white'
      });
      if (p.status === 'manufacturing') {
        logs.push({
          id: `p-prod-${p.id}`,
          title: `المشروع ${p.customerName} دخل مرحلة التصنيع بالورشة`,
          time: new Date(p.updatedAt || p.createdAt),
          badge: 'إنتاج',
          color: 'bg-neutral-900 text-[#c5a880]'
        });
      }
    });

    // Pull from CRM
    leads.forEach(l => {
      logs.push({
        id: `l-${l.id}`,
        title: `تم تسجيل مهتم جديد: ${l.name} من ${l.source === 'instagram' ? 'إنستجرام' : 'فيسبوك'}`,
        time: new Date(l.createdAt),
        badge: 'عميل محتمل',
        color: 'bg-stone-300 text-stone-900'
      });
    });

    // Pull from installations
    installations.forEach(inst => {
      logs.push({
        id: `i-${inst.id}`,
        title: `جدولة تركيب مطبخ للعميل بقسم التركيبات - فريق ${inst.team}`,
        time: new Date(inst.createdAt || now.toISOString()),
        badge: 'تركيب',
        color: 'bg-[#B39367] text-white'
      });
    });

    // Sort by time desc
    return logs
      .sort((a, b) => b.time.getTime() - a.time.getTime())
      .slice(0, 6);
  }, [projects, leads, installations]);

  return (
    <div className="space-y-8" dir="rtl">
      
      {/* Premium Executive Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-neutral-950 flex items-center gap-2">
            لوحة الإشراف التنفيذية
            <Sparkles className="w-6 h-6 text-[#B39367]" />
          </h2>
          <p className="text-sm text-stone-500 mt-1 font-medium">TKL – The Kitchen LAB | منصة إدارة المبيعات وتدفقات التصنيع والتركيبات الفاخرة</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-3 py-1.5 bg-white shadow-xs border-stone-300 text-stone-700 text-xs font-semibold">
            السنة المالية: {new Date().getFullYear()}
          </Badge>
          <Button 
            className="bg-neutral-900 hover:bg-[#A98C64] text-white hover:text-neutral-950 transition-all shadow-md font-bold px-4 py-2 text-xs flex items-center gap-1.5"
            onClick={() => onNavigate('projects')}
          >
            إضافة مشروع جديد
            <ChevronRight className="w-4 h-4 rotate-180" />
          </Button>
        </div>
      </div>

      {/* KPI Cards Section */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        
        {/* KPI 1: Total Leads */}
        <Card className="border border-stone-200 bg-white hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-stone-50 rounded-full translate-x-8 -translate-y-8 group-hover:scale-125 transition-transform duration-300 z-0"></div>
          <CardContent className="p-5 relative z-10 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-500">إجمالي المهتمين</span>
              <Users className="w-5 h-5 text-[#B39367]" />
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-black text-neutral-900">{stats.totalLeads}</h3>
              <p className="text-[10px] text-stone-400 mt-1 font-semibold">من قنوات التسويق المختلفة</p>
            </div>
          </CardContent>
        </Card>

        {/* KPI 2: Active Projects */}
        <Card className="border border-stone-200 bg-white hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-stone-50 rounded-full translate-x-8 -translate-y-8 group-hover:scale-125 transition-transform duration-300 z-0"></div>
          <CardContent className="p-5 relative z-10 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-500">المشاريع النشطة</span>
              <Briefcase className="w-5 h-5 text-neutral-900" />
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-black text-neutral-900">{stats.activeProjectsCount}</h3>
              <p className="text-[10px] text-stone-400 mt-1 font-semibold">تصميم، قياس، وتوريد</p>
            </div>
          </CardContent>
        </Card>

        {/* KPI 3: Projects in Production */}
        <Card className="border border-stone-200 bg-white hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-stone-50 rounded-full translate-x-8 -translate-y-8 group-hover:scale-125 transition-transform duration-300 z-0"></div>
          <CardContent className="p-5 relative z-10 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-500">قيد التصنيع</span>
              <Hammer className="w-5 h-5 text-[#B39367]" />
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-black text-[#B39367]">{stats.inProductionCount}</h3>
              <p className="text-[10px] text-stone-400 mt-1 font-semibold">على خطوط إنتاج الورشة</p>
            </div>
          </CardContent>
        </Card>

        {/* KPI 4: Installations Scheduled */}
        <Card className="border border-stone-200 bg-white hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-stone-50 rounded-full translate-x-8 -translate-y-8 group-hover:scale-125 transition-transform duration-300 z-0"></div>
          <CardContent className="p-5 relative z-10 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-500">التركيبات المجدولة</span>
              <Calendar className="w-5 h-5 text-neutral-950" />
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-black text-neutral-900">{stats.installationsCount}</h3>
              <p className="text-[10px] text-stone-400 mt-1 font-semibold">مواقع قيد التنفيذ والتشطيب</p>
            </div>
          </CardContent>
        </Card>

        {/* KPI 5: Monthly Revenue */}
        <Card className="border border-stone-200 bg-white hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-stone-50 rounded-full translate-x-8 -translate-y-8 group-hover:scale-125 transition-transform duration-300 z-0"></div>
          <CardContent className="p-5 relative z-10 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-500">مبيعات الشهر</span>
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-black text-neutral-900 truncate">{formatCurrency(stats.monthlyRevenue)}</h3>
              <p className="text-[10px] text-emerald-600 mt-1 font-semibold flex items-center gap-0.5">
                مشاريع الشهر الحالي
              </p>
            </div>
          </CardContent>
        </Card>

        {/* KPI 6: Monthly Profit */}
        <Card className="border border-stone-200 bg-white hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-stone-50 rounded-full translate-x-8 -translate-y-8 group-hover:scale-125 transition-transform duration-300 z-0"></div>
          <CardContent className="p-5 relative z-10 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-500">أرباح الشهر</span>
              <DollarSign className="w-5 h-5 text-[#B39367]" />
            </div>
            <div className="mt-4">
              <h3 className={`text-lg font-black truncate ${stats.monthlyProfit >= 0 ? 'text-[#B39367]' : 'text-rose-600'}`}>
                {formatCurrency(stats.monthlyProfit)}
              </h3>
              <p className="text-[10px] text-stone-400 mt-1 font-semibold">المبيعات مخصوماً منها التكاليف</p>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Chart Card */}
        <Card className="lg:col-span-2 border border-stone-200 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-md font-bold text-neutral-950 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#B39367]" />
              مقارنة الإيرادات بالمصاريف التشغيلية
            </CardTitle>
            <CardDescription className="text-xs">المبيعات المحققة مقابل تكاليف الخامات والأجور والمصاريف للشهر الحالي</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {financialTrendData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-stone-400 text-sm">لا تتوفر بيانات مالية حالياً</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={financialTrendData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#B39367" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#B39367" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1A1A1A" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#1A1A1A" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    fontSize={10}
                    stroke="#888888"
                    interval={0}
                    angle={-35}
                    textAnchor="end"
                    height={56}
                    tickMargin={8}
                  />
                  <YAxis fontSize={10} stroke="#888888" width={48} tickFormatter={(v) => `${v}`} />
                  <Tooltip formatter={(value) => `${parseFloat(value as string).toLocaleString()} ج.م`} />
                  <Area type="monotone" name="الإيرادات" dataKey="revenue" stroke="#B39367" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  <Area type="monotone" name="المصروفات" dataKey="expenses" stroke="#1A1A1A" strokeWidth={2} fillOpacity={1} fill="url(#colorExpenses)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Production Status Chart */}
        <Card className="border border-stone-200 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-md font-bold text-neutral-950 flex items-center gap-2">
              <Hammer className="w-5 h-5 text-neutral-900" />
              حالة مشاريع الإنتاج
            </CardTitle>
            <CardDescription className="text-xs">توزيع المشاريع النشطة طبقاً لمرحلة التصنيع والتركيب</CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex flex-col justify-between">
            {productionStatusData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-stone-400 text-sm">لا توجد مشاريع نشطة قيد التتبع</div>
            ) : (
              <div className="h-48 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={productionStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {productionStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-neutral-900">{projects.length}</span>
                  <span className="text-[10px] text-stone-400 font-bold">إجمالي المشاريع</span>
                </div>
              </div>
            )}
            
            {/* Status Legend */}
            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-stone-100">
              {productionStatusData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2 text-xs font-semibold text-stone-600">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: entry.color }}></span>
                  <span className="truncate">{entry.name}</span>
                  <span className="text-stone-400 mr-auto">({entry.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Sub charts & tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sales Funnel Card */}
        <Card className="border border-stone-200 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-md font-bold text-neutral-950 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#B39367]" />
              قمع تحويل العملاء (Sales Funnel)
            </CardTitle>
            <CardDescription className="text-xs">توزيع العملاء المهتمين على مراحل المبيعات والتعاقد</CardDescription>
          </CardHeader>
          <CardContent className="min-h-[22rem] py-2">
            {leads.length === 0 ? (
              <div className="h-52 flex items-center justify-center text-stone-400 text-sm">لا توجد بيانات قمع مبيعات</div>
            ) : (
              <div className="space-y-2.5">
                <p className="text-[10px] font-bold text-stone-500 text-left">
                  إجمالي العملاء في القمع: <span className="text-neutral-900">{funnelTotal}</span>
                </p>
                <div className="space-y-2 max-h-[19rem] overflow-y-auto pr-1 scrollbar-thin">
                  {funnelData.map((stage, index) => (
                    <div key={stage.id} className="flex items-center gap-2.5 min-h-[2rem]">
                      <div
                        className="w-[5.5rem] shrink-0 text-[10px] font-bold text-stone-600 leading-snug text-right break-words"
                        title={stage.label}
                      >
                        {stage.shortLabel}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="h-7 bg-stone-100 rounded-md overflow-hidden border border-stone-100">
                          <div
                            className="h-full rounded-md flex items-center justify-end px-2 transition-all duration-300"
                            style={{
                              width: `${stage.barWidth}%`,
                              backgroundColor: index % 2 === 0 ? '#B39367' : '#1A1A1A',
                            }}
                          >
                            {stage.count > 0 && (
                              <span className="text-[10px] font-black text-white tabular-nums">
                                {stage.count}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activities Feed */}
        <Card className="border border-stone-200 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-md font-bold text-neutral-950 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-neutral-900" />
              سجل الحركة والأنشطة الأخير
            </CardTitle>
            <CardDescription className="text-xs">مراقبة التحديثات اللحظية للمبيعات والمصانع وعمليات التشغيل</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivities.length === 0 ? (
              <div className="py-8 text-center text-stone-400 text-xs">لا يوجد نشاط مسجل مؤخراً</div>
            ) : (
              <div className="space-y-4">
                {recentActivities.map((act) => (
                  <div key={act.id} className="flex gap-3 text-xs leading-relaxed border-b border-stone-50 pb-2">
                    <Badge className={`h-fit text-[9px] font-bold px-1.5 ${act.color}`}>
                      {act.badge}
                    </Badge>
                    <div className="flex-1">
                      <p className="font-semibold text-neutral-900">{act.title}</p>
                      <p className="text-[10px] text-stone-400 mt-0.5">{formatDate(act.time.toISOString())}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Installations Card */}
        <Card className="border border-stone-200 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-md font-bold text-neutral-950 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#B39367]" />
                أعمال التركيبات القادمة
              </CardTitle>
              <CardDescription className="text-xs">المواقع المجدولة للتركيب وتسليم المفتاح</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('installations')} className="text-xs font-bold text-[#B39367] hover:text-neutral-950 p-0 h-auto">
              إدارة الكل
            </Button>
          </CardHeader>
          <CardContent>
            {installations.filter(i => i.status === 'scheduled').length === 0 ? (
              <div className="py-12 text-center text-stone-400 text-xs">لا توجد عمليات تركيب مجدولة قريباً</div>
            ) : (
              <div className="space-y-3">
                {installations
                  .filter(i => i.status === 'scheduled')
                  .slice(0, 4)
                  .map((inst) => (
                    <div key={inst.id} className="p-3 bg-stone-50 border border-stone-100 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-bold text-xs text-neutral-900">{inst.clientName}</p>
                        <p className="text-[10px] text-stone-500 mt-1">تاريخ التركيب: {formatDate(inst.date)}</p>
                      </div>
                      <Badge className="bg-neutral-900 text-stone-100 border border-stone-800 text-[10px] font-bold">
                        فريق: {inst.team}
                      </Badge>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
      
    </div>
  );
}
