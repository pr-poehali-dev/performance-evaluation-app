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
import { AdditionalMetric } from '@/lib/kpi-utils';

interface MetricsTabProps {
  metrics: AdditionalMetric[];
  additionalBonus: number;
  onUpdateMetric: (id: string, field: 'plan' | 'fact', value: number) => void;
  onAddMetric: () => void;
}

export default function MetricsTab({
  metrics,
  additionalBonus,
  onUpdateMetric,
  onAddMetric,
}: MetricsTabProps) {
  return (
    <div className="space-y-4">
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Дополнительные показатели</h2>
          <Button onClick={onAddMetric} variant="outline" size="sm">
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
              {metrics.map((metric) => (
                <TableRow key={metric.id}>
                  <TableCell className="font-medium">{metric.name}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={metric.plan}
                      onChange={(e) =>
                        onUpdateMetric(metric.id, 'plan', Number(e.target.value))
                      }
                      className="w-24 bg-input"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={metric.fact}
                      onChange={(e) =>
                        onUpdateMetric(metric.id, 'fact', Number(e.target.value))
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
            {additionalBonus.toFixed(1)}%
          </div>
          <p className="text-sm text-muted-foreground">
            Средний процент выполнения дополнительных показателей
          </p>
        </div>
      </Card>
    </div>
  );
}
