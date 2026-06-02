import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LayoutDashboard, Users, Briefcase, Calculator, Package, DollarSign, Calendar, Archive, Wallet, Menu, X, Hammer, Truck, Sparkles, FileCheck } from 'lucide-react';
import { ProfessionalDashboard } from '@/components/dashboard/ProfessionalDashboard';
import { CustomerList } from '@/components/customers/CustomerList';
import { CustomerForm } from '@/components/customers/CustomerForm';
import { ProjectList } from '@/components/projects/ProjectList';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { AreaCalculator } from '@/components/calculator/AreaCalculator';
import { InventoryManager } from '@/components/inventory/InventoryManager';
import { FinanceManager } from '@/components/finance/FinanceManager';
import { CashFlow } from '@/components/finance/CashFlow';
import { AccountingDashboard } from '@/components/finance/AccountingDashboard';
import { AppointmentManager } from '@/components/appointments/AppointmentManager';
import { ArchiveManager } from '@/components/archive/ArchiveManager';
import { AIAssistant } from '@/components/ai/AIAssistant';
import { VoiceCommand } from '@/components/ai/VoiceCommand';

// Import New Upgraded Modules
import { CRMContainer } from '@/components/customers/CRMContainer';
import { CabinetCalculator } from '@/components/calculator/CabinetCalculator';
import { ManufacturingManager } from '@/components/calculator/ManufacturingManager';
import { DocumentManager } from '@/components/quotes/DocumentManager';
import { InstallationTracker } from '@/components/installations/InstallationTracker';

import { 
  useCustomers, 
  useProjects, 
  useProducts, 
  useExpenses, 
  useAppointments,
  useInvoices,
  useRentals,
  useSalaries,
  // New hooks
  useCRMLeads,
  useCabinetCuts,
  useInstallations,
  useInventory
} from '@/hooks/useLocalStorage';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

