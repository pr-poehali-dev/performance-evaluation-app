import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Employee, getGradeColor } from '@/lib/kpi-utils';

interface DashboardTabProps {
  employees: Employee[];
}

export default function DashboardTab({ employees }: DashboardTabProps) {
  return (
    <div className="space-y-4">
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
    </div>
  );
}
