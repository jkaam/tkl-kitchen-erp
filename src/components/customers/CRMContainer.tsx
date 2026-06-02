import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Phone, 
  Share2, 
  Search,
  ExternalLink
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

// Stages definition
const PIPELINE_STAGES = [
  { id: 'new', label: 'مهتم جديد', color: 'border-r-4 border-r-blue-400 bg-blue-50/20' },
  { id: 'visit', label: 'رفع مقاسات الموقع', color: 'border-r-4 border-r-indigo-400 bg-indigo-50/20' },
  { id: 'design', label: 'مرحلة التصميم', color: 'border-r-4 border-r-[#B39367] bg-[#B39367]/10' },
  { id: 'quotation', label: 'تقديم العرض المالي', color: 'border-r-4 border-r-amber-500 bg-amber-50/20' },
  { id: 'negotiation', label: 'مفاوضات ومراجعة', color: 'border-r-4 border-r-orange-400 bg-orange-50/20' },
  { id: 'contract', label: 'توقيع العقد الرسمي', color: 'border-r-4 border-r-emerald-500 bg-emerald-50/20' },
  { id: 'production', label: 'التصنيع والورشة', color: 'border-r-4 border-r-purple-500 bg-purple-50/20' },
  { id: 'installation', label: 'التركيب بالموقع', color: 'border-r-4 border-r-sky-500 bg-sky-50/20' },
  { id: 'completed', label: 'تم التسليم والتشغيل', color: 'border-r-4 border-r-teal-600 bg-teal-50/20' },
];

const SOURCES = [
  { id: 'facebook', label: 'فيسبوك' },
  { id: 'instagram', label: 'إنستجرام' },
  { id: 'tiktok', label: 'تيك توك' },
  { id: 'referral', label: 'ترشيح عميل سابق' },
  { id: 'walk_in', label: 'زيارة المعرض' }
];

interface CRMContainerProps {
  leads: any[];
  addLead: (lead: any) => any;
  updateLead: (id: string, updates: any) => void;
  deleteLead: (id: string) => void;
  addTimelineItem: (leadId: string, item: any) => void;
}

