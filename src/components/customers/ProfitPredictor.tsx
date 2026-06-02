import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  DollarSign, 
  Activity,
  Target,
  AlertTriangle
} from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  email?: string;
  notes?: string;
  totalDeals?: number;
  totalSpent?: number;
  importedFrom?: string;
  createdAt: string;
  updatedAt: string;
}

interface Project {
  id: string;
  customerId: string;
  totalPrice: number;
  paidAmount: number;
  remainingAmount: number;
  status: string;
  createdAt: string;
}

interface ProfitPredictorProps {
  customers: Customer[];
  projects: Project[];
}

interface CustomerProfitPrediction {
  customer: Customer;
  potentialValue: number;
  averageDealValue: number;
  confidence: number;
  recommendation: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export function ProfitPredictor({ customers, projects }: ProfitPredictorProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const customerStats = useMemo(() => {
    const stats: Record<string, { totalDeals: number; totalSpent: number; paidAmount: number }> = {};
    
    projects.forEach(project => {
      if (!stats[project.customerId]) {
        stats[project.customerId] = { totalDeals: 0, totalSpent: 0, paidAmount: 0 };
      }
      stats[project.customerId].totalDeals += 1;
      stats[project.customerId].totalSpent += project.totalPrice || 0;
      stats[project.customerId].paidAmount += project.paidAmount || 0;
    });

    return stats;
  }, [projects]);

  const predictions = useMemo((): CustomerProfitPrediction[] => {
    const allCustomers = customers.map(customer => {
      const stats = customerStats[customer.id] || { totalDeals: 0, totalSpent: 0, paidAmount: 0 };
      
      const hasHistory = stats.totalDeals > 0;
      const hasContact = !!customer.phone;
      const hasEmail = !!customer.email;
      const hasAddress = !!customer.address;
      const hasNotes = !!customer.notes;
      
      const confidence = Math.min(100, 
        (hasHistory ? 30 : 0) +
        (hasContact ? 15 : 0) +
        (hasEmail ? 10 : 0) +
        (hasAddress ? 10 : 0) +
        (hasNotes ? 15 : 0) +
        (stats.totalDeals > 1 ? 10 : 0) +
        (stats.totalSpent > 50000 ? 10 : 0)
      );

      let potentialValue: number;
      let averageDealValue: number;
      let recommendation: string;
      let riskLevel: 'low' | 'medium' | 'high';

      if (hasHistory && stats.totalDeals > 0) {
        averageDealValue = stats.totalSpent / stats.totalDeals;
        const repeatProbability = Math.min(1, stats.totalDeals / 3);
        potentialValue = averageDealValue * (2 + repeatProbability);
        
        if (stats.totalSpent > 100000) {
          recommendation = 'عميل مميز!.offer exclusive deals';
          riskLevel = 'low';
        } else if (stats.totalSpent > 50000) {
          recommendation = 'عرض ترقيات حصرية';
          riskLevel = 'low';
        } else {
          recommendation = 'متابعة مستمرة';
          riskLevel = 'medium';
        }
      } else {
        averageDealValue = 25000;
        potentialValue = averageDealValue;
        
        if (hasContact && hasEmail) {
          recommendation = 'بدء التواصل';
          riskLevel = 'medium';
        } else if (hasContact) {
          recommendation = 'طلب البيانات الناقصة';
          riskLevel = 'high';
        } else {
          recommendation = 'التحقق من البيانات';
          riskLevel = 'high';
        }
      }

      return {
        customer,
        potentialValue,
        averageDealValue,
        confidence,
        recommendation,
        riskLevel,
      };
    });

    return allCustomers.sort((a, b) => b.confidence - a.confidence);
  }, [customers, customerStats]);

  const topCustomers = predictions.slice(0, 5);
  const totalPotentialValue = predictions.reduce((sum, p) => sum + p.potentialValue, 0);
  const avgConfidence = predictions.length > 0 
    ? predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length 
    : 0;
  const highRiskCount = predictions.filter(p => p.riskLevel === 'high').length;

  const selectedPrediction = selectedCustomerId 
    ? predictions.find(p => p.customer.id === selectedCustomerId)
    : null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            تنبؤ أرباح العملاء
          </CardTitle>
          <CardDescription>
            بناءً على البيانات المستوردة والمشاريع السابقة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-700">القيمة المتوقعة</span>
              </div>
              <p className="text-2xl font-bold text-green-700">{formatCurrency(totalPotentialValue)}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-blue-700">ثقة التنبؤ</span>
              </div>
              <p className="text-2xl font-bold text-blue-700">{avgConfidence.toFixed(0)}%</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <span className="text-sm text-orange-700">عملاء محتمل失去</span>
              </div>
              <p className="text-2xl font-bold text-orange-700">{highRiskCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>أفضل العملاء المتوقعين</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topCustomers.map((prediction, index) => (
              <div
                key={prediction.customer.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedCustomerId === prediction.customer.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedCustomerId(prediction.customer.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium">{prediction.customer.name}</p>
                      <p className="text-sm text-gray-500">{prediction.customer.phone}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-green-600">{formatCurrency(prediction.potentialValue)}</p>
                    <div className="flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${
                        prediction.confidence >= 70 ? 'bg-green-500' :
                        prediction.confidence >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <span className="text-sm text-gray-500">{prediction.confidence}% ثقة</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded text-sm ${
                    prediction.riskLevel === 'low' ? 'bg-green-100 text-green-700' :
                    prediction.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {prediction.recommendation}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedPrediction && (
        <Card>
          <CardHeader>
            <CardTitle>تفاصيل العميل</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">القيمة المحتملة</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(selectedPrediction.potentialValue)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">متوسط قيمة الصفقة</p>
                  <p className="text-xl font-bold">
                    {formatCurrency(selectedPrediction.averageDealValue)}
                  </p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <p className="text-sm text-gray-500 mb-2">معلومات التواصل</p>
                <div className="space-y-2 text-sm">
                  <p>📱 {selectedPrediction.customer.phone || 'غير متوفر'}</p>
                  <p>📧 {selectedPrediction.customer.email || 'غير متوفر'}</p>
                  <p>🏠 {selectedPrediction.customer.address || 'غير متوفر'}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-500 mb-2">التوصية</p>
                <div className={`p-3 rounded-lg ${
                  selectedPrediction.riskLevel === 'low' ? 'bg-green-50' :
                  selectedPrediction.riskLevel === 'medium' ? 'bg-yellow-50' :
                  'bg-red-50'
                }`}>
                  <p className="font-medium">{selectedPrediction.recommendation}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}