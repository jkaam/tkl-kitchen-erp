import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const item = window.localStorage.getItem(key);
        if (item) {
          setStoredValue(JSON.parse(item));
        }
      } catch (error) {
        console.error('Error reading from localStorage:', error);
      }
    }
  }, [key]);

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      setStoredValue(prev => {
        const valueToStore = value instanceof Function ? value(prev) : value;
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
        return valueToStore;
      });
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [key]);

  return [storedValue, setValue];
}

// Hook للعملاء
export function useCustomers() {
  const [customers, setCustomers] = useLocalStorage<any[]>('customers', []);
  
  const addCustomer = useCallback((customer: any) => {
    const newCustomer = {
      ...customer,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCustomers(prev => [...prev, newCustomer]);
    return newCustomer;
  }, [setCustomers]);

  const updateCustomer = useCallback((id: string, updates: any) => {
    setCustomers(prev => prev.map(c => 
      c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
    ));
  }, [setCustomers]);

  const deleteCustomer = useCallback((id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
  }, [setCustomers]);

  const getCustomerById = useCallback((id: string) => {
    return customers.find(c => c.id === id);
  }, [customers]);

  return { customers, addCustomer, updateCustomer, deleteCustomer, getCustomerById };
}

// Hook للمشاريع
export function useProjects() {
  const [projects, setProjects] = useLocalStorage<any[]>('projects', []);
  
  const addProject = useCallback((project: any) => {
    const newProject = {
      ...project,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects(prev => [...prev, newProject]);
    return newProject;
  }, [setProjects]);

  const updateProject = useCallback((id: string, updates: any) => {
    setProjects(prev => prev.map(p => 
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    ));
  }, [setProjects]);

  const deleteProject = useCallback((id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  }, [setProjects]);

  const getProjectById = useCallback((id: string) => {
    return projects.find(p => p.id === id);
  }, [projects]);

  const getProjectsByCustomer = useCallback((customerId: string) => {
    return projects.filter(p => p.customerId === customerId);
  }, [projects]);

  return { projects, addProject, updateProject, deleteProject, getProjectById, getProjectsByCustomer };
}

// Hook للمنتجات
export function useProducts() {
  const [products, setProducts] = useLocalStorage<any[]>('products', []);
  
  const addProduct = useCallback((product: any) => {
    const newProduct = {
      ...product,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProducts(prev => [...prev, newProduct]);
    return newProduct;
  }, [setProducts]);

  const updateProduct = useCallback((id: string, updates: any) => {
    setProducts(prev => prev.map(p => 
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    ));
  }, [setProducts]);

  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  }, [setProducts]);

  const getProductById = useCallback((id: string) => {
    return products.find(p => p.id === id);
  }, [products]);

  return { products, addProduct, updateProduct, deleteProduct, getProductById };
}

// Hook للمصروفات
export function useExpenses() {
  const [expenses, setExpenses] = useLocalStorage<any[]>('expenses', []);
  
  const addExpense = useCallback((expense: any) => {
    const newExpense = {
      ...expense,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setExpenses(prev => [...prev, newExpense]);
    return newExpense;
  }, [setExpenses]);

  const updateExpense = useCallback((id: string, updates: any) => {
    setExpenses(prev => prev.map(e => 
      e.id === id ? { ...e, ...updates } : e
    ));
  }, [setExpenses]);

  const deleteExpense = useCallback((id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  }, [setExpenses]);

  return { expenses, addExpense, updateExpense, deleteExpense };
}

// Hook للمواعيد
export function useAppointments() {
  const [appointments, setAppointments] = useLocalStorage<any[]>('appointments', []);
  
  const addAppointment = useCallback((appointment: any) => {
    const newAppointment = {
      ...appointment,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setAppointments(prev => [...prev, newAppointment]);
    return newAppointment;
  }, [setAppointments]);

  const updateAppointment = useCallback((id: string, updates: any) => {
    setAppointments(prev => prev.map(a => 
      a.id === id ? { ...a, ...updates } : a
    ));
  }, [setAppointments]);

  const deleteAppointment = useCallback((id: string) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
  }, [setAppointments]);

  const getUpcomingAppointments = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return appointments.filter(a => a.date >= today && !a.isCompleted);
  }, [appointments]);

  return { appointments, addAppointment, updateAppointment, deleteAppointment, getUpcomingAppointments };
}

