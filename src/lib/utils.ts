import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// تصدير إلى Excel
export function exportToExcel(data: any[], filename: string, sheetName: string = 'Sheet1') {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

// تصدير إلى PDF
export function exportToPDF(
  title: string,
  headers: string[],
  data: any[][],
  filename: string,
  additionalInfo?: { label: string; value: string }[]
) {
  const doc = new jsPDF();
  
  // العنوان
  doc.setFontSize(18);
  doc.text(title, 14, 20);
  
  // معلومات إضافية
  let yPos = 30;
  if (additionalInfo) {
    doc.setFontSize(12);
    additionalInfo.forEach(info => {
      doc.text(`${info.label}: ${info.value}`, 14, yPos);
      yPos += 7;
    });
    yPos += 5;
  }
  
  // الجدول
  (doc as any).autoTable({
    head: [headers],
    body: data,
    startY: yPos,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185] },
    styles: { font: 'helvetica', fontStyle: 'normal' },
  });
  
  doc.save(`${filename}.pdf`);
}

// تنسيق التاريخ
export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// تنسيق المبلغ
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 2,
  }).format(amount);
}

// توليد ID فريد
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// حساب المساحة
export function calculateArea(length: number, width: number): number {
  return length * width;
}

// حساب الحجم
export function calculateVolume(length: number, width: number, height: number): number {
  return length * width * height;
}

// حساب السعر الإجمالي
export function calculateTotalPrice(quantity: number, unitPrice: number): number {
  return quantity * unitPrice;
}

// حساب النسبة المئوية
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}

// حساب الربح
export function calculateProfit(income: number, expenses: number): number {
  return income - expenses;
}

// حساب هامش الربح
export function calculateProfitMargin(income: number, expenses: number): number {
  if (income === 0) return 0;
  return ((income - expenses) / income) * 100;
}

// توليد رقم عشوائي
export function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// تقصير النص
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// التحقق من صحة رقم الهاتف المصري
export function isValidEgyptianPhone(phone: string): boolean {
  const regex = /^(01)[0-2,5]{1}[0-9]{8}$/;
  return regex.test(phone);
}

// الحصول على حالة المشروع بالعربية
export function getProjectStatus(status: string): string {
  const statuses: { [key: string]: string } = {
    pending: 'معلق',
    measuring: 'رفع مقاسات',
    designing: 'تصميم',
    manufacturing: 'تصنيع',
    ready: 'جاهز',
    delivered: 'تم التسليم',
    cancelled: 'ملغي',
  };
  return statuses[status] || status;
}

// الحصول على نوع المشروع بالعربية
export function getProjectType(type: string): string {
  const types: { [key: string]: string } = {
    kitchen: 'مطبخ',
    dressing: 'دريسنج',
    furniture: 'أثاث',
    other: 'أخرى',
  };
  return types[type] || type;
}

// الحصول على نوع الموعد بالعربية
export function getAppointmentType(type: string): string {
  const types: { [key: string]: string } = {
    measurement: 'رفع مقاسات',
    design: 'تصميم',
    delivery: 'تسليم',
    installation: 'تركيب',
    follow_up: 'متابعة',
    other: 'أخرى',
  };
  return types[type] || type;
}

// الحصول على فئة المصروف بالعربية
export function getExpenseCategory(category: string): string {
  const categories: { [key: string]: string } = {
    materials: 'خامات',
    labor: 'عمالة',
    transport: 'نقل',
    installation: 'تركيب',
    design: 'تصميم',
    waste: 'هالك',
    other: 'أخرى',
  };
  return categories[category] || category;
}

// تحويل الصورة إلى Base64
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

// حفظ الصورة في LocalStorage
export async function saveImageToStorage(file: File, key: string): Promise<string> {
  const base64 = await fileToBase64(file);
  const images = JSON.parse(localStorage.getItem(key) || '[]');
  images.push(base64);
  localStorage.setItem(key, JSON.stringify(images));
  return base64;
}

// الحصول على الإشعارات القادمة
export function getUpcomingNotifications(appointments: any[], days: number = 3): any[] {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + days);
  
  return appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    return appointmentDate >= today && appointmentDate <= futureDate && !appointment.isCompleted;
  });
}

// حساب إجمالي المبيعات
export function calculateTotalSales(projects: any[]): number {
  return projects.reduce((total, project) => total + (project.totalPrice || 0), 0);
}

// حساب إجمالي المدفوعات
export function calculateTotalPayments(payments: any[]): number {
  return payments.reduce((total, payment) => total + (payment.amount || 0), 0);
}

// حساب إجمالي المصروفات
export function calculateTotalExpenses(expenses: any[]): number {
  return expenses.reduce((total, expense) => total + (expense.amount || 0), 0);
}

// حساب صافي الربح
export function calculateNetProfit(income: number, expenses: number): number {
  return income - expenses;
}
