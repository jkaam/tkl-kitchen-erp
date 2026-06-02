import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, 
  Keyboard, 
  Sparkles, 
  FileText,
  CheckCircle,
  X
} from 'lucide-react';
import { toast } from 'sonner';

interface VoiceCommandProps {
  onNavigate: (page: string) => void;
  onAddCustomer?: (data: any) => void;
  onAddExpense?: (data: any) => void;
}

interface CommandResult {
  action: string;
  data?: any;
  message: string;
}

interface Note {
  id: string;
  text: string;
  createdAt: string;
  completed: boolean;
}

export function VoiceCommand({ 
  onNavigate, 
  onAddCustomer, 
  onAddExpense
}: VoiceCommandProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [command, setCommand] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [showNotes, setShowNotes] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // تحميل الملاحظات من LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('ai_notes');
    if (saved) {
      setNotes(JSON.parse(saved));
    }
  }, []);

  // حفظ الملاحظات
  useEffect(() => {
    localStorage.setItem('ai_notes', JSON.stringify(notes));
  }, [notes]);

  // التركيز على الإدخال عند الفتح
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const addNote = (text: string) => {
    const newNote: Note = {
      id: Date.now().toString(),
      text,
      createdAt: new Date().toISOString(),
      completed: false,
    };
    setNotes(prev => [newNote, ...prev]);
    toast.success('تمت إضافة الملاحظة');
  };

  const toggleNote = (id: string) => {
    setNotes(prev => prev.map(n => 
      n.id === id ? { ...n, completed: !n.completed } : n
    ));
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const processCommand = (cmd: string): CommandResult => {
    const lowerCmd = cmd.toLowerCase().trim();

    // التنقل بين الصفحات
    if (lowerCmd.includes('الرئيسية') || lowerCmd.includes('dashboard')) {
      onNavigate('dashboard');
      return { action: 'navigate', message: 'تم الانتقال للصفحة الرئيسية' };
    }
    if (lowerCmd.includes('عملاء') || lowerCmd.includes('العملاء')) {
      onNavigate('customers');
      return { action: 'navigate', message: 'تم الانتقال لصفحة العملاء' };
    }
    if (lowerCmd.includes('مشاريع') || lowerCmd.includes('المشاريع')) {
      onNavigate('projects');
      return { action: 'navigate', message: 'تم الانتقال لصفحة المشاريع' };
    }
    if (lowerCmd.includes('مخزون') || lowerCmd.includes('المخزون')) {
      onNavigate('inventory');
      return { action: 'navigate', message: 'تم الانتقال لصفحة المخزون' };
    }
    if (lowerCmd.includes('ماليات') || lowerCmd.includes('الماليات')) {
      onNavigate('finance');
      return { action: 'navigate', message: 'تم الانتقال لصفحة الماليات' };
    }
    if (lowerCmd.includes('مواعيد') || lowerCmd.includes('المواعيد')) {
      onNavigate('appointments');
      return { action: 'navigate', message: 'تم الانتقال لصفحة المواعيد' };
    }
    if (lowerCmd.includes('أرشيف') || lowerCmd.includes('الأرشيف')) {
      onNavigate('archive');
      return { action: 'navigate', message: 'تم الانتقال لصفحة الأرشيف' };
    }
    if (lowerCmd.includes('كاش') || lowerCmd.includes('تدفق')) {
      onNavigate('cashflow');
      return { action: 'navigate', message: 'تم الانتقال لصفحة تدفق الكاش' };
    }
    if (lowerCmd.includes('حاسبة') || lowerCmd.includes('حسب')) {
      onNavigate('calculator');
      return { action: 'navigate', message: 'تم الانتقال لحاسبة الأمتار' };
    }
    if (lowerCmd.includes('عروض') || lowerCmd.includes('أسعار')) {
      onNavigate('quotes');
      return { action: 'navigate', message: 'تم الانتقال لصفحة عروض الأسعار' };
    }

    // إضافة عميل
    if (lowerCmd.includes('أضف عميل') || lowerCmd.includes('عميل جديد')) {
      const nameMatch = cmd.match(/عميل\s+جديد\s+(.+)/i) || cmd.match(/أضف\s+عميل\s+(.+)/i);
      if (nameMatch && onAddCustomer) {
        onAddCustomer({ name: nameMatch[1].trim(), phone: '', address: '' });
        return { action: 'add', message: `تم إضافة العميل: ${nameMatch[1].trim()}` };
      }
      onNavigate('customers');
      return { action: 'navigate', message: 'افتح صفحة إضافة عميل' };
    }

    // إضافة مشروع
    if (lowerCmd.includes('أضف مشروع') || lowerCmd.includes('مشروع جديد')) {
      onNavigate('projects');
      return { action: 'navigate', message: 'افتح صفحة إضافة مشروع' };
    }

    // إضافة مصروف
    if (lowerCmd.includes('أضف مصروف') || lowerCmd.includes('مصروف جديد')) {
      const amountMatch = cmd.match(/(\d+)/);
      if (amountMatch && onAddExpense) {
        onAddExpense({ 
          amount: parseInt(amountMatch[1]), 
          category: 'other',
          date: new Date().toISOString().split('T')[0]
        });
        return { action: 'add', message: `تم إضافة مصروف: ${amountMatch[1]} جنيه` };
      }
      onNavigate('finance');
      return { action: 'navigate', message: 'افتح صفحة إضافة مصروف' };
    }

    // إضافة موعد
    if (lowerCmd.includes('أضف موعد') || lowerCmd.includes('موعد جديد')) {
      onNavigate('appointments');
      return { action: 'navigate', message: 'افتح صفحة إضافة موعد' };
    }

    // إضافة ملاحظة
    if (lowerCmd.includes('ملاحظة') || lowerCmd.includes('اكتب') || lowerCmd.includes('سجل')) {
      const noteMatch = cmd.match(/(?:ملاحظة|اكتب|سجل)\s+(.+)/i);
      if (noteMatch) {
        addNote(noteMatch[1].trim());
        return { action: 'note', message: 'تم حفظ الملاحظة' };
      }
    }

    // عرض الملاحظات
    if (lowerCmd.includes('عرض الملاحظات') || lowerCmd.includes('ملاحظاتي')) {
      setShowNotes(true);
      return { action: 'show_notes', message: 'عرض الملاحظات' };
    }

    // البحث
    if (lowerCmd.includes('ابحث') || lowerCmd.includes('دور')) {
      const searchMatch = cmd.match(/(?:ابحث|دور)\s+(?:عن\s+)?(.+)/i);
      if (searchMatch) {
        return { action: 'search', message: `جاري البحث عن: ${searchMatch[1]}` };
      }
    }

    // مساعدة
    if (lowerCmd.includes('مساعدة') || lowerCmd.includes('help') || lowerCmd.includes('؟')) {
      return { 
        action: 'help', 
        message: `الأوامر المتاحة:\n\n` +
                `• "الرئيسية" - الذهاب للصفحة الرئيسية\n` +
                `• "العملاء" - صفحة العملاء\n` +
                `• "المشاريع" - صفحة المشاريع\n` +
                `• "المخزون" - صفحة المخزون\n` +
                `• "الماليات" - صفحة الماليات\n` +
                `• "المواعيد" - صفحة المواعيد\n` +
                `• "الأرشيف" - صفحة الأرشيف\n` +
                `• "تدفق الكاش" - صفحة التدفق النقدي\n` +
                `• "حاسبة الأمتار" - حاسبة الأمتار\n` +
                `• "عروض الأسعار" - صفحة عروض الأسعار\n\n` +
                `• "أضف عميل [الاسم]" - إضافة عميل جديد\n` +
                `• "أضف مصروف [المبلغ]" - إضافة مصروف\n` +
                `• "ملاحظة [النص]" - إضافة ملاحظة\n` +
                `• "عرض الملاحظات" - عرض جميع الملاحظات`
      };
    }

    return { 
      action: 'unknown', 
      message: 'لم أفهم الأمر. اكتب "مساعدة" لمعرفة الأوامر المتاحة.' 
    };
  };

  const handleExecute = () => {
    if (!command.trim()) return;
    
    const result = processCommand(command);
    toast.success(result.message);
    
    if (result.action !== 'unknown' && result.action !== 'help') {
      setCommand('');
      if (result.action === 'navigate') {
        setIsOpen(false);
      }
    }
  };

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'ar-SA';
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setCommand(transcript);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.onerror = () => {
        setIsListening(false);
        toast.error('حدث خطأ في التعرف على الصوت');
      };
      
      recognition.start();
    } else {
      toast.error('المتصفح لا يدعم التعرف على الصوت');
    }
  };

  return (
    <>
      {/* زر الأوامر الصوتية */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg bg-gradient-to-r from-purple-500 to-pink-500"
      >
        <Sparkles className="w-6 h-6" />
      </Button>

      {/* نافذة الأوامر */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-96 shadow-2xl z-50">
          <CardHeader className="flex flex-row items-center justify-between py-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Keyboard className="w-5 h-5" />
              أوامر سريعة
            </CardTitle>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => setShowNotes(!showNotes)}>
                <FileText className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* إدخال الأمر */}
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleExecute()}
                placeholder="اكتب أمرك هنا... (مثال: العملاء)"
                className="flex-1 text-right"
              />
              <Button 
                onClick={startListening} 
                size="icon"
                variant={isListening ? 'default' : 'outline'}
                className={isListening ? 'animate-pulse' : ''}
              >
                <Mic className="w-4 h-4" />
              </Button>
              <Button onClick={handleExecute} size="icon">
                <Sparkles className="w-4 h-4" />
              </Button>
            </div>

            {/* الاختصارات السريعة */}
            {!showNotes && (
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => { onNavigate('dashboard'); setIsOpen(false); }}
                  className="p-2 bg-gray-100 rounded hover:bg-gray-200 text-center text-sm"
                >
                  الرئيسية
                </button>
                <button 
                  onClick={() => { onNavigate('customers'); setIsOpen(false); }}
                  className="p-2 bg-blue-100 rounded hover:bg-blue-200 text-center text-sm"
                >
                  العملاء
                </button>
                <button 
                  onClick={() => { onNavigate('projects'); setIsOpen(false); }}
                  className="p-2 bg-purple-100 rounded hover:bg-purple-200 text-center text-sm"
                >
                  المشاريع
                </button>
                <button 
                  onClick={() => { onNavigate('inventory'); setIsOpen(false); }}
                  className="p-2 bg-orange-100 rounded hover:bg-orange-200 text-center text-sm"
                >
                  المخزون
                </button>
                <button 
                  onClick={() => { onNavigate('finance'); setIsOpen(false); }}
                  className="p-2 bg-green-100 rounded hover:bg-green-200 text-center text-sm"
                >
                  الماليات
                </button>
                <button 
                  onClick={() => { onNavigate('appointments'); setIsOpen(false); }}
                  className="p-2 bg-yellow-100 rounded hover:bg-yellow-200 text-center text-sm"
                >
                  المواعيد
                </button>
                <button 
                  onClick={() => { onNavigate('archive'); setIsOpen(false); }}
                  className="p-2 bg-gray-100 rounded hover:bg-gray-200 text-center text-sm"
                >
                  الأرشيف
                </button>
                <button 
                  onClick={() => { onNavigate('cashflow'); setIsOpen(false); }}
                  className="p-2 bg-cyan-100 rounded hover:bg-cyan-200 text-center text-sm"
                >
                  الكاش
                </button>
                <button 
                  onClick={() => { onNavigate('calculator'); setIsOpen(false); }}
                  className="p-2 bg-pink-100 rounded hover:bg-pink-200 text-center text-sm"
                >
                  الحاسبة
                </button>
              </div>
            )}

            {/* الملاحظات */}
            {showNotes && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm">ملاحظاتي</h4>
                  <Badge variant="secondary">{notes.filter(n => !n.completed).length} متبقية</Badge>
                </div>
                
                {notes.length === 0 ? (
                  <p className="text-center text-gray-500 text-sm py-4">لا يوجد ملاحظات</p>
                ) : (
                  notes.map(note => (
                    <div 
                      key={note.id} 
                      className={`flex items-center gap-2 p-2 rounded ${note.completed ? 'bg-gray-100' : 'bg-yellow-50'}`}
                    >
                      <button 
                        onClick={() => toggleNote(note.id)}
                        className="flex-shrink-0"
                      >
                        <CheckCircle className={`w-4 h-4 ${note.completed ? 'text-green-600' : 'text-gray-400'}`} />
                      </button>
                      <span className={`flex-1 text-sm ${note.completed ? 'line-through text-gray-500' : ''}`}>
                        {note.text}
                      </span>
                      <button 
                        onClick={() => deleteNote(note.id)}
                        className="text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* تلميح */}
            <p className="text-xs text-gray-500 text-center">
              اكتب "مساعدة" لمعرفة جميع الأوامر
            </p>
          </CardContent>
        </Card>
      )}
    </>
  );
}