// Hook للدفعات
export function usePayments() {
  const [payments, setPayments] = useLocalStorage<any[]>('payments', []);
  
  const addPayment = useCallback((payment: any) => {
    const newPayment = {
      ...payment,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setPayments(prev => [...prev, newPayment]);
    return newPayment;
  }, [setPayments]);

  const deletePayment = useCallback((id: string) => {
    setPayments(prev => prev.filter(p => p.id !== id));
  }, [setPayments]);

  const getPaymentsByProject = useCallback((projectId: string) => {
    return payments.filter(p => p.projectId === projectId);
  }, [payments]);

  return { payments, addPayment, deletePayment, getPaymentsByProject };
}

// Hook للفواتير
export function useInvoices() {
  const [invoices, setInvoices] = useLocalStorage<any[]>('invoices', []);
  
  const addInvoice = useCallback((invoice: any) => {
    const newInvoice = {
      ...invoice,
      id: Date.now().toString(),
      invoiceNumber: `INV-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setInvoices(prev => [...prev, newInvoice]);
    return newInvoice;
  }, [setInvoices]);

  const updateInvoice = useCallback((id: string, updates: any) => {
    setInvoices(prev => prev.map(i => 
      i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i
    ));
  }, [setInvoices]);

  const deleteInvoice = useCallback((id: string) => {
    setInvoices(prev => prev.filter(i => i.id !== id));
  }, [setInvoices]);

  const getInvoiceById = useCallback((id: string) => {
    return invoices.find(i => i.id === id);
  }, [invoices]);

  const getOverdueInvoices = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return invoices.filter(i => i.dueDate < today && i.status !== 'paid');
  }, [invoices]);

  const getPendingInvoices = useCallback(() => {
    return invoices.filter(i => i.status === 'pending' || i.status === 'partial');
  }, [invoices]);

  return { invoices, addInvoice, updateInvoice, deleteInvoice, getInvoiceById, getOverdueInvoices, getPendingInvoices };
}

// Hook للأجارات
export function useRentals() {
  const [rentals, setRentals] = useLocalStorage<any[]>('rentals', []);
  
  const addRental = useCallback((rental: any) => {
    const newRental = {
      ...rental,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setRentals(prev => [...prev, newRental]);
    return newRental;
  }, [setRentals]);

  const updateRental = useCallback((id: string, updates: any) => {
    setRentals(prev => prev.map(r => 
      r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
    ));
  }, [setRentals]);

  const deleteRental = useCallback((id: string) => {
    setRentals(prev => prev.filter(r => r.id !== id));
  }, [setRentals]);

  const getActiveRentals = useCallback(() => {
    return rentals.filter(r => r.status === 'active');
  }, [rentals]);

  const getRentalById = useCallback((id: string) => {
    return rentals.find(r => r.id === id);
  }, [rentals]);

  return { rentals, addRental, updateRental, deleteRental, getActiveRentals, getRentalById };
}

// Hook للرواتب
export function useSalaries() {
  const [salaries, setSalaries] = useLocalStorage<any[]>('salaries', []);
  
  const addSalary = useCallback((salary: any) => {
    const newSalary = {
      ...salary,
      id: Date.now().toString(),
      netSalary: (salary.baseSalary || 0) + (salary.allowances || 0) - (salary.deductions || 0),
      createdAt: new Date().toISOString(),
    };
    setSalaries(prev => [...prev, newSalary]);
    return newSalary;
  }, [setSalaries]);

  const updateSalary = useCallback((id: string, updates: any) => {
    setSalaries(prev => prev.map(s => {
      if (s.id === id) {
        const base = updates.baseSalary ?? s.baseSalary;
        const allowances = updates.allowances ?? s.allowances;
        const deductions = updates.deductions ?? s.deductions;
        return { ...s, ...updates, netSalary: base + allowances - deductions };
      }
      return s;
    }));
  }, [setSalaries]);

  const deleteSalary = useCallback((id: string) => {
    setSalaries(prev => prev.filter(s => s.id !== id));
  }, [setSalaries]);

  const getPendingSalaries = useCallback(() => {
    return salaries.filter(s => s.status !== 'paid');
  }, [salaries]);

  return { salaries, addSalary, updateSalary, deleteSalary, getPendingSalaries };
}

// Hook للتنبيهات المالية
export function useFinancialReminders() {
  const [reminders, setReminders] = useLocalStorage<any[]>('financialReminders', []);
  
  const addReminder = useCallback((reminder: any) => {
    const newReminder = {
      ...reminder,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setReminders(prev => [...prev, newReminder]);
    return newReminder;
  }, [setReminders]);

  const updateReminder = useCallback((id: string, updates: any) => {
    setReminders(prev => prev.map(r => 
      r.id === id ? { ...r, ...updates } : r
    ));
  }, [setReminders]);

  const deleteReminder = useCallback((id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  }, [setReminders]);

  const checkDueReminders = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return reminders.filter(r => r.isActive && r.dueDate <= today);
  }, [reminders]);

  return { reminders, addReminder, updateReminder, deleteReminder, checkDueReminders };
}

// Hook لإدارة عملاء الـ CRM والصفقات
export function useCRMLeads() {
  const [leads, setLeads] = useLocalStorage<any[]>('crm_leads', [
    // بيانات تجريبية أولية لإثراء لوحة التحكم عند البدء
    {
      id: 'lead-1',
      name: 'أحمد محمود',
      phone: '01012345678',
      whatsapp: '201012345678',
      address: 'القاهرة، مصر الجديدة',
      source: 'instagram',
      stage: 'design',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [
        { id: 't1', type: 'call', text: 'الاتصال الأول والاتفاق على الموعد', date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 't2', type: 'meeting', text: 'زيارة صالة العرض ومناقشة التصميم الأولي', date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() }
      ]
    },
    {
      id: 'lead-2',
      name: 'سارة أحمد',
      phone: '01234567890',
      whatsapp: '201234567890',
      address: 'التجمع الخامس، فيلا 12',
      source: 'referral',
      stage: 'quotation',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [
        { id: 't3', type: 'note', text: 'العميلة تفضل التصميم الكلاسيكي مع ألوان بيج وتفاصيل برونزية', date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() }
      ]
    }
  ]);

  const addLead = useCallback((lead: any) => {
    const newLead = {
      ...lead,
      id: 'crm-' + Date.now().toString(),
      stage: lead.stage || 'new',
      timeline: lead.timeline || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setLeads(prev => [...prev, newLead]);
    return newLead;
  }, [setLeads]);

  const updateLead = useCallback((id: string, updates: any) => {
    setLeads(prev => prev.map(l => 
      l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l
    ));
  }, [setLeads]);

  const deleteLead = useCallback((id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
  }, [setLeads]);

  const addTimelineItem = useCallback((leadId: string, item: { type: string, text: string }) => {
    const newItem = {
      id: 'time-' + Date.now().toString(),
      type: item.type,
      text: item.text,
      date: new Date().toISOString()
    };
    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        return {
          ...l,
          timeline: [newItem, ...(l.timeline || [])],
          updatedAt: new Date().toISOString()
        };
      }
      return l;
    }));
  }, [setLeads]);

  return { leads, addLead, updateLead, deleteLead, addTimelineItem };
}

// Hook لحفظ المقاسات وحسابات التقطيع
export function useCabinetCuts() {
  const [cabinetCuts, setCabinetCuts] = useLocalStorage<any[]>('cabinet_cuts', []);

  const addCabinetCut = useCallback((cut: any) => {
    const newCut = {
      ...cut,
      id: 'cut-' + Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setCabinetCuts(prev => [newCut, ...prev]);
    return newCut;
  }, [setCabinetCuts]);

  const deleteCabinetCut = useCallback((id: string) => {
    setCabinetCuts(prev => prev.filter(c => c.id !== id));
  }, [setCabinetCuts]);

  return { cabinetCuts, addCabinetCut, deleteCabinetCut };
}

// Hook لإدارة التركيبات
export function useInstallations() {
  const [installations, setInstallations] = useLocalStorage<any[]>('installations', []);

  const addInstallation = useCallback((installation: any) => {
    const newInst = {
      ...installation,
      id: 'inst-' + Date.now().toString(),
      status: installation.status || 'scheduled',
      beforePhotos: installation.beforePhotos || [],
      afterPhotos: installation.afterPhotos || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setInstallations(prev => [...prev, newInst]);
    return newInst;
  }, [setInstallations]);

  const updateInstallation = useCallback((id: string, updates: any) => {
    setInstallations(prev => prev.map(i => 
      i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i
    ));
  }, [setInstallations]);

  const deleteInstallation = useCallback((id: string) => {
    setInstallations(prev => prev.filter(i => i.id !== id));
  }, [setInstallations]);

  return { installations, addInstallation, updateInstallation, deleteInstallation };
}

// Hook لعقود البيع والمشاريع
export function useContracts() {
  const [contracts, setContracts] = useLocalStorage<any[]>('contracts', []);

  const addContract = useCallback((contract: any) => {
    const newContract = {
      ...contract,
      id: 'cont-' + Date.now().toString(),
      status: contract.status || 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setContracts(prev => [...prev, newContract]);
    return newContract;
  }, [setContracts]);

  const updateContract = useCallback((id: string, updates: any) => {
    setContracts(prev => prev.map(c => 
      c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
    ));
  }, [setContracts]);

  const deleteContract = useCallback((id: string) => {
    setContracts(prev => prev.filter(c => c.id !== id));
  }, [setContracts]);

  return { contracts, addContract, updateContract, deleteContract };
}

// Hook لإدارة خامات ومستلزمات الإنتاج (المخزن الصناعي)
export function useInventory() {
  const [inventoryItems, setInventoryItems] = useLocalStorage<any[]>('raw_inventory', [
    { id: 'inv-1', name: 'لوح MDF مغطى ميلامين 18مم', type: 'board', quantity: 45, minQuantity: 10, unit: 'لوح', unitPrice: 1200, supplier: 'الشركة المصرية للأخشاب' },
    { id: 'inv-2', name: 'لوح HPL رمادي غامق 1مم', type: 'hpl', quantity: 24, minQuantity: 5, unit: 'لوح', unitPrice: 950, supplier: 'تكنوود' },
    { id: 'inv-3', name: 'مفصلات هايفيل 110 درجة هيدروليك', type: 'hinge', quantity: 180, minQuantity: 50, unit: 'قطعة', unitPrice: 45, supplier: 'وكيل هافيل' },
    { id: 'inv-4', name: 'مجرى درج تاندوم بوكس بلوم 50سم', type: 'drawer', quantity: 12, minQuantity: 15, unit: 'طقم', unitPrice: 650, supplier: 'بلوم مصر' },
    { id: 'inv-5', name: 'مقبض ألومنيوم مدمج برونزي 20سم', type: 'handle', quantity: 80, minQuantity: 20, unit: 'قطعة', unitPrice: 75, supplier: 'الأهرام للمعادن' }
  ]);

  const addInventoryItem = useCallback((item: any) => {
    const newItem = {
      ...item,
      id: 'inv-' + Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setInventoryItems(prev => [...prev, newItem]);
    return newItem;
  }, [setInventoryItems]);

  const updateInventoryItem = useCallback((id: string, updates: any) => {
    setInventoryItems(prev => prev.map(i => 
      i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i
    ));
  }, [setInventoryItems]);

  const deleteInventoryItem = useCallback((id: string) => {
    setInventoryItems(prev => prev.filter(i => i.id !== id));
  }, [setInventoryItems]);

  const adjustStock = useCallback((id: string, amount: number) => {
    setInventoryItems(prev => prev.map(i => {
      if (i.id === id) {
        const newQty = Math.max(0, i.quantity + amount);
        return { ...i, quantity: newQty, updatedAt: new Date().toISOString() };
      }
      return i;
    }));
  }, [setInventoryItems]);

  return { inventoryItems, addInventoryItem, updateInventoryItem, deleteInventoryItem, adjustStock };
}
