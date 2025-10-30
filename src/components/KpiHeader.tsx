import Icon from '@/components/ui/icon';
import { Card } from '@/components/ui/card';

interface KpiHeaderProps {
  employeeCount: number;
  averageGrade: number;
  totalPlan: number;
  overallPercentage: number;
}

export default function KpiHeader({ employeeCount, averageGrade, totalPlan, overallPercentage }: KpiHeaderProps) {
  return (
    <>
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
          <div className="text-3xl font-bold font-mono">{employeeCount}</div>
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
    </>
  );
}
