/** مراحل قمع المبيعات — مصدر واحد للوحة التحكم وبوابة CRM */
export const CRM_PIPELINE_STAGES = [
  { id: 'new', label: 'مهتم جديد', shortLabel: 'مهتم جديد', color: 'border-r-blue-400 bg-blue-50/20' },
  { id: 'visit', label: 'رفع مقاسات الموقع', shortLabel: 'رفع مقاسات', color: 'border-r-indigo-400 bg-indigo-50/20' },
  { id: 'design', label: 'مرحلة التصميم', shortLabel: 'التصميم', color: 'border-r-[#B39367] bg-[#B39367]/10' },
  { id: 'quotation', label: 'تقديم العرض المالي', shortLabel: 'عرض السعر', color: 'border-r-amber-500 bg-amber-50/20' },
  { id: 'negotiation', label: 'مفاوضات ومراجعة', shortLabel: 'مفاوضات', color: 'border-r-orange-400 bg-orange-50/20' },
  { id: 'contract', label: 'توقيع العقد الرسمي', shortLabel: 'العقد', color: 'border-r-emerald-500 bg-emerald-50/20' },
  { id: 'production', label: 'التصنيع والورشة', shortLabel: 'التصنيع', color: 'border-r-purple-500 bg-purple-50/20' },
  { id: 'installation', label: 'التركيب بالموقع', shortLabel: 'التركيب', color: 'border-r-sky-500 bg-sky-50/20' },
  { id: 'completed', label: 'تم التسليم والتشغيل', shortLabel: 'مكتمل', color: 'border-r-teal-600 bg-teal-50/20' },
] as const;

export type CrmPipelineStageId = (typeof CRM_PIPELINE_STAGES)[number]['id'];
