import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bot, 
  Send, 
  Sparkles,
  X
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface AIAssistantProps {
  projects: any[];
  products: any[];
  expenses: any[];
}

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  actions?: any[];
  suggestions?: string[];
}

export function AIAssistant({ projects, products, expenses }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      type: 'ai',
      content: 'مرحباً! أنا مساعدك الذكي. كيف يمكنني مساعدتك اليوم؟',
      suggestions: ['اقترح سعر بيع', 'حلل أدائي', 'توقع أرباحي', 'أشرح لي المخزون']
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // تحليل البيانات للAI
  const analyzeData = () => {
    const totalIncome = projects.reduce((sum, p) => sum + (p.totalPrice || 0), 0);
    const totalPaid = projects.reduce((sum, p) => sum + (p.paidAmount || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const netProfit = totalPaid - totalExpenses;
    
    const activeProjects = projects.filter(p => !['delivered', 'cancelled'].includes(p.status));
    const deliveredProjects = projects.filter(p => p.status === 'delivered');
    
    const lowStockProducts = products.filter(p => p.quantity <= p.minQuantity);
    
    // حساب متوسط الربح لكل مشروع
    const avgProfit = deliveredProjects.length > 0 
      ? deliveredProjects.reduce((sum, p) => {
          const pExpenses = expenses.filter(e => e.projectId === p.id).reduce((eSum, e) => eSum + (e.amount || 0), 0);
          return sum + ((p.totalPrice || 0) - pExpenses);
        }, 0) / deliveredProjects.length 
      : 0;

    // نسبة الهالك
    const wasteExpenses = expenses.filter(e => e.category === 'waste').reduce((sum, e) => sum + (e.amount || 0), 0);
    const wastePercentage = totalExpenses > 0 ? (wasteExpenses / totalExpenses) * 100 : 0;

    return {
      totalIncome,
      totalPaid,
      totalExpenses,
      netProfit,
      activeProjects: activeProjects.length,
      deliveredProjects: deliveredProjects.length,
      lowStockProducts: lowStockProducts.length,
      avgProfit,
      wastePercentage,
      profitMargin: totalPaid > 0 ? (netProfit / totalPaid) * 100 : 0,
    };
  };

  const generatePriceSuggestion = (_projectType: string, area: number) => {
    // حساب التكلفة التقديرية
    const materialCost = area * 1500; // متوسط سعر المتر
    const laborCost = area * 400;
    const overheadCost = materialCost * 0.15; // 15% مصاريف إدارية
    const totalCost = materialCost + laborCost + overheadCost;
    
    // اقتراح السعر بناءً على هامش الربح المستهدف
    const targetProfitMargin = 30; // 30% هامش ربح مستهدف
    const suggestedPrice = totalCost * (1 + targetProfitMargin / 100);
    
    const minPrice = totalCost * 1.15; // 15% ربح minimum
    const maxPrice = totalCost * 1.5;  // 50% ربح maximum
    
    return {
      cost: totalCost,
      suggested: suggestedPrice,
      min: minPrice,
      max: maxPrice,
      profitMargin: targetProfitMargin,
    };
  };

  const analyzePerformance = () => {
    const stats = analyzeData();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // مشاريع الشهر الحالي
    const monthProjects = projects.filter(p => {
      const pDate = new Date(p.createdAt);
      return pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear;
    });
    
    const monthIncome = monthProjects.reduce((sum, p) => sum + (p.totalPrice || 0), 0);
    const monthExpenses = expenses.filter(e => {
      const eDate = new Date(e.date);
      return eDate.getMonth() === currentMonth && eDate.getFullYear() === currentYear;
    }).reduce((sum, e) => sum + (e.amount || 0), 0);
    
    return {
      ...stats,
      monthProjects: monthProjects.length,
      monthIncome,
      monthExpenses,
      monthProfit: monthIncome - monthExpenses,
    };
  };

  const predictProfits = () => {
    const stats = analyzeData();
    const activeProjectsValue = projects
      .filter(p => !['delivered', 'cancelled'].includes(p.status))
      .reduce((sum, p) => sum + (p.remainingAmount || 0), 0);
    
    // توقع الأرباح للشهر القادم
    const expectedMonthlyProjects = Math.ceil(stats.deliveredProjects / 6); // متوسط 6 أشهر
    const expectedProfit = expectedMonthlyProjects * stats.avgProfit;
    
    return {
      currentProfit: stats.netProfit,
      expectedMonthlyProfit: expectedProfit,
      activeProjectsValue,
      totalExpected: stats.netProfit + activeProjectsValue,
    };
  };

  const processCommand = (command: string): Message => {
    const lowerCommand = command.toLowerCase();
    const stats = analyzeData();
    
    // اقتراح سعر بيع
    if (lowerCommand.includes('سعر') || lowerCommand.includes('تسعير') || lowerCommand.includes('اقترح')) {
      const areaMatch = command.match(/(\d+)/);
      const area = areaMatch ? parseInt(areaMatch[1]) : 10;
      const type = lowerCommand.includes('مطبخ') ? 'مطبخ' : lowerCommand.includes('دريسنج') ? 'دريسنج' : 'عام';
      
      const suggestion = generatePriceSuggestion(type, area);
      
      return {
        id: Date.now().toString(),
        type: 'ai',
        content: `💡 اقتراح تسعير لـ ${type} (${area} متر مربع):\n\n` +
                `• التكلفة التقديرية: ${formatCurrency(suggestion.cost)}\n` +
                `• السعر المقترح: ${formatCurrency(suggestion.suggested)}\n` +
                `• الحد الأدنى: ${formatCurrency(suggestion.min)}\n` +
                `• الحد الأقصى: ${formatCurrency(suggestion.max)}\n\n` +
                `هامش الربح المتوقع: ${suggestion.profitMargin}%`,
        suggestions: ['حسب لي على 15 متر', 'اقترح سعر دريسنج', 'ما هي التكلفة المتوقعة؟']
      };
    }
    
    // تحليل الأداء
    if (lowerCommand.includes('أداء') || lowerCommand.includes('تحليل') || lowerCommand.includes('شغلي')) {
      const performance = analyzePerformance();
      
      let rating = 'جيد';
      if (performance.profitMargin > 30) rating = 'ممتاز';
      else if (performance.profitMargin < 15) rating = 'يحتاج تحسين';
      
      return {
        id: Date.now().toString(),
        type: 'ai',
        content: `📊 تحليل أداء عملك:\n\n` +
                `• صافي الربح: ${formatCurrency(performance.netProfit)}\n` +
                `• هامش الربح: ${performance.profitMargin.toFixed(1)}% (${rating})\n` +
                `• المشاريع المكتملة: ${performance.deliveredProjects}\n` +
                `• المشاريع النشطة: ${performance.activeProjects}\n\n` +
                `📈 هذا الشهر:\n` +
                `• إيرادات: ${formatCurrency(performance.monthIncome)}\n` +
                `• مصروفات: ${formatCurrency(performance.monthExpenses)}\n` +
                `• ربح: ${formatCurrency(performance.monthProfit)}`,
        suggestions: ['كيف أحسن أدائي؟', 'توقع أرباحي', 'ما هي نقاط الضعف؟']
      };
    }
    
    // توقع الأرباح
    if (lowerCommand.includes('توقع') || lowerCommand.includes('أرباح') || lowerCommand.includes('مستقبل')) {
      const prediction = predictProfits();
      
      return {
        id: Date.now().toString(),
        type: 'ai',
        content: `🔮 توقعات الأرباح:\n\n` +
                `• الأرباح الحالية: ${formatCurrency(prediction.currentProfit)}\n` +
                `• قيمة المشاريع النشطة: ${formatCurrency(prediction.activeProjectsValue)}\n` +
                `• الربح المتوقع شهرياً: ${formatCurrency(prediction.expectedMonthlyProfit)}\n\n` +
                `💰 إجمالي الأرباح المتوقعة: ${formatCurrency(prediction.totalExpected)}`,
        suggestions: ['كيف أزيد أرباحي؟', 'تحليل المخاطر', 'مشاريع مربحة أكثر']
      };
    }
    
    // تقليل الهالك
    if (lowerCommand.includes('هالك') || lowerCommand.includes('فاقد') || lowerCommand.includes('تقليل')) {
      const wasteTips = [
        '• خطط دقيق للكميات المطلوبة قبل الشراء',
        '• استخدم برامج تقطيع (Cutting Optimization)',
        '• خزن الخامات بشكل صحيح لتجنب التلف',
        '• استخدم بقايا الخشب في مشاريع صغيرة',
        '• راقب الهالك شهرياً وحدد أسبابه',
        '• درب العمال على التركيب الصحيح',
      ];
      
      return {
        id: Date.now().toString(),
        type: 'ai',
        content: `⚠️ نسبة الهالك الحالية: ${stats.wastePercentage.toFixed(1)}%\n\n` +
                `💡 نصائح لتقليل الهالك:\n${wasteTips.join('\n')}\n\n` +
                `💰 توفير محتمل: ${formatCurrency(stats.totalExpenses * 0.1)} شهرياً`,
        suggestions: ['حلل هالك الشهر', 'أفضل طرق التخزين', 'برامج تقطيع']
      };
    }
    
    // تحليل المخزون
    if (lowerCommand.includes('مخزون') || lowerCommand.includes('خامات') || lowerCommand.includes('منتجات')) {
      const lowStock = products.filter(p => p.quantity <= p.minQuantity);
      
      return {
        id: Date.now().toString(),
        type: 'ai',
        content: `📦 حالة المخزون:\n\n` +
                `• إجمالي المنتجات: ${products.length}\n` +
                `• منتجات منخفضة: ${lowStock.length}\n\n` +
                (lowStock.length > 0 
                  ? `⚠️ منتجات تحتاج تجديد:\n${lowStock.slice(0, 5).map(p => `• ${p.name} (${p.quantity} ${p.unit})`).join('\n')}`
                  : '✅ المخزون في حالة جيدة'),
        suggestions: ['منتجات ناقصة', 'تقرير المخزون', 'متى أشتري خامات؟']
      };
    }
    
    // مساعدة عامة
    return {
      id: Date.now().toString(),
      type: 'ai',
      content: `🤔 لم أفهم طلبك بالضبط. يمكنني مساعدتك في:\n\n` +
              `• اقتراح أسعار البيع المناسبة\n` +
              `• تحليل أداء عملك\n` +
              `• توقع أرباحك المستقبلية\n` +
              `• تقليل الهالك والفاقد\n` +
              `• تحليل المخزون\n\n` +
              `جرب أن تسأل: "اقترح سعر لمطبخ 12 متر"`,
      suggestions: ['اقترح سعر بيع', 'حلل أدائي', 'توقع أرباحي', 'نصائح لتقليل الهالك']
    };
  };

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    
    // محاكاة تأخير الرد
    setTimeout(() => {
      const aiResponse = processCommand(userMessage.content);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <>
      {/* زر فتح المساعد */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 w-14 h-14 rounded-full shadow-lg"
      >
        <Bot className="w-6 h-6" />
      </Button>

      {/* نافذة المحادثة */}
      {isOpen && (
        <Card className="fixed bottom-24 left-6 w-96 h-[500px] shadow-2xl z-50 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between py-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              المساعد الذكي
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-lg ${
                        msg.type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-gray-100'
                      }`}
                    >
                      <p className="whitespace-pre-line text-sm">{msg.content}</p>
                      
                      {msg.suggestions && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {msg.suggestions.map((suggestion, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setInput(suggestion);
                                handleSend();
                              }}
                              className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            <div className="p-3 border-t">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="اكتب سؤالك هنا..."
                  className="flex-1 text-right"
                />
                <Button onClick={handleSend} size="icon">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