type Page = 
  | 'dashboard' 
  | 'crm'
  | 'customers' 
  | 'projects' 
  | 'cabinet_calc'
  | 'manufacturing'
  | 'inventory' 
  | 'quotes_contracts'
  | 'installations'
  | 'finance' 
  | 'accounting' 
  | 'cashflow' 
  | 'appointments' 
  | 'archive'
  | 'calculator';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // نماذج العملاء
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  
  // نماذج المشاريع
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);

  // Hooks البيانات الأساسية
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useCustomers();
  const { projects, addProject, updateProject } = useProjects();
  const { expenses, addExpense, deleteExpense } = useExpenses();
  const { appointments, addAppointment, updateAppointment, deleteAppointment } = useAppointments();
  const { invoices, addInvoice, updateInvoice, deleteInvoice } = useInvoices();
  const { rentals, addRental, updateRental, deleteRental } = useRentals();
  const { products } = useProducts();
  const { salaries, addSalary, updateSalary, deleteSalary } = useSalaries();
  const { leads, addLead, updateLead, deleteLead, addTimelineItem } = useCRMLeads();
  const { cabinetCuts, addCabinetCut } = useCabinetCuts();
  const { installations, addInstallation, updateInstallation, deleteInstallation } = useInstallations();
  const { inventoryItems, addInventoryItem, updateInventoryItem, deleteInventoryItem } = useInventory();

  // عناصر القائمة الجانبية المحدثة للـ ERP
  const menuItems = [
    { id: 'dashboard', label: 'الرئيسية (Dashboard)', icon: LayoutDashboard },
    { id: 'crm', label: 'بوابة الـ CRM والعملاء', icon: Users },
    { id: 'projects', label: 'إدارة مشاريع التنفيذ', icon: Briefcase },
    { id: 'cabinet_calc', label: 'حاسبة تقطيع الكوابين', icon: Calculator },
    { id: 'manufacturing', label: 'الورشة ومخطط الألواح', icon: Hammer },
    { id: 'inventory', label: 'المستودع والخامات', icon: Package },
    { id: 'quotes_contracts', label: 'العقود والمقايسات', icon: FileCheck },
    { id: 'installations', label: 'جدولة التركيبات', icon: Truck },
    { id: 'finance', label: 'الماليات والمصاريف', icon: DollarSign },
    { id: 'accounting', label: 'المحاسبة العامة', icon: Wallet },
    { id: 'cashflow', label: 'التدفق المالي الكاش', icon: Wallet },
    { id: 'appointments', label: 'المواعيد والمعاينات', icon: Calendar },
    { id: 'archive', label: 'الأرشيف العام', icon: Archive },
    { id: 'customers', label: 'دليل اتصالات المعرض', icon: Users },
    { id: 'calculator', label: 'حاسبة الأمتار الأصلية', icon: Calculator },
  ];

  // معالجات العملاء
  const handleAddCustomer = (customer: any) => {
    addCustomer(customer);
    toast.success('تم إضافة العميل بنجاح');
  };

  const handleUpdateCustomer = (customer: any) => {
    updateCustomer(editingCustomer.id, customer);
    setEditingCustomer(null);
    toast.success('تم تحديث بيانات العميل');
  };

  const handleDeleteCustomer = (id: string) => {
    deleteCustomer(id);
    toast.success('تم حذف العميل');
  };

  // معالجات المشاريع
  const handleAddProject = (project: any) => {
    addProject(project);
    toast.success('تم إضافة المشروع بنجاح');
  };

  const handleUpdateProject = (project: any) => {
    updateProject(editingProject.id, project);
    setEditingProject(null);
    toast.success('تم تحديث المشروع');
  };



  // معالجات المصروفات
  const handleAddExpense = (expense: any) => {
    addExpense(expense);
    toast.success('تم إضافة المصروف');
  };

  const handleDeleteExpense = (id: string) => {
    deleteExpense(id);
    toast.success('تم حذف المصروف');
  };

  // معالجات المواعيد
  const handleAddAppointment = (appointment: any) => {
    addAppointment(appointment);
    toast.success('تم إضافة الموعد');
  };

  const handleUpdateAppointment = (id: string, updates: any) => {
    updateAppointment(id, updates);
    toast.success('تم تحديث الموعد');
  };

  const handleDeleteAppointment = (id: string) => {
    deleteAppointment(id);
    toast.success('تم حذف الموعد');
  };

  // عرض الصفحة الحالية
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <ProfessionalDashboard
            customers={customers}
            projects={projects}
            products={products}
            expenses={expenses}
            appointments={appointments}
            leads={leads}
            installations={installations}
            onNavigate={(page) => setCurrentPage(page as Page)}
          />
        );
      
      case 'crm':
        return (
          <CRMContainer 
            leads={leads}
            addLead={addLead}
            updateLead={updateLead}
            deleteLead={deleteLead}
            addTimelineItem={addTimelineItem}
          />
        );

      case 'customers':
        return (
          <>
            <CustomerList
              customers={customers}
              projects={projects}
              onAdd={() => {
                setEditingCustomer(null);
                setIsCustomerFormOpen(true);
              }}
              onEdit={(customer) => {
                setEditingCustomer(customer);
                setIsCustomerFormOpen(true);
              }}
              onDelete={handleDeleteCustomer}
              onViewProjects={() => {
                setCurrentPage('projects');
              }}
            />
            <CustomerForm
              isOpen={isCustomerFormOpen}
              onClose={() => setIsCustomerFormOpen(false)}
              onSubmit={editingCustomer ? handleUpdateCustomer : handleAddCustomer}
              initialData={editingCustomer}
            />
          </>
        );
      
      case 'projects':
        return (
          <>
            <ProjectList
              projects={projects}
              customers={customers}
              onAdd={() => {
                setEditingProject(null);
                setIsProjectFormOpen(true);
              }}
              onEdit={(project) => {
                setEditingProject(project);
                setIsProjectFormOpen(true);
              }}
            />
            <ProjectForm
              isOpen={isProjectFormOpen}
              onClose={() => setIsProjectFormOpen(false)}
              onSubmit={editingProject ? handleUpdateProject : handleAddProject}
              customers={customers}
              initialData={editingProject}
            />
          </>
        );
      
      case 'cabinet_calc':
        return (
          <CabinetCalculator 
            onSaveCutList={(cut) => {
              addCabinetCut(cut);
              toast.success('تم حفظ جدول تقطيع الكابينة بنجاح');
            }}
            projects={projects}
          />
        );

      case 'manufacturing':
        return (
          <ManufacturingManager 
            projects={projects}
            savedCuts={cabinetCuts}
            updateProjectStatus={updateProject}
          />
        );

      case 'inventory':
        return (
          <InventoryManager
            products={inventoryItems} // Upgraded raw inventory items
            onAdd={addInventoryItem}
            onUpdate={updateInventoryItem}
            onDelete={deleteInventoryItem}
          />
        );

      case 'quotes_contracts':
        return (
          <DocumentManager 
            customers={customers}
            projects={projects}
          />
        );

      case 'installations':
        return (
          <InstallationTracker 
            installations={installations}
            projects={projects}
            addInstallation={addInstallation}
            updateInstallation={updateInstallation}
            deleteInstallation={deleteInstallation}
          />
        );
      
      case 'calculator':
        return <AreaCalculator />;
      
      case 'finance':
        return (
          <FinanceManager
            projects={projects}
            expenses={expenses}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        );
      
      case 'accounting':
        return (
          <AccountingDashboard
            invoices={invoices}
            rentals={rentals}
            salaries={salaries}
            onAddInvoice={addInvoice}
            onUpdateInvoice={updateInvoice}
            onDeleteInvoice={deleteInvoice}
            onAddRental={addRental}
            onUpdateRental={updateRental}
            onDeleteRental={deleteRental}
            onAddSalary={addSalary}
            onUpdateSalary={updateSalary}
            onDeleteSalary={deleteSalary}
          />
        );
      
      case 'cashflow':
        return (
          <CashFlow
            projects={projects}
            expenses={expenses}
          />
        );
      
      case 'appointments':
        return (
          <AppointmentManager
            appointments={appointments}
            customers={customers}
            onAdd={handleAddAppointment}
            onUpdate={handleUpdateAppointment}
            onDelete={handleDeleteAppointment}
          />
        );
      
      case 'archive':
        return (
          <ArchiveManager
            projects={projects}
            expenses={expenses}
            appointments={appointments}
          />
        );
      
      default:
        return (
          <ProfessionalDashboard 
            customers={customers}
            projects={projects}
            products={products}
            expenses={expenses}
            appointments={appointments}
            leads={leads}
            installations={installations}
            onNavigate={(page) => setCurrentPage(page as Page)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-neutral-900" dir="rtl">
      <Toaster position="top-center" richColors />
      
      {/* Premium Luxury Sidebar Navigation (Matte Black / Charcoal) */}
      <aside 
        className={`fixed top-0 bottom-0 right-0 bg-[#121212] border-l border-neutral-900 shadow-2xl transition-all duration-300 z-50 flex flex-col justify-between ${
          sidebarOpen ? 'w-64' : 'w-0 overflow-hidden border-l-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Brand Header */}
          <div className="p-5 border-b border-neutral-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#B39367] animate-pulse" />
              <div>
                <span className="font-black text-xs text-stone-100 tracking-wider block">TKL – The Kitchen LAB</span>
                <span className="text-[8px] text-stone-400 font-bold block uppercase">Kitchen ERP Enterprise</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-stone-400 hover:text-stone-100 p-0 hover:bg-neutral-800"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-3 overflow-y-auto space-y-1 scrollbar-hide">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isSelected = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id as Page)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-right text-xs font-bold transition-all duration-200 ${
                    isSelected 
                      ? 'bg-[#B39367] text-[#121212] font-black shadow-md' 
                      : 'text-stone-400 hover:text-stone-100 hover:bg-neutral-900'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Profile Info */}
          <div className="p-4 border-t border-neutral-900 text-center">
            <span className="text-[10px] text-stone-400 font-bold block">مرحباً بك</span>
            <span className="text-xs font-extrabold text-[#B39367] mt-0.5 block">المدير العام / المسؤول المالي</span>
          </div>
        </div>
      </aside>

      {/* Main Layout Header & Content */}
      <div 
        className={`min-h-screen transition-all duration-300 ${
          sidebarOpen ? 'mr-64' : 'mr-0'
        }`}
      >
        {/* Header bar */}
        <header className="bg-white border-b border-stone-200 fixed top-0 left-0 z-40 right-0 h-16 transition-all duration-300" style={{ right: sidebarOpen ? '16rem' : '0' }}>
          <div className="flex items-center justify-between h-full px-5">
            <div className="flex items-center gap-4">
              {!sidebarOpen && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-stone-100 border border-stone-200"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="w-5 h-5 text-neutral-800" />
                </Button>
              )}
              <h1 className="text-md font-black text-neutral-950 flex items-center gap-1.5">
                نظام تخطيط وتصنيع المطابخ (TKL ERP)
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-neutral-900 text-[#B39367] text-[10px] font-black tracking-widest px-2.5 py-1">
                TKL LUXURY LAB
              </Badge>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="pt-16 min-h-screen bg-stone-50">
          <div className="p-6 max-w-7xl mx-auto">
            {renderPage()}
          </div>
        </main>
      </div>

      {/* AIAssistant floating trigger */}
      <AIAssistant 
        projects={projects}
        products={products}
        expenses={expenses}
      />

      {/* Voice Command recognition */}
      <VoiceCommand 
        onNavigate={(page) => setCurrentPage(page as Page)}
        onAddCustomer={handleAddCustomer}
        onAddExpense={handleAddExpense}
      />
    </div>
  );
}

export default App;