export function CRMContainer({
  leads = [],
  addLead,
  updateLead,
  deleteLead,
  addTimelineItem
}: CRMContainerProps) {
  const [activeTab, setActiveTab] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // New Lead state
  const [newLeadForm, setNewLeadForm] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    address: '',
    source: 'instagram',
    stage: 'new',
  });

  // Timeline form state
  const [timelineType, setTimelineType] = useState<'call' | 'meeting' | 'note' | 'quote' | 'contract'>('note');
  const [timelineText, setTimelineText] = useState('');

  // Drag state
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter(l => 
      l.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.phone?.includes(searchQuery)
    );
  }, [leads, searchQuery]);

  // Lead sourcing calculations
  const sourceStats = useMemo(() => {
    const stats: { [key: string]: number } = {};
    leads.forEach(l => {
      stats[l.source] = (stats[l.source] || 0) + 1;
    });
    return stats;
  }, [leads]);

  // Kanban groups
  const kanbanGroups = useMemo(() => {
    const groups: { [key: string]: any[] } = {};
    PIPELINE_STAGES.forEach(s => {
      groups[s.id] = [];
    });
    filteredLeads.forEach(l => {
      if (groups[l.stage]) {
        groups[l.stage].push(l);
      } else {
        // Safe fallback
        groups['new'] = groups['new'] || [];
        groups['new'].push(l);
      }
    });
    return groups;
  }, [filteredLeads]);

  // Create Lead
  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadForm.name || !newLeadForm.phone) return;
    
    // Automatically construct whatsapp code if not full link
    let formattedWA = newLeadForm.whatsapp;
    if (formattedWA && !formattedWA.startsWith('http')) {
      // Remove symbols
      const digits = formattedWA.replace(/\D/g, '');
      formattedWA = digits.startsWith('2') ? digits : '2' + digits;
    } else if (!formattedWA) {
      const digits = newLeadForm.phone.replace(/\D/g, '');
      formattedWA = digits.startsWith('2') ? digits : '2' + digits;
    }

    addLead({
      ...newLeadForm,
      whatsapp: formattedWA,
      timeline: [
        {
          id: 'time-init',
          type: 'note',
          text: `تم تسجيل العميل بنجاح في النظام من مصدر: ${SOURCES.find(s => s.id === newLeadForm.source)?.label || newLeadForm.source}`,
          date: new Date().toISOString()
        }
      ]
    });

    setIsAddLeadOpen(false);
    setNewLeadForm({ name: '', phone: '', whatsapp: '', address: '', source: 'instagram', stage: 'new' });
  };

  // Drag and Drop
  const handleDragStart = (leadId: string) => {
    setDraggedLeadId(leadId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (stageId: string) => {
    if (!draggedLeadId) return;
    updateLead(draggedLeadId, { stage: stageId });
    addTimelineItem(draggedLeadId, {
      type: 'note',
      text: `تم تعديل مرحلة العميل إلى: ${PIPELINE_STAGES.find(s => s.id === stageId)?.label}`
    });
    setDraggedLeadId(null);
  };

  // Add timeline history
  const handleAddTimeline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!timelineText || !selectedLead) return;

    addTimelineItem(selectedLead.id, {
      type: timelineType,
      text: timelineText
    });
    
    // update current selected lead in dialog
    const updatedLead = leads.find(l => l.id === selectedLead.id);
    if (updatedLead) {
      // simulate instant UI update for dialog
      setSelectedLead({
        ...updatedLead,
        timeline: [
          { id: Date.now().toString(), type: timelineType, text: timelineText, date: new Date().toISOString() },
          ...(updatedLead.timeline || [])
        ]
      });
    }

    setTimelineText('');
  };

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* Top action bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <h2 className="text-2xl font-black text-neutral-900 flex items-center gap-2">
            إدارة علاقات العملاء (CRM Portal)
            <Badge className="bg-[#B39367] text-neutral-900 font-bold px-2 py-0.5">Luxury Leads</Badge>
          </h2>
          <p className="text-xs text-stone-500 mt-1 font-semibold">تتبع العملاء الجدد ومراحل المعاينة والتسعير حتى توقيع العقد النهائي</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            className="bg-neutral-950 hover:bg-[#B39367] text-white hover:text-neutral-950 font-bold px-4 py-2 text-xs flex items-center gap-1.5 transition-all"
            onClick={() => setIsAddLeadOpen(true)}
          >
            <Plus className="w-4 h-4" />
            إضافة مهتم جديد
          </Button>
        </div>
      </div>

      {/* Analytics stats row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {SOURCES.map(src => {
          const count = sourceStats[src.id] || 0;
          return (
            <Card key={src.id} className="border border-stone-200 bg-white">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-stone-400 font-bold">{src.label}</p>
                  <p className="text-xl font-black text-neutral-900 mt-1">{count} عملاء</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center">
                  <Share2 className="w-4 h-4 text-[#B39367]" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters and Tab Toggles */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white border border-stone-200 p-4 rounded-xl">
        <div className="relative w-full md:w-80">
          <Input 
            className="pr-10 border-stone-300 text-xs font-semibold focus-visible:ring-[#B39367]"
            placeholder="ابحث بالاسم أو رقم الهاتف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="w-4 h-4 text-stone-400 absolute top-3 right-3" />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button
            variant={activeTab === 'kanban' ? 'default' : 'outline'}
            onClick={() => setActiveTab('kanban')}
            className={`text-xs font-bold w-1/2 md:w-auto px-4 ${activeTab === 'kanban' ? 'bg-neutral-900 text-white' : 'border-stone-300'}`}
          >
            لوحة خط المبيعات (Kanban)
          </Button>
          <Button
            variant={activeTab === 'list' ? 'default' : 'outline'}
            onClick={() => setActiveTab('list')}
            className={`text-xs font-bold w-1/2 md:w-auto px-4 ${activeTab === 'list' ? 'bg-neutral-900 text-white' : 'border-stone-300'}`}
          >
            دليل العملاء كجدول
          </Button>
        </div>
      </div>

      {/* Main View: Kanban Board */}
      {activeTab === 'kanban' && (
        <div className="overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex gap-4 min-w-[1600px] h-[600px]">
            {PIPELINE_STAGES.map(stage => {
              const stageLeads = kanbanGroups[stage.id] || [];
              return (
                <div 
                  key={stage.id} 
                  className={`w-80 flex flex-col rounded-xl border border-stone-200 bg-stone-100/40 p-3 h-full ${stage.color}`}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(stage.id)}
                >
                  {/* Stage Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-stone-200/80 mb-3">
                    <span className="font-bold text-xs text-neutral-800">{stage.label}</span>
                    <Badge className="bg-neutral-900 text-stone-100 text-[10px] font-bold px-1.5">{stageLeads.length}</Badge>
                  </div>

                  {/* Stage Cards Container */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                    {stageLeads.length === 0 ? (
                      <div className="h-24 border border-dashed border-stone-300 rounded-lg flex items-center justify-center text-[10px] text-stone-400 font-semibold bg-white/40">
                        اسحب العملاء هنا
                      </div>
                    ) : (
                      stageLeads.map(lead => (
                        <div
                          key={lead.id}
                          draggable
                          onDragStart={() => handleDragStart(lead.id)}
                          onClick={() => {
                            setSelectedLead(lead);
                            setIsDetailOpen(true);
                          }}
                          className="bg-white p-3 rounded-lg border border-stone-200 shadow-xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing hover:border-[#B39367]"
                        >
                          <h4 className="font-bold text-xs text-neutral-950 mb-1">{lead.name}</h4>
                          <p className="text-[10px] text-stone-500 font-semibold mb-2 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-[#B39367]" />
                            {lead.phone}
                          </p>
                          <div className="flex justify-between items-center mt-2 pt-2 border-t border-stone-100">
                            <Badge variant="outline" className="text-[8px] bg-stone-50 text-stone-600 font-bold border-stone-300">
                              {SOURCES.find(s => s.id === lead.source)?.label || lead.source}
                            </Badge>
                            <span className="text-[9px] text-stone-400 font-bold">{formatDate(lead.createdAt).split('،')[0]}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main View: List View */}
      {activeTab === 'list' && (
        <Card className="border border-stone-200 bg-white">
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-stone-50 text-stone-500 border-b border-stone-200">
                <tr>
                  <th className="p-4 font-bold">الاسم الكلي</th>
                  <th className="p-4 font-bold">رقم الهاتف</th>
                  <th className="p-4 font-bold">رقم واتساب</th>
                  <th className="p-4 font-bold">العنوان التفصيلي</th>
                  <th className="p-4 font-bold">مرحلة العميل</th>
                  <th className="p-4 font-bold">مصدر العميل</th>
                  <th className="p-4 font-bold">تاريخ التسجيل</th>
                  <th className="p-4 font-bold text-center">العمليات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 font-semibold text-neutral-900">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center p-8 text-stone-400">لا يوجد عملاء مطابقين للبحث</td>
                  </tr>
                ) : (
                  filteredLeads.map(lead => (
                    <tr key={lead.id} className="hover:bg-stone-50/50">
                      <td className="p-4 font-bold text-neutral-950">{lead.name}</td>
                      <td className="p-4">{lead.phone}</td>
                      <td className="p-4">
                        <a 
                          href={`https://wa.me/${lead.whatsapp}`}
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-[#B39367] flex items-center gap-1 hover:underline text-[10px]"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          فتح المحادثة
                        </a>
                      </td>
                      <td className="p-4 truncate max-w-xs">{lead.address || '-'}</td>
                      <td className="p-4">
                        <Badge className="bg-neutral-900 text-stone-100 text-[10px] font-bold">
                          {PIPELINE_STAGES.find(s => s.id === lead.stage)?.label || lead.stage}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="border-stone-300 text-stone-600 text-[10px] font-bold">
                          {SOURCES.find(s => s.id === lead.source)?.label || lead.source}
                        </Badge>
                      </td>
                      <td className="p-4 text-stone-500">{formatDate(lead.createdAt)}</td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-[#B39367] text-[10px] font-bold"
                            onClick={() => {
                              setSelectedLead(lead);
                              setIsDetailOpen(true);
                            }}
                          >
                            عرض السجل
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 text-[10px] font-bold"
                            onClick={() => {
                              if (confirm('هل أنت متأكد من حذف هذا العميل وسجلاته بالكامل؟')) {
                                deleteLead(lead.id);
                              }
                            }}
                          >
                            حذف
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
      )}

      {/* Modal: Add Lead Form */}
      <Dialog open={isAddLeadOpen} onOpenChange={setIsAddLeadOpen}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-md font-bold text-neutral-950">إضافة مهتم جديد لخط المبيعات</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateLead} className="space-y-4 text-xs font-bold text-neutral-800">
            <div className="space-y-1.5">
              <label>الاسم الكامل</label>
              <Input 
                required 
                placeholder="أدخل اسم العميل بالكامل" 
                value={newLeadForm.name} 
                onChange={(e) => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                className="border-stone-300 text-xs" 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label>رقم الهاتف</label>
                <Input 
                  required 
                  placeholder="مثال: 01012345678" 
                  value={newLeadForm.phone} 
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                  className="border-stone-300 text-xs" 
                />
              </div>
              <div className="space-y-1.5">
                <label>رقم واتساب (مع رمز الدولة)</label>
                <Input 
                  placeholder="مثال: 201012345678" 
                  value={newLeadForm.whatsapp} 
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, whatsapp: e.target.value })}
                  className="border-stone-300 text-xs" 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label>العنوان السكني</label>
              <Input 
                placeholder="التجمع الخامس، القاهرة" 
                value={newLeadForm.address} 
                onChange={(e) => setNewLeadForm({ ...newLeadForm, address: e.target.value })}
                className="border-stone-300 text-xs" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label>قناة التسويق (المصدر)</label>
                <Select 
                  value={newLeadForm.source} 
                  onValueChange={(val) => setNewLeadForm({ ...newLeadForm, source: val })}
                >
                  <SelectTrigger className="border-stone-300 text-xs font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SOURCES.map(src => (
                      <SelectItem key={src.id} value={src.id} className="text-xs font-bold">{src.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label>مرحلة خط المبيعات</label>
                <Select 
                  value={newLeadForm.stage} 
                  onValueChange={(val) => setNewLeadForm({ ...newLeadForm, stage: val })}
                >
                  <SelectTrigger className="border-stone-300 text-xs font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PIPELINE_STAGES.map(st => (
                      <SelectItem key={st.id} value={st.id} className="text-xs font-bold">{st.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-4 gap-2 flex justify-end">
              <Button type="button" variant="outline" onClick={() => setIsAddLeadOpen(false)} className="border-stone-300 text-xs font-bold">
                إلغاء
              </Button>
              <Button type="submit" className="bg-neutral-900 text-white font-bold text-xs hover:bg-[#B39367] transition-all">
                حفظ العميل
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Lead Detail & Timeline Profile */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto" dir="rtl">
          {selectedLead && (
            <>
              <DialogHeader>
                <DialogTitle className="text-md font-bold text-neutral-950 flex items-center justify-between border-b border-stone-100 pb-3">
                  <span>سجل تفاعلات العميل: {selectedLead.name}</span>
                  <Badge className="bg-[#B39367] text-neutral-900 font-bold px-2 py-0.5 text-[10px]">
                    {PIPELINE_STAGES.find(s => s.id === selectedLead.stage)?.label}
                  </Badge>
                </DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                
                {/* Left side: Client profile details */}
                <div className="space-y-4 border-l border-stone-200 pl-4 font-semibold text-xs text-stone-700">
                  <h4 className="font-extrabold text-xs text-neutral-950 uppercase border-b pb-1 border-stone-100">تفاصيل الاتصال</h4>
                  <div>
                    <span className="text-[10px] text-stone-400 block font-bold">رقم الهاتف</span>
                    <span className="text-neutral-900 font-bold text-xs">{selectedLead.phone}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block font-bold">واتساب للتواصل</span>
                    <a 
                      href={`https://wa.me/${selectedLead.whatsapp}`}
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-[#B39367] hover:underline flex items-center gap-1"
                    >
                      {selectedLead.whatsapp} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block font-bold">موقع التركيب</span>
                    <span className="text-neutral-900 text-xs">{selectedLead.address || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block font-bold">المصدر التسويقي</span>
                    <span className="text-neutral-900 text-xs">
                      {SOURCES.find(s => s.id === selectedLead.source)?.label || selectedLead.source}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block font-bold">تاريخ الإضافة</span>
                    <span className="text-neutral-900 text-xs">{formatDate(selectedLead.createdAt)}</span>
                  </div>
                  
                  {/* Lead Stage manual update in detail */}
                  <div className="space-y-2 pt-4">
                    <label className="text-[10px] text-[#B39367] block font-bold">تحديث المرحلة سريعاً</label>
                    <Select
                      value={selectedLead.stage}
                      onValueChange={(val) => {
                        updateLead(selectedLead.id, { stage: val });
                        addTimelineItem(selectedLead.id, {
                          type: 'note',
                          text: `تم نقل العميل إلى المرحلة: ${PIPELINE_STAGES.find(s => s.id === val)?.label}`
                        });
                        setSelectedLead({ ...selectedLead, stage: val });
                      }}
                    >
                      <SelectTrigger className="border-stone-300 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PIPELINE_STAGES.map(st => (
                          <SelectItem key={st.id} value={st.id} className="text-xs font-bold">{st.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Right side: Timeline & log form */}
                <div className="md:col-span-2 space-y-6">
                  
                  {/* Log new activity */}
                  <form onSubmit={handleAddTimeline} className="bg-stone-50 border border-stone-200/80 p-4 rounded-xl space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-neutral-800">تسجيل نشاط جديد:</span>
                      
                      <div className="flex gap-2">
                        {['note', 'call', 'meeting'].map(t => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setTimelineType(t as any)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                              timelineType === t 
                                ? 'bg-neutral-900 text-white border-neutral-900' 
                                : 'bg-white text-stone-600 border-stone-300 hover:bg-stone-100'
                            }`}
                          >
                            {t === 'note' ? 'ملاحظة' : t === 'call' ? 'مكالمة هاتفية' : 'اجتماع عمل'}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <Textarea 
                      required
                      placeholder="اكتب تفاصيل التفاعل مع العميل هنا..."
                      className="border-stone-300 text-xs font-semibold focus-visible:ring-[#B39367] resize-none h-16"
                      value={timelineText}
                      onChange={(e) => setTimelineText(e.target.value)}
                    />
                    
                    <div className="flex justify-end">
                      <Button type="submit" size="sm" className="bg-[#B39367] text-neutral-950 text-[10px] font-bold hover:bg-neutral-900 hover:text-white transition-all">
                        تسجيل بالجدول الزمني
                      </Button>
                    </div>
                  </form>

                  {/* Activity Timeline List */}
                  <div className="space-y-4">
                    <h4 className="font-extrabold text-xs text-neutral-950 uppercase border-b pb-1 border-stone-100">سجل الأحداث والتسلسل الزمني</h4>
                    
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                      {(!selectedLead.timeline || selectedLead.timeline.length === 0) ? (
                        <p className="text-center text-stone-400 text-xs py-4">لا توجد ملاحظات أو اجتماعات مسجلة في الجدول الزمني</p>
                      ) : (
                        selectedLead.timeline.map((item: any) => {
                          const isCall = item.type === 'call';
                          const isMeeting = item.type === 'meeting';
                          return (
                            <div key={item.id} className="relative flex gap-3 text-xs border-r border-stone-200 pr-4 pb-2 mr-2">
                              {/* Dot */}
                              <span className={`absolute right-[-4px] top-1.5 w-2 h-2 rounded-full border ${
                                isCall ? 'bg-blue-500 border-white' : isMeeting ? 'bg-amber-600 border-white' : 'bg-stone-400 border-white'
                              }`}></span>
                              
                              <div className="flex-1 bg-stone-50 border border-stone-100 rounded-lg p-2.5">
                                <div className="flex justify-between items-center text-[10px] font-bold text-stone-400 mb-1">
                                  <span className={isCall ? 'text-blue-500' : isMeeting ? 'text-amber-700' : 'text-stone-500'}>
                                    {isCall ? 'مكالمة هاتفية' : isMeeting ? 'اجتماع' : 'ملاحظة عامة'}
                                  </span>
                                  <span>{formatDate(item.date)}</span>
                                </div>
                                <p className="font-semibold text-neutral-800 leading-relaxed text-xs">{item.text}</p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                </div>

              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
