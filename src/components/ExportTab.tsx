import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface ExportTabProps {
  isGeneratingPdf: boolean;
  onGeneratePdf: () => void;
}

export default function ExportTab({ isGeneratingPdf, onGeneratePdf }: ExportTabProps) {
  return (
    <div className="space-y-4">
      <Card className="p-6 bg-card border-border">
        <h2 className="text-xl font-semibold mb-4">Экспорт отчетов</h2>
        <div className="space-y-4">
          <Button 
            className="w-full" 
            size="lg"
            onClick={onGeneratePdf}
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
    </div>
  );
}
