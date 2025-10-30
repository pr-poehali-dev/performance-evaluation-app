import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Employee, getGradeColor } from '@/lib/kpi-utils';

interface EmployeesTabProps {
  employees: Employee[];
  employeeCount: number;
  additionalBonus: number;
  onUpdateEmployee: (id: string, field: 'plan' | 'fact', value: number) => void;
  onAddEmployee: () => void;
  onDeleteEmployee: (id: string) => void;
  onEmployeeCountChange: (count: number) => void;
}

export default function EmployeesTab({
  employees,
  employeeCount,
  additionalBonus,
  onUpdateEmployee,
  onAddEmployee,
  onDeleteEmployee,
  onEmployeeCountChange,
}: EmployeesTabProps) {
  return (
    <div className="space-y-4">
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Основная таблица</h2>
          <Button onClick={onAddEmployee} variant="outline" size="sm">
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
                <TableHead className="w-16"></TableHead>
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
                      onChange={(e) => onUpdateEmployee(emp.id, 'plan', Number(e.target.value))}
                      className="w-28 bg-input"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={emp.fact}
                      onChange={(e) => onUpdateEmployee(emp.id, 'fact', Number(e.target.value))}
                      className="w-28 bg-input"
                    />
                  </TableCell>
                  <TableCell className="font-mono">{emp.percentage.toFixed(1)}%</TableCell>
                  <TableCell>
                    <div className={`w-10 h-10 rounded-full ${getGradeColor(emp.grade)} flex items-center justify-center text-white font-bold`}>
                      {emp.grade}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteEmployee(emp.id)}
                      className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
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
              onChange={(e) => onEmployeeCountChange(Number(e.target.value))}
              className="w-24 bg-input"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Дополнительный процент ({additionalBonus.toFixed(1)}%) будет разделен на{' '}
            {employeeCount} сотрудников
          </p>
        </div>
      </Card>
    </div>
  );
}