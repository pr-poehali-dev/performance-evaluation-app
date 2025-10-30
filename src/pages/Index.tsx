import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import KpiHeader from '@/components/KpiHeader';
import DashboardTab from '@/components/DashboardTab';
import EmployeesTab from '@/components/EmployeesTab';
import MetricsTab from '@/components/MetricsTab';
import ExportTab from '@/components/ExportTab';
import { Employee, AdditionalMetric, calculatePercentage, calculateGrade } from '@/lib/kpi-utils';

export default function Index() {
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: '1',
      name: 'Иванов А.',
      plan: 80000,
      fact: 30000,
      percentage: 37.5,
      grade: 2,
    },
    {
      id: '2',
      name: 'Петров Б.',
      plan: 100000,
      fact: 85000,
      percentage: 85,
      grade: 5,
    },
    {
      id: '3',
      name: 'Сидорова В.',
      plan: 75000,
      fact: 52000,
      percentage: 69.3,
      grade: 4,
    },
  ]);

  const [additionalMetrics, setAdditionalMetrics] = useState<AdditionalMetric[]>([
    { id: '1', name: 'Качество работы', plan: 100, fact: 78, percentage: 78 },
    { id: '2', name: 'Сроки выполнения', plan: 100, fact: 92, percentage: 92 },
    { id: '3', name: 'Клиентский сервис', plan: 100, fact: 65, percentage: 65 },
  ]);

  const [employeeCount, setEmployeeCount] = useState<number>(employees.length);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const calculateAdditionalBonus = (): number => {
    if (additionalMetrics.length === 0) return 0;
    const sum = additionalMetrics.reduce((acc, m) => acc + m.percentage, 0);
    return sum / additionalMetrics.length;
  };

  const recalculateEmployees = () => {
    const additionalBonus = calculateAdditionalBonus();
    setEmployees((prev) =>
      prev.map((emp) => {
        const basePercentage = calculatePercentage(emp.fact, emp.plan);
        const finalPercentage = basePercentage + additionalBonus / employeeCount;
        const grade = calculateGrade(finalPercentage);
        return { ...emp, percentage: finalPercentage, grade };
      })
    );
  };

  const updateEmployee = (id: string, field: 'plan' | 'fact', value: number) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === id) {
          const updatedEmp = { ...emp, [field]: value };
          const percentage = calculatePercentage(updatedEmp.fact, updatedEmp.plan);
          const additionalBonus = calculateAdditionalBonus();
          const finalPercentage = percentage + additionalBonus / employeeCount;
          const grade = calculateGrade(finalPercentage);
          return { ...updatedEmp, percentage: finalPercentage, grade };
        }
        return emp;
      })
    );
  };

  const updateMetric = (id: string, field: 'plan' | 'fact', value: number) => {
    setAdditionalMetrics((prev) =>
      prev.map((metric) => {
        if (metric.id === id) {
          const updated = { ...metric, [field]: value };
          const percentage = calculatePercentage(updated.fact, updated.plan);
          return { ...updated, percentage };
        }
        return metric;
      })
    );
    recalculateEmployees();
  };

  const addEmployee = () => {
    const newEmployee: Employee = {
      id: Date.now().toString(),
      name: `Сотрудник ${employees.length + 1}`,
      plan: 0,
      fact: 0,
      percentage: 0,
      grade: 0,
    };
    setEmployees([...employees, newEmployee]);
    setEmployeeCount((prev) => prev + 1);
  };

  const deleteEmployee = (id: string) => {
    setEmployees((prev) => prev.filter((emp) => emp.id !== id));
    setEmployeeCount((prev) => prev - 1);
  };

  const addMetric = () => {
    const newMetric: AdditionalMetric = {
      id: Date.now().toString(),
      name: `Показатель ${additionalMetrics.length + 1}`,
      plan: 100,
      fact: 0,
      percentage: 0,
    };
    setAdditionalMetrics([...additionalMetrics, newMetric]);
    recalculateEmployees();
  };

  const deleteMetric = (id: string) => {
    setAdditionalMetrics((prev) => prev.filter((metric) => metric.id !== id));
    recalculateEmployees();
  };

  const handleEmployeeCountChange = (count: number) => {
    setEmployeeCount(count);
    recalculateEmployees();
  };

  const generatePdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const response = await fetch('https://functions.poehali.dev/6d689a55-e2ea-4ddd-b4f0-af97f10fe8b2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employees: employees,
          metrics: additionalMetrics,
        }),
      });

      const data = await response.json();
      
      if (data.success && data.pdf) {
        const byteCharacters = atob(data.pdf);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = data.filename || 'kpi-report.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Ошибка при генерации PDF. Попробуйте снова.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const averageGrade = employees.reduce((sum, emp) => sum + emp.grade, 0) / employees.length;
  const totalPlan = employees.reduce((sum, emp) => sum + emp.plan, 0);
  const totalFact = employees.reduce((sum, emp) => sum + emp.fact, 0);
  const overallPercentage = calculatePercentage(totalFact, totalPlan);
  const additionalBonus = calculateAdditionalBonus();

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        <KpiHeader
          employeeCount={employees.length}
          averageGrade={averageGrade}
          totalPlan={totalPlan}
          overallPercentage={overallPercentage}
        />

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-muted">
            <TabsTrigger value="dashboard">
              <Icon name="LayoutDashboard" size={16} className="mr-2" />
              Дашборд
            </TabsTrigger>
            <TabsTrigger value="employees">
              <Icon name="Users" size={16} className="mr-2" />
              Сотрудники
            </TabsTrigger>
            <TabsTrigger value="metrics">
              <Icon name="LineChart" size={16} className="mr-2" />
              Показатели
            </TabsTrigger>
            <TabsTrigger value="export">
              <Icon name="Download" size={16} className="mr-2" />
              Экспорт
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <DashboardTab employees={employees} />
          </TabsContent>

          <TabsContent value="employees">
            <EmployeesTab
              employees={employees}
              employeeCount={employeeCount}
              additionalBonus={additionalBonus}
              onUpdateEmployee={updateEmployee}
              onAddEmployee={addEmployee}
              onDeleteEmployee={deleteEmployee}
              onEmployeeCountChange={handleEmployeeCountChange}
            />
          </TabsContent>

          <TabsContent value="metrics">
            <MetricsTab
              metrics={additionalMetrics}
              additionalBonus={additionalBonus}
              onUpdateMetric={updateMetric}
              onAddMetric={addMetric}
              onDeleteMetric={deleteMetric}
            />
          </TabsContent>

          <TabsContent value="export">
            <ExportTab
              isGeneratingPdf={isGeneratingPdf}
              onGeneratePdf={generatePdf}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}