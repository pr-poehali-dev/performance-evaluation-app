import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Employee {
  id: string;
  name: string;
  plan: number;
  fact: number;
  percentage: number;
  grade: number;
}

interface AdditionalMetric {
  id: string;
  name: string;
  plan: number;
  fact: number;
  percentage: number;
}

const calculatePercentage = (fact: number, plan: number): number => {
  if (plan === 0) return 0;
  return (fact / plan) * 100;
};

const calculateGrade = (percentage: number): number => {
  if (percentage <= 10) return 0;
  if (percentage <= 35) return 1;
  if (percentage <= 50) return 2;
  if (percentage <= 65) return 3;
  if (percentage <= 79) return 4;
  return 5;
};

const getGradeColor = (grade: number): string => {
  const colors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-green-500',
  ];
  return colors[grade] || 'bg-gray-500';
};

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

  const averageGrade = employees.reduce((sum, emp) => sum + emp.grade, 0) / employees.length;
  const totalPlan = employees.reduce((sum, emp) => sum + emp.plan, 0);
  const totalFact = employees.reduce((sum, emp) => sum + emp.fact, 0);
  const overallPercentage = calculatePercentage(totalFact, totalPlan);

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

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

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              KPI Аналитика
            </h1>
            <p className="text-muted-foreground">
              Система оценки выполнения плана
            </p>
          </div>
          <Icon name="BarChart3" size={48} className="text-primary" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Сотрудников</span>
              <Icon name="Users" size={20} className="text-primary" />
            </div>
            <div className="text-3xl font-bold font-mono">{employees.length}</div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Средняя оценка</span>
              <Icon name="TrendingUp" size={20} className="text-success" />
            </div>
            <div className="text-3xl font-bold font-mono">{averageGrade.toFixed(1)}</div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">План всего</span>
              <Icon name="Target" size={20} className="text-warning" />
            </div>
            <div className="text-3xl font-bold font-mono">
              {totalPlan.toLocaleString('ru-RU')}
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Общий процент</span>
              <Icon name="Activity" size={20} className="text-primary" />
            </div>
            <div className="text-3xl font-bold font-mono">{overallPercentage.toFixed(1)}%</div>
          </Card>
        </div>

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

          <TabsContent value="dashboard" className="space-y-4">
            <Card className="p-6 bg-card border-border">
              <h2 className="text-xl font-semibold mb-4">Распределение оценок</h2>
              <div className="space-y-4">
                {[5, 4, 3, 2, 1, 0].map((grade) => {
                  const count = employees.filter((emp) => emp.grade === grade).length;
                  const percentage = (count / employees.length) * 100;
                  return (
                    <div key={grade}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Оценка {grade}</span>
                        <span className="text-sm text-muted-foreground">
                          {count} ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-6 bg-card border-border">
              <h2 className="text-xl font-semibold mb-4">Топ исполнителей</h2>
              <div className="space-y-3">
                {employees
                  .sort((a, b) => b.percentage - a.percentage)
                  .slice(0, 5)
                  .map((emp, index) => (
                    <div
                      key={emp.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <span className="font-medium">{emp.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm">{emp.percentage.toFixed(1)}%</span>
                        <div className={`w-10 h-10 rounded-full ${getGradeColor(emp.grade)} flex items-center justify-center text-white font-bold`}>
                          {emp.grade}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="employees" className="space-y-4">
            <Card className="p-6 bg-card border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Основная таблица</h2>
                <Button onClick={addEmployee} variant="outline" size="sm">
                  <Icon name="Plus" size={16} className="mr-2" />
                  Добавить
                </Button>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Сотрудник</TableHead>
                      <TableHead>План</TableHead>
                      <TableHead>Факт</TableHead>
                      <TableHead>Процент</TableHead>
                      <TableHead>Оценка</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((emp) => (
                      <TableRow key={emp.id}>
                        <TableCell className="font-medium">{emp.name}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={emp.plan}
                            onChange={(e) => updateEmployee(emp.id, 'plan', Number(e.target.value))}
                            className="w-28 bg-input"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={emp.fact}
                            onChange={(e) => updateEmployee(emp.id, 'fact', Number(e.target.value))}
                            className="w-28 bg-input"
                          />
                        </TableCell>
                        <TableCell className="font-mono">{emp.percentage.toFixed(1)}%</TableCell>
                        <TableCell>
                          <div className={`w-10 h-10 rounded-full ${getGradeColor(emp.grade)} flex items-center justify-center text-white font-bold`}>
                            {emp.grade}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>

            <Card className="p-6 bg-card border-border">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Настройки распределения</h3>
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium">Количество сотрудников:</label>
                  <Input
                    type="number"
                    value={employeeCount}
                    onChange={(e) => {
                      setEmployeeCount(Number(e.target.value));
                      recalculateEmployees();
                    }}
                    className="w-24 bg-input"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Дополнительный процент ({calculateAdditionalBonus().toFixed(1)}%) будет разделен на{' '}
                  {employeeCount} сотрудников
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4">
            <Card className="p-6 bg-card border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Дополнительные показатели</h2>
                <Button onClick={addMetric} variant="outline" size="sm">
                  <Icon name="Plus" size={16} className="mr-2" />
                  Добавить
                </Button>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Показатель</TableHead>
                      <TableHead>План</TableHead>
                      <TableHead>Факт</TableHead>
                      <TableHead>Процент</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {additionalMetrics.map((metric) => (
                      <TableRow key={metric.id}>
                        <TableCell className="font-medium">{metric.name}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={metric.plan}
                            onChange={(e) =>
                              updateMetric(metric.id, 'plan', Number(e.target.value))
                            }
                            className="w-24 bg-input"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={metric.fact}
                            onChange={(e) =>
                              updateMetric(metric.id, 'fact', Number(e.target.value))
                            }
                            className="w-24 bg-input"
                          />
                        </TableCell>
                        <TableCell className="font-mono">{metric.percentage.toFixed(1)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>

            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-semibold mb-4">Итоговый дополнительный процент</h3>
              <div className="text-center">
                <div className="text-5xl font-bold font-mono text-primary mb-2">
                  {calculateAdditionalBonus().toFixed(1)}%
                </div>
                <p className="text-sm text-muted-foreground">
                  Средний процент выполнения дополнительных показателей
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="export" className="space-y-4">
            <Card className="p-6 bg-card border-border">
              <h2 className="text-xl font-semibold mb-4">Экспорт отчетов</h2>
              <div className="space-y-4">
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={generatePdf}
                  disabled={isGeneratingPdf}
                >
                  <Icon name="FileDown" size={20} className="mr-2" />
                  {isGeneratingPdf ? 'Генерация PDF...' : 'Скачать отчет в PDF'}
                </Button>
                <Button className="w-full" variant="outline" size="lg" disabled>
                  <Icon name="FileSpreadsheet" size={20} className="mr-2" />
                  Экспорт в Excel (скоро)
                </Button>
                <Button className="w-full" variant="outline" size="lg" disabled>
                  <Icon name="Printer" size={20} className="mr-2" />
                  Печать отчета (скоро)
                </Button>
              </div>
            </Card>

            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-semibold mb-4">Содержание отчета</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Icon name="Check" size={16} className="mt-0.5 text-success" />
                  <span>Общая статистика по всем сотрудникам</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" size={16} className="mt-0.5 text-success" />
                  <span>Графики выполнения плана</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" size={16} className="mt-0.5 text-success" />
                  <span>Детализация по каждому сотруднику</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" size={16} className="mt-0.5 text-success" />
                  <span>Дополнительные показатели и бонусы</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" size={16} className="mt-0.5 text-success" />
                  <span>Распределение оценок</span>
                </li>
              </ul>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}