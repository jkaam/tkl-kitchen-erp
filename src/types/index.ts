// أنواع البيانات الأساسية للنظام

// نوع العميل
export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  email?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// نوع المنتج/الخامة
export interface Product {
  id: string;
  name: string;
  category: string;
  unit: string;
  unitPrice: number;
  quantity: number;
  minQuantity: number;
  supplier?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// نوع المشروع/الطلب
export interface Project {
  id: string;
  customerId: string;
  customerName: string;
  projectType: 'kitchen' | 'dressing' | 'furniture' | 'other';
  status: 'pending' | 'measuring' | 'designing' | 'manufacturing' | 'ready' | 'delivered' | 'cancelled';
  totalPrice: number;
  paidAmount: number;
  remainingAmount: number;
  measurementsDate?: string;
  designDate?: string;
  deliveryDate?: string;
  measurementsImages: string[];
  designImages: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// نوع بند التكلفة
export interface CostItem {
  id: string;
  projectId: string;
  name: string;
  category: 'materials' | 'labor' | 'transport' | 'installation' | 'design' | 'waste' | 'other';
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  createdAt: string;
}

// نوع المصروف
export interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
  description?: string;
  createdAt: string;
}

// نوع الدفعة/القسط
export interface Payment {
  id: string;
  projectId: string;
  customerId: string;
  amount: number;
  paymentDate: string;
  paymentType: 'cash' | 'bank' | 'installment';
  notes?: string;
  createdAt: string;
}

// نوع الموعد/التنبيه
export interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  projectId?: string;
  type: 'measurement' | 'design' | 'delivery' | 'installation' | 'follow_up' | 'other';
  date: string;
  time?: string;
  location?: string;
  notes?: string;
  isCompleted: boolean;
  createdAt: string;
}

// نوع عرض السعر
export interface Quote {
  id: string;
  customerId: string;
  customerName: string;
  projectType: string;
  items: QuoteItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  validUntil: string;
  notes?: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  createdAt: string;
}

// نوع بند عرض السعر
export interface QuoteItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

// نوع المستخدم
export interface User {
  id: string;
  name: string;
  businessName: string;
  phone: string;
  email?: string;
  logo?: string;
}

// نوع الإشعار
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'appointment' | 'payment' | 'delivery' | 'system';
  date: string;
  isRead: boolean;
  relatedId?: string;
}

// نوع التقرير المالي
export interface FinancialReport {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  totalProjects: number;
  completedProjects: number;
  pendingProjects: number;
  totalCustomers: number;
}

// نوع حاسبة الأمتار
export interface CalculatorItem {
  id: string;
  name: string;
  length: number;
  width: number;
  height?: number;
  quantity: number;
  unitPrice: number;
  totalArea: number;
  totalPrice: number;
}

// نوع الفاتورة
export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  projectId?: string;
  type: 'project' | 'rental' | 'salary' | 'expense' | 'other';
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'partial' | 'overdue' | 'cancelled';
  items: InvoiceItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

// نوع الأجارات
export interface Rental {
  id: string;
  propertyName: string;
  tenantName: string;
  tenantPhone: string;
  monthlyAmount: number;
  startDate: string;
  endDate?: string;
  status: 'active' | 'expired' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// نوع الرواتب
export interface Salary {
  id: string;
  employeeName: string;
  employeePhone: string;
  position: string;
  baseSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  paymentDate: string;
  status: 'paid' | 'pending' | 'delayed';
  notes?: string;
  createdAt: string;
}

// نوع التنبيهات المالية
export interface FinancialReminder {
  id: string;
  type: 'invoice' | 'rental' | 'salary' | 'expense' | 'custom';
  title: string;
  description: string;
  amount?: number;
  relatedId?: string;
  dueDate: string;
  repeatType: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  isActive: boolean;
  lastNotified?: string;
  createdAt: string;
}

// نوع الدليل المحاسبي (شجرة الحسابات)
export interface Account {
  id: string;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  parentId?: string;
  balance: number;
  isActive: boolean;
}

// نوع القيود المحاسبية
export interface JournalEntry {
  id: string;
  entryNumber: string;
  date: string;
  description: string;
  debits: JournalEntryLine[];
  credits: JournalEntryLine[];
  isPosted: boolean;
  createdAt: string;
}

export interface JournalEntryLine {
  accountId: string;
  accountName: string;
  debit: number;
  credit: number;
}
